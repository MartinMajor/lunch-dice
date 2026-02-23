"use client";

import { useEffect, useState } from "react";
import { useLocalGroups } from "@/hooks/useLocalGroups";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import AddPlayerPicker from "@/components/AddPlayerPicker";
import { GamePhase, RosterPlayer, SessionPlayer } from "@/types/game";

interface Props {
  group: { id: string; name: string };
  initialRoster: RosterPlayer[];
}

export default function GameClient({ group, initialRoster }: Props) {
  const { addGroup } = useLocalGroups();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [roster, setRoster] = useState<RosterPlayer[]>(initialRoster);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    addGroup(group.id, group.name);
  }, [group.id, group.name, addGroup]);

  // Compute probabilities from valid prices
  const prices = sessionPlayers.map((p) => parseFloat(p.price) || 0);
  const total = prices.reduce((a, b) => a + b, 0);
  const probabilities = prices.map((p) => (total > 0 ? p / total : 0));

  const validCount = prices.filter((p) => p > 0).length;
  const canStart = validCount >= 2;

  function updatePrice(playerId: string, value: string) {
    setSessionPlayers((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, price: value } : p))
    );
  }

  function removeFromSession(playerId: string) {
    setSessionPlayers((prev) => prev.filter((p) => p.playerId !== playerId));
  }

  function addExistingToSession(player: RosterPlayer, price: string) {
    setSessionPlayers((prev) => [
      ...prev,
      { playerId: player.id, name: player.name, price },
    ]);
    setShowPicker(false);
  }

  async function addNewToSession(name: string, price: string) {
    const res = await fetch(`/api/groups/${group.id}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;

    const newPlayer: RosterPlayer = await res.json();
    setRoster((prev) => [...prev, newPlayer]);
    setSessionPlayers((prev) => [
      ...prev,
      { playerId: newPlayer.id, name: newPlayer.name, price },
    ]);
    setShowPicker(false);
  }

  function startRolling() {
    if (!canStart) return;
    setPhase("rolling");
  }

  // ── Setup phase ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header groupId={group.id} groupName={group.name} />

        <main className="flex-1 flex flex-col p-4 gap-6 max-w-2xl mx-auto w-full">
          <h2 className="font-display text-gold/70 tracking-widest text-xs text-center pt-2">
            TODAY'S LUNCH
          </h2>

          {/* Player grid */}
          {sessionPlayers.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {sessionPlayers.map((player, i) => (
                <PlayerCard
                  key={player.playerId}
                  name={player.name}
                  price={player.price}
                  probability={probabilities[i]}
                  onPriceChange={(v) => updatePrice(player.playerId, v)}
                  onRemove={() => removeFromSession(player.playerId)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {sessionPlayers.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-4xl opacity-20">🎲</p>
              <p className="text-cream/30 text-sm">No players yet</p>
            </div>
          )}

          {/* Add player button */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full border border-dashed border-gold/20 text-cream/40
                       hover:border-gold/40 hover:text-cream/70
                       rounded-lg py-3 text-sm transition-colors"
          >
            + Add player
          </button>

          {/* Start rolling — only when ≥ 2 valid prices */}
          {canStart && (
            <button
              onClick={startRolling}
              className="w-full bg-gold text-casino-black font-display tracking-widest
                         text-sm py-4 rounded-lg transition-colors hover:bg-gold-light"
            >
              START ROLLING 🎲
            </button>
          )}
        </main>

        {showPicker && (
          <AddPlayerPicker
            roster={roster}
            sessionPlayerIds={sessionPlayers.map((p) => p.playerId)}
            groupId={group.id}
            onAddExisting={addExistingToSession}
            onAddNew={addNewToSession}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    );
  }

  // ── Rolling / Complete phases (Phase 8 & 9) ──────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gold/40 font-display text-lg tracking-widest">
          Rolling… (coming in Phase 8)
        </p>
      </main>
    </div>
  );
}
