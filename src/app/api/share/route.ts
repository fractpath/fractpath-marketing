export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Marketing Share (mode="marketing")
 * - Marketing owns branded email delivery.
 * - Marketing must treat ShareSummary as an opaque payload.
 * - Email sending happens ONLY if explicitly enabled.
 */

const MARKETING_SHARE_EMAIL_ENABLED =
  (process.env.MARKETING_SHARE_EMAIL_ENABLED || "").toLowerCase() === "true";

const SES_FROM = process.env.SES_FROM || "noreply@fractpath.com";

const ses = MARKETING_SHARE_EMAIL_ENABLED
  ? new SESClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/* ---------------- Rate limiting ---------------- */

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

/* ---------------- Handler ---------------- */

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
  const summary = body.summary;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400 },
    );
  }

  if (summary === undefined) {
    return NextResponse.json(
      { ok: false, error: "Summary required" },
      { status: 400 },
    );
  }

  if (!MARKETING_SHARE_EMAIL_ENABLED || !ses) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sharing is not configured yet. Please use Save & Continue to resume in the app.",
      },
      { status: 501 },
    );
  }

  try {
    await ses.send(
      new SendEmailCommand({
        Source: SES_FROM,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: "Your FractPath Scenario",
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data:
                "You were shared a FractPath scenario.\n\n" +
                "Open the FractPath app to continue.\n\n" +
                "— FractPath",
              Charset: "UTF-8",
            },
          },
        },
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[share] SES send failed", err);
    return NextResponse.json(
      { ok: false, error: "Email delivery failed" },
      { status: 500 },
    );
  }
}
