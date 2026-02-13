import type { WidgetEvent, CalculatorPersona } from "fractpath-calculator-widget";

declare global {
  interface Window {
    plausible?: (
      name: string,
      opts?: { props?: Record<string, string> },
    ) => void;
  }
}

export function trackEvent(event: WidgetEvent) {
  if (typeof window === "undefined") return;

  try {
    const name = event.type;
    const persona = event.persona;
    window.plausible?.(name, { props: { persona } });
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

export function trackPersonaSelected(persona: CalculatorPersona) {
  trackCustomEvent("persona_selected", { persona });
}

export function trackLeadEmailSubmitted(persona: CalculatorPersona) {
  trackCustomEvent("lead_email_submitted", { persona });
}
