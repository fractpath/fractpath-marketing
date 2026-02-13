TICKET MKT-010 — SEO, metadata, and social sharing polish
Ticket ID

MKT-010

Title

SEO + page metadata + social sharing previews

Objective

Ensure the FractPath marketing site is credible, discoverable, and shareable when sent to:

investors

realtors

partners

early beta users

This ticket adds metadata, SEO basics, and social previews without turning this into an SEO-heavy project or creating content debt.

Non-goals

No keyword-heavy SEO strategy

No blog

No backlink strategy

No analytics dashboards

No paid ads setup

Preconditions

MKT-001 → MKT-009 complete

Homepage copy and structure are stable

Brand assets exist in public/brand/

Dark/light mode implemented

Implementation Requirements
A) Global metadata (Next.js App Router)

Update:

src/app/layout.tsx

Add a metadata export with:

Required fields

title

description

openGraph

twitter

icons

Guidance (copy direction, not final copy):

Title:
“FractPath — Fractional home equity, without a loan”

Description:
“Model and structure fractional home equity agreements between homeowners, buyers, and realtors. No refinancing. No monthly loan payments.”

Avoid:

“Invest”

“Returns”

“Guaranteed”

“Yield”

B) Open Graph (social sharing)

Configure Open Graph metadata so links shared in Slack, iMessage, LinkedIn, etc. look professional.

Required OG fields:

og:title

og:description

og:type = website

og:url = https://fractpath.com

og:image

OG image requirements:

Size: 1200 × 630

Background: neutral grayscale

Accent: cyan

Content:

FractPath logo

Short headline (e.g., “Fractional home equity. On your terms.”)

File location:

public/og/og-image.png


This can be a simple static image — no dynamic generation required.

C) Twitter/X card metadata

Add:

twitter:card = summary_large_image

twitter:title

twitter:description

twitter:image

Use the same image as OG unless you have a reason not to.

D) Basic SEO hygiene

Add the following (lightweight):

Semantic structure

One <h1> per page (hero headline)

<h2> for major sections

Avoid skipping heading levels

Alt text

Logo images have meaningful alt text

Decorative icons can have empty alt (alt="")

Canonical URL

Set canonical to https://fractpath.com

Robots

Add robots.txt allowing indexing

No need for sitemap yet

E) Favicon + app icons

Add:

Favicon (32×32 or SVG)

Apple touch icon

Place under:

public/favicon.ico
public/apple-touch-icon.png


Reference them in metadata.

F) Contact section anchor (tie-in from MKT-009)

Ensure there is a Contact section with:

clear anchor ID (e.g., #contact)

short copy:

“Questions about FractPath or the beta?”

CTA:

“Contact FractPath”

scrolls or mailto (implementation already chosen)

This supports:

FAQ support CTA

investor follow-up

realtor outreach

Acceptance Criteria (Definition of Done)

Page renders correct title and description in browser tab

Social link preview renders correctly (OG image + text)

Lighthouse shows no major SEO errors

Only one H1 on page

Alt text present for logos

Canonical URL present

No build errors on Vercel

QA Checklist

 Share link in Slack or iMessage → preview looks professional

 Share link in LinkedIn → OG image visible

 Dark mode doesn’t affect OG image readability

 No marketing claims violate earlier constraints

Deliverables

Updated layout.tsx metadata

OG image asset in public/og/

Favicon + touch icon added

Contact section anchor verified
