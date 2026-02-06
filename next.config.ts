import type { NextConfig } from "next";

const allowedOrigins: string[] = [];
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}:5000`);
}
if (process.env.REPLIT_DOMAINS) {
  allowedOrigins.push(`https://${process.env.REPLIT_DOMAINS}`);
}
allowedOrigins.push("http://127.0.0.1:5000");
allowedOrigins.push("http://localhost:5000");
allowedOrigins.push("http://0.0.0.0:5000");

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedOrigins,
};

export default nextConfig;
