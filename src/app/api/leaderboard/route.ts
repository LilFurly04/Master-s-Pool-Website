import { NextResponse } from "next/server";
import { LiveScore, TournamentStatus } from "@/lib/types";
import { GOLFERS } from "@/data/golfers";

// ESPN undocumented API — golf leaderboard
const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga";

interface EspnAthlete {
  id: string;
  displayName: string;
}

interface EspnLinescoreEntry {
  displayValue?: string;
  value?: number;
}

interface EspnScoreEntry {
  displayValue?: string;
  value?: number;
}

interface EspnStatusPosition {
  displayName?: string;
}

interface EspnCompetitorStatus {
  position?: EspnStatusPosition;
  thru?: string | number;
  round?: number;
  type?: { name?: string };
}

interface EspnCompetitor {
  id?: string;
  athlete?: EspnAthlete;
  status?: EspnCompetitorStatus;
  score?: EspnScoreEntry;
  linescores?: EspnLinescoreEntry[];
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
}

interface EspnEvent {
  id?: string;
  name?: string;
  status?: { type?: { name?: string; description?: string } };
  competitions?: EspnCompetition[];
}

interface EspnLeague {
  events?: EspnEvent[];
}

interface EspnSport {
  leagues?: EspnLeague[];
}

interface EspnResponse {
  sports?: EspnSport[];
}

function parseScore(displayValue?: string): number {
  if (!displayValue) return 0;
  const v = displayValue.trim().toUpperCase();
  if (v === "E" || v === "EVEN") return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

function buildScoreFromEspn(competitor: EspnCompetitor): LiveScore | null {
  const name = competitor.athlete?.displayName ?? "";
  if (!name) return null;

  // Try to match to our golfer list by name
  const golfer = GOLFERS.find(
    (g) =>
      g.name.toLowerCase() === name.toLowerCase() ||
      name.toLowerCase().includes(g.name.split(" ").pop()?.toLowerCase() ?? "")
  );

  const golferId = golfer?.id ?? name.toLowerCase().replace(/\s+/g, "_");
  const totalScore = parseScore(competitor.score?.displayValue);
  const position = competitor.status?.position?.displayName ?? "—";
  const thru = String(competitor.status?.thru ?? "—");
  const round = competitor.status?.round ?? 1;

  const roundScores: (number | null)[] =
    competitor.linescores?.map((ls) =>
      ls.displayValue != null ? parseScore(ls.displayValue) : null
    ) ?? [];

  const statusName = competitor.status?.type?.name ?? "";
  const isWithdrawn = statusName.includes("WD") || statusName.includes("DQ");
  const madeCut = !isWithdrawn && !(statusName.includes("CUT"));

  return {
    golferId,
    golferName: name,
    position,
    totalScore,
    totalScoreDisplay:
      competitor.score?.displayValue ?? String(totalScore),
    currentRound: round,
    thru,
    roundScores,
    madeCut,
    isWithdrawn,
  };
}

function getMastersEvent(data: EspnResponse): EspnEvent | null {
  for (const sport of data.sports ?? []) {
    for (const league of sport.leagues ?? []) {
      for (const event of league.events ?? []) {
        const name = (event.name ?? "").toLowerCase();
        if (name.includes("masters")) return event;
      }
    }
  }
  // Fall back to first event if no Masters found
  const firstEvent = data.sports?.[0]?.leagues?.[0]?.events?.[0];
  return firstEvent ?? null;
}

// Demo data shown when ESPN API is unavailable or tournament hasn't started
function buildDemoData(): { scores: LiveScore[]; status: TournamentStatus } {
  const now = new Date();
  const tournamentStart = new Date("2026-04-09T08:00:00-04:00");
  const isPre = now < tournamentStart;

  const scores: LiveScore[] = GOLFERS.map((g, i) => {
    const base = isPre ? 0 : Math.round((Math.random() - 0.5) * 20);
    return {
      golferId: g.id,
      golferName: g.name,
      position: isPre ? "—" : String(i + 1),
      totalScore: isPre ? 0 : base,
      totalScoreDisplay: isPre ? "—" : base === 0 ? "E" : base > 0 ? `+${base}` : String(base),
      currentRound: isPre ? 0 : 2,
      thru: isPre ? "—" : "F",
      roundScores: isPre ? [] : [base > 0 ? Math.ceil(base / 2) : Math.floor(base / 2), base - (base > 0 ? Math.ceil(base / 2) : Math.floor(base / 2))],
      madeCut: true,
      isWithdrawn: false,
    };
  });

  return {
    scores,
    status: {
      name: "Masters Tournament 2026",
      round: isPre ? 0 : 2,
      status: isPre ? "pre" : "active",
      lastUpdated: new Date().toISOString(),
    },
  };
}

export async function GET() {
  try {
    const res = await fetch(ESPN_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 }, // cache 60 seconds
    });

    if (!res.ok) throw new Error(`ESPN API returned ${res.status}`);

    const data: EspnResponse = await res.json();
    const event = getMastersEvent(data);

    if (!event) {
      const demo = buildDemoData();
      return NextResponse.json({ ...demo, source: "demo" });
    }

    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];

    const scores: LiveScore[] = competitors
      .map(buildScoreFromEspn)
      .filter((s): s is LiveScore => s !== null);

    // Sort by score ascending
    scores.sort((a, b) => a.totalScore - b.totalScore);

    const statusName = event.status?.type?.name ?? "";
    const tournamentStatus: TournamentStatus = {
      name: event.name ?? "Masters Tournament 2026",
      round: scores[0]?.currentRound ?? 1,
      status: statusName.includes("FINAL")
        ? "complete"
        : statusName.includes("IN_PROGRESS") || statusName.includes("ACTIVE")
        ? "active"
        : "pre",
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ scores, status: tournamentStatus, source: "espn" });
  } catch {
    const demo = buildDemoData();
    return NextResponse.json({ ...demo, source: "demo" });
  }
}
