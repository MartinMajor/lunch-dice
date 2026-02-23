"use client";

import Die from "./Die";
import { SessionPlayer } from "@/types/game";

export type RollState = "waiting" | "rolling" | "safe" | "danger";

interface Props {
  player: SessionPlayer;
  rollState: RollState;
  onRoll: () => void;
  onDieComplete: () => void;
}

export default function RollingCard({
  player,
  rollState,
  onRoll,
  onDieComplete,
}: Props) {
  const isWaiting = rollState === "waiting";
  const isRolling = rollState === "rolling";
  const isSafe = rollState === "safe";
  const isDanger = rollState === "danger";
  const hasRolled = isSafe || isDanger;

  return (
    <div
      className={`
        rounded-lg border p-4 flex flex-col items-center gap-3 transition-all duration-500
        ${isDanger ? "border-danger-bright shadow-danger bg-danger/10" : ""}
        ${isSafe ? "border-safe/40 bg-safe/10 opacity-60" : ""}
        ${isWaiting || isRolling ? "border-gold/20 bg-felt" : ""}
      `}
    >
      {/* Name */}
      <span
        className={`font-display tracking-wide text-sm truncate w-full text-center
          ${isDanger ? "text-danger-bright" : ""}
          ${isSafe ? "text-cream/50" : ""}
          ${isWaiting || isRolling ? "text-cream" : ""}
        `}
      >
        {player.name}
      </span>

      {/* Die */}
      <button
        onClick={isWaiting ? onRoll : undefined}
        disabled={!isWaiting}
        className={`
          rounded-xl transition-transform
          ${isWaiting ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"}
        `}
        aria-label={isWaiting ? `Roll for ${player.name}` : undefined}
      >
        <Die
          face={player.dieFace ?? 1}
          rolling={!!player.isRolling}
          onRollComplete={onDieComplete}
          size={72}
        />
      </button>

      {/* Status */}
      {isWaiting && (
        <span className="text-xs text-cream/30 tracking-widest uppercase">
          Tap to roll
        </span>
      )}
      {isRolling && (
        <span className="text-xs text-gold/60 tracking-widest uppercase animate-pulse">
          Rolling…
        </span>
      )}
      {hasRolled && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono text-cream/50">
            {player.rolledScore!.toFixed(4)}
          </span>
          {isDanger && (
            <span className="text-xs text-danger-bright tracking-widest uppercase font-display">
              ⚠ In Danger
            </span>
          )}
          {isSafe && (
            <span className="text-xs text-safe/80 tracking-widest uppercase">
              ✓ Safe
            </span>
          )}
        </div>
      )}
    </div>
  );
}
