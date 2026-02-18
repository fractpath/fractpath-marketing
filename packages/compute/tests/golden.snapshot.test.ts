import { describe, it, expect } from "vitest";
import { computeDeal } from "../src/computeDeal.js";
import { COMPUTE_VERSION } from "../src/version.js";

const NOW = "2026-01-01T00:00:00.000Z";

describe("GOLDEN FIXTURE — canonical snapshot v10.1.0", () => {
  it("produces exact deterministic snapshot shape", () => {
    const terms = {
      contract_version: "1.0",
      schema_version: "1.0",
      iba_usd: 50_000,
      floor_multiple: 0.8,
      ceiling_multiple: 2.0,
      downside_mode: "HARD_FLOOR",
      timing_factor_gain_only: true,
      maturity_months: 60,
    };

    const assumptions = {
      start_fmv_usd: 500_000,
      end_fmv_usd: 600_000,
      months_held: 12,
      sale_cost_rate: 0,
    };

    const snapshot = computeDeal(terms as any, assumptions as any, NOW);

    expect(snapshot.compute_version).toBe("10.1.0");
    expect(COMPUTE_VERSION).toBe("10.1.0");

    expect(snapshot.inputs).toEqual({
      deal_terms: terms,
      scenario: assumptions,
    });

    expect(snapshot.outputs).toEqual({
      results: {
        isa_settlement: 52000,
        investor_multiple: 1.04,
        investor_profit_usd: 2000,
        investor_irr_annual: 0.04,
        monthly_irr: 0.00327374,
        floor_applied: false,
        ceiling_applied: false,
        timing_factor_effective: 0.2,
      },
    });

    expect(snapshot.computed_at).toBe(NOW);
  });
});
