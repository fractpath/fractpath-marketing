import { NextRequest, NextResponse } from "next/server";
import {
  extractDealTermsDefaultsUsed,
  DEAL_TERMS_DEFAULTS,
} from "@/lib/canonicalInputMapper";

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

// Minimal required keys for DraftSnapshotV1
const REQUIRED_SNAPSHOT_KEYS = [
  "contract_version",
  "schema_version",
  "created_at",
  "persona",
  "inputs",
  "basic_results",
] as const;

// Full-only keys (should not be present in marketing payload)
const FULL_ONLY_KEYS = ["full_results", "settlements"] as const;

// Validate draftSnapshot structure
function isValidDraftSnapshot(
  snapshot: unknown,
): snapshot is Record<string, unknown> {
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    Array.isArray(snapshot)
  )
    return false;
  const obj = snapshot as Record<string, unknown>;
  for (const key of REQUIRED_SNAPSHOT_KEYS) {
    if (!(key in obj) || obj[key] === undefined) return false;
  }
  return true;
}

function containsFullOnlyKeys(snapshot: Record<string, unknown>): boolean {
  return FULL_ONLY_KEYS.some((key) => key in snapshot);
}

// Redact PII from inputs
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

// Build canonical snapshot safely (truncate if too large)
const CANONICAL_MAX_BYTES = 20_480;
function buildSafeCanonicalSnapshot(raw: Record<string, unknown>) {
  const inputs = redactPiiFromInputs(raw.inputs as Record<string, unknown>);

  const full = {
    compute_version: raw.compute_version,
    computed_at: raw.computed_at,
    inputs,
    assumptions: raw.assumptions,
    outputs: raw.outputs,
  };

  let json = JSON.stringify(full);
  let sizeBytes = new TextEncoder().encode(json).length;
  if (sizeBytes <= CANONICAL_MAX_BYTES)
    return { safe: full, size_bytes: sizeBytes, truncated: false };

  const t1 = { ...full, outputs: "[TRUNCATED]" };
  json = JSON.stringify(t1);
  sizeBytes = new TextEncoder().encode(json).length;
  if (sizeBytes <= CANONICAL_MAX_BYTES)
    return { safe: t1, size_bytes: sizeBytes, truncated: true };

  const t2 = { ...t1, assumptions: "[TRUNCATED]" };
  json = JSON.stringify(t2);
  sizeBytes = new TextEncoder().encode(json).length;
  if (sizeBytes <= CANONICAL_MAX_BYTES)
    return { safe: t2, size_bytes: sizeBytes, truncated: true };

  const t3 = { ...t2, inputs: "[TRUNCATED]" };
  json = JSON.stringify(t3);
  sizeBytes = new TextEncoder().encode(json).length;
  return { safe: t3, size_bytes: sizeBytes, truncated: true };
}

// Minimal DraftSnapshotV1 defaults for marketing testing
function createMinimalDraftSnapshot(persona: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    contract_version: "v1",
    schema_version: "draft_v1",
    created_at: now,
    persona,
    inputs: {
      property_value: 500000,
      upfront_payment: 100000,
      monthly_payment: 2000,
      number_of_payments: 12,
      downside_mode: "NO_FLOOR",
    },
    basic_results: {},
  };
}

// HubSpot integration (unchanged)
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
  if (isRateLimited(ip))
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";
  const draftSnapshot =
    body.draftSnapshot ?? createMinimalDraftSnapshot(persona);
  const rawCanonicalSnapshot = body.canonicalSnapshot;
  const rawCanonicalInputs = body.canonicalInputs;

  if (!email || !email.includes("@"))
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  if (
    !persona ||
    !VALID_PERSONAS.includes(persona as (typeof VALID_PERSONAS)[number])
  )
    return NextResponse.json(
      { error: "Valid persona required (homeowner, buyer, or realtor)" },
      { status: 400 },
    );

  if (!isValidDraftSnapshot(draftSnapshot))
    return NextResponse.json(
      { error: "Invalid draftSnapshot: missing required fields" },
      { status: 422 },
    );
  if (containsFullOnlyKeys(draftSnapshot))
    return NextResponse.json(
      { error: "Rejected: payload contains full-only fields" },
      { status: 422 },
    );

  hubspotUpsert(email, JSON.stringify(draftSnapshot), persona).catch(() => {});

  // Mint draft token
  let token: string | null = null;
  let resumeUrl: string | null = null;
  let mintSource = "local_fallback";
  try {
    const mintRes = await fetch(`${FRACTPATH_APP_URL}/api/draft-tokens/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "marketing",
        snapshot_json: draftSnapshot,
        canonicalSnapshot: rawCanonicalSnapshot,
        canonicalInputs: rawCanonicalInputs,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (mintRes.ok) {
      const mintData = (await mintRes.json()) as Record<string, unknown>;
      token = typeof mintData.token === "string" ? mintData.token : null;

      // ✅ FIX: never return a relative /resume URL from marketing
      resumeUrl =
        typeof mintData.resumeUrl === "string" &&
        mintData.resumeUrl.startsWith("http")
          ? mintData.resumeUrl
          : `${FRACTPATH_APP_URL}/resume?token=${token}`;

      if (token) mintSource = "app_mint";
    }
  } catch (err) {
    console.warn(
      "[lead] draft-tokens/mint call failed (using local fallback):",
      err,
    );
  }

  if (!token)
    return NextResponse.json(
      { ok: false, error: "mint_failed" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );

  return NextResponse.json(
    {
      ok: true,
      token,
      resume_token: token,
      resumeUrl,
      mint_source: mintSource,
      contract_version: String(draftSnapshot.contract_version),
      has_canonical_snapshot: rawCanonicalSnapshot !== null,
      has_canonical_inputs: rawCanonicalInputs !== null,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
