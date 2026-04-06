"use client";

import { useEffect, useState } from "react";
import { Participant, PickSlot, PoolSettings } from "@/lib/types";
import { ALL_SLOTS } from "@/lib/types";
import {
  loadParticipants,
  picksComplete,
  saveParticipants,
  saveSettings,
} from "@/lib/pool-logic";
import { FLAG_EMOJI, GOLFERS, TIER_LABELS } from "@/data/golfers";

interface AdminPanelProps {
  settings: PoolSettings;
  onSettingsChange: (s: PoolSettings) => void;
}

const SLOT_GROUPS: { label: string; slots: PickSlot[]; tier: number }[] = [
  { label: "Tier 1 (pick 2)", slots: ["tier1a", "tier1b"], tier: 1 },
  { label: "Tier 2 (pick 2)", slots: ["tier2a", "tier2b"], tier: 2 },
  { label: "Tier 3 (pick 1)", slots: ["tier3"], tier: 3 },
  { label: "Tier 4 (pick 1)", slots: ["tier4"], tier: 4 },
];

const EMPTY_PICKS: Record<PickSlot, string | null> = {
  tier1a: null, tier1b: null, tier2a: null, tier2b: null, tier3: null, tier4: null,
};

export default function AdminPanel({ settings, onSettingsChange }: AdminPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<"participants" | "settings">("participants");
  const [newName, setNewName] = useState("");
  const [newPicks, setNewPicks] = useState<Record<PickSlot, string | null>>({ ...EMPTY_PICKS });
  const [formError, setFormError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPicks, setEditPicks] = useState<Record<PickSlot, string | null>>({ ...EMPTY_PICKS });

  useEffect(() => { setParticipants(loadParticipants()); }, []);

  function handleAdd() {
    if (!newName.trim()) { setFormError("Name is required."); return; }
    if (!picksComplete({ id: "", name: "", picks: newPicks })) { setFormError("All 6 picks required."); return; }
    if (participants.find((p) => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      setFormError("A participant with that name already exists."); return;
    }
    const p: Participant = {
      id: `${newName.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
      name: newName.trim(),
      picks: { ...newPicks },
    };
    const updated = [...participants, p];
    setParticipants(updated);
    saveParticipants(updated);
    setNewName("");
    setNewPicks({ ...EMPTY_PICKS });
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
    const updated = participants.map((p) => p.id === editId ? { ...p, picks: { ...editPicks } } : p);
    setParticipants(updated);
    saveParticipants(updated);
    setEditId(null);
  }

  function handleSettingChange(key: keyof PoolSettings, value: string | number | boolean) {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
    saveSettings(updated);
  }

  function handleLockToggle() {
    handleSettingChange("isLocked", !settings.isLocked);
  }

  function exportCSV() {
    const rows = [
      "Name,Tier1A,Tier1B,Tier2A,Tier2B,Tier3,Tier4,Complete",
      ...participants.map((p) => {
        const vals = ALL_SLOTS.map(
          (s) => GOLFERS.find((g) => g.id === p.picks[s])?.name ?? ""
        );
        return `"${p.name}",${vals.map((v) => `"${v}"`).join(",")},${picksComplete(p) ? "Yes" : "No"}`;
      }),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "masters-pool-picks.csv"; a.click();
  }

  return (
    <div className="space-y-6">
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-5">
        <h2 className="font-serif text-xl font-bold text-masters-green mb-1">Admin Panel</h2>
        <p className="text-gray-500 text-sm">Manage participants, picks, and pool settings.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200">
        {(["participants", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${
              tab === t ? "border-masters-green text-masters-green" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "participants" ? `👥 Participants (${participants.length})` : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {tab === "participants" && (
        <div className="space-y-6">
          {/* Add form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Add Participant</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Name</label>
                <input
                  type="text" value={newName}
                  onChange={(e) => { setNewName(e.target.value); setFormError(""); }}
                  placeholder="Participant name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green"
                />
              </div>

              {SLOT_GROUPS.map(({ label, slots, tier }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">{TIER_LABELS[tier]}</label>
                  <div className={`grid gap-2 ${slots.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {slots.map((slot, i) => (
                      <select
                        key={slot}
                        value={newPicks[slot] ?? ""}
                        onChange={(e) => setNewPicks((prev) => ({ ...prev, [slot]: e.target.value || null }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green bg-white"
                      >
                        <option value="">— Pick {slots.length > 1 ? (i === 0 ? "A" : "B") : ""} —</option>
                        {GOLFERS.filter((g) => g.tier === tier).map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.country}) — +{g.odds}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}

              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              {addSuccess && <p className="text-green-600 text-sm font-medium">✓ Participant added!</p>}
              <button
                onClick={handleAdd}
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
                <h3 className="font-semibold text-gray-800">All Participants ({participants.length})</h3>
                <button onClick={exportCSV} className="text-xs text-masters-green border border-masters-green/30 hover:bg-masters-green hover:text-white px-3 py-1 rounded-full transition-all">
                  ↓ Export CSV
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <div key={p.id} className="px-4 py-4">
                    {editId === p.id ? (
                      <div className="space-y-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        {SLOT_GROUPS.map(({ label, slots, tier }) => (
                          <div key={label}>
                            <label className="text-xs font-semibold text-gray-500 uppercase">{TIER_LABELS[tier]}</label>
                            <div className={`grid gap-2 mt-1 ${slots.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                              {slots.map((slot, i) => (
                                <select
                                  key={slot}
                                  value={editPicks[slot] ?? ""}
                                  onChange={(e) => setEditPicks((prev) => ({ ...prev, [slot]: e.target.value || null }))}
                                  className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                                >
                                  <option value="">— Pick {slots.length > 1 ? (i === 0 ? "A" : "B") : ""} —</option>
                                  {GOLFERS.filter((g) => g.tier === tier).map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                  ))}
                                </select>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-masters-green text-white text-sm rounded-lg font-medium">Save</button>
                          <button onClick={() => setEditId(null)} className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {ALL_SLOTS.map((slot) => {
                              const g = GOLFERS.find((gg) => gg.id === p.picks[slot]);
                              const flag = g ? (FLAG_EMOJI[g.country] ?? "") : "";
                              return (
                                <span key={slot} className={`text-xs px-1.5 py-0.5 rounded border ${g ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                                  {g ? `${flag} ${g.name}` : "NOT SET"}
                                </span>
                              );
                            })}
                          </div>
                          {!picksComplete(p) && <p className="text-xs text-amber-600 mt-1">⚠ Incomplete picks</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => { setEditId(p.id); setEditPicks({ ...p.picks }); }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
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
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Pool Name</label>
            <input type="text" value={settings.name} onChange={(e) => handleSettingChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Counting Golfers (best of 6)</label>
              <select value={settings.countingGolfers} onChange={(e) => handleSettingChange("countingGolfers", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green bg-white">
                <option value={4}>Best 4</option>
                <option value={5}>Best 5</option>
                <option value={6}>All 6</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">MC Penalty (strokes/round)</label>
              <input type="number" value={settings.cutPenalty} min={0} max={20}
                onChange={(e) => handleSettingChange("cutPenalty", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Pick Deadline</label>
            <input type="datetime-local" value={settings.pickDeadline.slice(0, 16)}
              onChange={(e) => handleSettingChange("pickDeadline", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masters-green" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div>
              <div className="font-semibold text-sm">{settings.isLocked ? "🔒 Picks Locked" : "🔓 Picks Open"}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {settings.isLocked ? "No new submissions allowed" : "Participants can still submit"}
              </div>
            </div>
            <button onClick={handleLockToggle}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${settings.isLocked ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
              {settings.isLocked ? "Unlock" : "Lock Now"}
            </button>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => { if (confirm("Reset all participant data? Cannot be undone.")) { saveParticipants([]); setParticipants([]); } }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >⚠ Reset all participant data</button>
          </div>
        </div>
      )}
    </div>
  );
}
