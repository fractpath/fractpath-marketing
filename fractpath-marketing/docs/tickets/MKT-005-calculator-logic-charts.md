# TICKET MKT-005 — Calculator logic + charts (persona-tailored)
Ticket ID: MKT-005  
Status: MOVED → fractpath-calculator-widget (WGT-010 + WGT-011)  
Owner Repo: fractpath-calculator-widget  
Last Updated: 2026-02-11

---

## Purpose (Marketing Scope Only)

This ticket is **closed in `fractpath-marketing`** and serves as a pointer + guardrail.

All deterministic calculator math, chart series generation, and persona-tailored outputs are implemented **only** in the calculator repo:

- **WGT-010** — Deterministic compute engine (single source of truth)
- **WGT-011** — Chart series generation + visualization wiring

Marketing must embed the widget through a locked interface and treat all scenario outputs as opaque.

---

## Frozen Architecture Alignment (Authoritative)

### Canonical Compute
- Calculator economics ("math") live in **one compute engine** maintained in `fractpath-calculator-widget`.
- Marketing **must not** implement or duplicate any economic computation.

### Trusted Compute / Snapshot
- For app workflows (Sprint 9+): compute will run server-side in `fractpath-app` using the same compute module, and persist snapshots for e-sign/vendor automation.
- Marketing may render computed outputs but does **not** persist scenario snapshots to the database.

### Share + Access
- Marketing does **not** mint share tokens or modify access grants.
- Share remains an app concern.

---

## Marketing Responsibilities (What remains in fractpath-marketing)

Marketing tickets should only cover:

1) **Widget embed + mode wiring**  
   - Provide persona + input defaults + gating config via the public widget interface
   - No local math or chart computation

2) **Lead capture payload** (MKT-006)  
   - Marketing may submit **inputs + rendered summary** to HubSpot
   - Must not claim outputs are guaranteed outcomes

3) **UI gating semantics** (MKT-004 / MKT-INT-001)  
   - Blur / lock detailed outputs until email captured
   - Treat widget results as opaque payloads

---

## Source Tickets (Do the work there)

- WGT-010 — Calc engine MVP
- WGT-011 — Chart series + visualization
- WGT-040 — Snapshot schema + stability guarantees (must align with Sprint 9 snapshot contract)

---

## Acceptance Criteria (Marketing)

- `fractpath-marketing` contains **no** scenario compute logic (`computeScenario`, schedule math, TF/FM/CM rules).
- Widget is embedded via a locked interface only (see MKT-INT-001 / WGT-INT-001).
- Lead payload (if used) contains:
  - raw numeric inputs
  - persona identifier
  - high-level rendered summary (optional), clearly labeled as illustrative

---

## Notes / Migration Pointer

See:
- `docs/migration/calculator-widget.md` (marketing declares widget as source of truth)
- `MKT-INT-001 — Tight widget embed via locked interface`

