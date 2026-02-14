import { roundRate } from "./rounding.js";

export function irrMonthlySingleOutflowInflow(
  outflow: number,
  inflow: number,
  months: number,
): number {
  if (months <= 0) {
    throw new Error("months must be > 0");
  }
  if (outflow <= 0) {
    throw new Error("outflow must be > 0");
  }
  if (inflow <= 0) {
    return -1;
  }

  const rm = Math.pow(inflow / outflow, 1 / months) - 1;
  return roundRate(rm);
}

export function annualizeMonthly(rm: number): number {
  const annual = Math.pow(1 + rm, 12) - 1;
  return roundRate(annual);
}
