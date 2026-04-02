import type { NextConfig } from "next";

const replitDomain = process.env.REPLIT_DEV_DOMAIN || "";

const allowedDevHosts: string[] = [
  // local dev hosts (NO scheme, NO port)
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
];

// Replit host (NO scheme)
if (replitDomain) allowedDevHosts.push(replitDomain);

// Any additional Replit hosts (NO scheme)
if (process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS.split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .forEach((d) => allowedDevHosts.push(d));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [...allowedDevHosts, "*.replit.dev", "*.repl.co"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
