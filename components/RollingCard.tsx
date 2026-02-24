"use client";

import Die from "./Die";
import { SessionPlayer } from "@/types/game";

export type RollState = "waiting" | "rolling" | "safe" | "danger" | "payer";

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
  const isPayer = rollState === "payer";
  const hasRolled = isSafe || isDanger || isPayer;

  return (
    <div
      className={`
        rounded-lg border p-4 flex flex-col items-center gap-3 transition-all duration-500
        ${isDanger || isPayer ? "border-danger-bright shadow-danger bg-danger/10" : ""}
        ${isSafe ? "border-safe/30 bg-safe/5 opacity-60" : ""}
        ${isWaiting || isRolling ? "border-gold/20 bg-felt" : ""}
      `}
    >
      {/* Name + price */}
      <span
        className={`font-display tracking-wide text-sm truncate w-full text-center
          ${isDanger || isPayer ? "text-danger-bright" : ""}
          ${isSafe ? "text-cream/50" : ""}
          ${isWaiting || isRolling ? "text-cream" : ""}
        `}
      >
        {player.name}
      </span>
      <span
        className={`text-xs tabular-nums -mt-2
          ${isDanger || isPayer ? "text-danger-bright/70" : "text-cream/30"}
        `}
      >
        ${parseFloat(player.price).toFixed(2)}
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

      {/* Status area — fixed height to prevent layout shift */}
      <div className="flex flex-col items-center gap-1.5 w-full min-h-[56px] justify-center">
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
          <>
            {/* Score — dominant */}
            <span
              className={`text-2xl font-mono font-bold tabular-nums leading-none
                ${isDanger || isPayer ? "text-danger-bright" : "text-cream/80"}
              `}
            >
              {(player.rolledScore! * 1000000).toFixed(0)}
            </span>

            {/* Roll — secondary */}
            <span className="text-[10px] text-cream/30 tabular-nums">
              roll {((1 - player.rolledU!) * 10000).toFixed(0)}
            </span>

            {/* State badge */}
            {isPayer && (
              <span className="text-[10px] text-danger-bright tracking-widest uppercase font-display mt-0.5">
                PAYS!
              </span>
            )}
            {isDanger && (
              <span className="text-[10px] text-danger-bright tracking-widest uppercase font-display mt-0.5">
                ⚠ In Danger
              </span>
            )}
            {isSafe && (
              <span className="text-[10px] text-cream/40 tracking-widest uppercase mt-0.5">
                ✓ Safe
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
