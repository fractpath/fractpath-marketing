# FractPath Marketing Homepage Spec (Frozen)

## Objective
Create an investor-presentable marketing homepage for fractpath.com that:
1) explains FractPath clearly for 3 personas (Homeowner, Buyer, Realtor)
2) provides a persona-based calculator that outputs a compelling visualization
3) captures email leads and sends a structured "deal summary" to HubSpot
4) requires minimal manual edits; all UI is code-generated

## Visual Style (must follow)
- Use shadcn/ui components, Tailwind, clean minimal style
- Typography: modern sans (default), strong hierarchy (H1/H2/Body/Caption)
- Spacing: generous whitespace, 2xl rounded corners, subtle shadows
- Tone: friendly, confident, not salesy, evidence-first

## IA / Sections (Homepage)
1) Top nav: Logo, How it works, FAQ, Realtor beta, Sign in
2) Hero:
   - Headline: debt-free equity access + path to ownership
   - Subhead: “scenario modeling” disclaimers
   - Primary CTA: "See your options"
   - Secondary CTA: "Join beta"
3) Persona toggle (Homeowner | Buyer | Realtor) - changes copy + outputs emphasis
4) Calculator card:
   Inputs (shared):
     - Property value (number)
     - Upfront contribution (optional)
     - Monthly contribution (optional)
     - Time horizon (years slider)
     - Appreciation rate (default 3.5%, optional advanced toggle)
   Persona-specific optional input:
     - Homeowner: desired cash-out amount
     - Buyer: target ownership % (optional)
     - Realtor: referral flat fee (optional) and share % (optional)
   Outputs (must be persona tailored):
     - Homeowner: cash received, equity retained, buyback window effect
     - Buyer: earned equity over time, implied purchase price, payoff/buyback scenarios
     - Realtor: projected commissions over time (simple schedule)
   Visualization (must exist):
     - A simple chart: stacked area or line(s) showing equity ownership over time
     - A simple bar/summary at "exit year": buyer payout, homeowner net, fees
5) Value Prop blocks (3 cards):
   - Each persona has Jobs/Pains/Gains bullets
6) How it works (3 steps):
   - Model -> Match -> Execute (manual-first ops)
7) Trust & compliance:
   - clear disclaimers, auditability, manual-first operations
8) Footer:
   - contact/support
   - legal disclaimers
   - privacy policy placeholder

## Lead Capture Requirements
- Results are partially blurred until email entered
- On email submit:
  - call /api/lead (Next.js route)
  - send to HubSpot with properties:
    - email
    - persona
    - scenario_inputs_json (string)
    - scenario_outputs_json (string)
    - deal_summary_text (short)
    - source = "homepage_calculator"
- After submit:
  - show full outputs
  - show CTA: “Create secure profile” -> app.fractpath.com/signup

## Calculator Logic Requirements (MVP)
- Must be deterministic and simple (no ML)
- Use contributions to compute vested equity:
  - upfront equity = upfront / SV
  - monthly equity each month = monthly / value_t
  - value_t = SV*(1+g)^(t/12)
- Exit scenarios (3):
  - standard exit at horizon year
  - early exit at max(1, horizon-2)
  - late exit at horizon+2
- Apply timing factor TF to payout amount (NOT FMV):
  - TF_early < 1
  - TF_late > 1
- Apply floor/cap:
  - Floor = IBA_paid_to_date * FM
  - Cap = IBA_paid_to_date * CM

## Non-goals (do not build)
- full contract execution
- messaging
- payments
- SMS verification
- investor flows

## Success Criteria
- homepage looks “investor-ready”
- calculator works and feels compelling
- hubspot receives correct deal summary
- no manual Webflow edits required
