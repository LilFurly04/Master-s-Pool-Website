export type Tier = 1 | 2 | 3 | 4;

export interface Golfer {
  id: string;
  name: string;
  country: string;
  owgr: number | null;   // Official World Golf Ranking
  tier: Tier;
  odds: number;          // FanDuel American odds (positive), e.g. 500 for +500
  winPct: number;        // 0–100, implied win probability
  top5Pct: number;       // 0–100
  top10Pct: number;      // 0–100
  top20Pct: number;      // 0–100
  espnId?: number;       // ESPN player ID for headshot URLs
}

export interface LiveScore {
  golferId: string;
  golferName: string;
  position: string;
  totalScore: number;
  totalScoreDisplay: string;
  currentRound: number;
  thru: string;
  roundScores: (number | null)[];
  madeCut: boolean;
  isWithdrawn: boolean;
}

export interface TournamentStatus {
  name: string;
  round: number;
  status: "pre" | "active" | "complete";
  lastUpdated: string;
}

// 6 pick slots: 2 from T1, 2 from T2, 1 from T3, 1 from T4
export type PickSlot = "tier1a" | "tier1b" | "tier2a" | "tier2b" | "tier3" | "tier4";

export interface Participant {
  id: string;
  name: string;
  picks: Record<PickSlot, string | null>;
}

export interface EntrantProbability {
  poolWinPct: number;
  poolTop3Pct: number;
  poolTop5Pct: number;
  lineupGolferWinPct: number;  // P(at least one golfer wins the tournament)
  lineupTop5Pct: number;       // P(at least one golfer finishes top 5)
}

export interface PoolEntry {
  participant: Participant;
  scores: Record<PickSlot, LiveScore | null>;
  allSixScores: number[];      // effective score for each of the 6 picks
  totalScore: number;          // sum of best 5 of 6
  droppedScore: number | null; // the dropped (worst) score
  cutsMissed: number;
  position: number;
  probability: EntrantProbability;
}

export interface PoolSettings {
  name: string;
  year: number;
  countingGolfers: number;  // best N of 6 (default 5)
  cutPenalty: number;       // strokes added per remaining round for MC golfers
  pickDeadline: string;
  isLocked: boolean;
}

// Which tier each slot belongs to, and how many per tier
export const SLOT_TIER: Record<PickSlot, Tier> = {
  tier1a: 1, tier1b: 1,
  tier2a: 2, tier2b: 2,
  tier3: 3,
  tier4: 4,
};

export const ALL_SLOTS: PickSlot[] = ["tier1a", "tier1b", "tier2a", "tier2b", "tier3", "tier4"];

export const TIER_PICK_LIMITS: Record<Tier, number> = { 1: 2, 2: 2, 3: 1, 4: 1 };

export const TIER_SLOTS: Record<Tier, PickSlot[]> = {
  1: ["tier1a", "tier1b"],
  2: ["tier2a", "tier2b"],
  3: ["tier3"],
  4: ["tier4"],
};
