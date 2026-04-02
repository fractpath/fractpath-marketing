import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

function walk(dir: string, out: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

describe("drift guards", () => {
  const repoRoot = process.cwd();
  const srcDir = path.resolve(repoRoot, "src");

  const srcFiles = walk(srcDir).filter((p) => p.endsWith(".ts") || p.endsWith(".tsx"));

  it('no file under src/ imports from "@/lib/compute"', () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes('from "@/lib/compute"') || content.includes("from '@/lib/compute'")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("no file under src/ calls computeDeal( from legacy compute", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (
        /computeDeal\s*\(/.test(content) &&
        (content.includes('from "@/lib/compute"') || content.includes("from '@/lib/compute'"))
      ) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("no file under src/ calls defaultDealTerms( from legacy compute", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (
        /defaultDealTerms\s*\(/.test(content) &&
        (content.includes('from "@/lib/compute"') || content.includes("from '@/lib/compute'"))
      ) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("lead route sends canonicalSnapshot (camelCase) not canonical_snapshot to mint", () => {
    const routePath = path.resolve(srcDir, "app/api/lead/route.ts");
    const content = fs.readFileSync(routePath, "utf8");

    const mintStart = content.indexOf("draft-tokens/mint");
    expect(mintStart).toBeGreaterThan(-1);

    expect(content).toContain("canonicalSnapshot:");
    expect(content).not.toMatch(/[^a-zA-Z]canonical_snapshot\s*:/);
  });
});

describe("canonicalInputMapper", () => {
  it("maps valid widget inputs to canonical v11 shape", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical({
      homeValue: 500000,
      initialBuyAmount: 50000,
      termYears: 5,
      annualGrowthRate: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.deal_terms.property_value).toBe(500000);
    expect(result.data.deal_terms.upfront_payment).toBe(50000);
    expect(result.data.deal_terms.contract_maturity_years).toBe(5);
    expect(result.data.deal_terms.monthly_payment).toBe(0);
    expect(result.data.deal_terms.number_of_payments).toBe(0);
    expect(result.data.deal_terms.servicing_fee_monthly).toBe(0);

    expect(result.data.scenario.annual_appreciation).toBe(0.03);
    expect(result.data.scenario.closing_cost_pct).toBe(0);
    expect(result.data.scenario.exit_year).toBe(5);
  });

  it("rejects non-positive homeValue", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical({
      homeValue: 0,
      initialBuyAmount: 50000,
      termYears: 5,
      annualGrowthRate: 3,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.field).toBe("homeValue");
  });

  it("rejects non-finite annualGrowthRate", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical({
      homeValue: 500000,
      initialBuyAmount: 50000,
      termYears: 5,
      annualGrowthRate: NaN,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.field).toBe("annualGrowthRate");
  });
});
