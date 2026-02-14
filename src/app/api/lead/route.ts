import { NextRequest, NextResponse } from "next/server";
import { defaultDealTerms } from "@/lib/compute";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_ENABLED =
  (process.env.HUBSPOT_ENABLED || "").toLowerCase() === "true";

const FRACTPATH_APP_URL = (
  process.env.FRACTPATH_APP_URL || "https://app.fractpath.com"
).trim();

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const VALID_PERSONAS = ["homeowner", "buyer", "realtor"] as const;

const REQUIRED_SNAPSHOT_KEYS = [
  "contract_version",
  "schema_version",
  "created_at",
  "persona",
  "inputs",
  "basic_results",
] as const;

const FULL_ONLY_KEYS = [
  "full_results",
  "settlements",
] as const;

const REQUIRED_CANONICAL_KEYS = [
  "compute_version",
  "computed_at",
  "inputs",
  "assumptions",
  "outputs",
] as const;

function isValidDraftSnapshot(
  snapshot: unknown,
): snapshot is Record<string, unknown> {
  if (typeof snapshot !== "object" || snapshot === null || Array.isArray(snapshot)) {
    return false;
  }
  const obj = snapshot as Record<string, unknown>;
  for (const key of REQUIRED_SNAPSHOT_KEYS) {
    if (!(key in obj) || obj[key] === undefined) {
      return false;
    }
  }
  return true;
}

function containsFullOnlyKeys(snapshot: Record<string, unknown>): boolean {
  for (const key of FULL_ONLY_KEYS) {
    if (key in snapshot) return true;
  }
  return false;
}

const CANONICAL_MAX_BYTES = 20_480;
const PII_KEY_PATTERN = /(address|street|zip|postal|ssn|dob|phone|email)/i;

function redactPiiFromInputs(
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(inputs)) {
    redacted[key] = PII_KEY_PATTERN.test(key) ? "[REDACTED]" : value;
  }
  return redacted;
}

function buildSafeCanonicalSnapshot(
  raw: Record<string, unknown>,
): {
  safe: Record<string, unknown>;
  size_bytes: number;
  truncated: boolean;
} {
  const inputs = redactPiiFromInputs(
    raw.inputs as Record<string, unknown>,
  );

  const full = {
    compute_version: raw.compute_version,
    computed_at: raw.computed_at,
    inputs,
    assumptions: raw.assumptions,
    outputs: raw.outputs,
  };

  let json = JSON.stringify(full);
  let sizeBytes = new TextEncoder().encode(json).length;

  if (sizeBytes <= CANONICAL_MAX_BYTES) {
    return { safe: full, size_bytes: sizeBytes, truncated: false };
  }

  const t1 = { ...full, outputs: "[TRUNCATED]" };
  json = JSON.stringify(t1);
  sizeBytes = new TextEncoder().encode(json).length;
  if (sizeBytes <= CANONICAL_MAX_BYTES) {
    return { safe: t1, size_bytes: sizeBytes, truncated: true };
  }

  const t2 = { ...t1, assumptions: "[TRUNCATED]" };
  json = JSON.stringify(t2);
  sizeBytes = new TextEncoder().encode(json).length;
  if (sizeBytes <= CANONICAL_MAX_BYTES) {
    return { safe: t2, size_bytes: sizeBytes, truncated: true };
  }

  const t3 = { ...t2, inputs: "[TRUNCATED]" };
  json = JSON.stringify(t3);
  sizeBytes = new TextEncoder().encode(json).length;
  return { safe: t3, size_bytes: sizeBytes, truncated: true };
}

function isValidCanonicalSnapshot(
  snapshot: unknown,
): snapshot is Record<string, unknown> {
  if (typeof snapshot !== "object" || snapshot === null || Array.isArray(snapshot)) {
    return false;
  }
  const obj = snapshot as Record<string, unknown>;
  for (const key of REQUIRED_CANONICAL_KEYS) {
    if (!(key in obj) || obj[key] === undefined) {
      return false;
    }
  }
  if (typeof obj.inputs !== "object" || obj.inputs === null) return false;
  if (typeof obj.assumptions !== "object" || obj.assumptions === null) return false;
  if (typeof obj.outputs !== "object" || obj.outputs === null) return false;

  try {
    JSON.stringify(snapshot);
  } catch {
    return false;
  }

  return true;
}

function extractDealTermsDefaults(
  canonicalInputs: Record<string, unknown> | null,
  draftSnapshot: Record<string, unknown>,
): Record<string, unknown> {
  const draftInputs = draftSnapshot.inputs as Record<string, unknown> | undefined;

  const canonicalMaturity =
    canonicalInputs && typeof canonicalInputs.maturity_months === "number"
      ? canonicalInputs.maturity_months
      : canonicalInputs && typeof canonicalInputs.maturityMonths === "number"
        ? canonicalInputs.maturityMonths
        : null;

  const draftTermYears = Number(draftInputs?.termYears ?? 5);
  const draftMaturity = Number(
    draftInputs?.maturity_months ??
      draftInputs?.maturityMonths ??
      draftTermYears * 12,
  );

  const maturity_months =
    (canonicalMaturity && canonicalMaturity > 0 ? canonicalMaturity : null) ??
    (draftMaturity > 0 ? draftMaturity : 60);

  if (canonicalInputs) {
    return {
      floor_multiple: canonicalInputs.floor_multiple,
      ceiling_multiple: canonicalInputs.ceiling_multiple,
      downside_mode: canonicalInputs.downside_mode,
      timing_factor_gain_only: canonicalInputs.timing_factor_gain_only,
      maturity_months,
      source: "canonical_snapshot",
    };
  }

  const iba = Number(draftInputs?.initialBuyAmount ?? draftInputs?.iba_usd ?? 1);

  try {
    const defaults = defaultDealTerms({
      iba_usd: iba > 0 ? iba : 1,
      maturity_months,
    });

    return {
      floor_multiple: defaults.floor_multiple,
      ceiling_multiple: defaults.ceiling_multiple,
      downside_mode: defaults.downside_mode,
      timing_factor_gain_only: defaults.timing_factor_gain_only,
      maturity_months,
      source: "default_deal_terms",
    };
  } catch {
    return {
      floor_multiple: 0.8,
      ceiling_multiple: 2.0,
      downside_mode: "HARD_FLOOR",
      timing_factor_gain_only: true,
      maturity_months,
      source: "fallback",
    };
  }
}

async function hubspotUpsert(
  email: string,
  snapshotJson: string,
  persona: string,
) {
  if (!HUBSPOT_ENABLED || !HUBSPOT_ACCESS_TOKEN) return;

  try {
    const properties: Record<string, string> = {
      email,
      fp_persona: persona,
      fp_source: "homepage_calculator",
      fp_snapshot_json: snapshotJson.slice(0, 5000),
      fp_last_scenario_at: new Date().toISOString(),
      fp_deal_summary: `Marketing scenario: persona=${persona}, mode=marketing`,
    };

    const searchRes = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "email", operator: "EQ", value: email },
              ],
            },
          ],
        }),
      },
    );

    if (!searchRes.ok) return;

    const data = await searchRes.json();
    if (data.total > 0) {
      const contactId = data.results[0].id;
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        },
      );
    } else {
      await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ properties }),
      });
    }
  } catch (err) {
    console.error("[hubspot] upsert failed (non-blocking):", err);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";
  const draftSnapshot = body.draftSnapshot;
  const rawCanonicalSnapshot = body.canonicalSnapshot;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  if (!persona || !VALID_PERSONAS.includes(persona as typeof VALID_PERSONAS[number])) {
    return NextResponse.json(
      { error: "Valid persona required (homeowner, buyer, or realtor)" },
      { status: 400 },
    );
  }

  if (draftSnapshot === undefined) {
    return NextResponse.json(
      { error: "draftSnapshot required" },
      { status: 400 },
    );
  }

  if (!isValidDraftSnapshot(draftSnapshot)) {
    return NextResponse.json(
      { error: "Invalid draftSnapshot: missing required fields" },
      { status: 422 },
    );
  }

  if (containsFullOnlyKeys(draftSnapshot)) {
    return NextResponse.json(
      { error: "Rejected: payload contains full-only fields" },
      { status: 422 },
    );
  }

  let canonicalSnapshot: Record<string, unknown> | null = null;
  let canonicalSnapshot_invalid = false;

  if (rawCanonicalSnapshot !== undefined && rawCanonicalSnapshot !== null) {
    if (isValidCanonicalSnapshot(rawCanonicalSnapshot)) {
      canonicalSnapshot = rawCanonicalSnapshot;
    } else {
      canonicalSnapshot_invalid = true;
      console.warn(
        `[lead] canonicalSnapshot present but invalid: email=${email}, persona=${persona}`,
      );
    }
  }

  const canonicalInputs = canonicalSnapshot
    ? (canonicalSnapshot.inputs as Record<string, unknown>)
    : null;

  const dealTermsDefaultsUsed = extractDealTermsDefaults(
    canonicalInputs,
    draftSnapshot,
  );

  let safeCanonical: Record<string, unknown> | undefined;
  let canonicalSnapshot_size_bytes: number | undefined;
  let canonicalSnapshot_truncated = false;

  if (canonicalSnapshot) {
    const result = buildSafeCanonicalSnapshot(canonicalSnapshot);
    safeCanonical = result.safe;
    canonicalSnapshot_size_bytes = result.size_bytes;
    canonicalSnapshot_truncated = result.truncated;
  }

  const snapshotJson = JSON.stringify(draftSnapshot);

  hubspotUpsert(email, snapshotJson, persona).catch(() => {});

  const resumeToken = crypto.randomUUID();

  const leadRecord: Record<string, unknown> = {
    email,
    persona,
    resume_token: resumeToken,
    contract_version: String(draftSnapshot.contract_version),
    deal_terms_defaults_used: dealTermsDefaultsUsed,
    has_canonical_snapshot: canonicalSnapshot !== null,
    canonicalSnapshot_invalid,
    captured_at: new Date().toISOString(),
  };

  if (safeCanonical) {
    leadRecord.canonicalSnapshot = safeCanonical;
    leadRecord.canonicalSnapshot_size_bytes = canonicalSnapshot_size_bytes;
    leadRecord.canonicalSnapshot_truncated = canonicalSnapshot_truncated;
  }

  console.log("[lead] captured:", JSON.stringify(leadRecord));

  if (canonicalSnapshot) {
    console.log(
      `[lead] canonicalSnapshot stored: compute_version=${String(canonicalSnapshot.compute_version)}, size=${canonicalSnapshot_size_bytes}B, truncated=${canonicalSnapshot_truncated}, token=${resumeToken}`,
    );
  }

  return NextResponse.json({ resume_token: resumeToken });
}
