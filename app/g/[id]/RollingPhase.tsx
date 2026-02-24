"use client";

import Header from "@/components/Header";
import RollingCard, { RollState } from "@/components/RollingCard";
import { SessionPlayer } from "@/types/game";

interface Props {
  group: { id: string; name: string };
  sessionPlayers: SessionPlayer[];
  total: number;
  onRoll: (playerId: string) => void;
  onDieComplete: (playerId: string) => void;
}

function getRollState(player: SessionPlayer, allPlayers: SessionPlayer[]): RollState {
  if (player.isRolling) return "rolling";
  if (player.rolledScore === undefined) return "waiting";
  const rolledScores = allPlayers
    .filter((p) => p.rolledScore !== undefined && !p.isRolling)
    .map((p) => p.rolledScore!);
  const minScore = Math.min(...rolledScores);
  return player.rolledScore === minScore ? "danger" : "safe";
}

export default function RollingPhase({
  group,
  sessionPlayers,
  total,
  onRoll,
  onDieComplete,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 pb-2 flex flex-col gap-6">
          <h2 className="font-display text-gold/70 tracking-widest text-xs text-center pt-2">
            ROLL YOUR DICE
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {sessionPlayers.map((player) => (
              <RollingCard
                key={player.playerId}
                player={player}
                rollState={getRollState(player, sessionPlayers)}
                onRoll={() => onRoll(player.playerId)}
                onDieComplete={() => onDieComplete(player.playerId)}
              />
            ))}
          </div>
        </div>

        <div className="p-4 pt-2 border-t border-gold/10 text-center">
          <p className="text-cream/60 text-xs uppercase tracking-widest">Total bill</p>
          <p className="text-gold font-display text-2xl">${total.toFixed(2)}</p>
        </div>
      </main>
    </div>
  );
}
