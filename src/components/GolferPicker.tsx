"use client";

import { useEffect, useState } from "react";
import { Golfer, PickSlot, PoolSettings } from "@/lib/types";
import { ALL_SLOTS } from "@/lib/types";
import {
  isPickDeadlinePassed,
  loadMyName,
  loadMyPicks,
  loadParticipants,
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
} from "@/data/golfers";
import GolferTooltip from "@/components/GolferTooltip";
import GolferModal from "@/components/GolferModal";
import { Participant } from "@/lib/types";

interface GolferPickerProps {
  settings: PoolSettings;
}

// ─── Tier constraints ─────────────────────────────────────────────────────────
const TIER_MAX: Record<number, number> = { 1: 2, 2: 2, 3: 6, 4: 6 }; // T3/T4 uncapped
const TOTAL_PICKS = 6;

const TIER_STYLE = {
  1: { border: "border-yellow-200", header: "bg-yellow-100 border-yellow-300 text-yellow-900", badge: "bg-yellow-400 text-yellow-900", btn: "hover:border-yellow-400 hover:bg-yellow-50" },
  2: { border: "border-blue-200",   header: "bg-blue-100 border-blue-300 text-blue-900",     badge: "bg-blue-400 text-blue-900",     btn: "hover:border-blue-400 hover:bg-blue-50" },
  3: { border: "border-green-200",  header: "bg-green-100 border-green-300 text-green-900",  badge: "bg-green-400 text-green-900",   btn: "hover:border-green-400 hover:bg-green-50" },
  4: { border: "border-gray-200",   header: "bg-gray-100 border-gray-300 text-gray-700",     badge: "bg-gray-400 text-gray-700",     btn: "hover:border-gray-400 hover:bg-gray-50" },
} as const;

const EMPTY_PICKS: Record<PickSlot, string | null> = {
  tier1a: null, tier1b: null, tier2a: null, tier2b: null, tier3: null, tier4: null,
};

// Map picks object → flat array of selected IDs
function picksToArray(picks: Record<PickSlot, string | null>): string[] {
  return ALL_SLOTS.map((s) => picks[s]).filter(Boolean) as string[];
}

// Add a golfer ID to the picks object, respecting tier constraints
function addPick(
  picks: Record<PickSlot, string | null>,
  golfer: Golfer
): Record<PickSlot, string | null> | null {
  const all = picksToArray(picks);
  if (all.includes(golfer.id)) return null; // already picked
  if (all.length >= TOTAL_PICKS) return null; // full

  // Count how many from this tier are already picked
  const currentTierCount = all.filter(
    (id) => GOLFERS.find((g) => g.id === id)?.tier === golfer.tier
  ).length;
  if (currentTierCount >= TIER_MAX[golfer.tier]) return null; // tier full

  // Find the right slot
  // T1 → tier1a/tier1b, T2 → tier2a/tier2b, T3 → tier3, T4 → tier4
  // But since picks are now flexible, use slots as generic containers
  const emptySlot = ALL_SLOTS.find((s) => picks[s] === null);
  if (!emptySlot) return null;
  return { ...picks, [emptySlot]: golfer.id };
}

// Remove a golfer ID from picks
function removePick(
  picks: Record<PickSlot, string | null>,
  golferId: string
): Record<PickSlot, string | null> {
  const updated = { ...picks };
  for (const slot of ALL_SLOTS) {
    if (updated[slot] === golferId) { updated[slot] = null; break; }
  }
  return updated;
}

function picksComplete(picks: Record<PickSlot, string | null>): boolean {
  return picksToArray(picks).length === TOTAL_PICKS;
}

export default function GolferPicker({ settings }: GolferPickerProps) {
  const [myName, setMyName] = useState("");
  const [picks, setPicks] = useState<Record<PickSlot, string | null>>({ ...EMPTY_PICKS });
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [modalGolfer, setModalGolfer] = useState<Golfer | null>(null);
  const locked = settings.isLocked || isPickDeadlinePassed(settings);

  useEffect(() => {
    setMyName(loadMyName());
    setPicks(loadMyPicks());
  }, []);

  const selected = picksToArray(picks);
  const tierCounts = [1, 2, 3, 4].reduce((acc, t) => {
    acc[t] = selected.filter((id) => GOLFERS.find((g) => g.id === id)?.tier === t).length;
    return acc;
  }, {} as Record<number, number>);

  function handleToggle(golfer: Golfer) {
    if (locked) return;
    if (selected.includes(golfer.id)) {
      setPicks((prev) => removePick(prev, golfer.id));
    } else {
      setPicks((prev) => {
        const next = addPick(prev, golfer);
        return next ?? prev;
      });
    }
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
    const idx = existing.findIndex((p) => p.name.toLowerCase() === myName.trim().toLowerCase());
    if (idx >= 0) existing[idx] = { ...existing[idx], picks };
    else existing.push(participant);
    saveParticipants(existing);
    setSaved(true);
  }

  const complete = picksComplete(picks);
  const remaining = TOTAL_PICKS - selected.length;
  const displayGolfers = filterTier ? getGolfersByTier(filterTier) : GOLFERS;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-6">
        <h2 className="font-serif text-xl font-bold text-masters-green mb-1">Make Your Picks</h2>
        <p className="text-gray-600 text-sm mb-4">
          Select any <strong>6 golfers</strong> from the field — with a max of{" "}
          <strong>2 from Tier 1</strong> and <strong>2 from Tier 2</strong>. Mix and match
          Tiers 3 &amp; 4 however you like. Your best <strong>5 of 6</strong> scores count.
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
                type="text" value={myName}
                onChange={(e) => { setMyName(e.target.value); setNameError(""); setSaved(false); }}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green focus:ring-1 focus:ring-masters-green"
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-gray-500 mb-1">Selected</div>
              <div className="text-2xl font-bold text-masters-green">{selected.length}/6</div>
            </div>
          </div>
        )}
      </div>

      {/* Constraint + deadline bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((t) => {
          const max = TIER_MAX[t];
          const count = tierCounts[t] ?? 0;
          const atMax = max <= 2 && count >= max;
          return (
            <div key={t} className={`rounded-lg border px-3 py-2 text-center text-xs ${
              atMax ? "bg-masters-green/10 border-masters-green/40" : "bg-white border-gray-200"
            }`}>
              <div className="font-bold text-gray-700">Tier {t}</div>
              <div className={`text-sm font-bold mt-0.5 ${atMax ? "text-masters-green" : "text-gray-400"}`}>
                {count}{max <= 2 ? `/${max}` : ""}
                {atMax ? " ✓" : ""}
              </div>
              {max <= 2 && <div className="text-gray-400 text-xs mt-0.5">max {max}</div>}
            </div>
          );
        })}
      </div>

      {!locked && (
        <div className="bg-masters-green/5 border border-masters-green/20 rounded-lg px-4 py-2.5 text-sm text-masters-green flex items-center gap-2">
          <span>⏰</span>
          <span>Deadline: <strong>Thursday April 9 · 8:00 AM ET</strong></span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {[null, 1, 2, 3, 4].map((t) => (
          <button
            key={String(t)}
            onClick={() => setFilterTier(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              filterTier === t
                ? "bg-masters-green text-white border-masters-green"
                : "bg-white text-gray-600 border-gray-200 hover:border-masters-green/50"
            }`}
          >
            {t === null ? "All Tiers" : `Tier ${t}`}
          </button>
        ))}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
        >
          {showDetails ? "📊 Hide Stats" : "📊 Show Stats"}
        </button>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Lineup</div>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const g = GOLFERS.find((gg) => gg.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => !locked && handleToggle(g)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    TIER_STYLE[g.tier as 1|2|3|4].header
                  } hover:opacity-80`}
                  title="Click to remove"
                >
                  <span>{FLAG_EMOJI[g.country] ?? "🏴"}</span>
                  {g.name}
                  {!locked && <span className="opacity-50 ml-0.5">×</span>}
                </button>
              );
            })}
            {!locked && selected.length > 0 && (
              <button
                onClick={() => setPicks({ ...EMPTY_PICKS })}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Golfer grid — grouped by tier */}
      {(filterTier ? [filterTier] : [1, 2, 3, 4]).map((tierNum) => {
        const s = TIER_STYLE[tierNum as 1|2|3|4];
        const tierGolfers = getGolfersByTier(tierNum);
        const tierCount = tierCounts[tierNum] ?? 0;
        const tierMax = TIER_MAX[tierNum];
        const tierFull = tierMax <= 2 && tierCount >= tierMax;

        return (
          <div key={tierNum} className={`border rounded-xl overflow-hidden shadow-sm bg-white ${s.border}`}>
            {/* Tier header */}
            <div className={`border-b px-4 py-3 ${s.header}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>Tier {tierNum}</span>
                    <span className="font-semibold text-sm">{TIER_LABELS[tierNum].split(" — ")[1]}</span>
                    {tierMax <= 2 && <span className="text-xs opacity-60">— max {tierMax}</span>}
                  </div>
                  <p className="text-xs opacity-60 mt-0.5">{TIER_DESCRIPTIONS[tierNum]}</p>
                </div>
                {tierFull && (
                  <span className="text-xs font-bold text-masters-green bg-masters-green/10 px-2 py-1 rounded-full">
                    {tierCount}/{tierMax} ✓
                  </span>
                )}
              </div>
            </div>

            {/* Golfer buttons */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
              {tierGolfers.map((golfer) => {
                const isSelected = selected.includes(golfer.id);
                const totalFull = !isSelected && selected.length >= TOTAL_PICKS;
                const tierAtMax = !isSelected && tierFull;
                const disabled = locked || totalFull || tierAtMax;

                return (
                  <GolferTooltip key={golfer.id} golfer={golfer} disabled={!showDetails}>
                    <div className={`w-full flex items-center gap-2 rounded-lg text-left text-sm transition-all border ${
                      isSelected
                        ? "bg-masters-green text-white border-masters-green shadow-sm"
                        : disabled
                        ? "bg-gray-50 text-gray-300 border-gray-100"
                        : `bg-white border-gray-200 ${s.btn}`
                    }`}>
                      <button
                        onClick={() => handleToggle(golfer)}
                        disabled={disabled}
                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 min-w-0 ${disabled && !isSelected ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="text-xl leading-none flex-shrink-0">
                          {FLAG_EMOJI[golfer.country] ?? "🏴"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold truncate text-sm ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {golfer.name}
                          </div>
                          {showDetails && (
                            <div className={`text-xs font-mono font-bold ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                              {formatOdds(golfer.odds)}
                            </div>
                          )}
                        </div>
                        {isSelected && <span className="text-white flex-shrink-0">✓</span>}
                      </button>
                      {/* Info button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalGolfer(golfer); }}
                        className={`flex-shrink-0 w-7 h-7 mr-2 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? "text-white/60 hover:text-white hover:bg-white/20"
                            : "text-gray-400 hover:text-masters-green hover:bg-masters-green/10"
                        }`}
                        title="Player details"
                        aria-label={`Details for ${golfer.name}`}
                      >
                        ⓘ
                      </button>
                    </div>
                  </GolferTooltip>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit bar */}
      {!locked && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div>
            {complete ? (
              <p className="text-masters-green font-semibold text-sm">✓ 6 picks selected — ready to submit!</p>
            ) : (
              <p className="text-gray-500 text-sm">{remaining} pick{remaining !== 1 ? "s" : ""} remaining</p>
            )}
            {saved && <p className="text-green-600 text-xs mt-0.5">Picks saved!</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!complete}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              complete ? "bg-masters-green hover:bg-masters-green-dark text-white shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saved ? "Update Picks" : "Submit Picks"}
          </button>
        </div>
      )}

      {/* Rules summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Quick Rules</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Pick <strong>6 golfers total</strong> — max 2 from Tier 1, max 2 from Tier 2</li>
          <li>Best <strong>5 of 6</strong> scores count (worst is automatically dropped)</li>
          <li>Scores are relative to par — <strong>lowest total wins</strong></li>
          <li>Missed cut = score + <strong>+{settings.cutPenalty} strokes per remaining round</strong> (Rounds 3 &amp; 4)</li>
          <li>Picks <strong>lock at first tee time</strong> Thursday morning</li>
          <li>Hover any golfer for a quick glance · click <strong>ⓘ</strong> for full stats &amp; history</li>
        </ul>
      </div>

      {/* Player detail modal */}
      {modalGolfer && (
        <GolferModal golfer={modalGolfer} onClose={() => setModalGolfer(null)} />
      )}
    </div>
  );
}
