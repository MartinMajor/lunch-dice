export interface RosterPlayer {
  id: string;
  name: string;
}

export interface SessionPlayer {
  playerId: string;
  name: string;
  price: string; // kept as string to allow empty/partial input
  rolledU?: number;     // raw uniform draw (shown as "draw" value)
  rolledScore?: number; // -ln(u)/price — the deciding number
  dieFace?: number;     // 1-6 correlated with u: [0,1/6)→1 … [5/6,1]→6
  isRolling?: boolean;  // true during die animation
}

export type GamePhase = "setup" | "rolling" | "complete";
