"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Golfer } from "@/lib/types";
import { FLAG_EMOJI, formatOdds } from "@/data/golfers";
import { formatPosition, getGolferHistory, positionValue } from "@/data/golfer-history";

interface GolferTooltipProps {
  golfer: Golfer;
  children: React.ReactNode;
  disabled?: boolean;
}

interface TooltipPos {
  top: number;
  left: number;
}

export default function GolferTooltip({ golfer, children, disabled }: GolferTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const history = getGolferHistory(golfer.id);

  useEffect(() => { setMounted(true); }, []);

  const computePos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const TOOLTIP_H = 160;
    const TOOLTIP_W = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < TOOLTIP_H && rect.top >= TOOLTIP_H;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - TOOLTIP_W - 8));
    const top = above ? rect.top - TOOLTIP_H - 4 : rect.bottom + 4;
    setPos({ top, left });
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

  const top10s = history.allFinishes.filter(
    (f) => { const v = positionValue(f.position); return v !== null && v <= 10; }
  ).length;
  const top20s = history.allFinishes.filter(
    (f) => { const v = positionValue(f.position); return v !== null && v <= 20; }
  ).length;

  const tooltip = visible && (
    <div
      className="fixed z-[9999] w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Compact header */}
      <div className="bg-masters-green text-white px-3 py-2.5 flex items-center gap-2.5">
        <span className="text-2xl leading-none flex-shrink-0">{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
        <div className="min-w-0">
          <div className="font-bold text-sm leading-tight truncate">{golfer.name}</div>
          <div className="text-white/70 text-xs">
            {golfer.owgr ? `#${golfer.owgr} · ` : ""}{formatOdds(golfer.odds)} FD
          </div>
        </div>
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 text-center py-2.5 px-1">
        <div>
          <div className="text-xs font-bold text-masters-green">
            {history.bestFinish ? formatPosition(history.bestFinish) : "—"}
          </div>
          <div className="text-[10px] text-gray-400 leading-tight mt-0.5">Best</div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">{top10s}</div>
          <div className="text-[10px] text-gray-400 leading-tight mt-0.5">Top 10s</div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">{top20s}</div>
          <div className="text-[10px] text-gray-400 leading-tight mt-0.5">Top 20s</div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">
            {history.cutsMade}/{history.mastersAppearances}
          </div>
          <div className="text-[10px] text-gray-400 leading-tight mt-0.5">Cuts</div>
        </div>
      </div>

      <div className="px-3 pb-2 text-center">
        <span className="text-[10px] text-gray-300">Click ⓘ for full stats</span>
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
