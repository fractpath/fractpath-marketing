export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function roundRate(n: number): number {
  return Math.round(n * 1e8) / 1e8;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}
