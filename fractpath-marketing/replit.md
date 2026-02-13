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
      /lead/route.ts   - POST /api/lead — email gate → draft token mint → redirect
      /share/route.ts  - POST /api/share — forward ShareSummary for email send
  /components
    /ui                - shadcn/ui components (Button, Card, Input, Dialog, etc.)
    /ui-kit            - Custom layout primitives (Container, Section, TopNav, etc.)
    calculator-embed.tsx - Widget embed wrapper with email gate + error boundary
  /lib
    utils.ts           - cn() utility for class merging
    analytics.ts       - Analytics event tracking wrapper (Plausible-compatible)
  /types
    fractpath-calculator-widget.d.ts - Local type declarations for widget contract
/public
  /brand               - Logo assets (SVG)
/docs
  /migration           - Widget migration boundary docs
  /tickets             - Feature tickets
```

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Widget**: fractpath-calculator-widget (GitHub dependency, built via postinstall)

## Widget Integration
- Widget package: `fractpath-calculator-widget` from GitHub branch `sprint-5-widget-exec`
- Widget is built during postinstall (vite lib build produces dist/index.js)
- Marketing does NOT contain calculator math — widget is canonical source of truth
- Widget provides: FractPathCalculatorWidget component, DraftSnapshot, ShareSummary types
- Marketing provides: email gate UI, /api/lead route, /api/share route, analytics wiring

## API Routes
- **POST /api/lead**: Receives email + DraftSnapshot, forwards to app for draft token minting, HubSpot upsert as non-blocking side effect, returns { ok, token, resumeUrl }
- **POST /api/share**: Receives email + ShareSummary, forwards to app for branded email send

## Key Flows
1. **Save & Continue**: Widget emits onDraftSnapshot → email gate UI → POST /api/lead → receive token → redirect to app /resume?token=...
2. **Share**: Widget emits onShareSummary → email prompt → POST /api/share → confirmation

## Development
- Run `npm run dev` to start the development server on port 5000
- Frontend binds to `0.0.0.0:5000`
- Widget auto-builds during `npm install` (postinstall script)

## Environment Variables
- `FRACTPATH_APP_URL` — Base URL for the FractPath app (default: https://app.fractpath.com)
- `HUBSPOT_ACCESS_TOKEN` — (Secret) For lead CRM upsert (non-blocking side effect)

## User Preferences
- Conservative, trustworthy tone (not salesy)
- Investor-presentable quality
- Clear disclaimers: "scenario modeling," "estimates," "not financial advice"
- No calculator math in marketing repo

## Recent Changes
- 2026-02-09: Sprint 5 — Embedded widget, email gate, /api/lead, /api/share, analytics
- 2026-02-06: MKT-A — Migration docs declaring widget as calculator source of truth
- 2026-02-06: MKT-003 — Persona content system
- 2026-02-06: MKT-002 — shadcn/ui design system and layout primitives
- 2026-02-05: MKT-001 — Initial setup
