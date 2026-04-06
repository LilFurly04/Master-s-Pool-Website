"use client";

import { PoolSettings } from "@/lib/types";

export type Tab = "leaderboard" | "picks" | "pool" | "rules" | "admin";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  settings: PoolSettings;
  tournamentRound: number;
  tournamentStatus: "pre" | "active" | "complete";
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "leaderboard", label: "Live Leaderboard", icon: "🏌️" },
  { id: "picks",       label: "Make Picks",       icon: "✏️" },
  { id: "pool",        label: "Pool Standings",   icon: "🏆" },
  { id: "rules",       label: "Rules",            icon: "📋" },
  { id: "admin",       label: "Admin",            icon: "⚙️" },
];

export default function Header({
  activeTab, onTabChange, settings, tournamentRound, tournamentStatus,
}: HeaderProps) {
  const statusBadge = () => {
    if (tournamentStatus === "pre")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-masters-gold/20 text-masters-gold border border-masters-gold/40">
          <span className="w-1.5 h-1.5 rounded-full bg-masters-gold animate-pulse inline-block" />
          Starts Apr 9
        </span>
      );
    if (tournamentStatus === "active")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-300 border border-green-400/40">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          LIVE · Round {tournamentRound}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-masters-gold/20 text-masters-gold border border-masters-gold/40">
        🏆 Final
      </span>
    );
  };

  return (
    <header className="bg-masters-gradient shadow-2xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-masters-gold text-3xl">⛳</div>
          <div>
            <h1 className="text-white font-serif text-2xl sm:text-3xl font-bold tracking-wide leading-none">
              {settings.name}
            </h1>
            <p className="text-masters-gold/80 text-sm mt-0.5 font-serif italic">
              Augusta National · April 9–12, {settings.year}
            </p>
          </div>
        </div>
        {statusBadge()}
      </div>

      <div className="h-px bg-masters-gold/30 mx-4" />

      <nav className="max-w-6xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-150 ${
                activeTab === tab.id
                  ? "border-masters-gold text-masters-gold"
                  : "border-transparent text-white/60 hover:text-white/90 hover:border-white/30"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
