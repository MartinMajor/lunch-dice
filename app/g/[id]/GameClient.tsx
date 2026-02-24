"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalGroups } from "@/hooks/useLocalGroups";
import { roll } from "@/lib/algorithm";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import AddPlayerPicker from "@/components/AddPlayerPicker";
import RollingCard, { RollState } from "@/components/RollingCard";
import Confetti from "@/components/Confetti";
import Die from "@/components/Die";
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

  // ── Setup helpers ─────────────────────────────────────────────────────────

  const prices = sessionPlayers.map((p) => parseFloat(p.price) || 0);
  const total = prices.reduce((a, b) => a + b, 0);
  const probabilities = prices.map((p) => (total > 0 ? p / total : 0));
  const canStart = prices.filter((p) => p > 0).length >= 2;

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

  // ── Rolling helpers ───────────────────────────────────────────────────────

  function rollPlayer(playerId: string) {
    const player = sessionPlayers.find((p) => p.playerId === playerId)!;
    const result = roll(parseFloat(player.price));

    setSessionPlayers((prev) =>
      prev.map((p) =>
        p.playerId === playerId
          ? { ...p, dieFace: result.face, rolledU: result.u, rolledScore: result.score, isRolling: true }
          : p
      )
    );
  }

  const saveSession = useCallback(
    (players: SessionPlayer[]) => {
      fetch(`/api/groups/${group.id}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: players.map((p) => ({
            playerId: p.playerId,
            price: parseFloat(p.price),
            rolledScore: p.rolledScore!,
            rolledU: p.rolledU!,
          })),
        }),
      });
    },
    [group.id]
  );

  function onDieComplete(playerId: string) {
    setSessionPlayers((prev) => {
      const updated = prev.map((p) =>
        p.playerId === playerId ? { ...p, isRolling: false } : p
      );
      const allDone = updated.every((p) => p.rolledScore !== undefined && !p.isRolling);
      if (allDone) {
        setTimeout(() => setPhase("complete"), 600);
        saveSession(updated);
      }
      return updated;
    });
  }

  function getRollState(player: SessionPlayer): RollState {
    if (player.isRolling) return "rolling";
    if (player.rolledScore === undefined) return "waiting";
    // Among players who have rolled, find the minimum score
    const rolledScores = sessionPlayers
      .filter((p) => p.rolledScore !== undefined && !p.isRolling)
      .map((p) => p.rolledScore!);
    const minScore = Math.min(...rolledScores);
    return player.rolledScore === minScore ? "danger" : "safe";
  }

  // ── Setup phase ───────────────────────────────────────────────────────────

  if (phase === "setup") {
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
                    onPriceChange={(v) => updatePrice(player.playerId, v)}
                    onRemove={() => removeFromSession(player.playerId)}
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
            <button
              onClick={() => setShowPicker(true)}
              className="w-full border border-dashed border-gold/20 text-cream/40
                         hover:border-gold/40 hover:text-cream/70
                         rounded-lg py-3 text-sm transition-colors"
            >
              + Add player
            </button>

            <button
              onClick={() => setPhase("rolling")}
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
            onAddExisting={addExistingToSession}
            onAddNew={addNewToSession}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    );
  }

  // ── Rolling phase ─────────────────────────────────────────────────────────

  if (phase === "rolling") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header groupId={group.id} groupName={group.name} />

        <main className="flex-1 flex flex-col p-4 gap-6 max-w-2xl mx-auto w-full">
          <h2 className="font-display text-gold/70 tracking-widest text-xs text-center pt-2">
            ROLL YOUR DICE
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {sessionPlayers.map((player) => (
              <RollingCard
                key={player.playerId}
                player={player}
                rollState={getRollState(player)}
                onRoll={() => rollPlayer(player.playerId)}
                onDieComplete={() => onDieComplete(player.playerId)}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ── Complete phase ────────────────────────────────────────────────────────

  const payer = sessionPlayers.reduce((min, p) =>
    (p.rolledScore ?? Infinity) < (min.rolledScore ?? Infinity) ? p : min
  );
  const billTotal = sessionPlayers.reduce((sum, p) => sum + parseFloat(p.price), 0);

  function newGame() {
    setPhase("setup");
    setSessionPlayers([]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Confetti />
      <Header groupId={group.id} groupName={group.name} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 pb-2 flex flex-col gap-6">
          <h2 className="font-display text-gold/70 tracking-widest text-xs text-center pt-2">
            RESULT
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {sessionPlayers.map((player) => {
              const isPayer = player.playerId === payer.playerId;
              return (
                <div
                  key={player.playerId}
                  className={`rounded-lg border p-4 flex flex-col items-center gap-3 transition-all
                    ${isPayer
                      ? "border-danger-bright bg-danger/10 shadow-danger"
                      : "border-white/10 bg-white/5 opacity-40 grayscale"
                    }`}
                >
                  {/* Name */}
                  <span
                    className={`font-display tracking-wide text-sm truncate w-full text-center
                      ${isPayer ? "text-danger-bright" : "text-cream/40"}`}
                  >
                    {player.name}
                  </span>

                  {/* Die — static, landed face */}
                  <Die face={player.dieFace ?? 1} rolling={false} size={isPayer ? 80 : 60} />

                  {/* Result info */}
                  <div className="flex flex-col items-center gap-1">
                    {isPayer ? (
                      <>
                        <span className="font-display text-danger-bright tracking-widest text-xs uppercase">
                          pays
                        </span>
                        <span className="text-2xl font-mono font-bold text-danger-bright">
                          ${parseFloat(player.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-cream/30 tracking-widest uppercase">
                        ✓ safe
                      </span>
                    )}
                    <span className="text-[10px] text-cream/20 tabular-nums">
                      score {(player.rolledScore! * 1000000).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total bill */}
          <div className="text-center">
            <p className="text-cream/30 text-xs uppercase tracking-widest">Total bill</p>
            <p className="text-gold font-display text-2xl">${billTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="p-4 pt-2 border-t border-gold/10">
          <button
            onClick={newGame}
            className="w-full bg-gold text-casino-black font-display tracking-widest
                       text-sm py-4 rounded-lg transition-colors hover:bg-gold-light"
          >
            NEW GAME
          </button>
        </div>
      </main>
    </div>
  );
}
