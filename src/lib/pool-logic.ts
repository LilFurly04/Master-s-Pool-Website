import {
  ALL_SLOTS,
  EntrantProbability,
  LiveScore,
  Participant,
  PickSlot,
  PoolEntry,
  PoolSettings,
  SLOT_TIER,
  TIER_SLOTS,
} from "./types";
import { GOLFERS, getGolferById } from "@/data/golfers";

export const DEFAULT_SETTINGS: PoolSettings = {
  name: "Masters Pool 2026",
  year: 2026,
  countingGolfers: 5,     // best 5 of 6
  cutPenalty: 8,          // +8 strokes per remaining round for MC golfers
  pickDeadline: "2026-04-09T08:00:00-04:00",
  isLocked: false,
};

// ─── Score formatting ─────────────────────────────────────────────────────────

export function formatScore(score: number | null): string {
  if (score === null) return "—";
  if (score === 0) return "E";
  if (score > 0) return `+${score}`;
  return `${score}`;
}

export function scoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score < 0) return "text-red-600";
  if (score === 0) return "text-gray-700";
  return "text-gray-500";
}

// ─── Effective score for a golfer (applies MC penalty) ───────────────────────

function effectiveScore(liveScore: LiveScore, cutPenalty: number): number {
  if (liveScore.isWithdrawn) return liveScore.totalScore + cutPenalty * 4;
  if (!liveScore.madeCut && liveScore.currentRound > 2) {
    const remainingRounds = Math.max(0, 4 - 2); // always 2 rounds missed
    return liveScore.totalScore + cutPenalty * remainingRounds;
  }
  return liveScore.totalScore;
}

// ─── Pool probability calculations ───────────────────────────────────────────

/**
 * Computes pre-tournament lineup probability metrics for a participant.
 * Uses live odds map when provided, otherwise falls back to static golfer data.
 */
function computeLineupProbability(
  participant: Participant,
  liveOddsMap: Map<string, number> // golferId → current win%
): {
  lineupGolferWinPct: number;
  lineupTop5Pct: number;
} {
  const golfers = ALL_SLOTS
    .map((slot) => participant.picks[slot])
    .filter(Boolean)
    .map((id) => getGolferById(id!))
    .filter(Boolean);

  if (golfers.length === 0) return { lineupGolferWinPct: 0, lineupTop5Pct: 0 };

  const winPcts = golfers.map((g) => liveOddsMap.get(g!.id) ?? g!.winPct);
  const top5Pcts = golfers.map((g) => g!.top5Pct); // top5 from static for now

  // P(at least one wins) = 1 - product(1 - p_win_i)
  const pNoneWin = winPcts.reduce((acc, p) => acc * (1 - p / 100), 1);
  const pNoneTop5 = top5Pcts.reduce((acc, p) => acc * (1 - p / 100), 1);

  return {
    lineupGolferWinPct: parseFloat(((1 - pNoneWin) * 100).toFixed(1)),
    lineupTop5Pct: parseFloat(((1 - pNoneTop5) * 100).toFixed(1)),
  };
}

/**
 * Computes a "lineup strength score" for pool-win probability estimation.
 * Lower score = stronger lineup.
 * Uses live odds map when available, otherwise falls back to static data.
 */
function lineupStrengthScore(
  participant: Participant,
  liveOddsMap: Map<string, number> = new Map()
): number {
  const golferScores = ALL_SLOTS
    .map((slot) => participant.picks[slot])
    .filter(Boolean)
    .map((id) => {
      const g = getGolferById(id!);
      if (!g) return Infinity;
      const winPct = liveOddsMap.get(id!) ?? g.winPct;
      return -Math.log(Math.max(winPct / 100, 0.0001));
    });

  golferScores.sort((a, b) => a - b);
  const best5 = golferScores.slice(0, 5);
  return best5.reduce((sum, s) => sum + s, 0);
}

/**
 * Converts relative lineup strength scores to pool win/top3/top5 probabilities.
 *
 * Mode "pre":  odds-based (pre-tournament or when live odds available).
 *              Uses liveOddsMap if populated, otherwise falls back to static.
 * Mode "live": blends current score gaps (Gaussian model) with odds-based
 *              strength. As more rounds complete, score gap dominates.
 */
function assignPoolProbabilities(
  entries: PoolEntry[],
  tournamentRoundsRemaining = 4,
  liveOddsMap: Map<string, number> = new Map()
): void {
  if (entries.length === 0) return;
  const n = entries.length;
  const isLive = tournamentRoundsRemaining < 4;

  let weights: number[];

  if (isLive) {
    // Blend score-gap model with odds-based strength.
    // As rounds complete, score gap weight increases (odds matter less).
    const roundsPlayed = 4 - tournamentRoundsRemaining;
    const oddsWeight = Math.max(0, 1 - roundsPlayed * 0.3); // fades to 0 after R3
    const scoreWeight = 1 - oddsWeight;

    const sigma = 3.5 * Math.sqrt(Math.max(tournamentRoundsRemaining, 0.5));
    const scores = entries.map((e) => e.totalScore);
    const leader = Math.min(...scores);
    const scoreWeights = scores.map((s) =>
      Math.exp(-Math.pow(s - leader, 2) / (2 * sigma * sigma))
    );

    const strengths = entries.map((e) => lineupStrengthScore(e.participant, liveOddsMap));
    const oddsWeights = strengths.map((s) => Math.exp(-s * 0.3));

    // Normalize each independently then blend
    const swTotal = scoreWeights.reduce((a, b) => a + b, 0);
    const owTotal = oddsWeights.reduce((a, b) => a + b, 0);
    weights = entries.map((_, i) =>
      scoreWeight * (scoreWeights[i] / swTotal) +
      oddsWeight * (oddsWeights[i] / owTotal)
    );
  } else {
    // Pre-tournament: pure odds-based
    const strengths = entries.map((e) => lineupStrengthScore(e.participant, liveOddsMap));
    weights = strengths.map((s) => Math.exp(-s * 0.3));
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const sortedWeights = [...weights].sort((a, b) => b - a);
  const top3Sum = sortedWeights.slice(0, Math.min(3, n)).reduce((a, b) => a + b, 0);
  const top5Sum = sortedWeights.slice(0, Math.min(5, n)).reduce((a, b) => a + b, 0);

  entries.forEach((entry, i) => {
    const w = weights[i];
    const lineup = computeLineupProbability(entry.participant, liveOddsMap);

    entry.probability = {
      poolWinPct:  parseFloat(((w / totalWeight) * 100).toFixed(1)),
      poolTop3Pct: parseFloat((Math.min(99, (w / top3Sum) * Math.min(3, n))).toFixed(1)),
      poolTop5Pct: parseFloat((Math.min(99, (w / top5Sum) * Math.min(5, n))).toFixed(1)),
      lineupGolferWinPct: lineup.lineupGolferWinPct,
      lineupTop5Pct: lineup.lineupTop5Pct,
    };
  });
}

// ─── Main pool computation ────────────────────────────────────────────────────

export function computePoolEntries(
  participants: Participant[],
  liveScores: LiveScore[],
  settings: PoolSettings,
  liveOddsMap: Map<string, number> = new Map()  // golferId → live win%
): PoolEntry[] {
  const scoreMap = new Map<string, LiveScore>();
  for (const s of liveScores) {
    scoreMap.set(s.golferId, s);
  }

  const entries: PoolEntry[] = participants.map((participant) => {
    const scores = {} as Record<PickSlot, LiveScore | null>;
    const allSixScores: number[] = [];
    let cutsMissed = 0;

    for (const slot of ALL_SLOTS) {
      const pick = participant.picks[slot];
      const liveScore = pick ? (scoreMap.get(pick) ?? null) : null;
      scores[slot] = liveScore;

      if (liveScore) {
        if (!liveScore.madeCut && !liveScore.isWithdrawn && liveScore.currentRound > 2) {
          cutsMissed++;
        }
        allSixScores.push(effectiveScore(liveScore, settings.cutPenalty));
      }
    }

    // Best N of 6
    const sorted = [...allSixScores].sort((a, b) => a - b);
    const counting = sorted.slice(0, settings.countingGolfers);
    const dropped = sorted.length > settings.countingGolfers ? sorted[settings.countingGolfers] : null;
    const totalScore = counting.reduce((sum, s) => sum + s, 0);

    return {
      participant,
      scores,
      allSixScores,
      totalScore: allSixScores.length > 0 ? totalScore : 0,
      droppedScore: dropped,
      cutsMissed,
      position: 0,
      probability: {
        poolWinPct: 0, poolTop3Pct: 0, poolTop5Pct: 0,
        lineupGolferWinPct: 0, lineupTop5Pct: 0,
      },
    };
  });

  // Sort by score, assign positions
  entries.sort((a, b) => {
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    return a.participant.name.localeCompare(b.participant.name);
  });

  let pos = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalScore === entries[i - 1].totalScore) {
      entries[i].position = entries[i - 1].position;
    } else {
      entries[i].position = pos;
    }
    pos++;
  }

  // Determine remaining rounds from live scores
  const maxRound = liveScores.reduce((m, s) => Math.max(m, s.currentRound), 0);
  const roundsRemaining = liveScores.length > 0 ? Math.max(0, 4 - maxRound) : 4;

  // Assign probability estimates (live-aware, odds-informed)
  assignPoolProbabilities(entries, roundsRemaining, liveOddsMap);

  return entries;
}

// ─── Pick validation ──────────────────────────────────────────────────────────

export function picksComplete(participant: Participant): boolean {
  return ALL_SLOTS.every((slot) => participant.picks[slot] !== null);
}

export function picksForTier(participant: Participant, tier: 1 | 2 | 3 | 4): (string | null)[] {
  return TIER_SLOTS[tier].map((slot) => participant.picks[slot]);
}

export function countPicksForTier(participant: Participant, tier: 1 | 2 | 3 | 4): number {
  return picksForTier(participant, tier).filter(Boolean).length;
}

export function isPickDeadlinePassed(settings: PoolSettings): boolean {
  return new Date() > new Date(settings.pickDeadline);
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

export function getSlotLabel(slot: PickSlot): string {
  const labels: Record<PickSlot, string> = {
    tier1a: "Tier 1 · Pick A",
    tier1b: "Tier 1 · Pick B",
    tier2a: "Tier 2 · Pick A",
    tier2b: "Tier 2 · Pick B",
    tier3: "Tier 3",
    tier4: "Tier 4",
  };
  return labels[slot];
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const KEYS = {
  PARTICIPANTS: "masters_pool_participants",
  SETTINGS: "masters_pool_settings",
  MY_PICKS: "masters_pool_my_picks",
  MY_NAME: "masters_pool_my_name",
};

const EMPTY_PICKS: Record<PickSlot, null> = {
  tier1a: null, tier1b: null,
  tier2a: null, tier2b: null,
  tier3: null, tier4: null,
};

export function loadParticipants(): Participant[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEYS.PARTICIPANTS) ?? "[]"); }
  catch { return []; }
}

export function saveParticipants(p: Participant[]): void {
  if (typeof window !== "undefined")
    localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(p));
}

export function loadSettings(): PoolSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(s: PoolSettings): void {
  if (typeof window !== "undefined")
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
}

export function loadMyPicks(): Record<PickSlot, string | null> {
  if (typeof window === "undefined") return { ...EMPTY_PICKS };
  try {
    const raw = localStorage.getItem(KEYS.MY_PICKS);
    return raw ? { ...EMPTY_PICKS, ...JSON.parse(raw) } : { ...EMPTY_PICKS };
  } catch { return { ...EMPTY_PICKS }; }
}

export function saveMyPicks(picks: Record<PickSlot, string | null>): void {
  if (typeof window !== "undefined")
    localStorage.setItem(KEYS.MY_PICKS, JSON.stringify(picks));
}

export function loadMyName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEYS.MY_NAME) ?? "";
}

export function saveMyName(name: string): void {
  if (typeof window !== "undefined")
    localStorage.setItem(KEYS.MY_NAME, name);
}
