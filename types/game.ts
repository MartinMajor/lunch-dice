export interface RosterPlayer {
  id: string;
  name: string;
}

export interface SessionPlayer {
  playerId: string;
  name: string;
  price: string; // kept as string to allow empty/partial input
  rolledScore?: number; // set when player rolls
  dieFace?: number;    // random 1-6, decorative
  isRolling?: boolean; // true during die animation
}

export type GamePhase = "setup" | "rolling" | "complete";
