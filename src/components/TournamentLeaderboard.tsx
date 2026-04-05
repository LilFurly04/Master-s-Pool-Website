"use client";

import { useEffect, useState, useCallback } from "react";
import { LiveScore, TournamentStatus } from "@/lib/types";
import { formatScore, scoreColor } from "@/lib/pool-logic";
import { GOLFERS, FLAG_EMOJI, getGolferById } from "@/data/golfers";

interface LeaderboardData {
  scores: LiveScore[];
  status: TournamentStatus;
  source: string;
}

const TIER_COLORS: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-blue-400 text-blue-900",
  3: "bg-green-400 text-green-900",
  4: "bg-gray-400 text-gray-900",
};

const TIER_LABELS_SHORT: Record<number, string> = {
  1: "T1", 2: "T2", 3: "T3", 4: "T4",
};

export default function TournamentLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const json: LeaderboardData = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError("Unable to load leaderboard. Retrying…");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-masters-green border-t-masters-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-serif italic">Loading leaderboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-500">
        {error ?? "No data available."}
      </div>
    );
  }

  const { scores, status } = data;
  const isPre = status.status === "pre";

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="bg-masters-green/5 border border-masters-green/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-masters-green font-serif text-xl font-bold">{status.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {isPre
              ? "Tournament begins Thursday, April 9 · First tee 8:00 AM ET"
              : `Round ${status.round} · Last updated ${lastRefresh ? lastRefresh.toLocaleTimeString() : "—"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.source === "demo" && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              Demo data
            </span>
          )}
          <button
            onClick={fetchLeaderboard}
            className="text-xs text-masters-green border border-masters-green/30 hover:bg-masters-green hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {isPre ? (
        <PreTournamentField />
      ) : (
        <LeaderboardTable scores={scores} />
      )}
    </div>
  );
}

function LeaderboardTable({ scores }: { scores: LiveScore[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-masters-green text-white">
              <th className="text-left px-4 py-3 font-semibold w-12">Pos</th>
              <th className="text-left px-4 py-3 font-semibold">Player</th>
              <th className="text-center px-3 py-3 font-semibold">Total</th>
              <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">Thru</th>
              <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">R1</th>
              <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">R2</th>
              <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">R3</th>
              <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">R4</th>
              <th className="text-center px-3 py-3 font-semibold">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scores.map((score, i) => {
              const golfer = getGolferById(score.golferId);
              const tier = golfer?.tier;
              const flag = golfer ? FLAG_EMOJI[golfer.country] ?? "🏴" : "🏴";
              const isTop3 = i < 3;

              return (
                <tr
                  key={score.golferId}
                  className={`transition-colors ${
                    isTop3 ? "bg-masters-gold/5" : "hover:bg-gray-50"
                  } ${score.isWithdrawn ? "opacity-50" : ""}`}
                >
                  {/* Position */}
                  <td className="px-4 py-3 text-center">
                    {i === 0 ? (
                      <span className="text-lg">🏆</span>
                    ) : (
                      <span className={`font-bold ${isTop3 ? "text-masters-gold-dark" : "text-gray-600"}`}>
                        {score.position}
                      </span>
                    )}
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{flag}</span>
                      <div>
                        <span className={`font-semibold ${isTop3 ? "text-masters-green" : "text-gray-900"}`}>
                          {score.golferName}
                        </span>
                        {score.isWithdrawn && (
                          <span className="ml-2 text-xs text-red-500 font-medium">WD</span>
                        )}
                        {!score.madeCut && !score.isWithdrawn && (
                          <span className="ml-2 text-xs text-gray-400 font-medium">MC</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total score */}
                  <td className={`px-3 py-3 text-center font-bold text-base ${scoreColor(score.totalScore)}`}>
                    {score.totalScoreDisplay}
                  </td>

                  {/* Thru */}
                  <td className="px-3 py-3 text-center text-gray-500 hidden sm:table-cell">
                    {score.thru}
                  </td>

                  {/* Round scores */}
                  {[0, 1, 2, 3].map((r) => (
                    <td key={r} className={`px-3 py-3 text-center hidden md:table-cell ${scoreColor(score.roundScores[r] ?? null)}`}>
                      {formatScore(score.roundScores[r] ?? null)}
                    </td>
                  ))}

                  {/* Tier badge */}
                  <td className="px-3 py-3 text-center">
                    {tier ? (
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[tier]}`}>
                        {TIER_LABELS_SHORT[tier]}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreTournamentField() {
  return (
    <div className="space-y-4">
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">⛳</div>
        <h3 className="font-serif text-xl font-bold text-masters-green mb-1">
          Tournament Begins Thursday, April 9
        </h3>
        <p className="text-gray-600 text-sm">
          Live scoring will appear here once the tournament starts. Submit your picks before the first tee time!
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-masters-green text-white px-4 py-3">
          <h3 className="font-semibold">2026 Masters Field</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-semibold">Player</th>
                <th className="text-center px-4 py-2 text-gray-600 font-semibold">World Rank</th>
                <th className="text-center px-4 py-2 text-gray-600 font-semibold">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {GOLFERS.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 flex items-center gap-2">
                    <span>{FLAG_EMOJI[g.country] ?? "🏴"}</span>
                    <span className="font-medium text-gray-900">{g.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-500">#{g.worldRank}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[g.tier]}`}>
                      T{g.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
