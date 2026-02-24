"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import AddPlayerPicker from "@/components/AddPlayerPicker";
import { RosterPlayer, SessionPlayer } from "@/types/game";

interface Props {
  group: { id: string; name: string };
  sessionPlayers: SessionPlayer[];
  roster: RosterPlayer[];
  probabilities: number[];
  total: number;
  canStart: boolean;
  onUpdatePrice: (playerId: string, value: string) => void;
  onRemove: (playerId: string) => void;
  onAddExisting: (player: RosterPlayer, price: string) => void;
  onAddNew: (name: string, price: string) => Promise<void>;
  onStart: () => void;
}

export default function SetupPhase({
  group,
  sessionPlayers,
  roster,
  probabilities,
  total,
  canStart,
  onUpdatePrice,
  onRemove,
  onAddExisting,
  onAddNew,
  onStart,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  function handleAddExisting(player: RosterPlayer, price: string) {
    onAddExisting(player, price);
    setShowPicker(false);
  }

  async function handleAddNew(name: string, price: string) {
    await onAddNew(name, price);
    setShowPicker(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Scrollable player area */}
        <div className="flex-1 overflow-y-auto p-4 pb-2 flex flex-col gap-6">
          <h2 className="font-display text-gold/70 tracking-widest text-xs text-center pt-2">
            TODAY'S LUNCH
          </h2>

          {sessionPlayers.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {sessionPlayers.map((player, i) => (
                <PlayerCard
                  key={player.playerId}
                  name={player.name}
                  price={player.price}
                  probability={probabilities[i]}
                  onPriceChange={(v) => onUpdatePrice(player.playerId, v)}
                  onRemove={() => onRemove(player.playerId)}
                />
              ))}
            </div>
          )}

          {sessionPlayers.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-4xl opacity-20">🎲</p>
              <p className="text-cream/30 text-sm">No players yet</p>
            </div>
          )}
        </div>

        {/* Sticky bottom bar */}
        <div className="p-4 pt-2 flex flex-col gap-3 border-t border-gold/10">
          {total > 0 && (
            <div className="text-center">
              <p className="text-cream/30 text-xs uppercase tracking-widest">Total bill</p>
              <p className="text-gold font-display text-2xl">${total.toFixed(2)}</p>
            </div>
          )}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full border border-dashed border-gold/20 text-cream/40
                       hover:border-gold/40 hover:text-cream/70
                       rounded-lg py-3 text-sm transition-colors"
          >
            + Add player
          </button>

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

      {showPicker && (
        <AddPlayerPicker
          roster={roster}
          sessionPlayerIds={sessionPlayers.map((p) => p.playerId)}
          onAddExisting={handleAddExisting}
          onAddNew={handleAddNew}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
