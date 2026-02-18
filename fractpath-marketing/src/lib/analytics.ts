import type { WidgetEvent } from "fractpath-calculator-widget";

declare global {
  interface Window {
    plausible?: (
      name: string,
      opts?: { props?: Record<string, string> },
    ) => void;
  }
}

/**
 * Analytics must be side-effect only and must not depend on widget payload structure.
 * Treat WidgetEvent as opaque; do not assume fields like `persona` exist.
 */
export function trackEvent(event: WidgetEvent) {
  if (typeof window === "undefined") return;

  try {
    // Best-effort event naming; fall back safely if shape is unknown
    const name =
      typeof event === "object" && event !== null && "type" in (event as any)
        ? String((event as any).type)
        : "widget_event";

    window.plausible?.(name);
  } catch {
    // analytics must never break the app
  }
}

export function trackCustomEvent(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    window.plausible?.(name, props ? { props } : undefined);
  } catch {
    // analytics must never break the app
  }
}

// --- Added missing exports for build ---
export function trackPersonaSelected(persona: string) {
  // Placeholder: log to console; can later integrate real analytics
  console.log("[Analytics] Persona selected:", persona);
}

export function trackLeadEmailSubmitted(email: string) {
  // Placeholder: log to console; can later integrate real analytics
  console.log("[Analytics] Lead email submitted:", email);
}
