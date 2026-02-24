"use client";

import { useState } from "react";
import Header from "@/components/Header";
import RosterCard from "@/components/RosterCard";
import { RosterPlayer, SessionPlayer } from "@/types/game";

interface Props {
  group: { id: string; name: string };
  sessionPlayers: SessionPlayer[];
  roster: RosterPlayer[];
  probabilities: number[];
  total: number;
  canStart: boolean;
  onSelect: (player: RosterPlayer) => void;
  onDeselect: (playerId: string) => void;
  onUpdatePrice: (playerId: string, value: string) => void;
  onAddNew: (name: string) => Promise<void>;
  onStart: () => void;
}

export default function SetupPhase({
  group,
  sessionPlayers,
  roster,
  probabilities,
  total,
  canStart,
  onSelect,
  onDeselect,
  onUpdatePrice,
  onAddNew,
  onStart,
}: Props) {
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const sessionIds = new Set(sessionPlayers.map((p) => p.playerId));

  async function handleAddNew() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    await onAddNew(name);
    setNewName("");
    setAddingNew(false);
    setSaving(false);
  }

  function handleNewKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAddNew();
    if (e.key === "Escape") { setAddingNew(false); setNewName(""); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Scrollable roster area */}
        <div className="flex-1 overflow-y-auto p-4 pb-2 flex flex-col gap-6">
          {/* Selected players — full-width rows */}
          {sessionPlayers.length > 0 && (
            <div className="flex flex-col gap-2">
              {sessionPlayers.map((sp, i) => (
                <RosterCard
                  key={sp.playerId}
                  name={sp.name}
                  selected
                  price={sp.price}
                  probability={probabilities[i]}
                  onDeselect={() => onDeselect(sp.playerId)}
                  onPriceChange={(v) => onUpdatePrice(sp.playerId, v)}
                />
              ))}
            </div>
          )}

          {/* Unselected roster + "+" — 2-column grid */}
          <div className="grid grid-cols-2 gap-3 items-start">
            {roster
              .filter((p) => !sessionIds.has(p.id))
              .map((player) => (
                <RosterCard
                  key={player.id}
                  name={player.name}
                  selected={false}
                  onSelect={() => onSelect(player)}
                />
              ))}

            {/* Add new person card */}
            {!addingNew ? (
              <button
                onClick={() => setAddingNew(true)}
                className="rounded-lg border border-dashed border-gold/20 text-cream/60
                           hover:border-gold/40 hover:text-cream/80 transition-colors
                           flex items-center justify-center min-h-[60px]"
              >
                <span className="text-2xl leading-none">+</span>
              </button>
            ) : (
              <div className="rounded-lg border border-gold/30 bg-white/5 p-4 flex flex-col gap-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleNewKeyDown}
                  className="bg-transparent text-cream text-sm outline-none
                             placeholder:text-cream/50 font-display w-full"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNew}
                    disabled={!newName.trim() || saving}
                    className="flex-1 bg-gold/80 text-casino-black text-xs py-1.5 rounded
                               font-display disabled:opacity-30"
                  >
                    {saving ? "Adding…" : "Add"}
                  </button>
                  <button
                    onClick={() => { setAddingNew(false); setNewName(""); }}
                    className="text-cream/60 hover:text-cream text-sm px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="p-4 pt-2 flex flex-col gap-3 border-t border-gold/10">
          {total > 0 && (
            <div className="text-center">
              <p className="text-cream/60 text-xs uppercase tracking-widest">Total bill</p>
              <p className="text-gold font-display text-2xl">${total.toFixed(2)}</p>
            </div>
          )}
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full bg-gold text-casino-black font-display tracking-widest
                       text-sm py-4 rounded-lg transition-colors
                       hover:bg-gold-light
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            START ROLLING 🎲
          </button>
        </div>
      </main>
    </div>
  );
}
