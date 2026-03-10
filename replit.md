# FractPath Marketing Site

## Overview
The FractPath marketing site is a Next.js application designed to showcase fractional real estate ownership scenario modeling. Its primary purpose is to attract potential users by allowing them to interact with a fractional real estate calculator widget. The site focuses on providing a clear and engaging user experience, driving user acquisition, and acting as a lead generation tool for the main FractPath application. It offers persona-specific content and features to cater to different user segments like homeowners, buyers, and realtors.

## User Preferences
- Conservative, trustworthy tone (not salesy)
- Investor-presentable quality
- Clear disclaimers: "scenario modeling," "estimates," "not financial advice"
- No calculator math in marketing repo
- One step at a time — complete and verify before moving to next
- No invention — all inputs, outputs, labels, events must come from tickets
- Preserve marketing → app snapshot contract

## System Architecture
The site is built with Next.js 16 (App Router) and TypeScript, utilizing Tailwind CSS and shadcn/ui for styling. The core functionality revolves around embedding the `fractpath-calculator-widget` (v1.0.0), which is the canonical source of truth for all calculator logic and calculations.

**Key Features and Design Patterns:**
- **Persona-Based Content System:** `src/content/personas.ts` defines persona-specific copy for homeowners, buyers, and realtors. Static hero, value propositions, and trust sections are server-rendered, while the calculator area (tabs + widget embed) is a client component (`PersonaPageContent`) that updates based on persona selection.
- **Widget Integration:** The `fractpath-calculator-widget` is integrated via git tag. The marketing site provides the UI for persona selection, registration gating, and sharing, while the widget handles the complex calculations and state management.
- **Registration Gate (token-based):** Calculator CTAs (Save & Continue, Share) first mint a server-side draft token via `POST /api/draft`, then open the registration modal with the token's `resumeUrl`. Modal performs real Supabase signup directly (shared auth project with app), then shows "check your email" confirmation. The email confirmation link routes through `${APP}/auth/callback?next=/resume?token=<TOKEN>`, establishing the user's session on the app origin and landing them directly in the restored draft. localStorage is retained as non-authoritative backup only.
- **API Endpoints:**
    - `POST /api/draft`: Mints a draft token from a canonical snapshot without requiring email. Uses remote mint (FRACTPATH_APP_URL/api/draft-tokens/mint) with local PostgreSQL fallback. Returns `{ok, token, resumeUrl}`. No HubSpot upsert.
    - `POST /api/lead`: Handles lead generation by receiving user email, persona, and a draft snapshot. Performs server-to-server minting with the main FractPath app or falls back to a local PostgreSQL store. Integrates with HubSpot for CRM upserts.
    - `POST /api/realtor-interest`: CRM-only lead capture for the realtor beta form. Accepts `{email, name?, brokerage?}`, does HubSpot upsert. Does NOT mint draft tokens or return resumeUrl.
    - `POST /api/share`: Facilitates sharing of calculator summaries via email. It generates a share token and sends a branded email using SES.
- **Analytics:** Plausible-compatible event tracking is implemented for key user interactions such as persona selection, lead submission, and call-to-action clicks.
- **Canonical Input Mapping:** `src/lib/canonicalInputMapper.ts` ensures that widget inputs are mapped to a canonical `v10.1` snake_case format for `deal_terms` and `scenario` before being sent to the backend.
- **UI/UX:** The site uses `shadcn/ui` components and custom `ui-kit` primitives for a consistent and modern design. Modals are used for user registration, saving, and sharing.

## External Dependencies
- **fractpath-calculator-widget:** The core calculator widget, integrated via git tag.
- **Supabase Auth:** Shared auth project with the main app (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Used for direct in-modal signup via `@supabase/supabase-js`. Sessions are NOT persisted on marketing origin — authentication is established on the app domain via the email confirmation callback flow.
- **HubSpot:** Used for CRM integration to upsert lead information (`HUBSPOT_ACCESS_TOKEN`).
- **Amazon SES (Simple Email Service):** Employed for sending branded share emails (`SES_FROM`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
- **FractPath Main Application:** Interacted with via `FRACTPATH_APP_URL` for server-to-server minting of draft tokens and `NEXT_PUBLIC_FRACTPATH_APP_URL` for client-side navigation.
- **Plausible Analytics (implied):** Analytics events are designed to be compatible with Plausible or similar privacy-friendly analytics platforms.
