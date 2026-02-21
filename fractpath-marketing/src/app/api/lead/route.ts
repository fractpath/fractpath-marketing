import { NextRequest, NextResponse } from "next/server";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_ENABLED =
  (process.env.HUBSPOT_ENABLED || "").toLowerCase() === "true";

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

const REQUIRED_LITE_KEYS = [
  "contract_version",
  "schema_version",
  "created_at",
  "persona",
  "inputs",
  "basic_results",
] as const;

const FULL_ONLY_KEYS = [
  "output_hash",
  "input_hash",
  "full_results",
  "settlements",
] as const;

function isLitePayload(
  snapshot: unknown,
): snapshot is Record<string, unknown> {
  if (typeof snapshot !== "object" || snapshot === null || Array.isArray(snapshot)) {
    return false;
  }
  const obj = snapshot as Record<string, unknown>;

  for (const key of REQUIRED_LITE_KEYS) {
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

  if (
    typeof snapshot.outputs === "object" &&
    snapshot.outputs !== null &&
    "settlements" in (snapshot.outputs as Record<string, unknown>)
  ) {
    const settlements = (snapshot.outputs as Record<string, unknown>).settlements;
    if (typeof settlements === "object" && settlements !== null) {
      const std = (settlements as Record<string, unknown>).standard;
      if (typeof std === "object" && std !== null) {
        const stdObj = std as Record<string, unknown>;
        if ("raw_payout" in stdObj || "transfer_fee" in stdObj || "clamp" in stdObj) {
          return true;
        }
      }
    }
  }

  return false;
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
      { ok: false, error: "Rate limited" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const snapshot =
    body.snapshot ??
    body.canonicalSnapshot ??
    body.draftSnapshot;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400 },
    );
  }
  if (snapshot === undefined) {
    return NextResponse.json(
      { ok: false, error: "Snapshot required" },
      { status: 400 },
    );
  }

  if (!isLitePayload(snapshot)) {
    return NextResponse.json(
      { ok: false, error: "Invalid snapshot: missing required V1 lite fields" },
      { status: 422 },
    );
  }

  if (containsFullOnlyKeys(snapshot)) {
    return NextResponse.json(
      { ok: false, error: "Rejected: payload contains full-only fields" },
      { status: 422 },
    );
  }

  const snapshotJson = JSON.stringify(snapshot);
  const persona =
    typeof snapshot.persona === "string" && snapshot.persona.trim()
      ? snapshot.persona.trim()
      : "unknown";

  hubspotUpsert(email, snapshotJson, persona).catch(() => {});

  console.log(
    `[lead] captured: email=${email}, persona=${persona}, contract_version=${String(snapshot.contract_version)}`,
  );

  return NextResponse.json({ ok: true });
}
