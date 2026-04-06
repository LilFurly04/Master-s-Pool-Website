import { NextResponse } from "next/server";
import { GOLFERS } from "@/data/golfers";

// ─── The Odds API ─────────────────────────────────────────────────────────────
// Sign up free at: https://the-odds-api.com  (500 req/month free tier)
// Set ODDS_API_KEY in your .env.local file.
// We cache the response for 10 minutes to stay well within free-tier limits.
//
// Sport key for The Masters outright winner market:
//   golf_masters_tournament_winner
// Fallback (if Masters key not found): golf_pga_championship_winner

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";
const SPORT_KEYS = [
  "golf_masters_tournament_winner",
  "golf_the_masters_winner",
  "golf_masters",
];
const BOOKMAKERS = "fanduel,draftkings,betmgm,williamhill_us,pointsbetus";
const CACHE_SECONDS = 600; // 10 minutes

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
  odds: number;             // best American odds found across bookmakers
  bookmaker: string;        // which book had the best price
  winPct: number;           // implied probability (0–100)
}

export interface OddsResponse {
  odds: NormalizedOdds[];
  source: "live" | "static";
  bookmakers: string[];
  requestsRemaining: number | null;
  lastUpdated: string;
  apiAvailable: boolean;
}

// ─── Name matching ────────────────────────────────────────────────────────────
// The Odds API uses full player names; we match them to our golfer IDs.
function matchGolfer(apiName: string): string | null {
  const normalized = apiName.toLowerCase().trim();

  // Direct full-name match
  const exact = GOLFERS.find(
    (g) => g.name.toLowerCase() === normalized
  );
  if (exact) return exact.id;

  // Last-name match (handles "Scheffler" → "Scottie Scheffler")
  const byLast = GOLFERS.find((g) => {
    const last = g.name.split(" ").pop()?.toLowerCase() ?? "";
    return last === normalized || normalized.includes(last);
  });
  if (byLast) return byLast.id;

  // Partial match on any word
  const words = normalized.split(" ");
  const byWord = GOLFERS.find((g) => {
    const gWords = g.name.toLowerCase().split(" ");
    return words.every((w) => gWords.some((gw) => gw.startsWith(w)));
  });
  return byWord?.id ?? null;
}

// ─── Implied probability from American odds ───────────────────────────────────
function toImpliedPct(odds: number): number {
  return parseFloat((100 / (odds + 100) * 100).toFixed(2));
}

// ─── Static fallback (returns our hardcoded FanDuel odds) ────────────────────
function buildStaticResponse(): OddsResponse {
  const odds: NormalizedOdds[] = GOLFERS.map((g) => ({
    golferId: g.id,
    golferName: g.name,
    odds: g.odds,
    bookmaker: "FanDuel (static)",
    winPct: g.winPct,
  }));

  return {
    odds,
    source: "static",
    bookmakers: ["FanDuel (static)"],
    requestsRemaining: null,
    lastUpdated: new Date().toISOString(),
    apiAvailable: false,
  };
}

// ─── Fetch from The Odds API ──────────────────────────────────────────────────
async function fetchLiveOdds(apiKey: string): Promise<OddsResponse | null> {
  // Try each sport key until one returns data
  for (const sportKey of SPORT_KEYS) {
    const url = new URL(`${ODDS_API_BASE}/sports/${sportKey}/odds`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("regions", "us");
    url.searchParams.set("markets", "outrights");
    url.searchParams.set("bookmakers", BOOKMAKERS);
    url.searchParams.set("oddsFormat", "american");

    try {
      const res = await fetch(url.toString(), {
        headers: { "Accept": "application/json" },
        next: { revalidate: CACHE_SECONDS },
      });

      const requestsRemaining = parseInt(
        res.headers.get("x-requests-remaining") ?? "-1", 10
      );

      if (res.status === 404 || res.status === 422) continue; // try next key
      if (!res.ok) return null;

      const events: OddsEvent[] = await res.json();
      if (!events.length) continue;

      // Use the most recent/active event
      const event = events[0];
      const usedBooks: Set<string> = new Set();

      // Collect best (highest) odds per player across all bookmakers
      const bestOddsMap = new Map<string, { odds: number; bookmaker: string }>();

      for (const book of event.bookmakers ?? []) {
        const market = book.markets.find((m) => m.key === "outrights");
        if (!market) continue;
        usedBooks.add(book.title);

        for (const outcome of market.outcomes) {
          const golferId = matchGolfer(outcome.name);
          if (!golferId) continue;

          const current = bestOddsMap.get(golferId);
          // Higher American odds = better price for bettor
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

      // Add any golfers not found in live odds using static fallback
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

      // Sort by odds ascending (favorites first)
      odds.sort((a, b) => a.odds - b.odds);

      return {
        odds,
        source: "live",
        bookmakers: Array.from(usedBooks),
        requestsRemaining: requestsRemaining >= 0 ? requestsRemaining : null,
        lastUpdated: new Date().toISOString(),
        apiAvailable: true,
      };
    } catch {
      continue;
    }
  }

  return null;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(buildStaticResponse());
  }

  const live = await fetchLiveOdds(apiKey);
  if (!live) {
    return NextResponse.json(buildStaticResponse());
  }

  return NextResponse.json(live, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  });
}
