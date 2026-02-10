export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Marketing Share (mode="marketing")
 * - Marketing owns branded email delivery.
 * - Treat ShareSummary as an opaque payload (do not infer fields).
 * - Email sending happens ONLY if explicitly enabled.
 */

const MARKETING_SHARE_EMAIL_ENABLED =
  (process.env.MARKETING_SHARE_EMAIL_ENABLED || "").toLowerCase() === "true";

const SES_FROM = (process.env.SES_FROM || "").trim();
const AWS_REGION = (process.env.AWS_REGION || "").trim();
const AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || "").trim();
const AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

// NEW: configurable landing URL (defaults to app root)
const SHARE_CONTINUE_URL = (
  process.env.SHARE_CONTINUE_URL || "https://app.fractpath.com"
).trim();

function isValidEmail(s: string) {
  return s.includes("@") && s.length <= 254;
}

function isValidUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" && s.length <= 2048;
  } catch {
    return false;
  }
}

function getSesClient(): SESClient | null {
  if (!MARKETING_SHARE_EMAIL_ENABLED) return null;

  // Fail CLOSED unless explicitly configured.
  if (!SES_FROM || !isValidEmail(SES_FROM)) return null;
  if (!AWS_REGION) return null;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) return null;

  return new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

/* ---------------- Rate limiting ---------------- */

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/* ---------------- Handler ---------------- */

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
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

  if (!email || !isValidEmail(email)) {
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

  const ses = getSesClient();

  // Fail closed until email provider is fully configured.
  if (!ses) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sharing is not configured yet. Please use Save & Continue to resume in the app.",
      },
      { status: 501 },
    );
  }

  // Validate continue URL (fail closed to safe default)
  const continueUrl = isValidUrl(SHARE_CONTINUE_URL)
    ? SHARE_CONTINUE_URL
    : "https://app.fractpath.com";

  try {
    // Explicitly treat summary as opaque (accepted but not inspected).
    void summary;

    await ses.send(
      new SendEmailCommand({
        Source: SES_FROM,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: "Your FractPath scenario is ready",
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data:
                "You were shared a FractPath scenario.\n\n" +
                "To view it and continue:\n" +
                `${continueUrl}\n\n` +
                "If you didn’t request this, you can ignore this email.\n\n" +
                "— FractPath\n",
              Charset: "UTF-8",
            },
          },
        },
        ReplyToAddresses: [SES_FROM],
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
