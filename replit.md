# FractPath Marketing Site

## Overview
Marketing homepage for fractpath.com — an investor-presentable site for the FractPath fractional equity access platform. Built with Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Recent Changes
- 2026-02-06: Initial project scaffolding and homepage shell setup from GitHub import

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **Fonts**: Geist Sans / Geist Mono (via next/font)

### Directory Structure
```
src/
  app/
    layout.tsx        - Root layout with fonts, metadata, toaster
    page.tsx          - Homepage with all marketing sections
    globals.css       - Tailwind + shadcn CSS variables
  components/
    ui/               - shadcn/ui components (button, card, tabs, etc.)
    ui-kit/           - FractPath layout primitives
      container.tsx   - Max-width centered container
      section.tsx     - Standard section with vertical padding
      page-header.tsx - Eyebrow + title + subtitle header
      stat-card.tsx   - Metric card (label/value/subtext)
      feature-card.tsx - Icon/title/body feature card
      top-nav.tsx     - Sticky top navigation
      footer.tsx      - Footer with links and disclaimers
  lib/
    utils.ts          - cn() utility for class merging
public/
  brand/              - SVG logo and icon assets
docs/
  marketing-homepage-spec.md  - Frozen marketing spec
  tickets/                     - Feature tickets (MKT-001 through MKT-020+)
```

### Homepage Sections (anchor IDs)
- `#top` — Logo + nav
- `#calculator` — Calculator placeholder
- `#how-it-works` — 3-step process
- `#faq` — Common questions
- `#realtor-beta` — Beta signup CTA
- Footer — Contact, legal, disclaimers

### Development
```bash
npm run dev     # Start dev server on port 5000
npm run build   # Production build
npm run start   # Production server
```

### Key Configuration
- **Port**: 5000 (configured in package.json dev script)
- **Host**: 0.0.0.0 for Replit compatibility
- **Allowed Dev Origins**: Configured in next.config.ts for Replit proxy

## User Preferences
- Conservative, trustworthy tone (not salesy)
- Investor-presentable quality
- Clear disclaimers: "scenario modeling," "estimates," "not financial advice"
