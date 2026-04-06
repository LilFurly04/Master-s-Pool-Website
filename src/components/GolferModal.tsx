"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Golfer } from "@/lib/types";
import { FLAG_EMOJI, formatOdds } from "@/data/golfers";
import { formatPosition, getGolferHistory, positionValue, sgColor } from "@/data/golfer-history";

interface GolferModalProps {
  golfer: Golfer;
  onClose: () => void;
}

export default function GolferModal({ golfer, onClose }: GolferModalProps) {
  const history = getGolferHistory(golfer.id);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const top10s = history
    ? history.allFinishes.filter((f) => { const v = positionValue(f.position); return v !== null && v <= 10; }).length
    : 0;
  const top20s = history
    ? history.allFinishes.filter((f) => { const v = positionValue(f.position); return v !== null && v <= 20; }).length
    : 0;

  const sgBar = (val: number, max = 3) => {
    const pct = Math.min(100, Math.max(0, ((val + max) / (2 * max)) * 100));
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${val > 0 ? "bg-green-500" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-mono w-12 text-right font-bold ${sgColor(val)}`}>
          {val > 0 ? "+" : ""}{val.toFixed(2)}
        </span>
      </div>
    );
  };

  const finishBadge = (p: number | string, key: number | string) => {
    const label = formatPosition(p);
    const v = positionValue(p);
    let cls = "bg-gray-100 text-gray-600";
    if (p === "MC" || p === "WD" || p === "CUT") cls = "bg-red-100 text-red-700 font-semibold";
    else if (v === 1) cls = "bg-yellow-100 text-yellow-800 font-bold";
    else if (v !== null && v <= 5) cls = "bg-green-100 text-green-700 font-semibold";
    else if (v !== null && v <= 10) cls = "bg-blue-100 text-blue-700 font-semibold";
    return (
      <span key={key} className={`inline-block text-xs px-2 py-0.5 rounded-full ${cls}`}>
        {label}
      </span>
    );
  };

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="bg-masters-green text-white px-5 py-4 rounded-t-2xl">
          <div className="flex items-start gap-4">
            {/* Flag */}
            <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-5xl bg-masters-green-dark border-2 border-masters-gold/30">
              {FLAG_EMOJI[golfer.country] ?? "🏴"}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-tight">{golfer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/70 text-sm">
                  {golfer.owgr ? `OWGR #${golfer.owgr}` : ""}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="bg-masters-gold/20 border border-masters-gold/40 text-masters-gold text-xs font-bold px-2.5 py-1 rounded-full">
                  {formatOdds(golfer.odds)} FanDuel
                </span>
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                  Win {golfer.winPct.toFixed(1)}%
                </span>
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                  Top 5 {golfer.top5Pct.toFixed(1)}%
                </span>
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                  Top 10 {golfer.top10Pct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white/60 hover:text-white text-2xl leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-100">

          {/* Masters career summary */}
          {history ? (
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">
                Masters Career
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Best Finish", val: history.bestFinish ? formatPosition(history.bestFinish) : "—" },
                  { label: "Top 10s", val: top10s },
                  { label: "Top 20s", val: top20s },
                  { label: "Cuts Made", val: `${history.cutsMade}/${history.mastersAppearances}` },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center bg-gray-50 rounded-xl py-3">
                    <div className="text-lg font-bold text-masters-green">{val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Last 5 finishes */}
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Last 5 Appearances</h4>
              {history.allFinishes.length === 0 ? (
                <p className="text-sm text-gray-400 italic">First Masters appearance</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {history.allFinishes.slice(0, 5).map((f) => (
                    <div key={f.year} className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">{f.year}</span>
                      {finishBadge(f.position, f.year)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-4 text-sm text-gray-400 italic">
              No Masters history on record.
            </div>
          )}

          {/* Recent form */}
          {history && history.recentForm.length > 0 && (
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">
                Recent Form
              </h3>
              <div className="space-y-2">
                {history.recentForm.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex-1 pr-3 truncate">{r.event}</span>
                    {finishBadge(r.position, i)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strokes gained */}
          {history && (
            <div className="px-5 py-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">
                Strokes Gained — 2025/26 Season
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Total",         val: history.strokesGained.total },
                  { label: "Off the Tee",   val: history.strokesGained.offTheTee },
                  { label: "Approach",      val: history.strokesGained.approach },
                  { label: "Around Green",  val: history.strokesGained.aroundGreen },
                  { label: "Putting",       val: history.strokesGained.putting },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    {sgBar(val)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-300 mt-3">Approximate via DataGolf</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
