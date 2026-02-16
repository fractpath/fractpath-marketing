// src/lib/analytics.ts
/**
 * Minimal analytics facade for marketing.
 * Keep client-safe (no server-only imports) and resilient in dev.
 *
 * NOTE: CalculatorEmbed imports:
 * - trackEvent
 * - trackPersonaSelected
 * - trackLeadEmailSubmitted
 * - trackCustomEvent
 *
 * We provide stable exports even if you later wire PostHog/GA/Segment.
 */

export type AnalyticsPayload = Record<string, unknown>;

export function trackEvent(event: unknown) {
  try {
    console.log("[analytics:event]", event);
  } catch {
    // no-op
  }
}

export function trackCustomEvent(name: string, payload: AnalyticsPayload = {}) {
  try {
    console.log("[analytics:custom]", { name, ...payload });
  } catch {
    // no-op
  }
}

export function trackPersonaSelected(persona: string) {
  trackCustomEvent("persona_selected", { persona });
}

export function trackLeadEmailSubmitted(persona: string) {
  trackCustomEvent("lead_email_submitted", { persona });
}
