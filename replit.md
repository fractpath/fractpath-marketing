# FractPath Marketing Site

## Overview
FractPath marketing homepage - a Next.js application for fractional real estate ownership scenario modeling. Embeds the `fractpath-calculator-widget` for all calculator logic.

## Project Structure
```
/src
  /app
    layout.tsx         - Root layout with fonts and Toaster
    page.tsx           - Main homepage with static sections + PersonaPageContent
    globals.css        - Tailwind CSS imports and shadcn/ui variables
    /api
      /lead/route.ts   - POST /api/lead — { email, persona, draftSnapshot } → { resume_token }
      /share/route.ts  - POST /api/share — { to_email, shareSummary } → { share_token }
  /components
    /ui                - shadcn/ui components (Button, Card, Input, Dialog, etc.)
    /ui-kit            - Custom layout primitives (Container, Section, TopNav, Footer, etc.)
    calculator-embed.tsx - Widget embed with persona tabs, Save & Continue modal, Share modal, error boundary
    persona-page-content.tsx - Client component wrapping persona-dependent page sections (hero, calculator, value props, trust)
  /content
    personas.ts        - Persona content system (hero copy, value props, calculator labels, trust bullets per persona)
  /lib
    utils.ts           - cn() utility for class merging
    analytics.ts       - Analytics event tracking (Plausible-compatible): persona_selected, lead_email_submitted, cta_signup_clicked, cta_contact_clicked, widget events
    canonicalInputMapper.ts - Maps widget camelCase inputs to canonical v10.1 snake_case deal_terms + scenario; all defaults as constants
  /types
    fractpath-calculator-widget.d.ts - Ambient type declarations mirroring real widget API
/public
  /brand               - Logo assets (SVG)
/docs
  /migration           - Widget migration boundary docs
  /tickets             - Feature tickets + WGT-030-supplement.md
/fractpath-calculator-widget-src  - Widget source checkout (excluded from tsc)
/fractpath-calculator-widget-pack - Widget tarball package
/fractpath-marketing              - Old subdir (excluded from tsc, legacy)
```

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Widget**: fractpath-calculator-widget (local tarball: fractpath-calculator-widget-0.0.0.tgz)

## Widget Integration
- Widget package: installed from local tarball `file:./fractpath-calculator-widget-0.0.0.tgz`
- Tarball built from GitHub source `fractpath-calculator-widget-src/` directory
- Ambient `.d.ts` file mirrors real widget types (needed because tsc can't resolve from the tarball's dist-types with bundler resolution)
- Marketing does NOT contain calculator math — widget is canonical source of truth
- Widget provides: FractPathCalculatorWidget component, DraftSnapshot, ShareSummary, WidgetEvent types
- Widget requires `persona` prop (CalculatorPersona: homeowner | buyer | realtor | investor | ops)
- Marketing provides: persona selector UI, email gate UI, share modal, /api/lead route, /api/share route, analytics wiring

## Persona Content System
- `src/content/personas.ts` defines persona-specific copy for 3 personas: homeowner, buyer, realtor (retained for future persona-specific landing pages)
- Hero, value props, and trust sections are **static** — they do NOT change when persona tabs are switched
- `PersonaPageContent` client component wraps only the calculator section (persona tabs + widget embed)
- Persona tabs only affect the calculator area below the tab controller; all other page sections are server-rendered and static

## API Routes
- **POST /api/lead**: Receives { email, persona, draftSnapshot, canonicalInputs?, canonicalSnapshot? }, validates persona + snapshot structure, rejects full-only fields, server-to-server mint via app's draft-tokens/mint (fallback: local UUID), HubSpot upsert as non-blocking side effect, returns { ok, resume_token, token, resumeUrl }
- **POST /api/share**: Receives { to_email, shareSummary }, generates opaque share_token, sends branded email via SES if configured, returns { share_token }

## Key Flows
1. **Persona Selection**: User clicks Homeowner/Buyer/Realtor tab → updates widget persona prop + page content → tracks persona_selected event
2. **Save & Continue**: Widget emits onDraftSnapshot → canonical input mapper → email gate UI → POST /api/lead with { email, persona, draftSnapshot, canonicalInputs } → server-to-server mint → receive { token, resumeUrl }
3. **Share**: Widget emits onShareSummary → share email modal → POST /api/share with { to_email, shareSummary } → receive share_token

## Analytics Events (MKT-011)
- `persona_selected` — { persona }
- `lead_email_submitted` — { persona }
- `cta_signup_clicked` — { location: "nav" | "hero" }
- `cta_contact_clicked` — { location: "footer" }
- Widget events forwarded via onEvent: calculator_used, share_clicked, save_continue_clicked, save_clicked

## Development
- Run `npm run dev` to start the development server on port 5000
- Frontend binds to `0.0.0.0:5000`
- next.config.ts uses wildcard `*.replit.dev` and `*.repl.co` for allowedDevOrigins
- tsconfig.json excludes `fractpath-calculator-widget-src`, `fractpath-marketing` directories

## Rebuilding Widget Tarball
If the upstream widget changes, rebuild the tarball:
1. `cd fractpath-calculator-widget-src && npm install && npm run build`
2. Edit `fractpath-calculator-widget-src/package.json` to remove any `workspace:*` dependencies
3. `npm pack` to produce new tarball
4. Copy tarball to workspace root: `cp fractpath-calculator-widget-0.0.0.tgz ../`
5. `cd .. && npm install` to reinstall
6. Update `src/types/fractpath-calculator-widget.d.ts` if the widget API changed

## Environment Variables
- `FRACTPATH_APP_URL` — Base URL for the FractPath app, used server-side for mint calls and resumeUrl construction (default: https://app.fractpath.com)
- `NEXT_PUBLIC_FRACTPATH_APP_URL` — Base URL for the FractPath app, used client-side for Save & Continue navigation (default: https://app.fractpath.com). For Replit dev, set to the app project's public Replit URL.
- `FRACTPATH_BASE_URL` — Base URL for marketing share links (default: https://fractpath.com)
- `HUBSPOT_ACCESS_TOKEN` — (Secret) For lead CRM upsert (non-blocking side effect)
- `HUBSPOT_ENABLED` — Set to "true" to enable HubSpot upsert
- `MARKETING_SHARE_EMAIL_ENABLED` — Set to "true" to enable SES email sharing
- `SES_FROM`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — SES email configuration

## User Preferences
- Conservative, trustworthy tone (not salesy)
- Investor-presentable quality
- Clear disclaimers: "scenario modeling," "estimates," "not financial advice"
- No calculator math in marketing repo
- One step at a time — complete and verify before moving to next
- No invention — all inputs, outputs, labels, events must come from tickets
- Preserve marketing → app snapshot contract

## Canonical Compute Migration
- Marketing has ZERO imports of @/lib/compute — legacy bridge file deleted
- `src/lib/canonicalInputMapper.ts` is the single canonical mapping layer (v10.1.0)
- All defaults live in DEAL_TERMS_DEFAULTS / SCENARIO_DEFAULTS constants in the mapper
- Calculator-embed.tsx sends `canonicalInputs` (deal_terms + scenario, snake_case) to /api/lead
- /api/lead forwards `canonicalSnapshot` (camelCase key, not canonical_snapshot) to app mint
- /api/lead also accepts and forwards `canonicalInputs` to app mint
- Drift guard tests in tests/drift-guards.test.ts prevent reintroduction of legacy compute
- No local recompute in marketing — widget owns UI computation, app owns canonical compute

## Recent Changes
- 2026-02-18: FullDealSnapshotV1 canonical compliance — Enforced canonical v10.1.0 snapshot shape: every emitted snapshot now includes deal_terms (all 18 fields), assumptions (annual_appreciation, closing_cost_pct, exit_year), compute_version/contract_version/engine_version "10.1.0", schema_version "1", mode "marketing", computed_at timestamp. Removed floor/ceiling multiple inputs from Save modal (now defaulted from DEAL_TERMS_DEFAULTS). Modal collects only email; role via persona tabs. Added buildCanonicalDealTerms, buildCanonicalScenario, buildCanonicalInputs, buildBasicResults helpers. Legacy DraftSnapshot shapes are upconverted to canonical form. 35 save-continue tests (canonical compliance, snapshot injection, modal behavior, no floor/ceiling in modal, event tracking, resume navigation) + 6 drift guards all pass. 4/4 API curl tests pass (canonical 201, missing 422, full_results rejection 422, buyer 201). 0 LSP errors.
- 2026-02-18: Save & Continue modal overlay + snapshot injection fix — Converted inline save/share forms to Dialog modal overlays with shaded background, Esc/Cancel close, auto-focus email input. Fixed broken render (gate forms were missing from JSX). Added extractInputsFromSnapshot/extractBasicResultsFromSnapshot helpers for FullDealSnapshotV1→DraftSnapshot field mapping. Email, persona, created_at injected inside draftSnapshot before POST. Added 18 save-continue tests (snapshot injection, modal behavior, event tracking, resume navigation). All 5 API validation tests pass, 6/6 drift guards pass, 0 LSP errors. No compute imports. No stubs.
- 2026-02-18: Email-aware Save & Continue — calculator-embed.tsx now injects email, persona, created_at inside draftSnapshot before POST to /api/lead (not just as top-level body fields). Added inputs/basic_results fallbacks for FullDealSnapshotV1 snapshots. All 5 validation test cases pass (canonical 201, missing fields 422, legacy 201, FullDealSnapshotV1 201, full_results rejection 422). 6/6 drift guards pass. No compute imports. No stubs.
- 2026-02-18: Multi-repo verification — fixed page.tsx duplicate imports, added FullDealSnapshotV1 type to widget + ambient d.ts, fixed widget build (missing type, async buildSavePayload, initialSnapshot prop), rebuilt tarball with dist/ included (.npmignore), updated calculator-embed to handle DraftSnapshot|FullDealSnapshotV1 union, marketing build passes, 6/6 drift guards pass, env vars split dev/prod
- 2026-02-17: Hardened Save & Continue resume URL — client-side URL construction now uses NEXT_PUBLIC_FRACTPATH_APP_URL env var instead of hardcoded app base; server-side /api/lead always returns absolute resumeUrl; dev-only console.log for navigation debugging
- 2026-02-16: Sprint 10 Phase 5B — Canonical v10.1 migration cutover: removed all @/lib/compute imports, deleted legacy bridge, created canonicalInputMapper.ts, fixed mint payload key drift (canonical_snapshot → canonicalSnapshot), added canonicalInputs acceptance in lead route, added 9 drift guard tests
- 2026-02-13: Fixed /api/lead rejecting widget draftSnapshot — removed input_hash and output_hash from FULL_ONLY_KEYS (they are integrity hashes emitted in marketing mode, not app-only fields). Verified all flows end-to-end.
- 2026-02-13: Fixed persona scope per WGT-030 guardrails — hero, value props, trust are now static; only calculator area (below tabs) changes with persona. Added console logging to Save & Continue and Share flows for preview debugging. Updated WGT-030-supplement.md.
- 2026-02-13: Implemented persona content system (MKT-003), wired onShareSummary flow with share email modal, aligned /api/share with MKT-006 contract ({ to_email, shareSummary } → { share_token }), added cta_signup_clicked and cta_contact_clicked analytics (MKT-011), added footer privacy note, created WGT-030-supplement.md documenting gaps
- 2026-02-13: Aligned type declarations with real widget API, added persona selector (Homeowner/Buyer/Realtor), wired onDraftSnapshot for Save & Continue flow, updated /api/lead to accept { email, persona, draftSnapshot }, enhanced analytics with persona_selected/lead_email_submitted events, fixed next.config allowedDevOrigins, excluded stale subdirs from tsconfig
- 2026-02-09: Sprint 5 — Embedded widget, email gate, /api/lead, /api/share, analytics
- 2026-02-06: MKT-A — Migration docs declaring widget as calculator source of truth
- 2026-02-06: MKT-003 — Persona content system
- 2026-02-06: MKT-002 — shadcn/ui design system and layout primitives
- 2026-02-05: MKT-001 — Initial setup
