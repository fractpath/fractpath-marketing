import { NextRequest, NextResponse } from "next/server";

const FRACTPATH_APP_URL = process.env.FRACTPATH_APP_URL || "https://app.fractpath.com";

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
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const summary = body.summary as Record<string, unknown> | undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }
  if (!summary || typeof summary !== "object") {
    return NextResponse.json({ ok: false, error: "Summary required" }, { status: 400 });
  }

  try {
    const shareRes = await fetch(`${FRACTPATH_APP_URL}/api/share/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, summary }),
    });
    if (shareRes.ok) {
      return NextResponse.json({ ok: true });
    }
    console.error("[share] app endpoint returned non-ok:", shareRes.status);
    return NextResponse.json({ ok: false, error: "Unable to send. Please try again." }, { status: 502 });
  } catch (err) {
    console.error("[share] send failed:", err);
    return NextResponse.json({ ok: false, error: "Unable to send. Please try again." }, { status: 502 });
  }
}
