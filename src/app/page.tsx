"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import TournamentLeaderboard from "@/components/TournamentLeaderboard";
import GolferPicker from "@/components/GolferPicker";
import PoolStandings from "@/components/PoolStandings";
import AdminPanel from "@/components/AdminPanel";
import { PoolSettings } from "@/lib/types";
import { loadSettings, saveSettings } from "@/lib/pool-logic";

type Tab = "leaderboard" | "picks" | "pool" | "admin";

interface LeaderboardStatus {
  round: number;
  status: "pre" | "active" | "complete";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [settings, setSettings] = useState<PoolSettings | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<LeaderboardStatus>({
    round: 0,
    status: "pre",
  });

  // Load settings client-side (localStorage)
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Periodically refresh tournament status for the header badge
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          if (data.status) {
            setTournamentInfo({
              round: data.status.round ?? 0,
              status: data.status.status ?? "pre",
            });
          }
        }
      } catch {
        // ignore
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 120_000);
    return () => clearInterval(interval);
  }, []);

  if (!settings) {
    // SSR / loading state
    return (
      <div className="min-h-screen bg-masters-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-masters-gold border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-masters-gold font-serif text-lg italic">Loading Masters Pool…</p>
        </div>
      </div>
    );
  }

  function handleSettingsChange(updated: PoolSettings) {
    setSettings(updated);
    saveSettings(updated);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={settings}
        tournamentRound={tournamentInfo.round}
        tournamentStatus={tournamentInfo.status}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {activeTab === "leaderboard" && <TournamentLeaderboard />}
        {activeTab === "picks" && <GolferPicker settings={settings} />}
        {activeTab === "pool" && <PoolStandings settings={settings} />}
        {activeTab === "admin" && (
          <AdminPanel settings={settings} onSettingsChange={handleSettingsChange} />
        )}
      </main>

      <footer className="bg-masters-green text-white/60 text-xs text-center py-4 font-serif italic">
        Masters Pool {settings.year} · Augusta National Golf Club · Scores via ESPN
      </footer>
    </div>
  );
}
