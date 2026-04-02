import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import {
  CONTRACT_VERSION,
  SCHEMA_VERSION,
  ENGINE_VERSION,
  COMPUTE_VERSION,
} from "@/lib/contractVersion";

const FRACTPATH_APP_URL = String(
  process.env.FRACTPATH_APP_URL || "https://app.fractpath.com",
).replace(/\/+$/, "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
});

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

function generateToken(): string {
  return randomBytes(32).toString("hex");
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

function createMinimalDraftSnapshot(persona: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    contract_version: CONTRACT_VERSION,
    schema_version: SCHEMA_VERSION,
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

function buildDraftFromCanonical(
  cs: Record<string, unknown>,
  persona: string,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    contract_version: cs.contract_version ?? CONTRACT_VERSION,
    schema_version: cs.schema_version ?? SCHEMA_VERSION,
    engine_version: cs.engine_version ?? ENGINE_VERSION,
    compute_version: cs.compute_version ?? COMPUTE_VERSION,
    created_at: (cs.created_at as string) || now,
    computed_at: (cs.computed_at as string) || now,
    persona,
    mode: "marketing",
    deal_terms: cs.deal_terms ?? {},
    scenario: cs.scenario ?? {},
    assumptions: cs.assumptions ?? {},
    inputs: cs.inputs ?? {},
    basic_results: cs.basic_results ?? {},
  };
}

async function localMint(
  snapshotJson: Record<string, unknown>,
  contractVersion: string,
  schemaVersion: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const maxAttempts = 3;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const token = generateToken();
    try {
      await pool.query(
        `INSERT INTO draft_tokens (token, snapshot_json, contract_version, schema_version, source, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          token,
          JSON.stringify(snapshotJson),
          contractVersion,
          schemaVersion,
          "marketing",
          expiresAt.toISOString(),
        ],
      );
      return { ok: true, token };
    } catch (err: unknown) {
      const code = (typeof err === "object" && err && "code" in err)
        ? (err as { code?: unknown }).code
        : undefined;
      if (code === "23505" && attempt < maxAttempts) continue;
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[local-mint] insert error:", msg);
      return { ok: false, error: "local_mint_failed" };
    }
  }
  return { ok: false, error: "local_mint_failed" };
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

  const persona = typeof body.persona === "string" ? body.persona.trim() : "";

  if (
    !persona ||
    !VALID_PERSONAS.includes(persona as (typeof VALID_PERSONAS)[number])
  )
    return NextResponse.json(
      { error: "Valid persona required (homeowner, buyer, or realtor)" },
      { status: 400 },
    );

  let draftSnapshot = body.draftSnapshot as Record<string, unknown> | undefined;

  if (!draftSnapshot && body.canonicalSnapshot) {
    const cs = body.canonicalSnapshot as Record<string, unknown>;
    draftSnapshot = buildDraftFromCanonical(cs, persona);
  }

  if (!draftSnapshot) {
    draftSnapshot = createMinimalDraftSnapshot(persona);
  }

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
  if (
    typeof snap.contract_version !== "string" ||
    !snap.contract_version ||
    typeof snap.schema_version !== "string" ||
    !snap.schema_version
  ) {
    return NextResponse.json(
      { error: "snapshot must include non-empty contract_version and schema_version strings" },
      { status: 422 },
    );
  }

  const snapshotJson: Record<string, unknown> = {
    draftSnapshot,
    canonicalSnapshot: (body.canonicalSnapshot as unknown) ?? null,
    canonicalInputs: (body.canonicalInputs as unknown) ?? null,
    meta: { source: "marketing", persona },
  };

  const mintUrl = `${FRACTPATH_APP_URL}/api/draft-tokens/mint`;

  let remoteMintOk = false;
  let token: string | null = null;
  let remoteResumeUrl: string | null = null;

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
      signal: AbortSignal.timeout(8000),
    });

    if (mintRes.ok) {
      const raw = await mintRes.text();
      let parsed: unknown = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = null;
      }

      const obj: Record<string, unknown> | null =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;

      const tok = obj?.token ?? obj?.resume_token ?? null;
      token = typeof tok === "string" ? tok : null;
      if (token) {
        remoteMintOk = true;
        const ru = obj?.resumeUrl;
        remoteResumeUrl =
          typeof ru === "string" ? ru : `/resume?token=${token}`;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[draft] remote mint failed:", msg);
  }

  if (remoteMintOk && token) {
    return NextResponse.json(
      {
        ok: true,
        token,
        resumeUrl: remoteResumeUrl,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  }

  console.warn("[draft] remote mint failed, falling back to local mint");

  const localResult = await localMint(
    snapshotJson,
    String(snap.contract_version),
    String(snap.schema_version),
  );

  if (!localResult.ok) {
    return NextResponse.json(
      { ok: false, error: "mint_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      token: localResult.token,
      resumeUrl: `/resume?token=${localResult.token}`,
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
