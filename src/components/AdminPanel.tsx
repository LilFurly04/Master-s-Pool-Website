"use client";

import { useEffect, useState } from "react";
import { Participant, PoolSettings } from "@/lib/types";
import {
  loadParticipants,
  loadSettings,
  picksComplete,
  saveParticipants,
  saveSettings,
} from "@/lib/pool-logic";
import { GOLFERS, TIER_LABELS, FLAG_EMOJI } from "@/data/golfers";

interface AdminPanelProps {
  settings: PoolSettings;
  onSettingsChange: (s: PoolSettings) => void;
}

type TierKey = "tier1" | "tier2" | "tier3" | "tier4";
const TIER_KEYS: TierKey[] = ["tier1", "tier2", "tier3", "tier4"];

export default function AdminPanel({ settings, onSettingsChange }: AdminPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<"participants" | "settings">("participants");

  // New participant form
  const [newName, setNewName] = useState("");
  const [newPicks, setNewPicks] = useState<Participant["picks"]>({
    tier1: null, tier2: null, tier3: null, tier4: null,
  });
  const [formError, setFormError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editPicks, setEditPicks] = useState<Participant["picks"]>({
    tier1: null, tier2: null, tier3: null, tier4: null,
  });

  useEffect(() => {
    setParticipants(loadParticipants());
  }, []);

  function handleAddParticipant() {
    if (!newName.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!picksComplete({ id: "", name: "", picks: newPicks })) {
      setFormError("All 4 tier picks are required.");
      return;
    }
    const dup = participants.find(
      (p) => p.name.toLowerCase() === newName.trim().toLowerCase()
    );
    if (dup) {
      setFormError("A participant with that name already exists.");
      return;
    }

    const newP: Participant = {
      id: newName.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: newName.trim(),
      picks: newPicks,
    };
    const updated = [...participants, newP];
    setParticipants(updated);
    saveParticipants(updated);
    setNewName("");
    setNewPicks({ tier1: null, tier2: null, tier3: null, tier4: null });
    setFormError("");
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  }

  function handleDelete(id: string) {
    const updated = participants.filter((p) => p.id !== id);
    setParticipants(updated);
    saveParticipants(updated);
  }

  function handleSaveEdit() {
    if (!editId) return;
    const updated = participants.map((p) =>
      p.id === editId ? { ...p, picks: editPicks } : p
    );
    setParticipants(updated);
    saveParticipants(updated);
    setEditId(null);
  }

  function handleLockToggle() {
    const updated = { ...settings, isLocked: !settings.isLocked };
    onSettingsChange(updated);
    saveSettings(updated);
  }

  function handleSettingsChange(key: keyof PoolSettings, value: string | number | boolean) {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
    saveSettings(updated);
  }

  return (
    <div className="space-y-6">
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-5">
        <h2 className="font-serif text-xl font-bold text-masters-green mb-1">Admin Panel</h2>
        <p className="text-gray-500 text-sm">Manage pool participants, picks, and settings.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200">
        {(["participants", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${
              tab === t
                ? "border-masters-green text-masters-green"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "participants" ? `👥 Participants (${participants.length})` : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {tab === "participants" && (
        <div className="space-y-6">
          {/* Add participant form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Add Participant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setFormError(""); }}
                  placeholder="Participant name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green focus:ring-1 focus:ring-masters-green"
                />
              </div>

              {TIER_KEYS.map((k, idx) => {
                const tierNum = idx + 1;
                const tierGolfers = GOLFERS.filter((g) => g.tier === tierNum);
                return (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      {TIER_LABELS[tierNum]}
                    </label>
                    <select
                      value={newPicks[k] ?? ""}
                      onChange={(e) =>
                        setNewPicks((prev) => ({ ...prev, [k]: e.target.value || null }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green focus:ring-1 focus:ring-masters-green bg-white"
                    >
                      <option value="">— Select a golfer —</option>
                      {tierGolfers.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.country}) — #{g.worldRank}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {formError && (
                <p className="text-red-500 text-sm">{formError}</p>
              )}
              {addSuccess && (
                <p className="text-green-600 text-sm font-medium">✓ Participant added!</p>
              )}

              <button
                onClick={handleAddParticipant}
                className="w-full bg-masters-green hover:bg-masters-green-dark text-white font-semibold py-2.5 rounded-lg transition-all shadow"
              >
                Add Participant
              </button>
            </div>
          </div>

          {/* Participants list */}
          {participants.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  All Participants ({participants.length})
                </h3>
                <button
                  onClick={() => {
                    const csv = [
                      "Name,Tier1,Tier2,Tier3,Tier4,Complete",
                      ...participants.map((p) => {
                        const t1 = GOLFERS.find((g) => g.id === p.picks.tier1)?.name ?? "";
                        const t2 = GOLFERS.find((g) => g.id === p.picks.tier2)?.name ?? "";
                        const t3 = GOLFERS.find((g) => g.id === p.picks.tier3)?.name ?? "";
                        const t4 = GOLFERS.find((g) => g.id === p.picks.tier4)?.name ?? "";
                        const complete = picksComplete(p) ? "Yes" : "No";
                        return `"${p.name}","${t1}","${t2}","${t3}","${t4}","${complete}"`;
                      }),
                    ].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "masters-pool-picks.csv";
                    a.click();
                  }}
                  className="text-xs text-masters-green border border-masters-green/30 hover:bg-masters-green hover:text-white px-3 py-1 rounded-full transition-all"
                >
                  ↓ Export CSV
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <div key={p.id} className="px-4 py-4">
                    {editId === p.id ? (
                      /* Edit form */
                      <div className="space-y-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        {TIER_KEYS.map((k, idx) => {
                          const tierNum = idx + 1;
                          const tierGolfers = GOLFERS.filter((g) => g.tier === tierNum);
                          return (
                            <div key={k}>
                              <label className="text-xs font-semibold text-gray-500 uppercase">
                                Tier {tierNum}
                              </label>
                              <select
                                value={editPicks[k] ?? ""}
                                onChange={(e) =>
                                  setEditPicks((prev) => ({ ...prev, [k]: e.target.value || null }))
                                }
                                className="block w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5 bg-white"
                              >
                                <option value="">— Select —</option>
                                {tierGolfers.map((g) => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-1.5 bg-masters-green text-white text-sm rounded-lg font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View row */
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {TIER_KEYS.map((k, idx) => {
                              const g = GOLFERS.find((gg) => gg.id === p.picks[k]);
                              return (
                                <span
                                  key={k}
                                  className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                    g ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-red-50 border-red-200 text-red-600"
                                  }`}
                                >
                                  T{idx + 1}: {g ? `${FLAG_EMOJI[g.country] ?? ""} ${g.name}` : "NOT SET"}
                                </span>
                              );
                            })}
                          </div>
                          {!picksComplete(p) && (
                            <p className="text-xs text-amber-600 mt-1">⚠ Incomplete picks</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditId(p.id);
                              setEditPicks({ ...p.picks });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-800">Pool Settings</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pool Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleSettingsChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Counting Golfers (best of 4)
              </label>
              <select
                value={settings.countingGolfers}
                onChange={(e) => handleSettingsChange("countingGolfers", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green bg-white"
              >
                <option value={2}>Best 2</option>
                <option value={3}>Best 3</option>
                <option value={4}>All 4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Missed Cut Penalty (strokes/round)
              </label>
              <input
                type="number"
                value={settings.cutPenalty}
                min={0}
                max={20}
                onChange={(e) => handleSettingsChange("cutPenalty", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Pick Deadline (local time)
            </label>
            <input
              type="datetime-local"
              value={settings.pickDeadline.slice(0, 16)}
              onChange={(e) => handleSettingsChange("pickDeadline", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green"
            />
          </div>

          {/* Lock toggle */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div>
              <div className="font-semibold text-sm text-gray-800">
                {settings.isLocked ? "🔒 Picks Locked" : "🔓 Picks Open"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {settings.isLocked
                  ? "No new picks or changes allowed"
                  : "Participants can still submit or change picks"}
              </div>
            </div>
            <button
              onClick={handleLockToggle}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                settings.isLocked
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {settings.isLocked ? "Unlock" : "Lock Now"}
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                if (confirm("Reset all participants and picks? This cannot be undone.")) {
                  saveParticipants([]);
                  setParticipants([]);
                }
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              ⚠ Reset all participant data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
