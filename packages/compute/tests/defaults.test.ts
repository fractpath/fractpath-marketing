import { describe, it, expect } from "vitest";
import { defaultDealTerms } from "../src/defaults.js";

describe("defaultDealTerms", () => {
  it("returns canonical defaults when only required fields provided", () => {
    const result = defaultDealTerms({ iba_usd: 50_000, maturity_months: 60 });

    expect(result.contract_version).toBe("fp-10");
    expect(result.schema_version).toBe("10.0.0");
    expect(result.iba_usd).toBe(50_000);
    expect(result.maturity_months).toBe(60);
    expect(result.floor_multiple).toBe(0.8);
    expect(result.ceiling_multiple).toBe(2.0);
    expect(result.downside_mode).toBe("HARD_FLOOR");
    expect(result.timing_factor_gain_only).toBe(true);
    expect(result.notes).toBeUndefined();
  });

  it("overrides apply correctly", () => {
    const result = defaultDealTerms(
      { iba_usd: 100_000, maturity_months: 120 },
      {
        floor_multiple: 0.9,
        ceiling_multiple: 1.5,
        downside_mode: "NO_FLOOR",
        contract_version: "fp-11",
        schema_version: "11.0.0",
        notes: "test note",
      }
    );

    expect(result.iba_usd).toBe(100_000);
    expect(result.maturity_months).toBe(120);
    expect(result.floor_multiple).toBe(0.9);
    expect(result.ceiling_multiple).toBe(1.5);
    expect(result.downside_mode).toBe("NO_FLOOR");
    expect(result.contract_version).toBe("fp-11");
    expect(result.schema_version).toBe("11.0.0");
    expect(result.notes).toBe("test note");
    expect(result.timing_factor_gain_only).toBe(true);
  });

  it("throws when iba_usd invalid", () => {
    expect(() => defaultDealTerms({ iba_usd: 0, maturity_months: 60 })).toThrow(
      "Invalid DealTerms defaults/overrides: iba_usd must be > 0"
    );
    expect(() => defaultDealTerms({ iba_usd: -100, maturity_months: 60 })).toThrow(
      "Invalid DealTerms defaults/overrides: iba_usd must be > 0"
    );
  });

  it("throws when maturity_months invalid", () => {
    expect(() => defaultDealTerms({ iba_usd: 50_000, maturity_months: 0 })).toThrow(
      "Invalid DealTerms defaults/overrides: maturity_months must be > 0"
    );
    expect(() => defaultDealTerms({ iba_usd: 50_000, maturity_months: -12 })).toThrow(
      "Invalid DealTerms defaults/overrides: maturity_months must be > 0"
    );
  });

  it("throws when floor_multiple > ceiling_multiple", () => {
    expect(() =>
      defaultDealTerms(
        { iba_usd: 50_000, maturity_months: 60 },
        { floor_multiple: 3.0, ceiling_multiple: 2.0 }
      )
    ).toThrow(
      "Invalid DealTerms defaults/overrides: floor_multiple must not exceed ceiling_multiple"
    );
  });

  it("determinism: deepEqual for identical calls", () => {
    const args = { iba_usd: 75_000, maturity_months: 36 } as const;
    const a = defaultDealTerms(args);
    const b = defaultDealTerms(args);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});
