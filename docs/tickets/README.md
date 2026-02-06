# FractPath Marketing — Ticket Index

## Calculator Source of Truth: Widget Repo

The `fractpath-calculator-widget` repository is the single source of truth for all calculator functionality, including deterministic scenario math, chart series generation, calculator UI components, and gating behavior. The marketing repo must not contain calculator math.

See [docs/migration/calculator-widget.md](../migration/calculator-widget.md) for the full boundary definition, ticket mapping (MKT → WGT), and future integration plan.

## Ticket Status Overview

| Ticket | Title | Status |
|--------|-------|--------|
| MKT-001 | Repo + deployment shape | Done |
| MKT-002 | Design system + layout | Done |
| MKT-003 | Persona content system | Done |
| MKT-004 | Calculator UI + gating | **SPLIT** → WGT-030/WGT-031 + marketing wrapper |
| MKT-005 | Calculator logic + charts | **MOVED** → WGT-010 + WGT-011 |
| MKT-006 | HubSpot API route + lead payload | **SPLIT** → WGT-031 + marketing `/api/lead` |
| MKT-007 | Investor-ready polish pass | Pending |
| MKT-008 | Realtor beta funnel | Pending |
| MKT-009 | FAQ + objection handling | Pending |
| MKT-010 | SEO metadata + social | Pending |
| MKT-011 | Analytics + conversion tracking | **SPLIT** → widget emits events; marketing logs |
| MKT-012 | Investor share mode | **MOVED** → WGT-020 |
