import { describe, it, expect } from "vitest";
import { computeDeal } from "../src/computeDeal.js";
import { roundMoney, roundRate, clamp } from "../src/rounding.js";
import {
  irrMonthlySingleOutflowInflow,
  annualizeMonthly,
} from "../src/irr.js";
import { COMPUTE_SEMVER, COMPUTE_VERSION } from "../src/version.js";
import type { DealTerms, ScenarioAssumptions } from "../src/types.js";

const NOW = "2026-02-13T00:00:00.000Z";

function makeTerms(overrides?: Partial<DealTerms>): DealTerms {
  return {
    contract_version: "1.0",
    schema_version: "1.0",
    iba_usd: 100_000,
    floor_multiple: 0.8,
    ceiling_multiple: 2.0,
    downside_mode: "HARD_FLOOR",
    timing_factor_gain_only: true,
    maturity_months: 60,
    ...overrides,
  };
}

function makeAssumptions(
  overrides?: Partial<ScenarioAssumptions>,
): ScenarioAssumptions {
  return {
    start_fmv_usd: 500_000,
    end_fmv_usd: 600_000,
    months_held: 12,
    ...overrides,
  };
}

describe("rounding", () => {
  it("roundMoney rounds to 2 decimal places", () => {
    expect(roundMoney(123.456)).toBe(123.46);
    expect(roundMoney(123.454)).toBe(123.45);
    expect(roundMoney(0.005)).toBe(0.01);
  });

  it("roundRate rounds to 8 decimal places", () => {
    expect(roundRate(0.123456789012)).toBe(0.12345679);
  });

  it("clamp constrains value", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("IRR", () => {
  it("calculates monthly IRR for positive inflow", () => {
    const rm = irrMonthlySingleOutflowInflow(100_000, 120_000, 12);
    expect(rm).toBeGreaterThan(0);
    const reconstructed = 100_000 * Math.pow(1 + rm, 12);
    expect(Math.abs(reconstructed - 120_000)).toBeLessThan(0.01);
  });

  it("returns -1 for zero inflow", () => {
    expect(irrMonthlySingleOutflowInflow(100_000, 0, 12)).toBe(-1);
  });

  it("throws for zero months", () => {
    expect(() => irrMonthlySingleOutflowInflow(100_000, 120_000, 0)).toThrow(
      "months must be > 0",
    );
  });

  it("throws for zero outflow", () => {
    expect(() => irrMonthlySingleOutflowInflow(0, 120_000, 12)).toThrow(
      "outflow must be > 0",
    );
  });

  it("annualizes monthly rate correctly", () => {
    const rm = 0.01;
    const annual = annualizeMonthly(rm);
    const expected = Math.pow(1.01, 12) - 1;
    expect(Math.abs(annual - expected)).toBeLessThan(1e-8);
  });
});

describe("computeDeal", () => {
  it("positive appreciation, early exit (tf_eff < 1)", () => {
    const terms = makeTerms();
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 600_000,
      months_held: 12,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.compute_version).toBe(COMPUTE_VERSION);
    expect(COMPUTE_VERSION.startsWith(COMPUTE_SEMVER)).toBe(true);
    expect(result.computed_at).toBe(NOW);

    const tf = result.outputs.timing_factor_effective;
    expect(tf).toBeCloseTo(12 / 60, 8);
    expect(tf).toBeCloseTo(0.2, 8);

    expect(result.outputs.investor_multiple).toBeGreaterThan(1);
    expect(result.outputs.investor_multiple).toBeLessThan(1.2);

    const expectedMultiple = 1 + (600_000 / 500_000 - 1) * 0.2;
    expect(result.outputs.investor_multiple).toBeCloseTo(expectedMultiple, 6);

    expect(result.outputs.investor_settlement_usd).toBeCloseTo(
      100_000 * expectedMultiple,
      1,
    );

    expect(result.outputs.investor_profit_usd).toBeGreaterThan(0);
    expect(result.outputs.floor_applied).toBe(false);
    expect(result.outputs.ceiling_applied).toBe(false);
    expect(result.outputs.monthly_irr).toBeGreaterThan(0);
    expect(result.outputs.annual_irr).toBeGreaterThan(0);
  });

  it("flat market (ratio = 1)", () => {
    const terms = makeTerms();
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 500_000,
      months_held: 36,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.outputs.investor_multiple).toBeCloseTo(1, 6);
    expect(result.outputs.investor_settlement_usd).toBe(100_000);
    expect(result.outputs.investor_profit_usd).toBe(0);
    expect(result.outputs.floor_applied).toBe(false);
    expect(result.outputs.ceiling_applied).toBe(false);
  });

  it("negative market with HARD_FLOOR — floor binds", () => {
    const terms = makeTerms({
      floor_multiple: 0.8,
      downside_mode: "HARD_FLOOR",
    });
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 300_000,
      months_held: 36,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.outputs.investor_multiple).toBeCloseTo(0.8, 6);
    expect(result.outputs.investor_settlement_usd).toBe(80_000);
    expect(result.outputs.investor_profit_usd).toBe(-20_000);
    expect(result.outputs.floor_applied).toBe(true);
    expect(result.outputs.ceiling_applied).toBe(false);
  });

  it("negative market with NO_FLOOR — no clamp", () => {
    const terms = makeTerms({
      floor_multiple: 0.8,
      downside_mode: "NO_FLOOR",
    });
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 300_000,
      months_held: 36,
    });
    const result = computeDeal(terms, assumptions, NOW);

    const expectedMultiple = 300_000 / 500_000;
    expect(result.outputs.investor_multiple).toBeCloseTo(expectedMultiple, 6);
    expect(result.outputs.investor_settlement_usd).toBe(
      roundMoney(100_000 * expectedMultiple),
    );
    expect(result.outputs.floor_applied).toBe(false);
    expect(result.outputs.ceiling_applied).toBe(false);
  });

  it("ceiling binding — very high appreciation", () => {
    const terms = makeTerms({ ceiling_multiple: 2.0 });
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 2_000_000,
      months_held: 60,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.outputs.investor_multiple).toBeCloseTo(2.0, 6);
    expect(result.outputs.investor_settlement_usd).toBe(200_000);
    expect(result.outputs.ceiling_applied).toBe(true);
    expect(result.outputs.floor_applied).toBe(false);
  });

  it("late exit — months >= maturity, tf_eff = 1", () => {
    const terms = makeTerms({ maturity_months: 60 });
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 700_000,
      months_held: 72,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.outputs.timing_factor_effective).toBe(1);

    const rawRatio = 700_000 / 500_000;
    expect(result.outputs.investor_multiple).toBeCloseTo(rawRatio, 6);
    expect(result.outputs.ceiling_applied).toBe(false);
  });

  it("determinism — same inputs produce same outputs", () => {
    const terms = makeTerms();
    const assumptions = makeAssumptions();

    const r1 = computeDeal(terms, assumptions, NOW);
    const r2 = computeDeal(terms, assumptions, NOW);

    expect(r1).toEqual(r2);
  });

  it("sale_cost_rate reduces settlement", () => {
    const terms = makeTerms();
    const assumptions = makeAssumptions({
      start_fmv_usd: 500_000,
      end_fmv_usd: 500_000,
      months_held: 60,
      sale_cost_rate: 0.06,
    });
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.outputs.investor_settlement_usd).toBe(
      roundMoney(100_000 * (1 - 0.06)),
    );
    expect(result.outputs.investor_profit_usd).toBeLessThan(0);
  });

  it("embeds inputs and assumptions in result", () => {
    const terms = makeTerms();
    const assumptions = makeAssumptions();
    const result = computeDeal(terms, assumptions, NOW);

    expect(result.inputs).toEqual(terms);
    expect(result.assumptions).toEqual(assumptions);
  });

  it("throws for invalid inputs", () => {
    expect(() =>
      computeDeal(
        makeTerms(),
        makeAssumptions({ start_fmv_usd: 0 }),
        NOW,
      ),
    ).toThrow("start_fmv_usd must be > 0");

    expect(() =>
      computeDeal(
        makeTerms(),
        makeAssumptions({ months_held: 0 }),
        NOW,
      ),
    ).toThrow("months_held must be > 0");

    expect(() =>
      computeDeal(
        makeTerms({ iba_usd: 0 }),
        makeAssumptions(),
        NOW,
      ),
    ).toThrow("iba_usd must be > 0");
  });

  it("throws when nowIso is not provided (deterministic core)", () => {
    // @ts-expect-error - nowIso is required by design
    expect(() => computeDeal(makeTerms(), makeAssumptions())).toThrow(/nowIso is required/i);
  });
});
