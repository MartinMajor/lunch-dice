export interface RosterPlayer {
  id: string;
  name: string;
}

export interface SessionPlayer {
  playerId: string;
  name: string;
  price: string; // kept as string to allow empty/partial input
  rolledScore?: number; // set during rolling phase
}

export type GamePhase = "setup" | "rolling" | "complete";
