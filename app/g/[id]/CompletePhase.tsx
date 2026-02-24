"use client";

import Header from "@/components/Header";
import RollingCard from "@/components/RollingCard";
import Confetti from "@/components/Confetti";
import { SessionPlayer } from "@/types/game";

interface Props {
  group: { id: string; name: string };
  sessionPlayers: SessionPlayer[];
  onNewGame: () => void;
}

export default function CompletePhase({ group, sessionPlayers, onNewGame }: Props) {
  const payer = sessionPlayers.reduce((min, p) =>
    (p.rolledScore ?? Infinity) < (min.rolledScore ?? Infinity) ? p : min
  );
  const billTotal = sessionPlayers.reduce((sum, p) => sum + parseFloat(p.price), 0);

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

        <div className="p-4 pt-2 border-t border-gold/10">
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
