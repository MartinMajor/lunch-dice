export interface RollResult {
  u: number;     // raw uniform draw
  score: number; // -ln(u) / price — lowest score pays
  face: number;  // 1–6, mapped from u: [0,1/6)→1 … [5/6,1]→6
}

export function roll(price: number): RollResult {
  const u = Math.random();
  const safeU = u > 0 ? u : 1e-300;
  const score = -Math.log(safeU) / price;
  const face = Math.max(1, Math.ceil(u * 6));
  return { u, score, face };
}
