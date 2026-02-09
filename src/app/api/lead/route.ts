import { NextRequest, NextResponse } from "next/server";

const FRACTPATH_APP_URL = process.env.FRACTPATH_APP_URL || "https://app.fractpath.com";
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

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

async function hubspotUpsert(email: string, persona: string, snapshot: Record<string, unknown>) {
  if (!HUBSPOT_ACCESS_TOKEN) return;
  try {
    const properties: Record<string, string> = {
      email,
      fp_persona: persona,
      fp_source: "homepage_calculator",
      fp_scenario_inputs_json: JSON.stringify(snapshot.inputs ?? {}).slice(0, 5000),
      fp_scenario_outputs_json: JSON.stringify(snapshot.basic_results ?? {}).slice(0, 5000),
      fp_last_scenario_at: new Date().toISOString(),
      fp_deal_summary: `Marketing scenario: ${persona} persona, mode=${snapshot.mode ?? "marketing"}`,
    };

    const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        filterGroups: [
          { filters: [{ propertyName: "email", operator: "EQ", value: email }] },
        ],
      }),
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.total > 0) {
        const contactId = data.results[0].id;
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        });
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
    }
  } catch (err) {
    console.error("[hubspot] upsert failed (non-blocking):", err);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const snapshot = body.snapshot as Record<string, unknown> | undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }
  if (!snapshot || typeof snapshot !== "object") {
    return NextResponse.json({ ok: false, error: "Snapshot required" }, { status: 400 });
  }

  const persona = typeof snapshot.persona === "string" ? snapshot.persona : "homeowner";

  let draftToken: string | null = null;
  try {
    const mintRes = await fetch(`${FRACTPATH_APP_URL}/api/drafts/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, snapshot }),
    });
    if (mintRes.ok) {
      const mintData = await mintRes.json();
      draftToken = mintData.token ?? null;
    }
  } catch (err) {
    console.error("[lead] draft mint failed:", err);
  }

  hubspotUpsert(email, persona, snapshot).catch(() => {});

  if (!draftToken) {
    return NextResponse.json({
      ok: false,
      error: "Unable to save your scenario right now. Please try again shortly.",
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    token: draftToken,
    resumeUrl: `${FRACTPATH_APP_URL}/resume?token=${draftToken}`,
  });
}
