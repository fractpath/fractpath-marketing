# FractPath Marketing Site

## Overview
FractPath marketing homepage - a Next.js application for fractional real estate ownership scenario modeling. Embeds the `fractpath-calculator-widget` for all calculator logic.

## Project Structure
```
/src
  /app
    layout.tsx         - Root layout with fonts and Toaster
    page.tsx           - Main homepage with all marketing sections + widget embed
    globals.css        - Tailwind CSS imports and shadcn/ui variables
    /api
      /lead/route.ts   - POST /api/lead — email gate, persona, draftSnapshot → resume_token
      /share/route.ts  - POST /api/share — forward ShareSummary for email send
  /components
    /ui                - shadcn/ui components (Button, Card, Input, Dialog, etc.)
    /ui-kit            - Custom layout primitives (Container, Section, TopNav, etc.)
    calculator-embed.tsx - Widget embed wrapper with persona selector, email gate + error boundary
  /lib
    utils.ts           - cn() utility for class merging
    analytics.ts       - Analytics event tracking (Plausible-compatible): persona_selected, lead_email_submitted, widget events
  /types
    fractpath-calculator-widget.d.ts - Ambient type declarations mirroring real widget API
/public
  /brand               - Logo assets (SVG)
/docs
  /migration           - Widget migration boundary docs
  /tickets             - Feature tickets
/fractpath-calculator-widget-src  - Widget source checkout (excluded from tsc)
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
- Marketing provides: persona selector UI, email gate UI, /api/lead route, /api/share route, analytics wiring

## API Routes
- **POST /api/lead**: Receives { email, persona, draftSnapshot }, validates persona + snapshot structure, rejects full-only fields, HubSpot upsert as non-blocking side effect, returns { resume_token }
- **POST /api/share**: Receives { email, summary }, forwards to SES for branded email send (requires SES configuration)

## Key Flows
1. **Persona Selection**: User clicks Homeowner/Buyer/Realtor tab → updates widget persona prop → tracks persona_selected event
2. **Save & Continue**: Widget emits onDraftSnapshot → email gate UI → POST /api/lead with { email, persona, draftSnapshot } → receive resume_token
3. **Share**: Widget emits onShareSummary → email prompt → POST /api/share → confirmation

## Development
- Run `npm run dev` to start the development server on port 5000
- Frontend binds to `0.0.0.0:5000`
- next.config.ts uses wildcard `*.replit.dev` and `*.repl.co` for allowedDevOrigins
- tsconfig.json excludes `fractpath-calculator-widget-src` and `fractpath-marketing` directories

## Rebuilding Widget Tarball
If the upstream widget changes, rebuild the tarball:
1. `cd fractpath-calculator-widget-src && npm install && npm run build`
2. Edit `fractpath-calculator-widget-src/package.json` to remove any `workspace:*` dependencies
3. `npm pack` to produce new tarball
4. Copy tarball to workspace root: `cp fractpath-calculator-widget-0.0.0.tgz ../`
5. `cd .. && npm install` to reinstall
6. Update `src/types/fractpath-calculator-widget.d.ts` if the widget API changed

## Environment Variables
- `FRACTPATH_APP_URL` — Base URL for the FractPath app (default: https://app.fractpath.com)
- `HUBSPOT_ACCESS_TOKEN` — (Secret) For lead CRM upsert (non-blocking side effect)
- `HUBSPOT_ENABLED` — Set to "true" to enable HubSpot upsert
- `MARKETING_SHARE_EMAIL_ENABLED` — Set to "true" to enable SES email sharing
- `SES_FROM`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — SES email configuration

## User Preferences
- Conservative, trustworthy tone (not salesy)
- Investor-presentable quality
- Clear disclaimers: "scenario modeling," "estimates," "not financial advice"
- No calculator math in marketing repo

## Recent Changes
- 2026-02-13: Aligned type declarations with real widget API, added persona selector (Homeowner/Buyer/Realtor), wired onDraftSnapshot for Save & Continue flow, updated /api/lead to accept { email, persona, draftSnapshot }, enhanced analytics with persona_selected/lead_email_submitted events, fixed next.config allowedDevOrigins, excluded stale subdirs from tsconfig
- 2026-02-09: Sprint 5 — Embedded widget, email gate, /api/lead, /api/share, analytics
- 2026-02-06: MKT-A — Migration docs declaring widget as calculator source of truth
- 2026-02-06: MKT-003 — Persona content system
- 2026-02-06: MKT-002 — shadcn/ui design system and layout primitives
- 2026-02-05: MKT-001 — Initial setup
