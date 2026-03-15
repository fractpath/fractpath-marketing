import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_ENABLED =
  (process.env.HUBSPOT_ENABLED || "").toLowerCase() === "true";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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

function splitName(name: string): { firstname: string; lastname: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

async function hubspotUpsertRealtor(
  email: string,
  name: string,
  brokerage: string,
): Promise<{ contactId: string }> {
  if (!HUBSPOT_ENABLED) {
    throw new Error("HubSpot is disabled. Set HUBSPOT_ENABLED=true.");
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    throw new Error("Missing HUBSPOT_ACCESS_TOKEN.");
  }

  const { firstname, lastname } = splitName(name);
  const now = new Date();
  const midnightUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const properties: Record<string, string> = {
    email,
    beta_program: "realtor_beta",
    fractpath_signup_source: "website_realtor_beta_form",
    fractpath_persona: "Realtor",
    fractpath_signup_page: "/",
    fractpath_signup_timestamp: midnightUtc.toISOString(),
  };

  if (firstname) properties.firstname = firstname;
  if (lastname) properties.lastname = lastname;
  if (brokerage) properties.company = brokerage;

  console.log("[realtor-interest] hubspot_upsert_started", { email });

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
            filters: [{ propertyName: "email", operator: "EQ", value: email }],
          },
        ],
        limit: 1,
        properties: [
          "email",
          "firstname",
          "lastname",
          "company",
          "beta_program",
          "fractpath_signup_source",
          "fractpath_persona",
          "fractpath_signup_page",
          "fractpath_signup_timestamp",
        ],
      }),
    },
  );

  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`HubSpot search failed: ${searchRes.status} ${text}`);
  }

  const searchData = await searchRes.json();

  if (searchData.total > 0 && searchData.results?.[0]?.id) {
    const contactId = String(searchData.results[0].id);

    const updateRes = await fetch(
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

    if (!updateRes.ok) {
      const text = await updateRes.text();
      throw new Error(`HubSpot update failed: ${updateRes.status} ${text}`);
    }

    console.log("[realtor-interest] hubspot_upsert_succeeded", {
      email,
      contactId,
      mode: "update",
    });

    return { contactId };
  }

  const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`HubSpot create failed: ${createRes.status} ${text}`);
  }

  const createData = await createRes.json();
  const contactId = String(createData.id);

  console.log("[realtor-interest] hubspot_upsert_succeeded", {
    email,
    contactId,
    mode: "create",
  });

  return { contactId };
}

async function sendRealtorConfirmation(
  email: string,
  name: string,
  submissionId: string,
  hubspotContactId: string,
): Promise<{ emailId: string }> {
  if (!resend) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  if (!RESEND_FROM_EMAIL) {
    throw new Error("Missing RESEND_FROM_EMAIL.");
  }

  const firstName = splitName(name).firstname || "there";

  console.log("[realtor-interest] resend_send_started", {
    email,
    submissionId,
    hubspotContactId,
  });

  const result = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: email,
    subject: "Thanks for joining the FractPath realtor beta",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">You're on the list</h1>
        <p>Hi ${firstName},</p>
        <p>Thanks for joining the FractPath realtor beta.</p>
        <p>We’ll keep you posted as we open access and share updates.</p>
        <p style="margin-top: 24px;">— FractPath</p>
      </div>
    `,
    text: `Hi ${firstName},

Thanks for joining the FractPath realtor beta.

We’ll keep you posted as we open access and share updates.

— FractPath`,
    headers: {
      "X-FractPath-Submission-Id": submissionId,
      "X-FractPath-HubSpot-Contact-Id": hubspotContactId,
    },
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }

  const emailId = String(result.data?.id || "");

  if (!emailId) {
    throw new Error("Resend send failed: missing email id");
  }

  console.log("[realtor-interest] resend_send_succeeded", {
    email,
    submissionId,
    hubspotContactId,
    emailId,
  });

  return { emailId };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brokerage =
    typeof body.brokerage === "string" ? body.brokerage.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  const submissionId = `realtor_beta_${Date.now()}`;

  console.log("[realtor-interest] submission_received", {
    submissionId,
    email,
    hasName: Boolean(name),
    hasBrokerage: Boolean(brokerage),
  });

  try {
    const { contactId } = await hubspotUpsertRealtor(email, name, brokerage);
    const { emailId } = await sendRealtorConfirmation(
      email,
      name,
      submissionId,
      contactId,
    );

    return NextResponse.json(
      {
        ok: true,
        submissionId,
        hubspot: {
          status: "success",
          contactId,
        },
        resend: {
          status: "success",
          emailId,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[realtor-interest] submission_failed", {
      submissionId,
      email,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        submissionId,
        error:
          error instanceof Error ? error.message : "Submission failed",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
