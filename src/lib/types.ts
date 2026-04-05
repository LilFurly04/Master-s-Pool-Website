export type Tier = 1 | 2 | 3 | 4;

export interface Golfer {
  id: string;
  name: string;
  country: string;
  worldRank: number;
  tier: Tier;
  espnId?: string;
}

export interface LiveScore {
  golferId: string;
  golferName: string;
  position: string;
  totalScore: number;        // relative to par, e.g. -10
  totalScoreDisplay: string; // e.g. "-10" or "E" or "+2"
  currentRound: number;
  thru: string;              // "F" for finished, "1" to "18"
  roundScores: (number | null)[]; // score per round relative to par
  madeCut: boolean;
  isWithdrawn: boolean;
}

export interface TournamentStatus {
  name: string;
  round: number;
  status: "pre" | "active" | "complete";
  lastUpdated: string;
}

export interface Participant {
  id: string;
  name: string;
  picks: {
    tier1: string | null; // golfer id
    tier2: string | null;
    tier3: string | null;
    tier4: string | null;
  };
}

export interface PoolEntry {
  participant: Participant;
  scores: {
    tier1: LiveScore | null;
    tier2: LiveScore | null;
    tier3: LiveScore | null;
    tier4: LiveScore | null;
  };
  totalScore: number;
  countingScores: number;   // number of golfers counting (not WD/MC)
  cutsMissed: number;
  position: number;
}

export interface PoolSettings {
  name: string;
  year: number;
  picksPerTier: number;      // always 1
  countingGolfers: number;   // best N of 4 scores count (e.g. 3)
  cutPenalty: number;        // strokes added per missed cut (e.g. 10)
  pickDeadline: string;      // ISO date string
  isLocked: boolean;
}
