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

  it("lead route mint payload uses canonicalSnapshot (camelCase) and snapshot_json is a JSON string", () => {
    const routePath = path.resolve(srcDir, "app/api/lead/route.ts");
    const content = fs.readFileSync(routePath, "utf8");

    const mintPayloadStart = content.indexOf("const mintPayload");
    expect(mintPayloadStart).toBeGreaterThan(-1);

    const fetchStart = content.indexOf("fetch(", mintPayloadStart);
    const mintPayloadSection =
      fetchStart > -1 ? content.slice(mintPayloadStart, fetchStart) : content.slice(mintPayloadStart);

    expect(mintPayloadSection).toContain("mintPayload.canonicalSnapshot");
    expect(mintPayloadSection).not.toContain("mintPayload.canonical_snapshot");

    // App contract requires snapshot_json to be a JSON object (not a JSON string)
    expect(mintPayloadSection).toContain("snapshot_json: draftSnapshot");
    expect(mintPayloadSection).not.toContain("snapshot_json: snapshotJson");


  });
});

describe("canonicalInputMapper", () => {
  it("maps valid widget inputs to canonical v10.1 shape", async () => {
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
    expect(result.data.deal_terms.floor_multiple).toBe(0.8);
    expect(result.data.deal_terms.ceiling_multiple).toBe(2.0);
    expect(result.data.deal_terms.downside_mode).toBe("HARD_FLOOR");
    expect(result.data.deal_terms.platform_fee).toBe(0);
    expect(result.data.deal_terms.exit_fee_pct).toBe(0);
    expect(result.data.deal_terms.duration_yield_floor_enabled).toBe(false);

    expect(result.data.scenario.annual_appreciation).toBe(0.03);
    expect(result.data.scenario.closing_cost_pct).toBe(0);
    expect(result.data.scenario.exit_year).toBe(5);
  });

  it("applies floor/ceiling overrides", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical(
      { homeValue: 400000, initialBuyAmount: 40000, termYears: 7, annualGrowthRate: 4 },
      { floor_multiple: 0.9, ceiling_multiple: 1.8 },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.deal_terms.floor_multiple).toBe(0.9);
    expect(result.data.deal_terms.ceiling_multiple).toBe(1.8);
  });
});
