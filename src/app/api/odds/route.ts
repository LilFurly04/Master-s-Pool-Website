import { NextResponse } from "next/server";
import { GOLFERS } from "@/data/golfers";

// ─── The Odds API ─────────────────────────────────────────────────────────────
// Sign up free at: https://the-odds-api.com  (500 req/month free tier)
// Set ODDS_API_KEY in your .env.local file.
//
// Cache schedule (Central Daylight Time, UTC-5):
//   • Apr 9–12 2026 (tournament days), 6 AM – 8 PM CDT → refresh every 10 min
//   • All other times → refresh every 60 min

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";
const SPORT_KEYS = [
  "golf_masters_tournament_winner",
  "golf_the_masters_winner",
  "golf_masters",
];
const BOOKMAKERS = "fanduel,draftkings,betmgm,williamhill_us,pointsbetus";

// ─── Dynamic TTL ──────────────────────────────────────────────────────────────
// Tournament days: April 9–12 2026. Active window: 6 AM–8 PM CDT (UTC-5).
function getCacheTtlMs(): number {
  const now = new Date();
  // Convert to CDT (UTC-5)
  const cdt = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  const year  = cdt.getUTCFullYear();
  const month = cdt.getUTCMonth(); // 0-indexed; 3 = April
  const date  = cdt.getUTCDate();
  const hour  = cdt.getUTCHours();

  const isTournamentDay = year === 2026 && month === 3 && date >= 9 && date <= 12;
  const isActiveWindow  = hour >= 6 && hour < 20; // 6 AM ≤ t < 8 PM CDT

  if (isTournamentDay && isActiveWindow) {
    return 10 * 60 * 1000; // 10 minutes
  }
  return 60 * 60 * 1000; // 1 hour
}

// ─── In-memory cache ──────────────────────────────────────────────────────────
// Adapts its TTL on every request, so the schedule above applies automatically.
interface CacheEntry {
  data: OddsResponse;
  timestamp: number;
}
let cache: CacheEntry | null = null;

// ─── Types ────────────────────────────────────────────────────────────────────
interface OddsOutcome {
  name: string;
  price: number; // American odds, e.g. 500 for +500
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  key: string;
  title: string;
  markets: OddsMarket[];
}

interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  bookmakers: OddsBookmaker[];
}

export interface NormalizedOdds {
  golferId: string;
  golferName: string;
  odds: number;      // best American odds found across bookmakers
  bookmaker: string; // which book had the best price
  winPct: number;    // implied probability (0–100)
}

export interface OddsResponse {
  odds: NormalizedOdds[];
  source: "live" | "static";
  bookmakers: string[];
  requestsRemaining: number | null;
  lastUpdated: string;
  apiAvailable: boolean;
  nextRefreshMinutes: number; // how long until next scheduled refresh
}

// ─── Name matching ────────────────────────────────────────────────────────────
function matchGolfer(apiName: string): string | null {
  const normalized = apiName.toLowerCase().trim();

  const exact = GOLFERS.find((g) => g.name.toLowerCase() === normalized);
  if (exact) return exact.id;

  const byLast = GOLFERS.find((g) => {
    const last = g.name.split(" ").pop()?.toLowerCase() ?? "";
    return last === normalized || normalized.includes(last);
  });
  if (byLast) return byLast.id;

  const words = normalized.split(" ");
  const byWord = GOLFERS.find((g) => {
    const gWords = g.name.toLowerCase().split(" ");
    return words.every((w) => gWords.some((gw) => gw.startsWith(w)));
  });
  return byWord?.id ?? null;
}

// ─── Implied probability from American odds ───────────────────────────────────
function toImpliedPct(odds: number): number {
  return parseFloat(((100 / (odds + 100)) * 100).toFixed(2));
}

// ─── Static fallback ──────────────────────────────────────────────────────────
function buildStaticResponse(): OddsResponse {
  const ttlMs = getCacheTtlMs();
  return {
    odds: GOLFERS.map((g) => ({
      golferId: g.id,
      golferName: g.name,
      odds: g.odds,
      bookmaker: "FanDuel (static)",
      winPct: g.winPct,
    })),
    source: "static",
    bookmakers: ["FanDuel (static)"],
    requestsRemaining: null,
    lastUpdated: new Date().toISOString(),
    apiAvailable: false,
    nextRefreshMinutes: Math.round(ttlMs / 60000),
  };
}

// ─── Fetch from The Odds API ──────────────────────────────────────────────────
async function fetchLiveOdds(apiKey: string): Promise<OddsResponse | null> {
  const ttlMs = getCacheTtlMs();

  for (const sportKey of SPORT_KEYS) {
    const url = new URL(`${ODDS_API_BASE}/sports/${sportKey}/odds`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("regions", "us");
    url.searchParams.set("markets", "outrights");
    url.searchParams.set("bookmakers", BOOKMAKERS);
    url.searchParams.set("oddsFormat", "american");

    try {
      // Always fetch fresh — our in-memory cache handles rate limiting
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const requestsRemaining = parseInt(
        res.headers.get("x-requests-remaining") ?? "-1",
        10
      );

      if (res.status === 404 || res.status === 422) continue;
      if (!res.ok) return null;

      const events: OddsEvent[] = await res.json();
      if (!events.length) continue;

      const event = events[0];
      const usedBooks: Set<string> = new Set();
      const bestOddsMap = new Map<string, { odds: number; bookmaker: string }>();

      for (const book of event.bookmakers ?? []) {
        const market = book.markets.find((m) => m.key === "outrights");
        if (!market) continue;
        usedBooks.add(book.title);

        for (const outcome of market.outcomes) {
          const golferId = matchGolfer(outcome.name);
          if (!golferId) continue;

          const current = bestOddsMap.get(golferId);
          if (!current || outcome.price > current.odds) {
            bestOddsMap.set(golferId, { odds: outcome.price, bookmaker: book.title });
          }
        }
      }

      if (bestOddsMap.size === 0) continue;

      const odds: NormalizedOdds[] = Array.from(bestOddsMap.entries()).map(
        ([golferId, { odds: price, bookmaker }]) => {
          const golfer = GOLFERS.find((g) => g.id === golferId);
          return {
            golferId,
            golferName: golfer?.name ?? golferId,
            odds: price,
            bookmaker,
            winPct: toImpliedPct(price),
          };
        }
      );

      // Fill in any golfers not found in live odds
      for (const g of GOLFERS) {
        if (!bestOddsMap.has(g.id)) {
          odds.push({
            golferId: g.id,
            golferName: g.name,
            odds: g.odds,
            bookmaker: "FanDuel (static)",
            winPct: g.winPct,
          });
        }
      }

      odds.sort((a, b) => a.odds - b.odds);

      return {
        odds,
        source: "live",
        bookmakers: Array.from(usedBooks),
        requestsRemaining: requestsRemaining >= 0 ? requestsRemaining : null,
        lastUpdated: new Date().toISOString(),
        apiAvailable: true,
        nextRefreshMinutes: Math.round(ttlMs / 60000),
      };
    } catch {
      continue;
    }
  }

  return null;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic"; // disable Next.js static caching; we manage our own

export async function GET() {
  const now = Date.now();
  const ttlMs = getCacheTtlMs();

  // Serve from in-memory cache if still fresh
  if (cache && now - cache.timestamp < ttlMs) {
    return NextResponse.json(cache.data);
  }

  const apiKey = process.env.ODDS_API_KEY;

  let result: OddsResponse;
  if (!apiKey) {
    result = buildStaticResponse();
  } else {
    result = (await fetchLiveOdds(apiKey)) ?? buildStaticResponse();
  }

  cache = { data: result, timestamp: now };
  return NextResponse.json(result);
}
