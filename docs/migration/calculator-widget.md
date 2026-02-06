# Calculator Widget Migration

> **Source of truth:** Marketing must not contain calculator math. The `fractpath-calculator-widget` repo is canonical for all deterministic scenario logic, chart series generation, calculator UI, and gating behavior.

## Boundary Definitions

| Concern | Owner | Notes |
|---------|-------|-------|
| Deterministic math (`computeScenario`, equity vesting, settlement logic) | **Widget** | Single source of truth for all calculation formulas |
| Chart series generation (`buildChartSeries`, Recharts rendering) | **Widget** | Widget controls data shape and visualization |
| Calculator UI (inputs, outputs, gating, blur/reveal) | **Widget** | Widget renders its own component tree |
| Page copy (hero, value props, trust bullets, section headers) | **Marketing** | Sourced from `src/content/personas.ts` and `src/content/siteContent.ts` |
| `/api/lead` HubSpot upsert | **Marketing** | Server route stays in Next.js; widget emits payload, marketing posts it |
| Analytics wiring (Plausible/PostHog event logging) | **Marketing** | Widget emits events; marketing subscribes and logs them |
| Wrapper/layout (persona tabs, section scaffolding, query param parsing) | **Marketing** | Marketing owns the page shell that hosts the widget |

## Ticket Mapping (MKT → WGT)

| Marketing Ticket | Status | Widget Ticket(s) | Description |
|------------------|--------|-------------------|-------------|
| MKT-005 (Calculator logic + charts) | **MOVED** | WGT-010 + WGT-011 | All deterministic math and chart rendering moved to widget |
| MKT-012 (Investor share mode) | **MOVED** | WGT-020 | Ungated read-only mode is a widget concern (mode=share bypass) |
| MKT-004 (Calculator UI + gating) | **SPLIT** | WGT-030 + WGT-031 | UI shell and gating logic → widget; marketing keeps wrapper/layout and page integration |
| MKT-006 (HubSpot API route) | **SPLIT** | WGT-031 | Widget builds and emits lead payload; marketing owns the `/api/lead` server route |
| MKT-011 (Analytics + tracking) | **SPLIT** | (widget emits events) | Widget emits standardized events; marketing subscribes and logs to analytics provider |

## Implementation Plan (Batch MKT-C — not in this batch)

1. Publish `fractpath-calculator-widget` as an npm package (or embed via iframe/module federation — TBD).
2. Add the widget package as a dependency in `fractpath-marketing`.
3. Create a `<CalculatorEmbed />` wrapper component in marketing that mounts the widget, passes persona key and query params, and subscribes to widget events.
4. Wire widget `onLeadPayload` callback to POST `/api/lead` from the marketing wrapper.
5. Wire widget `onAnalyticsEvent` callback to the marketing analytics provider (`src/lib/analytics.ts`).
6. Remove any residual placeholder calculator UI from marketing (the current `CalculatorSection` shell becomes a thin host).
7. Verify build, dark/light mode, mobile layout, and persona switching end-to-end.

> **This plan is documented for reference only. No runtime code changes are made in Batch MKT-A.**
