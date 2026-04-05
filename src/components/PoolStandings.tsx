"use client";

import { useEffect, useState, useCallback } from "react";
import { LiveScore, Participant, PoolEntry, PoolSettings } from "@/lib/types";
import { computePoolEntries, formatScore, loadParticipants, scoreColor } from "@/lib/pool-logic";
import { GOLFERS, FLAG_EMOJI, getGolferById } from "@/data/golfers";

interface PoolStandingsProps {
  settings: PoolSettings;
}

interface LeaderboardData {
  scores: LiveScore[];
}

const TIER_BADGE: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-blue-100 text-blue-800 border-blue-300",
  3: "bg-green-100 text-green-800 border-green-300",
  4: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function PoolStandings({ settings }: PoolStandingsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const p = loadParticipants();
    setParticipants(p);

    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data: LeaderboardData = await res.json();
        setLiveScores(data.scores ?? []);
        setEntries(computePoolEntries(p, data.scores ?? [], settings));
      }
    } catch {
      setEntries(computePoolEntries(p, [], settings));
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-masters-green border-t-masters-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">🏌️</div>
        <h3 className="font-serif text-xl text-gray-700">No participants yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Add participants in the <strong>Admin</strong> tab, or submit your own picks in the{" "}
          <strong>Make Picks</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-masters-green">{settings.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {participants.length} participant{participants.length !== 1 ? "s" : ""} ·{" "}
            Best {settings.countingGolfers} of 4 scores count · Lowest total wins
          </p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs text-masters-green border border-masters-green/30 hover:bg-masters-green hover:text-white px-3 py-1.5 rounded-full transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Standings table */}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <EntryCard
            key={entry.participant.id}
            entry={entry}
            rank={i + 1}
            isExpanded={expanded === entry.participant.id}
            onToggle={() =>
              setExpanded((prev) =>
                prev === entry.participant.id ? null : entry.participant.id
              )
            }
            settings={settings}
            liveScores={liveScores}
          />
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  rank,
  isExpanded,
  onToggle,
  settings,
  liveScores,
}: {
  entry: PoolEntry;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  settings: PoolSettings;
  liveScores: LiveScore[];
}) {
  const { participant, scores, totalScore, cutsMissed } = entry;
  const isLeader = rank === 1;
  const tierKeys = ["tier1", "tier2", "tier3", "tier4"] as const;

  // Collect all golfer scores for this entry to highlight counting ones
  const golferScores = tierKeys.map((k) => ({
    tierKey: k,
    score: scores[k],
    golferId: participant.picks[k],
  }));

  // Determine which are the "counting" scores (best N)
  const scoreValues = golferScores
    .filter((g) => g.score !== null)
    .map((g) => ({ ...g, val: g.score!.totalScore }))
    .sort((a, b) => a.val - b.val);
  const countingIds = new Set(
    scoreValues.slice(0, settings.countingGolfers).map((g) => g.golferId)
  );

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
        isLeader
          ? "border-masters-gold bg-masters-gold/5"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Rank */}
        <div className="w-10 text-center flex-shrink-0">
          {rank === 1 ? (
            <span className="text-2xl">🏆</span>
          ) : rank === 2 ? (
            <span className="text-xl">🥈</span>
          ) : rank === 3 ? (
            <span className="text-xl">🥉</span>
          ) : (
            <span className="text-lg font-bold text-gray-500">{rank}</span>
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base truncate ${isLeader ? "text-masters-green" : "text-gray-900"}`}>
            {participant.name}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-2">
            {tierKeys.map((k, idx) => {
              const golfer = participant.picks[k]
                ? GOLFERS.find((g) => g.id === participant.picks[k])
                : null;
              if (!golfer) return null;
              const tierNum = idx + 1;
              return (
                <span key={k} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs ${TIER_BADGE[tierNum]}`}>
                  T{tierNum}: {golfer.name.split(" ").pop()}
                </span>
              );
            })}
          </div>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold font-serif ${scoreColor(totalScore)}`}>
            {formatScore(totalScore)}
          </div>
          {cutsMissed > 0 && (
            <div className="text-xs text-amber-600 mt-0.5">
              {cutsMissed} MC
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <div className={`text-gray-400 text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          ▼
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tierKeys.map((k, idx) => {
              const golferId = participant.picks[k];
              const golfer = golferId ? GOLFERS.find((g) => g.id === golferId) : null;
              const liveScore = scores[k];
              const isCounting = golferId ? countingIds.has(golferId) : false;
              const tierNum = idx + 1;

              return (
                <div
                  key={k}
                  className={`rounded-lg border p-3 ${
                    isCounting
                      ? "border-masters-green/40 bg-masters-green/5"
                      : "border-gray-200 bg-white opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[tierNum]}`}>
                        T{tierNum}
                      </span>
                      {golfer ? (
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
                            <span className="font-semibold text-sm text-gray-900">
                              {golfer.name}
                            </span>
                          </div>
                          {liveScore && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Pos: {liveScore.position} · Thru: {liveScore.thru}
                              {liveScore.isWithdrawn && " · WD"}
                              {!liveScore.madeCut && !liveScore.isWithdrawn && " · MC"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No pick</span>
                      )}
                    </div>
                    <div className="text-right">
                      {liveScore ? (
                        <>
                          <div className={`font-bold text-base ${scoreColor(liveScore.totalScore)}`}>
                            {liveScore.totalScoreDisplay}
                          </div>
                          {!isCounting && liveScore && (
                            <div className="text-xs text-gray-400">not counting</div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-300 text-sm">—</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Best {settings.countingGolfers} of 4 scores count · highlighted scores are counting
          </p>
        </div>
      )}
    </div>
  );
}
