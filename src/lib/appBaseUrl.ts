export function getAppBaseUrlServer(): string {
  const raw = process.env.FRACTPATH_APP_URL || "https://app.fractpath.com";
  return raw.replace(/\/+$/, "");
}

export function getAppBaseUrlClient(): string {
  const raw =
    process.env.NEXT_PUBLIC_FRACTPATH_APP_URL ||
    process.env.NEXT_PUBLIC_FRACTPATH_APP_URL || // (intentional no-op if you refactor later)
    "https://app.fractpath.com";
  return String(raw).replace(/\/+$/, "");
}
