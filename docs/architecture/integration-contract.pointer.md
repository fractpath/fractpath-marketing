# Integration Contract Pointer (Marketing)

Marketing embeds the calculator widget and must not implement calculator math or mutate widget payloads.

## Canonical Contract
- Canonical contract file lives in the widget repo (mirrored from project-level contract per WGT-INT-001).
- Treat the widget repo contract as authoritative for:
  - exported component name
  - props/callbacks
  - DraftSnapshot / ShareSummary schemas

## Widget Dependency
Marketing consumes:
- fractpath-calculator-widget @ github:fractpath/fractpath-calculator-widget#sprint-5-widget-exec

## Governance
- OPS governor: OPS-INT-001 (fractpath-app: tickets/OPS/)
- Marketing guardrails: MKT-INT-001 (this repo: docs/tickets/)
- Widget interface lock: WGT-INT-001 (widget repo: docs/tickets/)

If any mismatch is found, STOP and report; do not guess.
