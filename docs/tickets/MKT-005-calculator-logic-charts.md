**Status: MOVED → fractpath-calculator-widget (WGT-010 + WGT-011)**

---

TICKET MKT-005 — Calculator logic + charts (persona-tailored)
Ticket ID

MKT-005

Title

Calculator logic engine + real visualizations (persona-tailored outputs)

## Notes

This ticket has been fully moved to the `fractpath-calculator-widget` repository.

- **WGT-010** covers the deterministic math engine (`computeScenario`, equity vesting schedule, settlement scenarios, floor/cap/TF logic).
- **WGT-011** covers chart series generation and Recharts visualization.
- **Source of truth:** Marketing must not contain calculator math. Widget is canonical. See `docs/migration/calculator-widget.md`.

---

Objective

Implement the deterministic FractPath scenario math and produce compelling, persona-specific outputs and a data visualization that clearly communicates the value proposition.

This ticket upgrades the calculator from "UI shell" to a credible scenario model:

computes equity vesting over time (upfront + installments)

models standard/early/late settlement events

applies timing factor TF to payout (NOT FMV)

applies floor and ceiling bounds

outputs: buyer/homeowner/realtor-focused summaries

chart: equity ownership over time + exit summary

Non-goals

No HubSpot submission (MKT-006)

No address/AVM lookups

No contract execution logic

No saving scenarios to DB (portal feature)

Preconditions

MKT-001..004 complete

Calculator UI exists and gates results behind email

buildLeadPayload() exists (currently placeholder outputs)

Recharts installed (preferred; if not installed, install it now)

Persona toggle implemented and passed into calculator

Implementation Requirements
A) Input formatting (display) vs stored values (critical)

Add numeric formatting so inputs display currency formatting but are stored as numbers.

Create helper:
src/lib/format.ts

Required functions:

formatCurrency(n: number): string → "$650,000"

parseCurrency(input: string): number → 650000 (strip $, commas, spaces)

formatPercent(n: number): string (optional)

Rules:

state should store numeric values (e.g., 650000)

input field can display formatted string

on blur, reformat display

on change, parse permissively (user can type $, commas)

do not break typing experience (avoid constantly jumping cursor)

Acceptance: the payload sent later uses raw numbers.

B) Core calculator engine file (single source of truth)

Create:
src/lib/calc.ts

Export:

computeScenario(inputs: ScenarioInputs): ScenarioOutputs

buildChartSeries(inputs, outputs): ChartSeries

Define types in:
src/lib/types.ts

ScenarioInputs (MVP)

Include these fields (all numeric values stored as numbers):

persona (homeowner|buyer|realtor)

SV (property value)

g (annual appreciation, default 0.035)

I_upfront

I_monthly

N_months (computed from horizon years: years*12)

Y_horizon (years)

TF_early (default 0.85 unless spec says otherwise)

TF_late (default 1.15)

FM (floor multiplier default 1.0–1.1; pick safe MVP default 1.05 if unspecified)

CM (ceiling multiplier default 2.5–3.0; pick safe MVP default 3.0 if unspecified)

CPW_start and CPW_end (defaults; if not specified, use start=3 end=10 like prior discussion)

Realtor optional:

reReferralFlat

reSharePlatform

reShareServicing

reShareExit

Fee assumptions (for modeling only; conservative):

platformFee (default 0 for marketing MVP unless you want set)

servicingFeeMonthly (default 0)

exitFeePct (default 0)

Note: If you haven't chosen defaults for TF/FM/CM/CPW, implement sensible placeholders and make them easy to change later (constants at top).

C) Time series schedule (equity vesting)

For month t from 1..(Y_horizon*12):

value_t = SV * (1+g)^(t/12)

Upfront equity (at t=0):

eq_upfront = I_upfront / SV (if I_upfront > 0)

Monthly equity at time t:

eq_t = payment_t / value_t

where payment_t = I_monthly for t <= N_months, else 0

Cumulative:

cum_paid_t = I_upfront + sum(payment_1..payment_t)

cum_equity_t = eq_upfront + sum(eq_1..eq_t)

Store arrays for chart.

D) Settlement scenarios (standard / early / late)

Define 3 settlement event years:

Standard: Y_std = Y_horizon

Early: Y_early = max(1, Y_horizon - 2)

Late: Y_late = Y_horizon + 2 (cap series at 240 months for chart; for late, compute via formula directly)

Convert year → month index:

m = round(year*12) capped at 240

For each scenario:

FMV_settlement = SV * (1+g)^(year)

Compute:

VestedEquity_total = cum_equity_at_m (equity share owned by buyer/utilizer)

IBA_paid_to_date = cum_paid_at_m (total capital contributed by buyer/utilizer to date)

Timing factor TF logic (must not change FMV)

Compute:

if year < CPW_start → TF = TF_early

else if year > CPW_end → TF = TF_late

else TF = 1

Uncapped payout (Total Value model)

UIA_uncapped = FMV_settlement * VestedEquity_total

Apply timing repricing to payout amount:
payout_pre_bounds = UIA_uncapped * TF

Floor and cap:

floor_amt = IBA_paid_to_date * FM

cap_amt = IBA_paid_to_date * CM

ISA_settlement = min(max(payout_pre_bounds, floor_amt), cap_amt)

ISA stands for: Investor Settlement Amount (i.e., buyer/utilizer receives this at settlement).

E) Persona-tailored outputs (must be compelling)

Outputs should be computed for each scenario: standard/early/late.

Buyer persona outputs

Earned equity % at horizon

"Implied purchase price" concept:

Buyer's implied purchase price per 1% equity at settlement:

implied_price_per_pct = IBA_paid_to_date / (VestedEquity_total*100)

Or show: "Paid X to control Y% of a home worth Z"

Settlement payout (ISA) and gain above capital:

gain_above_capital = ISA_settlement - IBA_paid_to_date (clamp min 0 optional)

Annualized ROI (approx) (optional simple):

roi_simple = (ISA / IBA)^(1/years)-1 (only if IBA>0)

Homeowner persona outputs

Homeowner perspective should show "what you keep" and liquidity.

Add:

Cash received to date: IBA_paid_to_date (buyer paid in)

Equity retained at settlement: 1 - VestedEquity_total

Net proceeds framing (simplified, no senior debt modeling):

homeowner_net_sale_proceeds = FMV_settlement*(1 - VestedEquity_total) - closing_costs_placeholder

If you don't want closing costs yet, show it as "before closing costs"

Buyback incentive clarity:

Show early vs standard vs late settlement cost difference:

ISA_early, ISA_std, ISA_late

Realtor persona outputs

For MVP, model an illustrative schedule:

Realtor total = flat referral + shares of fees (platform/servicing/exit)
Since platform fees may be 0 right now on marketing, still show:

flat referral (input)

projected total commissions (if exit fee pct used)
Keep it conservative and clearly labeled "example schedule".

F) Visualization requirements (must exist)

Use Recharts.

Primary chart (required): equity ownership over time
Choose one:

stacked area chart:

Buyer equity %

Homeowner remaining equity %
OR

line chart:

buyer equity %

optional home value line on secondary axis

Given your earlier direction, implement stacked area (cleaner story) unless already chosen otherwise.

Secondary summary (required): scenario cards for Standard/Early/Late
Each shows:

Year

FMV

Buyer payout (ISA)

Buyer equity %

Homeowner retained equity %

G) Update lead payload outputs (replace placeholders)

Update buildLeadPayload() usage so it includes real values:

scenario_inputs_json should include raw numeric inputs

scenario_outputs_json should include:

per scenario: vestedEquity, IBA, FMV, TF, ISA, gain

persona hero metric values

deal_summary_text should be a short sentence per persona:

buyer: "Paid $X to earn ~Y% equity; projected payout $Z at year N."

homeowner: "Received $X; retained ~R% equity; projected buyback $Z at year N."

realtor: "Projected commission ~$C across referral + schedule."

No claims of guaranteed outcomes.

Acceptance Criteria (Definition of Done)

Calculator outputs change live with inputs

Standard/Early/Late scenarios computed correctly and differ appropriately because:

FMV changes with time

TF changes payout (not FMV)

floor/cap bind when applicable

Chart renders and updates live

All outputs are persona-tailored (different hero metric + relevant cards)

Lead payload builder now includes computed outputs (not placeholders)

Works in dark mode and light mode

Build passes locally and on Vercel

No console errors

QA Checklist

 If monthly=0 and upfront>0, still works

 If upfront=0 and monthly>0, still works

 If both=0, show warning and outputs remain neutral/zero

 Currency formatting doesn't corrupt stored values

 Equity % never exceeds 100% (clamp if necessary)

 WCAG: text remains readable in both modes; cyan used as accent not body text

Deliverables

src/lib/calc.ts + src/lib/types.ts + src/lib/format.ts

Calculator wired to real outputs and chart

Updated payload builder usage with computed outputs

Updated UI labels to match persona content map
