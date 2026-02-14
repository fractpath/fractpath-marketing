# Agent Guardrails — FractPath Marketing Repo

This document is the **contract** that all Replit agents (and humans acting as agents) must follow.
If there is any conflict between a ticket prompt and these guardrails, **STOP** and ask for clarification.

---

## 1) Repo Contract (What this repo is / is not)

### This repo IS:
- The **marketing website** (Next.js) for lead capture and lightweight user flows.
- Allowed to embed the calculator widget and collect/save/share lead inputs.
- Allowed to pass snapshot payloads to backend endpoints (e.g., `/api/lead`, `/api/share`) and redirect users into the app.

### This repo is NOT:
- The canonical source of truth for financial math.
- The place to author or fork “compute logic”.
- The place to introduce new financial terms/business rules without a compute ticket.

**Canonical compute lives in:** `packages/compute` (or the compute repo once split out).
Marketing may *consume* compute outputs/types/defaults, but may not change compute logic unless explicitly authorized.

---

## 2) Ticket Types and Allowed Change Surface

### A) Marketing-only tickets (default)
**Allowed paths:**
- `src/**`
- `docs/**` (documentation only)
- `public/**`

**Forbidden unless explicitly allowed by the ticket:**
- `packages/compute/**`
- `next.config.*` / `next.config.mjs` / `next.config.ts`
- `tsconfig*.json`
- `package.json` / `package-lock.json`
- `.env*`, deployment configs, CI configs
- Any “workspace wiring” changes (path aliases, transpilePackages changes, monorepo tooling)

### B) Compute-only tickets
**Allowed paths:**
- `packages/compute/**` only

**Forbidden:**
- Anything outside `packages/compute/**`

### C) Multi-surface tickets (rare; must be explicit)
If a ticket truly requires touching both marketing and compute:
- The ticket must say so explicitly.
- Work must be split into **two commits** (or two PRs) at minimum:
  - one compute-only
  - one marketing-only
- Each commit must pass its own tests.

---

## 3) Hard “No Drift” Rules

Unless the ticket explicitly authorizes it, do NOT:
1. Change Next.js config, Turbopack config, or build tooling.
2. Add new path aliases or tsconfig changes.
3. Change dependency versions, add dependencies, or edit lockfiles.
4. Introduce workarounds that alter architecture (bridge modules, dist imports, etc.) without explicit approval.
5. Modify the compute engine’s math, defaults, or contract during marketing tickets.

If you believe any of the above is required, STOP and ask.

---

## 4) Mandatory Proof of Compliance (must be included in every agent completion message)

Every agent must end with:

### Proof: Changed files
- `git diff --name-only`
- `git diff --stat`

### Proof: Contract check
- Marketing-only ticket: assert **NO** changes under `packages/compute/**`
- Compute-only ticket: assert **ONLY** changes under `packages/compute/**`

### Proof: Build/Test
- Marketing: `npm run build` (or `npm run lint` if required by ticket)
- Compute: `npm test && npm run typecheck && npm run build`

If any proof step fails, STOP and report failure.

---

## 5) Stop Conditions (when the agent must stop and ask)

STOP and ask for explicit direction if:
- You need to touch a forbidden file/path.
- You encounter a Next.js/Turbopack module resolution issue that suggests config changes.
- You need to alter the compute contract to make marketing compile.
- You need to change data contracts between widget ↔ marketing ↔ app.
- You are unsure whether a value should be hardcoded, defaulted, or user-editable.

---

## 6) Output Format Requirement (how agents should respond)

When starting:
- Restate the ticket scope in one sentence.
- List the exact files you intend to modify.

When finishing:
- Provide the Proof of Compliance section (above).
- Provide a short summary of changes.
- Provide explicit follow-ups if any are required (new ticket suggestions only).
