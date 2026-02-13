TICKET MKT-001 — Repo + deployment shape
Ticket ID

MKT-001

Title

Repo + deployment shape for FractPath marketing site

Objective

Create the initial Next.js marketing site repo structure for fractpath.com, wired for Vercel deployment, with shadcn/ui-ready Tailwind setup, and a homepage shell that matches the frozen spec structure (placeholders acceptable). No calculator logic yet.

This ticket should produce a deployable baseline that future tickets can safely build on without restructuring.

Non-goals

No HubSpot integration

No calculator logic

No persona content system

No auth

No portal routes

No claims about returns/investment performance beyond disclaimers

Preconditions

Repo exists: fractpath/fractpath-marketing

Frozen spec exists at: docs/marketing-homepage-spec.md

You have access to a Vercel account that can connect to this repo

Domain fractpath.com exists (DNS changes can happen later)

Implementation Requirements
A) Repository structure (must match)

Create these top-level paths:

/docs
  marketing-homepage-spec.md   (already exists)
/src
  /app
    layout.tsx
    page.tsx
    globals.css
  /components
    (empty for now or placeholder)
/public
README.md
.gitignore
.env.example

B) Next.js scaffold

Next.js App Router

TypeScript enabled

ESLint enabled

Tailwind CSS enabled

src/ directory enabled

Node version pinned via .nvmrc or engines in package.json (pick one)

C) Environment variable hygiene

Add an .env.example with placeholders (even if unused now):

# Marketing site env vars (MVP placeholders)
HUBSPOT_ACCESS_TOKEN=
NEXT_PUBLIC_SITE_URL=https://fractpath.com


No secrets committed.

D) Homepage shell (placeholder sections only)

Implement a src/app/page.tsx that renders sections corresponding to the spec IA, but content can be placeholder.

Must include visible anchors/sections (IDs) so future tickets can target them:

#top

#calculator

#how-it-works

#faq

#realtor-beta

footer

Homepage must have:

top nav with links to the above sections + “Sign in” (link can be placeholder)

hero section with headline + subhead + two CTAs

persona toggle UI placeholder (static is ok)

calculator card placeholder (empty state ok)

value prop cards placeholder (3)

how it works placeholder (3 steps)

trust & compliance placeholder with disclaimer language

footer placeholder

E) Styling baseline

Tailwind configured and working

Minimal, clean typography hierarchy in place (H1/H2/body/caption)

No custom design flourishes yet; keep it clean

F) Deployment

Ensure repo builds on Vercel with default settings

Provide a vercel.json only if needed (prefer not needed)

Acceptance Criteria (Definition of Done)

npm install and npm run dev works locally

npm run build succeeds with no errors

Vercel deploy succeeds and provides a preview URL

Homepage renders with the required section structure and IDs

No console errors on initial load

Repo includes .env.example and .gitignore

No secrets committed

QA Checklist

 Links in nav scroll to section IDs

 Layout works on mobile (basic stacking is fine)

 Lighthouse not required yet, but page should not be obviously broken

 Disclaimers appear in Trust & Compliance section (basic placeholder language ok)

 No references to “investment returns guaranteed” or similar

Deliverables

PR or commit(s) implementing the scaffold and homepage shell

Vercel preview URL posted in PR description or README

Notes for the agent

Read docs/marketing-homepage-spec.md before coding

Do not invent new features beyond placeholders

Keep language conservative: “scenario modeling,” “estimates,” “not financial advice”

Use semantic HTML and accessible nav patterns
