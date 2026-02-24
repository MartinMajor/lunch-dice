"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalGroups } from "@/hooks/useLocalGroups";
import { roll } from "@/lib/algorithm";
import { GamePhase, RosterPlayer, SessionPlayer } from "@/types/game";
import SetupPhase from "./SetupPhase";
import RollingPhase from "./RollingPhase";
import CompletePhase from "./CompletePhase";

interface Props {
  group: { id: string; name: string };
  initialRoster: RosterPlayer[];
}

export default function GameClient({ group, initialRoster }: Props) {
  const { addGroup } = useLocalGroups();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [roster, setRoster] = useState<RosterPlayer[]>(initialRoster);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);

  useEffect(() => {
    addGroup(group.id, group.name);
  }, [group.id, group.name, addGroup]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const prices = sessionPlayers.map((p) => parseFloat(p.price) || 0);
  const total = prices.reduce((a, b) => a + b, 0);
  const probabilities = prices.map((p) => (total > 0 ? p / total : 0));
  const canStart = sessionPlayers.length >= 2 && prices.every((p) => p > 0);

  // ── Setup callbacks ───────────────────────────────────────────────────────

  function updatePrice(playerId: string, value: string) {
    setSessionPlayers((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, price: value } : p))
    );
  }

  function removeFromSession(playerId: string) {
    setSessionPlayers((prev) => prev.filter((p) => p.playerId !== playerId));
  }

  function selectPlayer(player: RosterPlayer) {
    setSessionPlayers((prev) => [
      ...prev,
      { playerId: player.id, name: player.name, price: "" },
    ]);
  }

  async function addNewPlayer(name: string) {
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
      { playerId: newPlayer.id, name: newPlayer.name, price: "" },
    ]);
  }

  // ── Rolling callbacks ─────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <SetupPhase
        group={group}
        sessionPlayers={sessionPlayers}
        roster={roster}
        probabilities={probabilities}
        total={total}
        canStart={canStart}
        onSelect={selectPlayer}
        onDeselect={removeFromSession}
        onUpdatePrice={updatePrice}
        onAddNew={addNewPlayer}
        onStart={() => setPhase("rolling")}
      />
    );
  }

  if (phase === "rolling") {
    return (
      <RollingPhase
        group={group}
        sessionPlayers={sessionPlayers}
        total={total}
        onRoll={rollPlayer}
        onDieComplete={onDieComplete}
      />
    );
  }

  return (
    <CompletePhase
      group={group}
      sessionPlayers={sessionPlayers}
      onNewGame={() => {
        setPhase("setup");
        setSessionPlayers([]);
      }}
    />
  );
}
