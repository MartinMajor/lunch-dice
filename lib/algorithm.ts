export function computeScore(price: number): number {
  const u = Math.random();
  return -Math.log(u > 0 ? u : 1e-300) / price;
}
