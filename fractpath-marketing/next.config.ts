import type { NextConfig } from "next";

const allowedOrigins: string[] = [];

// Add Replit environment URLs if present
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}:3000`);
}
if (process.env.REPLIT_DOMAINS) {
  allowedOrigins.push(`https://${process.env.REPLIT_DOMAINS}`);
}

// Add local dev URLs
allowedOrigins.push("http://127.0.0.1:3000");
allowedOrigins.push("http://localhost:3000");
allowedOrigins.push("http://0.0.0.0:3000");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["fractpath-calculator-widget"],
  experimental: { esmExternals: true },
  allowedDevOrigins: allowedOrigins,
};

export default nextConfig;
