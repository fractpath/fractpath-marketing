import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function walkTs(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      results.push(...walkTs(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

describe("drift guards", () => {
  const srcDir = path.resolve(__dirname, "../src");
  const srcFiles = walkTs(srcDir);

  it("no file under src/ imports from @/lib/compute", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes('from "@/lib/compute"') || content.includes("from '@/lib/compute'")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("no file under src/ calls computeDeal(", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      if (/computeDeal\s*\(/.test(content)) {
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

    const mintPayloadSection = content.slice(
      content.indexOf("mintPayload"),
      content.indexOf("fetch(") > content.indexOf("mintPayload")
        ? content.indexOf("fetch(", content.indexOf("mintPayload"))
        : content.length,
    );

    expect(mintPayloadSection).toContain("mintPayload.canonicalSnapshot");
    expect(mintPayloadSection).not.toContain("mintPayload.canonical_snapshot");
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

  it("rejects invalid homeValue", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical({
      homeValue: -1,
      initialBuyAmount: 50000,
      termYears: 5,
      annualGrowthRate: 3,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.field).toBe("homeValue");
  });

  it("rejects floor > ceiling", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical(
      { homeValue: 500000, initialBuyAmount: 50000, termYears: 5, annualGrowthRate: 3 },
      { floor_multiple: 2.5, ceiling_multiple: 1.0 },
    );

    expect(result.ok).toBe(false);
  });

  it("all canonical DealTerms fields use snake_case", async () => {
    const { mapWidgetInputsToCanonical } = await import("../src/lib/canonicalInputMapper");

    const result = mapWidgetInputsToCanonical({
      homeValue: 500000,
      initialBuyAmount: 50000,
      termYears: 5,
      annualGrowthRate: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const dtKeys = Object.keys(result.data.deal_terms);
    for (const key of dtKeys) {
      expect(key).not.toMatch(/[A-Z]/);
    }

    const scKeys = Object.keys(result.data.scenario);
    for (const key of scKeys) {
      expect(key).not.toMatch(/[A-Z]/);
    }
  });
});
