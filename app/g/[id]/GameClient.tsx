"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalGroups } from "@/hooks/useLocalGroups";
import { roll } from "@/lib/algorithm";
import { GamePhase, RosterPlayer, SessionPlayer } from "@/types/game";
import SetupPhase from "./SetupPhase";
import RollingPhase from "./RollingPhase";
import CompletePhase from "./CompletePhase";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  group: { id: string; name: string };
  initialRoster: RosterPlayer[];
}

export default function GameClient({ group, initialRoster }: Props) {
  const { addGroup } = useLocalGroups();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [roster, setRoster] = useState<RosterPlayer[]>(initialRoster);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Refs guard against double-invocation of state updaters (React concurrent mode)
  // and against the completion effect running more than once per game.
  const savedRef = useRef(false);
  const completionFiredRef = useRef(false);

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

  // ── Save session ──────────────────────────────────────────────────────────

  const saveSession = useCallback(
    async (players: SessionPlayer[]) => {
      if (savedRef.current) return;
      savedRef.current = true;
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/groups/${group.id}/sessions`, {
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
        if (!res.ok) {
          savedRef.current = false;
          setSaveStatus("error");
          return;
        }
        setSaveStatus("saved");
      } catch {
        savedRef.current = false; // allow retry
        setSaveStatus("error");
      }
    },
    [group.id]
  );

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

  // Pure state update — no side effects inside the updater.
  function onDieComplete(playerId: string) {
    setSessionPlayers((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, isRolling: false } : p))
    );
  }

  // Detect completion outside the updater to avoid React double-invocation.
  useEffect(() => {
    if (phase !== "rolling") return;
    const allDone =
      sessionPlayers.length > 0 &&
      sessionPlayers.every((p) => p.rolledScore !== undefined && !p.isRolling);
    if (!allDone || completionFiredRef.current) return;

    completionFiredRef.current = true;
    setTimeout(() => setPhase("complete"), 600);
    void saveSession(sessionPlayers);
  }, [sessionPlayers, phase, saveSession]);

  // ── New game ──────────────────────────────────────────────────────────────

  function handleNewGame() {
    savedRef.current = false;
    completionFiredRef.current = false;
    setSaveStatus("idle");
    setPhase("setup");
    setSessionPlayers([]);
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
      saveStatus={saveStatus}
      onRetrySave={() => {
        savedRef.current = false;
        void saveSession(sessionPlayers);
      }}
      onNewGame={handleNewGame}
    />
  );
}
