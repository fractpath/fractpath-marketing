// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_ENABLED =
  (process.env.HUBSPOT_ENABLED || "").toLowerCase() === "true";

// Where mint happens (app owns draft_tokens table)
const FRACTPATH_APP_URL = String(
  process.env.FRACTPATH_APP_URL || "https://app.fractpath.com",
).replace(/\/+$/, "");

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

// Keys that must never be sent from marketing
const FULL_ONLY_KEYS = ["full_results", "settlements"] as const;

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

// Minimal DraftSnapshot defaults (only used if caller omits draftSnapshot)
function createMinimalDraftSnapshot(persona: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    contract_version: "10.2.0",
    schema_version: "1",
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

// HubSpot integration (non-blocking)
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
  const debug = request.headers.get("x-fractpath-debug") === "1";

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip))
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // TEMPORARY — Phase 2.1 wire-level payload capture. REMOVE THIS LOG IN PHASE 5 CLEANUP
  {
    const snap = body.draftSnapshot as Record<string, unknown> | undefined;
    const dealTerms = snap?.deal_terms as Record<string, unknown> | undefined;
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    console.log("[phase2.1] /api/lead payload probe:", JSON.stringify({
      contract_version: snap?.contract_version ?? null,
      schema_version: snap?.schema_version ?? null,
      compute_version: snap?.compute_version ?? null,
      engine_version: snap?.engine_version ?? null,
      has_deal_terms: !!dealTerms,
      deal_terms_key_count: dealTerms ? Object.keys(dealTerms).length : 0,
      has_email: !!emailRaw && emailRaw.includes("@"),
    }));
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";

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

  const draftSnapshot =
    (body.draftSnapshot as unknown) ?? createMinimalDraftSnapshot(persona);

  if (!isValidDraftSnapshot(draftSnapshot))
    return NextResponse.json(
      { error: "Invalid draftSnapshot: missing required fields" },
      { status: 422 },
    );

  if (containsFullOnlyKeys(draftSnapshot as Record<string, unknown>))
    return NextResponse.json(
      { error: "Rejected: payload contains full-only fields" },
      { status: 422 },
    );

  const snap = draftSnapshot as Record<string, unknown>;
  if (snap.contract_version !== "10.2.0" || snap.schema_version !== "1") {
    return NextResponse.json(
      { error: "Expected canonical snapshot 10.2.0 / schema 1" },
      { status: 422 },
    );
  }

  // Non-blocking CRM write
  hubspotUpsert(email, JSON.stringify(draftSnapshot), persona).catch(() => {});

  // Build snapshot_json to send to app mint endpoint
  const snapshotJson: Record<string, unknown> = {
    draftSnapshot,
    // Pass through canonical fields if present
    canonicalSnapshot: (body.canonicalSnapshot as unknown) ?? null,
    canonicalInputs: (body.canonicalInputs as unknown) ?? null,
    // Optional: include email/persona metadata (non-sensitive)
    meta: { source: "marketing", persona },
  };

  const mintUrl = `${FRACTPATH_APP_URL}/api/draft-tokens/mint`;

  try {
    const mintRes = await fetch(mintUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        snapshot_json: snapshotJson,
        source: "marketing",
      }),
    });

    const raw = await mintRes.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    if (!mintRes.ok) {
      if (debug) {
        return NextResponse.json(
          {
            ok: false,
            error: "mint_failed",
            mint_status: mintRes.status,
            mint_body: raw.slice(0, 4000),
          },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "mint_failed" },
        { status: 502 },
      );
    }

    const token = parsed?.token ?? parsed?.resume_token ?? null;
    if (!token || typeof token !== "string") {
      if (debug) {
        return NextResponse.json(
          {
            ok: false,
            error: "mint_missing_token",
            mint_body: raw.slice(0, 4000),
          },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "mint_missing_token" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        token,
        // IMPORTANT: resume happens in app, not marketing
        resumeUrl: `${FRACTPATH_APP_URL}/resume?token=${token}`,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (debug) {
      return NextResponse.json(
        { ok: false, error: "mint_exception", message: msg },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "mint_exception" },
      { status: 502 },
    );
  }
}
