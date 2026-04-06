"use client";

import { useEffect, useState } from "react";
import { Golfer, Participant, PickSlot, PoolSettings, TIER_SLOTS } from "@/lib/types";
import GolferTooltip from "@/components/GolferTooltip";
import {
  countPicksForTier,
  isPickDeadlinePassed,
  loadMyName,
  loadMyPicks,
  loadParticipants,
  picksComplete,
  saveMyName,
  saveMyPicks,
  saveParticipants,
} from "@/lib/pool-logic";
import {
  FLAG_EMOJI,
  formatOdds,
  GOLFERS,
  getGolfersByTier,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  TIER_PICK_COUNT,
} from "@/data/golfers";

interface GolferPickerProps {
  settings: PoolSettings;
}

const TIER_STYLE = {
  1: { border: "border-yellow-200 bg-yellow-50",   header: "bg-yellow-100 border-yellow-300 text-yellow-900",  badge: "bg-yellow-400 text-yellow-900",  btn: "hover:border-yellow-400 hover:bg-yellow-50" },
  2: { border: "border-blue-200 bg-blue-50",       header: "bg-blue-100 border-blue-300 text-blue-900",        badge: "bg-blue-400 text-blue-900",      btn: "hover:border-blue-400 hover:bg-blue-50" },
  3: { border: "border-green-200 bg-green-50",     header: "bg-green-100 border-green-300 text-green-900",    badge: "bg-green-400 text-green-900",    btn: "hover:border-green-400 hover:bg-green-50" },
  4: { border: "border-gray-200 bg-gray-50",       header: "bg-gray-100 border-gray-300 text-gray-700",       badge: "bg-gray-400 text-gray-700",      btn: "hover:border-gray-400 hover:bg-gray-50" },
} as const;

const EMPTY_PICKS: Record<PickSlot, string | null> = {
  tier1a: null, tier1b: null, tier2a: null, tier2b: null, tier3: null, tier4: null,
};

export default function GolferPicker({ settings }: GolferPickerProps) {
  const [myName, setMyName] = useState("");
  const [picks, setPicks] = useState<Record<PickSlot, string | null>>({ ...EMPTY_PICKS });
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const locked = settings.isLocked || isPickDeadlinePassed(settings);

  useEffect(() => {
    setMyName(loadMyName());
    setPicks(loadMyPicks());
  }, []);

  // All currently selected golfer IDs across all slots
  const allSelected = Object.values(picks).filter(Boolean) as string[];

  function handlePick(tier: 1 | 2 | 3 | 4, golferId: string) {
    if (locked) return;
    const slots = TIER_SLOTS[tier];
    const limit = TIER_PICK_COUNT[tier];

    setPicks((prev) => {
      // If already selected in this tier, deselect it
      const slot = slots.find((s) => prev[s] === golferId);
      if (slot) return { ...prev, [slot]: null };

      // Can't pick same golfer in another tier
      if (allSelected.includes(golferId)) return prev;

      // Find first empty slot in this tier
      const emptySlot = slots.find((s) => !prev[s]);
      if (!emptySlot) {
        // Tier full — replace the second pick (slot B / last slot)
        if (limit === 2) return { ...prev, [slots[1]]: golferId };
        return prev;
      }
      return { ...prev, [emptySlot]: golferId };
    });
    setSaved(false);
  }

  function handleSubmit() {
    if (!myName.trim()) { setNameError("Please enter your name."); return; }
    setNameError("");
    saveMyName(myName.trim());
    saveMyPicks(picks);

    const existing = loadParticipants();
    const participant: Participant = {
      id: myName.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: myName.trim(),
      picks,
    };
    const idx = existing.findIndex(
      (p) => p.name.toLowerCase() === myName.trim().toLowerCase()
    );
    if (idx >= 0) existing[idx] = { ...existing[idx], picks };
    else existing.push(participant);
    saveParticipants(existing);
    setSaved(true);
  }

  const complete = picksComplete({ id: "", name: "", picks });
  const pickedCount = allSelected.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-6">
        <h2 className="font-serif text-xl font-bold text-masters-green mb-1">Make Your Picks</h2>
        <p className="text-gray-600 text-sm mb-4">
          Pick <strong>2 from Tier 1</strong>, <strong>2 from Tier 2</strong>,{" "}
          <strong>1 from Tier 3</strong>, and <strong>1 from Tier 4</strong> — 6 golfers total.
          Your best <strong>5 of 6</strong> scores count. Lowest total wins!
        </p>
        {locked ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
            🔒 Picks are locked — the deadline has passed or the admin has closed submissions.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Your Name</label>
              <input
                type="text"
                value={myName}
                onChange={(e) => { setMyName(e.target.value); setNameError(""); setSaved(false); }}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green focus:ring-1 focus:ring-masters-green"
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-gray-500 mb-1">Progress</div>
              <div className="text-2xl font-bold text-masters-green">{pickedCount}/6</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {!locked && (
          <div className="bg-masters-green/5 border border-masters-green/20 rounded-lg px-4 py-3 text-sm text-masters-green flex items-center gap-2 flex-1">
            <span>⏰</span>
            <span>Deadline: <strong>Thursday April 9 · 8:00 AM ET</strong></span>
          </div>
        )}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0"
          title="Toggle detailed stats (odds, win %, strokes gained)"
        >
          <span>{showDetails ? "🔽" : "📊"}</span>
          <span className="hidden sm:inline">{showDetails ? "Hide Stats" : "Show Stats"}</span>
        </button>
      </div>

      {/* Tier pickers */}
      {([1, 2, 3, 4] as const).map((tierNum) => {
        const s = TIER_STYLE[tierNum];
        const tierGolfers = getGolfersByTier(tierNum);
        const limit = TIER_PICK_COUNT[tierNum];
        const slots = TIER_SLOTS[tierNum];
        const tierPicks = slots.map((slot) => picks[slot]).filter(Boolean) as string[];
        const tierCount = countPicksForTier({ id: "", name: "", picks }, tierNum);

        return (
          <div key={tierNum} className={`border rounded-xl overflow-hidden shadow-sm ${s.border}`}>
            {/* Tier header */}
            <div className={`border-b px-4 py-3 ${s.header}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                      Tier {tierNum}
                    </span>
                    <span className="font-semibold text-sm">
                      {TIER_LABELS[tierNum].split(" — ")[1]}
                    </span>
                    <span className="text-xs opacity-60">— pick {limit}</span>
                  </div>
                  <p className="text-xs opacity-60">{TIER_DESCRIPTIONS[tierNum]}</p>
                </div>
                {/* Selected picks summary */}
                <div className="text-right text-sm flex-shrink-0">
                  {tierPicks.length === 0 ? (
                    <span className="text-xs opacity-50">{limit} needed</span>
                  ) : (
                    <div className="space-y-0.5">
                      {tierPicks.map((id) => {
                        const g = GOLFERS.find((gg) => gg.id === id);
                        return g ? (
                          <div key={id} className="flex items-center gap-1 justify-end font-semibold text-xs">
                            {FLAG_EMOJI[g.country] ?? "🏴"} {g.name.split(" ").pop()} ✓
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Golfer grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {tierGolfers.map((golfer) => {
                const isSelected = tierPicks.includes(golfer.id);
                const isPickedElsewhere = allSelected.includes(golfer.id) && !isSelected;
                const tierFull = tierCount >= limit && !isSelected;

                return (
                  <GolferTooltip key={golfer.id} golfer={golfer} disabled={!showDetails}>
                    <button
                      onClick={() => handlePick(tierNum, golfer.id)}
                      disabled={locked || isPickedElsewhere || (tierFull && !isSelected)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all border ${
                        isSelected
                          ? "bg-masters-green text-white border-masters-green shadow-md"
                          : isPickedElsewhere || (tierFull && !isSelected)
                          ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                          : `bg-white border-gray-200 cursor-pointer ${s.btn}`
                      }`}
                    >
                      <span className="text-xl leading-none">{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate text-sm ${isSelected ? "text-white" : "text-gray-900"}`}>
                          {golfer.name}
                        </div>
                        {showDetails && (
                          <div className={`text-xs flex items-center gap-2 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                            <span className="font-mono font-bold">{formatOdds(golfer.odds)}</span>
                            <span>·</span>
                            <span>Win {golfer.winPct.toFixed(1)}%</span>
                            <span>·</span>
                            <span>Top5 {golfer.top5Pct}%</span>
                          </div>
                        )}
                      </div>
                      {isSelected && <span className="text-white text-base flex-shrink-0">✓</span>}
                    </button>
                  </GolferTooltip>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className={`px-4 pb-3`}>
              <div className="flex gap-1">
                {Array.from({ length: limit }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < tierCount ? "bg-masters-green" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{tierCount}/{limit} selected</p>
            </div>
          </div>
        );
      })}

      {/* Submit */}
      {!locked && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div>
            {complete ? (
              <p className="text-masters-green font-semibold text-sm">✓ All 6 picks selected — ready to submit!</p>
            ) : (
              <p className="text-gray-500 text-sm">{6 - pickedCount} pick{6 - pickedCount !== 1 ? "s" : ""} remaining</p>
            )}
            {saved && <p className="text-green-600 text-xs mt-0.5">Picks saved successfully!</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!complete}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              complete
                ? "bg-masters-green hover:bg-masters-green-dark text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saved ? "Update Picks" : "Submit Picks"}
          </button>
        </div>
      )}

      {/* Mini rules */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Quick Rules</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Pick <strong>2 from Tier 1, 2 from Tier 2, 1 from Tier 3, 1 from Tier 4</strong></li>
          <li>Best <strong>5 of 6</strong> golfer scores count toward your total (worst score dropped)</li>
          <li>Scores are relative to par — <strong>lowest total wins</strong></li>
          <li>Missed cut = your score + <strong>+{settings.cutPenalty} strokes per remaining round</strong></li>
          <li>Picks <strong>lock at first tee time</strong> Thursday morning</li>
        </ul>
      </div>
    </div>
  );
}
