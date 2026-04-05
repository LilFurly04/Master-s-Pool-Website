"use client";

import { useEffect, useState } from "react";
import { Participant, PoolSettings } from "@/lib/types";
import {
  loadMyName,
  loadMyPicks,
  loadParticipants,
  picksComplete,
  saveMyName,
  saveMyPicks,
  saveParticipants,
  isPickDeadlinePassed,
} from "@/lib/pool-logic";
import {
  GOLFERS,
  TIER_LABELS,
  TIER_DESCRIPTIONS,
  getGolfersByTier,
  FLAG_EMOJI,
} from "@/data/golfers";

interface GolferPickerProps {
  settings: PoolSettings;
}

type TierKey = "tier1" | "tier2" | "tier3" | "tier4";

const TIER_KEYS: TierKey[] = ["tier1", "tier2", "tier3", "tier4"];

const TIER_BORDER: Record<number, string> = {
  1: "border-yellow-300 bg-yellow-50",
  2: "border-blue-300 bg-blue-50",
  3: "border-green-300 bg-green-50",
  4: "border-gray-300 bg-gray-50",
};

const TIER_BADGE: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-blue-400 text-blue-900",
  3: "bg-green-400 text-green-900",
  4: "bg-gray-400 text-gray-900",
};

const TIER_HEADER: Record<number, string> = {
  1: "bg-yellow-400/20 border-yellow-400/40 text-yellow-800",
  2: "bg-blue-400/20 border-blue-400/40 text-blue-800",
  3: "bg-green-400/20 border-green-400/40 text-green-800",
  4: "bg-gray-200/60 border-gray-300 text-gray-700",
};

export default function GolferPicker({ settings }: GolferPickerProps) {
  const [myName, setMyName] = useState("");
  const [picks, setPicks] = useState<Participant["picks"]>({
    tier1: null, tier2: null, tier3: null, tier4: null,
  });
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const locked = settings.isLocked || isPickDeadlinePassed(settings);

  useEffect(() => {
    setMyName(loadMyName());
    setPicks(loadMyPicks());
  }, []);

  function handlePick(tierKey: TierKey, golferId: string) {
    if (locked) return;
    setPicks((prev) => {
      // Ensure golfer isn't already picked in another tier
      const already = TIER_KEYS.find((k) => k !== tierKey && prev[k] === golferId);
      if (already) return prev;
      return { ...prev, [tierKey]: golferId };
    });
    setSaved(false);
  }

  function handleSubmit() {
    if (!myName.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");
    saveMyName(myName.trim());
    saveMyPicks(picks);

    // Upsert into participants list
    const existing = loadParticipants();
    const idx = existing.findIndex(
      (p) => p.name.toLowerCase() === myName.trim().toLowerCase()
    );
    const participant: Participant = {
      id: myName.trim().toLowerCase().replace(/\s+/g, "_"),
      name: myName.trim(),
      picks,
    };
    if (idx >= 0) {
      existing[idx] = participant;
    } else {
      existing.push(participant);
    }
    saveParticipants(existing);
    setSaved(true);
    setSubmitted(true);
  }

  const complete = picksComplete({ id: "", name: "", picks });
  const allGolfersPicked = Object.values(picks).filter(Boolean);

  // Count how many tiers are picked
  const pickedCount = TIER_KEYS.filter((k) => picks[k] !== null).length;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-6">
        <h2 className="font-serif text-xl font-bold text-masters-green mb-1">
          Make Your Picks
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Select <strong>1 golfer from each tier</strong> (4 picks total). Your best 3 of 4 scores
          count toward your pool total. Lowest score wins!
        </p>

        {locked ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
            🔒 Picks are locked — the tournament has started or the deadline has passed.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={myName}
                onChange={(e) => { setMyName(e.target.value); setNameError(""); setSaved(false); }}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green focus:ring-1 focus:ring-masters-green"
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Progress</div>
              <div className="text-2xl font-bold text-masters-green">{pickedCount}/4</div>
            </div>
          </div>
        )}
      </div>

      {/* Deadline banner */}
      {!locked && (
        <div className="bg-masters-green/5 border border-masters-green/20 rounded-lg px-4 py-3 text-sm text-masters-green flex items-center gap-2">
          <span>⏰</span>
          <span>
            Pick deadline: <strong>Thursday, April 9 at 8:00 AM ET</strong> — before the first tee time
          </span>
        </div>
      )}

      {/* Tier pickers */}
      {[1, 2, 3, 4].map((tierNum) => {
        const tierKey = `tier${tierNum}` as TierKey;
        const tierGolfers = getGolfersByTier(tierNum);
        const selectedId = picks[tierKey];
        const selectedGolfer = selectedId ? GOLFERS.find((g) => g.id === selectedId) : null;

        return (
          <div key={tierNum} className={`border rounded-xl overflow-hidden shadow-sm ${TIER_BORDER[tierNum]}`}>
            {/* Tier header */}
            <div className={`border-b px-4 py-3 ${TIER_HEADER[tierNum]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[tierNum]}`}>
                      Tier {tierNum}
                    </span>
                    <span className="font-semibold text-sm">
                      {TIER_LABELS[tierNum].split(" — ")[1]}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mt-0.5">{TIER_DESCRIPTIONS[tierNum]}</p>
                </div>
                {selectedGolfer && (
                  <div className="text-right">
                    <div className="text-xs opacity-60">Selected</div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      <span>{FLAG_EMOJI[selectedGolfer.country] ?? "🏴"}</span>
                      {selectedGolfer.name}
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Golfer grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tierGolfers.map((golfer) => {
                const isSelected = selectedId === golfer.id;
                const isPickedElsewhere = allGolfersPicked.includes(golfer.id) && !isSelected;

                return (
                  <button
                    key={golfer.id}
                    onClick={() => handlePick(tierKey, golfer.id)}
                    disabled={locked || isPickedElsewhere}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all border ${
                      isSelected
                        ? "bg-masters-green text-white border-masters-green shadow-md"
                        : isPickedElsewhere
                        ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                        : locked
                        ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-masters-green/10 hover:border-masters-green/50 border-gray-200 cursor-pointer"
                    }`}
                  >
                    <span className="text-lg">{FLAG_EMOJI[golfer.country] ?? "🏴"}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {golfer.name}
                      </div>
                      <div className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        World #{golfer.worldRank}
                      </div>
                    </div>
                    {isSelected && <span className="text-white text-base">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit */}
      {!locked && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div>
            {complete ? (
              <p className="text-masters-green font-semibold text-sm">
                ✓ All 4 picks selected — ready to submit!
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                {4 - pickedCount} pick{4 - pickedCount !== 1 ? "s" : ""} remaining
              </p>
            )}
            {saved && submitted && (
              <p className="text-green-600 text-xs mt-0.5">Picks saved successfully!</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!complete}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              complete
                ? "bg-masters-green hover:bg-masters-green-dark text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitted && saved ? "Update Picks" : "Submit Picks"}
          </button>
        </div>
      )}

      {/* Rules card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Pool Rules</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Pick <strong>1 golfer per tier</strong> (4 total)</li>
          <li>Best <strong>3 of 4</strong> golfer scores count toward your total</li>
          <li>Scores are relative to par — <strong>lowest total wins</strong></li>
          <li>Missed cut = <strong>+{settings.cutPenalty} strokes</strong> per remaining round</li>
          <li>Picks <strong>lock at first tee time</strong> on Thursday</li>
        </ul>
      </div>
    </div>
  );
}
