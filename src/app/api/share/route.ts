export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const MARKETING_SHARE_EMAIL_ENABLED =
  (process.env.MARKETING_SHARE_EMAIL_ENABLED || "").toLowerCase() === "true";

const SES_FROM = (process.env.SES_FROM || "").trim();
const AWS_REGION = (process.env.AWS_REGION || "").trim();
const AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || "").trim();
const AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

const FRACTPATH_BASE_URL = (
  process.env.FRACTPATH_BASE_URL || "https://fractpath.com"
).trim();

function isValidEmail(s: string) {
  return s.includes("@") && s.length <= 254;
}

function getSesClient(): SESClient | null {
  if (!MARKETING_SHARE_EMAIL_ENABLED) return null;
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

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const toEmail = typeof body.to_email === "string" ? body.to_email.trim() : "";
  const shareSummary = body.shareSummary;

  if (!toEmail || !isValidEmail(toEmail)) {
    return NextResponse.json(
      { error: "Valid to_email required" },
      { status: 400 },
    );
  }
  if (shareSummary === undefined) {
    return NextResponse.json(
      { error: "shareSummary required" },
      { status: 400 },
    );
  }

  const shareToken = crypto.randomUUID();

  const ses = getSesClient();

  if (!ses) {
    console.log(
      `[share] email disabled — token=${shareToken}, to=${toEmail}`,
    );
    return NextResponse.json({ share_token: shareToken });
  }

  const magicLink = `${FRACTPATH_BASE_URL}/calculator?share=${shareToken}`;

  try {
    void shareSummary;

    await ses.send(
      new SendEmailCommand({
        Source: SES_FROM,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: {
            Data: "Someone shared a FractPath scenario with you",
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data:
                "You've been shared an illustrative FractPath scenario.\n\n" +
                "This is a non-binding estimate for informational purposes only.\n\n" +
                "View the scenario:\n" +
                `${magicLink}\n\n` +
                "If you didn't expect this, you can safely ignore this email.\n\n" +
                "— FractPath\n",
              Charset: "UTF-8",
            },
          },
        },
        ReplyToAddresses: [SES_FROM],
      }),
    );

    return NextResponse.json({ share_token: shareToken });
  } catch (err) {
    console.error("[share] SES send failed", err);
    return NextResponse.json(
      { error: "Email delivery failed" },
      { status: 500 },
    );
  }
}
