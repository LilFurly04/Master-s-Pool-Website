"use client";

import { useEffect, useRef, useState } from "react";
import { Golfer } from "@/lib/types";
import { FLAG_EMOJI, formatOdds } from "@/data/golfers";
import { formatPosition, getGolferHistory, sgColor } from "@/data/golfer-history";

interface GolferTooltipProps {
  golfer: Golfer;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function GolferTooltip({ golfer, children, disabled }: GolferTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<"above" | "below">("below");
  const containerRef = useRef<HTMLDivElement>(null);
  const history = getGolferHistory(golfer.id);

  useEffect(() => {
    if (!visible || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPos(spaceBelow < 340 ? "above" : "below");
  }, [visible]);

  if (disabled || !history) return <>{children}</>;

  const sgBar = (val: number, max = 3) => {
    const width = Math.min(100, Math.max(0, ((val + max) / (2 * max)) * 100));
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${val > 0 ? "bg-green-500" : "bg-red-400"}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className={`text-xs font-mono w-10 text-right font-semibold ${sgColor(val)}`}>
          {val > 0 ? "+" : ""}{val.toFixed(2)}
        </span>
      </div>
    );
  };

  const recentBadge = (pos: number | "MC" | "WD" | "CUT") => {
    const label = formatPosition(pos);
    let color = "bg-gray-100 text-gray-600";
    if (pos === "MC" || pos === "WD" || pos === "CUT") color = "bg-red-100 text-red-700";
    else if (pos === 1) color = "bg-yellow-100 text-yellow-800 font-bold";
    else if ((pos as number) <= 5) color = "bg-green-100 text-green-700 font-semibold";
    else if ((pos as number) <= 10) color = "bg-blue-100 text-blue-700";
    return (
      <span key={String(pos)} className={`text-xs px-1.5 py-0.5 rounded ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          className={`absolute z-50 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl text-sm overflow-hidden ${
            pos === "above" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          {/* Header */}
          <div className="bg-masters-green text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
              <div>
                <div className="font-bold text-base leading-tight">{golfer.name}</div>
                <div className="text-white/70 text-xs">
                  World #{golfer.worldRank} · {formatOdds(golfer.odds)} FD outright
                </div>
              </div>
            </div>
            {/* Probability bar */}
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Win", val: golfer.winPct },
                { label: "Top 5", val: golfer.top5Pct },
                { label: "Top 10", val: golfer.top10Pct },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/10 rounded-lg py-1.5">
                  <div className="text-masters-gold font-bold text-sm">{val}%</div>
                  <div className="text-white/60 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Masters history */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                Masters History
              </h4>
              <span className="text-xs text-gray-500">
                {history.cutsMade}/{history.mastersAppearances} cuts made
              </span>
            </div>
            <div className="space-y-1">
              {history.allFinishes.slice(0, 5).map((f) => (
                <div key={f.year} className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{f.year}</span>
                  <span className={`text-xs font-semibold ${
                    f.position === "MC" || f.position === "WD"
                      ? "text-red-500"
                      : f.position === 1
                      ? "text-masters-gold-dark"
                      : (f.position as number) <= 5
                      ? "text-green-600"
                      : (f.position as number) <= 10
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}>
                    {formatPosition(f.position)}
                  </span>
                </div>
              ))}
            </div>
            {history.bestFinish && (
              <p className="text-xs text-gray-400 mt-1.5">
                Best: <strong>{formatPosition(history.bestFinish)}</strong> · {history.mastersAppearances} appearances
              </p>
            )}
          </div>

          {/* Recent form */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">
              Recent Form
            </h4>
            <div className="space-y-1">
              {history.recentForm.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs truncate flex-1 pr-2">{r.event}</span>
                  {recentBadge(r.position)}
                </div>
              ))}
            </div>
          </div>

          {/* Strokes Gained */}
          <div className="px-4 py-3">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">
              Strokes Gained (Season Avg.)
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
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                  {sgBar(val)}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 mt-2">Stats via DataGolf (approx.)</p>
          </div>
        </div>
      )}
    </div>
  );
}
