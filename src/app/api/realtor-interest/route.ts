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

async function hubspotUpsertRealtor(
  email: string,
  name: string,
  brokerage: string,
) {
  if (!HUBSPOT_ENABLED || !HUBSPOT_ACCESS_TOKEN) return;
  try {
    const properties: Record<string, string> = {
      email,
      fp_persona: "realtor",
      fp_source: "realtor_beta_form",
      fp_interest: "fractpath",
      fp_stage: "early-access",
      fp_last_scenario_at: new Date().toISOString(),
    };
    if (name) properties.firstname = name;
    if (brokerage) properties.company = brokerage;

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
    console.error("[hubspot] realtor upsert failed (non-blocking):", err);
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brokerage =
    typeof body.brokerage === "string" ? body.brokerage.trim() : "";

  if (!email || !email.includes("@"))
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );

  hubspotUpsertRealtor(email, name, brokerage).catch(() => {});

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
