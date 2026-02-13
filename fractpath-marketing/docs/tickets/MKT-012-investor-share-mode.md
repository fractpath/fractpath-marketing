# TICKET MKT-012 — Investor "Read-Only" Share Mode (No Email Gate)
Ticket ID: MKT-012  
Status: MOVED → fractpath-calculator-widget (WGT-020)  
Owner Repo: fractpath-calculator-widget  
Last Updated: 2026-02-11  

---

## Purpose (Marketing Scope Only)

This ticket is closed in `fractpath-marketing` and serves as a scope guardrail.

All share-mode gating logic, UI state handling, and output rendering behavior live inside the calculator repo:

- **WGT-020** — Share mode semantics (mode=share)
- **WGT-030 / WGT-031** — Widget surface + gating behavior
- **WGT-INT-001** — Locked public interface

Marketing is responsible only for:

- forwarding query params to the widget
- page-level layout polish
- analytics wiring (if applicable)

Marketing must not contain:
- calculator math
- role logic
- snapshot persistence logic
- share token minting

---

# Architecture Alignment (Frozen)

## Canonical Compute
All scenario math is implemented in the calculator repo.  
Marketing renders widget outputs only.

## Share Model (Aligned with Sprint 8 Hardening)

This ticket does NOT modify application share-token semantics.

- Only OWNER may mint share tokens (app concern).
- Any user may distribute an existing share token URL (app concern).
- `?mode=share` in marketing is a **presentation mode**, not an access-control mechanism.

Important:
`?mode=share` is not related to `app.fractpath.com/share?t=token`.  
It is purely a marketing embed configuration flag.

---

# Objective (Marketing Perspective)

Enable a frictionless “Investor Share Mode” in marketing that:

- Displays calculator outputs immediately
- Bypasses email gating
- Maintains compliance posture
- Does not create DB state
- Does not mint share tokens
- Does not persist snapshots

This is a credibility-first presentation mode.

---

# Implementation Requirements (Marketing Scope Only)

## A) URL Parameter Forwarding

Marketing must:

- Detect `?mode=share`
- Forward `mode="share"` into the widget embed
- Forward `persona` if present

Examples:

