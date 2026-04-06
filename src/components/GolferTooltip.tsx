"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Golfer } from "@/lib/types";
import { espnHeadshotUrl, FLAG_EMOJI, formatOdds } from "@/data/golfers";
import { formatPosition, getGolferHistory, sgColor } from "@/data/golfer-history";

interface GolferTooltipProps {
  golfer: Golfer;
  children: React.ReactNode;
  disabled?: boolean;
}

interface TooltipPos {
  top: number;
  left: number;
  above: boolean;
}

export default function GolferTooltip({ golfer, children, disabled }: GolferTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0, above: false });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const history = getGolferHistory(golfer.id);

  useEffect(() => { setMounted(true); }, []);

  const computePos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const TOOLTIP_H = 420;
    const TOOLTIP_W = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < TOOLTIP_H && rect.top >= TOOLTIP_H;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - TOOLTIP_W - 8));
    const top = above ? rect.top - TOOLTIP_H - 4 : rect.bottom + 4;
    setPos({ top, left, above });
  }, []);

  function handleMouseEnter() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    computePos();
    setVisible(true);
  }

  function handleMouseLeave() {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  }

  if (disabled || !history) return <>{children}</>;

  const sgBar = (val: number, max = 3) => {
    const pct = Math.min(100, Math.max(0, ((val + max) / (2 * max)) * 100));
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${val > 0 ? "bg-green-500" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-mono w-10 text-right font-semibold ${sgColor(val)}`}>
          {val > 0 ? "+" : ""}{val.toFixed(2)}
        </span>
      </div>
    );
  };

  const recentBadge = (p: number | "MC" | "WD" | "CUT", key: number) => {
    const label = formatPosition(p);
    let cls = "bg-gray-100 text-gray-600";
    if (p === "MC" || p === "WD" || p === "CUT") cls = "bg-red-100 text-red-700";
    else if (p === 1) cls = "bg-yellow-100 text-yellow-800 font-bold";
    else if ((p as number) <= 5) cls = "bg-green-100 text-green-700 font-semibold";
    else if ((p as number) <= 10) cls = "bg-blue-100 text-blue-700";
    return <span key={key} className={`text-xs px-1.5 py-0.5 rounded ${cls}`}>{label}</span>;
  };

  const tooltip = visible && (
    <div
      className="fixed z-[9999] w-80 bg-white border border-gray-200 rounded-xl shadow-2xl text-sm overflow-hidden pointer-events-auto"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="bg-masters-green text-white px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Player photo or flag fallback */}
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-masters-green-dark border-2 border-masters-gold/40">
            {golfer.espnId ? (
              <img
                src={`https://a.espncdn.com/i/headshots/golf/players/full/${golfer.espnId}.png`}
                alt={golfer.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-3xl ${golfer.espnId ? "hidden" : ""}`}>
              {FLAG_EMOJI[golfer.country] ?? "🏴"}
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-base leading-tight">{golfer.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl leading-none">{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
              <span className="text-white/70 text-xs">
                {golfer.owgr ? `OWGR #${golfer.owgr} · ` : ""}{formatOdds(golfer.odds)} FD
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Win", val: golfer.winPct },
            { label: "Top 5", val: golfer.top5Pct },
            { label: "Top 10", val: golfer.top10Pct },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/10 rounded-lg py-1.5">
              <div className="text-masters-gold font-bold text-sm">{val.toFixed(1)}%</div>
              <div className="text-white/60 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Masters history */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Masters History</h4>
          <span className="text-xs text-gray-500">{history.cutsMade}/{history.mastersAppearances} cuts</span>
        </div>
        {history.allFinishes.length === 0 ? (
          <p className="text-xs text-gray-400 italic">First Masters appearance</p>
        ) : (
          <div className="space-y-1">
            {history.allFinishes.slice(0, 5).map((f) => (
              <div key={f.year} className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{f.year}</span>
                <span className={`text-xs font-semibold ${
                  f.position === "MC" || f.position === "WD" ? "text-red-500"
                    : f.position === 1 ? "text-masters-gold-dark"
                    : (f.position as number) <= 5 ? "text-green-600"
                    : (f.position as number) <= 10 ? "text-blue-600"
                    : "text-gray-600"
                }`}>{formatPosition(f.position)}</span>
              </div>
            ))}
          </div>
        )}
        {history.bestFinish && (
          <p className="text-xs text-gray-400 mt-1.5">
            Best: <strong>{formatPosition(history.bestFinish)}</strong>
          </p>
        )}
      </div>

      {/* Recent form */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">Recent Form</h4>
        <div className="space-y-1">
          {history.recentForm.slice(0, 5).map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-500 text-xs truncate flex-1 pr-2">{r.event}</span>
              {recentBadge(r.position, i)}
            </div>
          ))}
        </div>
      </div>

      {/* Strokes Gained */}
      <div className="px-4 py-3">
        <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">
          Strokes Gained (Season)
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "Total", val: history.strokesGained.total },
            { label: "Off the Tee", val: history.strokesGained.offTheTee },
            { label: "Approach", val: history.strokesGained.approach },
            { label: "Around Green", val: history.strokesGained.aroundGreen },
            { label: "Putting", val: history.strokesGained.putting },
          ].map(({ label, val }) => (
            <div key={label}>
              <span className="text-xs text-gray-500">{label}</span>
              {sgBar(val)}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-300 mt-2">via DataGolf (approx.)</p>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {mounted && typeof document !== "undefined" && createPortal(tooltip, document.body)}
    </div>
  );
}
