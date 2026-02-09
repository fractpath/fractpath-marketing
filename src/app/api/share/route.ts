import { NextRequest, NextResponse } from "next/server";

/**
 * Marketing Share (mode="marketing")
 * - Marketing owns branded email delivery.
 * - Marketing must treat ShareSummary as an opaque payload and must not infer fields.
 *
 * This route intentionally FAILS CLOSED unless an email provider is configured.
 * (Do not delegate marketing share delivery to the app.)
 */

const MARKETING_SHARE_EMAIL_ENABLED =
  (process.env.MARKETING_SHARE_EMAIL_ENABLED || "").toLowerCase() === "true";

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

  // Fail closed until an email provider is configured.
  // This prevents false positives while keeping contract ownership correct.
  if (!MARKETING_SHARE_EMAIL_ENABLED) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sharing is not configured yet. Please use Save & Continue to resume in the app.",
      },
      { status: 501 },
    );
  }

  // Placeholder for real email delivery (Resend/SendGrid/Postmark/etc).
  // Must treat `summary` as opaque and embed a magic link provided/constructed by marketing contract.
  console.error(
    "[share] MARKETING_SHARE_EMAIL_ENABLED=true but no provider configured",
  );
  void summary; // explicit: summary is accepted but not inspected

  return NextResponse.json(
    { ok: false, error: "Sharing is not configured yet." },
    { status: 501 },
  );
}
