"use client";

import { useCallback, useEffect, useState } from "react";
import { LiveScore, Participant, PickSlot, PoolEntry, PoolSettings } from "@/lib/types";
import { ALL_SLOTS } from "@/lib/types";
import { computePoolEntries, formatScore, loadParticipants, scoreColor } from "@/lib/pool-logic";
import { FLAG_EMOJI, GOLFERS, formatOdds } from "@/data/golfers";

interface PoolStandingsProps {
  settings: PoolSettings;
}

interface LeaderboardData {
  scores: LiveScore[];
  status: { status: "pre" | "active" | "complete"; round: number };
}

const SLOT_LABEL: Record<PickSlot, string> = {
  tier1a: "T1A", tier1b: "T1B",
  tier2a: "T2A", tier2b: "T2B",
  tier3: "T3", tier4: "T4",
};

const SLOT_BADGE: Record<PickSlot, string> = {
  tier1a: "bg-yellow-100 text-yellow-800 border-yellow-300",
  tier1b: "bg-yellow-100 text-yellow-800 border-yellow-300",
  tier2a: "bg-blue-100 text-blue-800 border-blue-300",
  tier2b: "bg-blue-100 text-blue-800 border-blue-300",
  tier3: "bg-green-100 text-green-800 border-green-300",
  tier4: "bg-gray-100 text-gray-700 border-gray-300",
};

function ProbabilityBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function PoolStandings({ settings }: PoolStandingsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [entries, setEntries] = useState<PoolEntry[]>([]);
  const [tournamentStatus, setTournamentStatus] = useState<"pre" | "active" | "complete">("pre");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showProb, setShowProb] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const p = loadParticipants();
    setParticipants(p);
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data: LeaderboardData = await res.json();
        const scores = data.scores ?? [];
        setLiveScores(scores);
        setTournamentStatus(data.status?.status ?? "pre");
        setEntries(computePoolEntries(p, scores, settings));
        setLastRefresh(new Date());
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
          Add participants via the <strong>Admin</strong> tab, or have people submit picks in <strong>Make Picks</strong>.
        </p>
      </div>
    );
  }

  const isPre = tournamentStatus === "pre";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-masters-green">{settings.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {participants.length} entrant{participants.length !== 1 ? "s" : ""} · Best {settings.countingGolfers} of 6 scores count ·{" "}
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProb((v) => !v)}
            className="text-xs border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
          >
            <span>{showProb ? "📊" : "📉"}</span>
            <span>{showProb ? "Hide Odds" : "Show Odds"}</span>
          </button>
          <button
            onClick={fetchData}
            className="text-xs text-masters-green border border-masters-green/30 hover:bg-masters-green hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Probability legend */}
      {showProb && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-500 flex flex-wrap gap-4">
          <div>
            <span className="font-semibold text-gray-700">Pool Win%</span> — probability of winning the overall pool
            {isPre ? " (pre-tournament, based on lineup odds)" : " (live, based on current scores + remaining rounds)"}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Golfer Win%</span> — probability ≥1 of your 6 golfers wins the tournament
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <EntryCard
            key={entry.participant.id}
            entry={entry}
            rank={i + 1}
            isExpanded={expanded === entry.participant.id}
            onToggle={() => setExpanded((prev) => prev === entry.participant.id ? null : entry.participant.id)}
            settings={settings}
            showProb={showProb}
            isPre={isPre}
          />
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  entry, rank, isExpanded, onToggle, settings, showProb, isPre,
}: {
  entry: PoolEntry;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  settings: PoolSettings;
  showProb: boolean;
  isPre: boolean;
}) {
  const { participant, scores, probability, droppedScore, cutsMissed } = entry;
  const isLeader = rank === 1;

  // Find which slot has the dropped score
  const slotScores = ALL_SLOTS.map((slot) => {
    const score = scores[slot];
    if (!score) return { slot, val: null };
    const effective = score.isWithdrawn
      ? score.totalScore + settings.cutPenalty * 4
      : !score.madeCut && score.currentRound > 2
      ? score.totalScore + settings.cutPenalty * 2
      : score.totalScore;
    return { slot, val: effective };
  });
  const validSlots = slotScores.filter((s) => s.val !== null).sort((a, b) => a.val! - b.val!);
  const droppedSlots = new Set(
    validSlots.slice(settings.countingGolfers).map((s) => s.slot)
  );

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm transition-all ${isLeader ? "border-masters-gold bg-masters-gold/5" : "border-gray-200 bg-white"}`}>
      {/* Main row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Rank */}
        <div className="w-8 text-center flex-shrink-0">
          {rank === 1 ? <span className="text-2xl">🏆</span>
            : rank === 2 ? <span className="text-xl">🥈</span>
            : rank === 3 ? <span className="text-xl">🥉</span>
            : <span className="text-base font-bold text-gray-500">{rank}</span>}
        </div>

        {/* Name + golfer chips */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base ${isLeader ? "text-masters-green" : "text-gray-900"}`}>
            {participant.name}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {ALL_SLOTS.map((slot) => {
              const golfer = participant.picks[slot]
                ? GOLFERS.find((g) => g.id === participant.picks[slot])
                : null;
              if (!golfer) return null;
              const isDropped = droppedSlots.has(slot);
              const flag = FLAG_EMOJI[golfer.country] ?? "🏴";
              return (
                <span
                  key={slot}
                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium ${
                    isDropped
                      ? "bg-gray-50 border-gray-200 text-gray-300 line-through"
                      : SLOT_BADGE[slot]
                  }`}
                >
                  {flag} {golfer.name.split(" ").pop()}
                </span>
              );
            })}
          </div>
        </div>

        {/* Score + probability */}
        <div className="text-right flex-shrink-0 space-y-1">
          <div className={`text-2xl font-bold font-serif ${scoreColor(entry.totalScore)}`}>
            {isPre ? "—" : formatScore(entry.totalScore)}
          </div>
          {showProb && !isPre && (
            <ProbabilityBar pct={probability.poolWinPct} color="bg-masters-green" />
          )}
          {showProb && isPre && (
            <div className="text-xs text-gray-400">Win {probability.poolWinPct.toFixed(1)}%</div>
          )}
          {cutsMissed > 0 && (
            <div className="text-xs text-amber-600">{cutsMissed} MC</div>
          )}
        </div>

        <div className={`text-gray-400 text-xs transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>▼</div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          {/* Probability cards */}
          {showProb && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: isPre ? "Pool Win%" : "Pool Win% (live)", val: probability.poolWinPct, color: "text-masters-green", bar: "bg-masters-green" },
                { label: "Pool Top 3%", val: probability.poolTop3Pct, color: "text-blue-600", bar: "bg-blue-500" },
                { label: "Pool Top 5%", val: probability.poolTop5Pct, color: "text-purple-600", bar: "bg-purple-500" },
                { label: "Golfer Win%", val: probability.lineupGolferWinPct, color: "text-masters-gold-dark", bar: "bg-masters-gold" },
              ].map(({ label, val, color, bar }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className={`text-xl font-bold font-serif ${color}`}>{val.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, val)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Golfer scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ALL_SLOTS.map((slot) => {
              const golferId = participant.picks[slot];
              const golfer = golferId ? GOLFERS.find((g) => g.id === golferId) : null;
              const liveScore = scores[slot];
              const isDropped = droppedSlots.has(slot);
              const tierNum = slot.startsWith("tier1") ? 1 : slot.startsWith("tier2") ? 2 : slot === "tier3" ? 3 : 4;
              const flag = golfer ? FLAG_EMOJI[golfer.country] ?? "🏴" : "";

              return (
                <div
                  key={slot}
                  className={`rounded-lg border p-3 ${
                    isDropped
                      ? "border-gray-200 bg-white opacity-50"
                      : "border-masters-green/30 bg-masters-green/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold px-1 py-0.5 rounded ${SLOT_BADGE[slot]}`}>
                          {SLOT_LABEL[slot]}
                        </span>
                        {isDropped && <span className="text-xs text-gray-400">dropped</span>}
                      </div>
                      {golfer ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-base">{flag}</span>
                            <span className="font-semibold text-sm text-gray-900 truncate">{golfer.name}</span>
                          </div>
                          {liveScore && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Pos: {liveScore.position} · Thru: {liveScore.thru}
                              {liveScore.isWithdrawn && " · WD"}
                              {!liveScore.madeCut && !liveScore.isWithdrawn && liveScore.currentRound > 2 && " · MC"}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">{formatOdds(golfer.odds)}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No pick</span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {liveScore ? (
                        <div className={`font-bold text-lg ${scoreColor(liveScore.totalScore)}`}>
                          {liveScore.totalScoreDisplay}
                        </div>
                      ) : golfer ? (
                        <div className="text-gray-300 text-sm">—</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Best {settings.countingGolfers} of 6 count · Strikethrough = dropped score · MC penalty: +{settings.cutPenalty}/remaining round
          </p>
        </div>
      )}
    </div>
  );
}
