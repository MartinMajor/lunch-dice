"use client";

import Header from "@/components/Header";
import RollingCard from "@/components/RollingCard";
import Confetti from "@/components/Confetti";
import { SessionPlayer } from "@/types/game";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  group: { id: string; name: string };
  sessionPlayers: SessionPlayer[];
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  onNewGame: () => void;
}

export default function CompletePhase({
  group,
  sessionPlayers,
  saveStatus,
  onRetrySave,
  onNewGame,
}: Props) {
  const payer = sessionPlayers.reduce((min, p) =>
    (p.rolledScore ?? Infinity) < (min.rolledScore ?? Infinity) ? p : min
  );
  const billTotal = sessionPlayers.reduce((sum, p) => sum + parseFloat(p.price), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Confetti />
      <Header groupId={group.id} groupName={group.name} />

      <main className="max-w-2xl mx-auto w-full">
        <div className="p-4 pb-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            {sessionPlayers.map((player) => (
              <RollingCard
                key={player.playerId}
                player={player}
                rollState={player.playerId === payer.playerId ? "payer" : "safe"}
                onRoll={() => {}}
                onDieComplete={() => {}}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-cream/60 text-xs uppercase tracking-widest">Total bill</p>
            <p className="text-gold font-display text-2xl">${billTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-4 flex items-center justify-center">
          {saveStatus === "saving" && (
              <p className="text-cream/50 text-xs text-center animate-pulse">Saving…</p>
          )}
          {saveStatus === "error" && (
              <div className="flex items-center justify-center gap-3">
                <p className="text-danger-bright text-xs">Could not save results.</p>
                <button
                    onClick={onRetrySave}
                    className="text-xs text-gold hover:text-gold-light transition-colors underline
                             underline-offset-2"
                >
                  Retry
                </button>
              </div>
          )}
        </div>

        <div className="p-4 pt-2 border-t border-gold/10 flex flex-col gap-3">
          <button
            onClick={onNewGame}
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
