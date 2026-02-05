TICKET MKT-002 — Minimal design system + layout components
Ticket ID

MKT-002

Title

Minimal design system + layout primitives (shadcn/ui baseline)

Objective

Create a minimal, investor-presentable design system foundation in the marketing repo using shadcn/ui + Tailwind, and implement reusable layout primitives so all future homepage sections are consistent, clean, and easy for agents to extend.

This ticket should significantly improve the visual quality of the site without requiring “designing by hand.”

Non-goals

No calculator logic

No HubSpot integration

No persona-specific copy system (that’s MKT-003)

No advanced animations

No portal/auth features

Preconditions

MKT-001 completed (Next.js app builds, homepage shell exists)

docs/marketing-homepage-spec.md exists and is the authoritative spec

Implementation Requirements
A) Install and configure shadcn/ui

Add shadcn/ui to the repo (standard installation for Next.js App Router + Tailwind). Configure it so components can be added consistently.

Must include:

Tailwind configured correctly

globals.css includes necessary CSS variables for shadcn theme

No broken build on Vercel

B) Add baseline shadcn components (minimum set)

Install/add these components (or their equivalents if naming differs), because upcoming tickets will depend on them:

Button

Input

Label

Card

Tabs

Dialog

DropdownMenu

Separator

Badge

Toast or Sonner (choose one; Sonner is common)

Acceptance dependency: MKT-004 will use Tabs, Card, Input, Button, and Toast/Sonner.

C) Create layout primitives (FractPath UI kit)

Create these reusable components under:

src/components/ui-kit/

Required components:

Container

Standard max width + horizontal padding

Example behavior: centered, max-w, responsive gutters

Section

Standard vertical spacing (top/bottom padding)

Accepts optional id for anchor navigation

PageHeader

Supports eyebrow, title, subtitle

Proper typography hierarchy

StatCard

A small card for key metrics (label + value + subtext)

Used later for persona outputs

FeatureCard

Icon/title/body style card

Used for value prop blocks and “how it works”

TopNav

Uses Container

Links to anchors: calculator/how-it-works/faq/realtor-beta

Includes CTA button linking to https://app.fractpath.com/signup

Footer

Minimal, clean

Includes support/contact placeholder and legal disclaimer links placeholders

D) Typography & spacing rules (must be enforced)

Set consistent typography and spacing by default:

H1: prominent but not huge

H2: clear section headings

Body: comfortable line-height

Caption: lighter tone

Spacing: generous whitespace, avoid cramped sections

Corners: 2xl on cards

Shadows: subtle (avoid heavy)

No elaborate brand design; keep it minimal and trustworthy.

E) Apply primitives to homepage shell

Refactor the existing src/app/page.tsx to use:

TopNav

Section

Container

PageHeader

FeatureCard

Footer

The content can remain placeholder, but the structure should look polished.

Acceptance Criteria (Definition of Done)

Site looks materially more “investor-ready”:

consistent spacing

consistent typography

consistent cards/buttons

Homepage uses the new primitives (not raw div soup)

npm run build succeeds

Vercel deploy succeeds

Top nav anchors work

CTA button in nav links to: https://app.fractpath.com/signup

At least one shadcn component of each required type is actually rendered somewhere (so broken imports are caught early)

QA Checklist

 Mobile: sections stack cleanly; nav doesn’t break

 No console errors

 Buttons, inputs, cards have consistent styling

 No accessibility regressions (basic keyboard nav works)

 No aggressive marketing language (keep neutral tone)

Deliverables

PR/commit adding shadcn/ui and UI kit components

Refactored homepage shell using primitives

Short “How to add a section” note added to docs/tickets/README.md (optional but recommended)

Notes for the agent

Follow docs/marketing-homepage-spec.md for overall IA

Do not add features beyond design system and layout primitives

Keep styling minimal, modern, trustworthy
