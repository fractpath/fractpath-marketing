/* eslint-disable no-console */

import { computeDeal } from "../packages/compute/src/computeDeal.js";

type JsonRecord = Record<string, unknown>;

const ORIGIN =
  process.env.MKT_PREVIEW_ORIGIN ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000");

const endpointUrl = new URL("/api/lead", ORIGIN).toString();

const TIMEOUT_MS = Number(process.env.MKT_TIMEOUT_MS ?? "10000");

function nowIso(): string {
  return new Date().toISOString();
}

function buildPayload(): JsonRecord {
  const iso = nowIso();

  // Marketing-friendly “canonical” inputs blob
  const canonicalInputs = {
    contract_version: "canonical_inputs_v1",
    schema_version: "v1",
    now_iso: iso,
    deal_terms: {
      property_value: 1_000_000,
      upfront_payment: 50_000,
      monthly_payment: 0,
      number_of_payments_months: 0,
      maturity_months: 60,
      downside_mode: "HARD_FLOOR",
    },
    assumptions: {
      start_fmv_usd: 500_000,
      end_fmv_usd: 600_000,
      months_held: 12,
      sale_cost_rate: 0,
    },
  };

  // Compute-module inputs (canonical math engine)
  const computeTerms = {
    contract_version: "1.0",
    schema_version: "1.0",
    iba_usd: canonicalInputs.deal_terms.upfront_payment,
    floor_multiple: 0.8,
    ceiling_multiple: 2.0,
    downside_mode: canonicalInputs.deal_terms.downside_mode,
    timing_factor_gain_only: true,
    maturity_months: canonicalInputs.deal_terms.maturity_months,
  };

  const computeAssumptions = {
    start_fmv_usd: canonicalInputs.assumptions.start_fmv_usd,
    end_fmv_usd: canonicalInputs.assumptions.end_fmv_usd,
    months_held: canonicalInputs.assumptions.months_held,
    sale_cost_rate: canonicalInputs.assumptions.sale_cost_rate ?? 0,
  };

  const computed = computeDeal(
    computeTerms as any,
    computeAssumptions as any,
    iso,
  );

  // App expects outputs.results to contain anchor KPIs (investor_irr_annual, investor_multiple, etc.)
  // So canonicalSnapshot.results = computed.outputs.
  const canonicalSnapshot = {
    contract_version: computed.compute_version,
    schema_version: "v1",
    now_iso: iso,
    deal_terms: canonicalInputs.deal_terms,
    assumptions: canonicalInputs.assumptions,
    results: computed.outputs.results,
  };

  const draftSnapshot = {
    contract_version: "v1",
    schema_version: "draft_v1",
    created_at: iso,
    persona: "homeowner",
    inputs: {
      property_value: canonicalInputs.deal_terms.property_value,
      upfront_payment: canonicalInputs.deal_terms.upfront_payment,
      monthly_payment: canonicalInputs.deal_terms.monthly_payment,
      number_of_payments: 0,
      downside_mode: canonicalInputs.deal_terms.downside_mode,
    },
    basic_results: {
      property_value: canonicalInputs.deal_terms.property_value,
      upfront_payment: canonicalInputs.deal_terms.upfront_payment,
    },
    canonicalSnapshot,
    canonicalInputs,
  };

  return {
    email: `test+${Date.now()}@example.com`,
    persona: "homeowner",
    draftSnapshot,
    canonicalSnapshot,
    canonicalInputs,
  };
}

function tryParseJson(raw: string): unknown | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function main() {
  const payload = buildPayload();

  console.log("== FractPath Phase 2: testCanonicalMint ==");
  console.log("POST", endpointUrl);
  console.log("Origin:", ORIGIN);
  console.log("Timeout(ms):", TIMEOUT_MS);
  console.log("Payload (pretty):\n", JSON.stringify(payload, null, 2));

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  let raw = "";

  try {
    res = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-fractpath-debug": "1",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    raw = await res.text();
  } catch (err) {
    clearTimeout(t);
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\n❌ Request failed:", msg);
    process.exit(1);
    return;
  } finally {
    clearTimeout(t);
  }

  console.log("\n== Response ==");
  console.log("Status:", res.status, res.statusText);
  console.log("Content-Type:", res.headers.get("content-type"));

  console.log("\n== Raw body (first 2000 chars) ==");
  console.log(raw.slice(0, 2000));
  if (raw.length > 2000) console.log(`... (${raw.length - 2000} more chars)`);

  const parsed = tryParseJson(raw);
  if (parsed !== null) {
    console.log("\n== Parsed JSON ==");
    console.log(JSON.stringify(parsed, null, 2));
  } else {
    console.log("\n(Body is not JSON)");
  }

  if (!res.ok) process.exit(1);

  console.log("\n✅ Success");
}

main();
