import { LiveScore, Participant, PoolEntry, PoolSettings } from "./types";

export const DEFAULT_SETTINGS: PoolSettings = {
  name: "Masters Pool 2026",
  year: 2026,
  picksPerTier: 1,
  countingGolfers: 3,   // best 3 of 4 scores count
  cutPenalty: 10,       // +10 per round after cut for missed-cut golfers
  pickDeadline: "2026-04-09T08:00:00-04:00",
  isLocked: false,
};

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

export function computePoolEntries(
  participants: Participant[],
  liveScores: LiveScore[],
  settings: PoolSettings
): PoolEntry[] {
  const scoreMap = new Map<string, LiveScore>();
  for (const s of liveScores) {
    scoreMap.set(s.golferId, s);
  }

  const entries: PoolEntry[] = participants.map((participant) => {
    const tierKeys = ["tier1", "tier2", "tier3", "tier4"] as const;
    const scores = {
      tier1: participant.picks.tier1 ? (scoreMap.get(participant.picks.tier1) ?? null) : null,
      tier2: participant.picks.tier2 ? (scoreMap.get(participant.picks.tier2) ?? null) : null,
      tier3: participant.picks.tier3 ? (scoreMap.get(participant.picks.tier3) ?? null) : null,
      tier4: participant.picks.tier4 ? (scoreMap.get(participant.picks.tier4) ?? null) : null,
    };

    // Collect individual golfer scores, applying penalties for missed cuts
    const golferScores: number[] = [];
    let cutsMissed = 0;

    for (const key of tierKeys) {
      const pick = participant.picks[key];
      if (!pick) continue;
      const liveScore = scores[key];
      if (!liveScore) continue;

      if (liveScore.isWithdrawn) {
        golferScores.push(settings.cutPenalty * 2); // WD penalty
      } else if (!liveScore.madeCut && liveScore.currentRound > 2) {
        cutsMissed++;
        // Missed cut: use their 2-round total + penalty per remaining round
        const remainingRounds = Math.max(0, 4 - liveScore.currentRound);
        golferScores.push(liveScore.totalScore + settings.cutPenalty * remainingRounds);
      } else {
        golferScores.push(liveScore.totalScore);
      }
    }

    // Best N of 4 scores count
    golferScores.sort((a, b) => a - b);
    const counting = golferScores.slice(0, settings.countingGolfers);
    const totalScore = counting.reduce((sum, s) => sum + s, 0);

    return {
      participant,
      scores,
      totalScore: golferScores.length > 0 ? totalScore : 0,
      countingScores: counting.length,
      cutsMissed,
      position: 0, // set below
    };
  });

  // Sort by total score ascending (lower is better in golf)
  entries.sort((a, b) => {
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    return a.participant.name.localeCompare(b.participant.name);
  });

  // Assign positions with ties
  let pos = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalScore === entries[i - 1].totalScore) {
      entries[i].position = entries[i - 1].position;
    } else {
      entries[i].position = pos;
    }
    pos++;
  }

  return entries;
}

export function isPickDeadlinePassed(settings: PoolSettings): boolean {
  return new Date() > new Date(settings.pickDeadline);
}

export function picksComplete(participant: Participant): boolean {
  return (
    participant.picks.tier1 !== null &&
    participant.picks.tier2 !== null &&
    participant.picks.tier3 !== null &&
    participant.picks.tier4 !== null
  );
}

// Storage helpers
const STORAGE_KEYS = {
  PARTICIPANTS: "masters_pool_participants",
  SETTINGS: "masters_pool_settings",
  MY_PICKS: "masters_pool_my_picks",
  MY_NAME: "masters_pool_my_name",
};

export function loadParticipants(): Participant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveParticipants(participants: Participant[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
}

export function loadSettings(): PoolSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: PoolSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadMyPicks(): Participant["picks"] {
  if (typeof window === "undefined")
    return { tier1: null, tier2: null, tier3: null, tier4: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_PICKS);
    return raw
      ? JSON.parse(raw)
      : { tier1: null, tier2: null, tier3: null, tier4: null };
  } catch {
    return { tier1: null, tier2: null, tier3: null, tier4: null };
  }
}

export function saveMyPicks(picks: Participant["picks"]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MY_PICKS, JSON.stringify(picks));
}

export function loadMyName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.MY_NAME) ?? "";
}

export function saveMyName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MY_NAME, name);
}
