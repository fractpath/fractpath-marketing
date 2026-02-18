import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const EMBED_PATH = path.resolve("src/components/calculator-embed.tsx");
const EMBED_SRC = fs.readFileSync(EMBED_PATH, "utf-8");

describe("FullDealSnapshotV1 canonical compliance", () => {
  it("always emits contract_version 10.1.0", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain('contract_version: "10.1.0"');
  });

  it("always emits schema_version as string '1'", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain('schema_version: "1"');
  });

  it("always emits engine_version 10.1.0", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain('engine_version: "10.1.0"');
  });

  it("always emits compute_version 10.1.0", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain('compute_version: "10.1.0"');
  });

  it("includes deal_terms in snapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("deal_terms: dealTerms");
  });

  it("includes assumptions (scenario) in snapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("assumptions: scenario");
  });

  it("includes computed_at timestamp in snapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("computed_at:");
  });

  it("includes mode: marketing in snapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain('mode: "marketing"');
  });

  it("builds canonical deal_terms with all required fields from FullDealSnapshotV1", () => {
    expect(EMBED_SRC).toContain("function buildCanonicalDealTerms");
    const fnStart = EMBED_SRC.indexOf("function buildCanonicalDealTerms");
    const fnEnd = EMBED_SRC.indexOf("function buildCanonicalScenario");
    const fn = EMBED_SRC.slice(fnStart, fnEnd);
    expect(fn).toContain("property_value");
    expect(fn).toContain("upfront_payment");
    expect(fn).toContain("floor_multiple");
    expect(fn).toContain("ceiling_multiple");
    expect(fn).toContain("downside_mode");
    expect(fn).toContain("payback_window_start_year");
    expect(fn).toContain("payback_window_end_year");
    expect(fn).toContain("timing_factor_early");
    expect(fn).toContain("timing_factor_late");
    expect(fn).toContain("platform_fee");
    expect(fn).toContain("servicing_fee_monthly");
    expect(fn).toContain("exit_fee_pct");
    expect(fn).toContain("duration_yield_floor_enabled");
    expect(fn).toContain("contract_maturity_years");
    expect(fn).toContain("liquidity_trigger_year");
    expect(fn).toContain("minimum_hold_years");
  });

  it("builds canonical scenario with annual_appreciation, closing_cost_pct, exit_year", () => {
    expect(EMBED_SRC).toContain("function buildCanonicalScenario");
    const fnStart = EMBED_SRC.indexOf("function buildCanonicalScenario");
    const fnEnd = EMBED_SRC.indexOf("function buildCanonicalInputs");
    const fn = EMBED_SRC.slice(fnStart, fnEnd);
    expect(fn).toContain("annual_appreciation");
    expect(fn).toContain("closing_cost_pct");
    expect(fn).toContain("exit_year");
  });

  it("never emits legacy DraftSnapshot shape without canonical fields", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 800);
    expect(block).toContain("deal_terms");
    expect(block).toContain("assumptions");
    expect(block).toContain("inputs");
    expect(block).toContain("basic_results");
  });
});

describe("Save & Continue — snapshot injection", () => {
  it("injects email into draftSnapshot object", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("email");
  });

  it("injects persona into draftSnapshot object", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("persona");
  });

  it("injects created_at with fallback into draftSnapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toContain("created_at");
    expect(EMBED_SRC).toContain("new Date().toISOString()");
  });

  it("provides inputs using buildCanonicalInputs", () => {
    expect(EMBED_SRC).toContain("buildCanonicalInputs");
    expect(EMBED_SRC).toContain("deal_terms");
  });

  it("provides basic_results using buildBasicResults", () => {
    expect(EMBED_SRC).toContain("buildBasicResults");
    const fnStart = EMBED_SRC.indexOf("function buildBasicResults");
    const fnEnd = EMBED_SRC.indexOf("export type CalculatorEmbedProps");
    const fn = EMBED_SRC.slice(fnStart, fnEnd);
    expect(fn).toContain("basic_results");
    expect(fn).toContain("return {}");
  });

  it("sends draftSnapshot inside POST body (not just top-level fields)", () => {
    const fetchSection = EMBED_SRC.slice(
      EMBED_SRC.indexOf('fetch("/api/lead"'),
      EMBED_SRC.indexOf("const data = await res.json()"),
    );
    expect(fetchSection).toContain("draftSnapshot: draftSnapshotForLead");
    expect(fetchSection).toContain("email");
    expect(fetchSection).toContain("persona");
  });
});

describe("Save & Continue — modal overlay", () => {
  it("uses Dialog component for save gate", () => {
    expect(EMBED_SRC).toContain("Dialog");
    expect(EMBED_SRC).toContain("DialogContent");
    expect(EMBED_SRC).toContain("isSaveModalOpen");
  });

  it("uses Dialog component for share gate", () => {
    expect(EMBED_SRC).toContain("isShareModalOpen");
  });

  it("modal closes on cancel via closeModal", () => {
    expect(EMBED_SRC).toContain("closeModal");
    expect(EMBED_SRC).toContain('step: "idle"');
  });

  it("modal closes on overlay click via onOpenChange", () => {
    expect(EMBED_SRC).toContain("onOpenChange");
  });

  it("auto-focuses email input when modal opens", () => {
    expect(EMBED_SRC).toContain("emailRef");
    expect(EMBED_SRC).toContain("autoFocus");
  });

  it("does NOT render floor/ceiling inputs in modal", () => {
    expect(EMBED_SRC).not.toContain("gate-floor");
    expect(EMBED_SRC).not.toContain("gate-ceiling");
    expect(EMBED_SRC).not.toContain("Floor multiple");
    expect(EMBED_SRC).not.toContain("Ceiling multiple");
  });

  it("does NOT have user-editable floorMultiple/ceilingMultiple state", () => {
    expect(EMBED_SRC).not.toContain("setFloorMultiple");
    expect(EMBED_SRC).not.toContain("setCeilingMultiple");
  });

  it("modal only collects email (role via persona tabs)", () => {
    const saveFormStart = EMBED_SRC.indexOf('id="gate-email"');
    expect(saveFormStart).toBeGreaterThan(-1);
    const saveFormSlice = EMBED_SRC.slice(saveFormStart - 200, saveFormStart + 500);
    expect(saveFormSlice).toContain('type="email"');
    expect(saveFormSlice).not.toContain('inputMode="decimal"');
  });
});

describe("Save & Continue — event tracking preserved", () => {
  it("tracks save_continue_clicked via widget onEvent", () => {
    expect(EMBED_SRC).toContain("trackEvent");
    expect(EMBED_SRC).toContain("onEvent");
  });

  it("tracks lead_email_submitted on save submit", () => {
    expect(EMBED_SRC).toContain("trackLeadEmailSubmitted");
  });

  it("tracks persona_selected on persona change", () => {
    expect(EMBED_SRC).toContain("trackPersonaSelected");
  });

  it("tracks share_clicked on share submit", () => {
    expect(EMBED_SRC).toContain('trackCustomEvent("share_clicked"');
  });
});

describe("Save & Continue — resume navigation", () => {
  it("navigates to resume URL on success", () => {
    expect(EMBED_SRC).toContain("window.location.assign(continueUrl)");
  });

  it("constructs resume URL from appBase + token", () => {
    expect(EMBED_SRC).toContain("appBase");
    expect(EMBED_SRC).toContain("/resume?token=");
  });

  it("handles both resume_token and token response fields", () => {
    expect(EMBED_SRC).toContain("data.resume_token || data.token");
  });
});

describe("Floor/ceiling defaults (not user-collected)", () => {
  it("uses DEAL_TERMS_DEFAULTS for floor_multiple", () => {
    expect(EMBED_SRC).toContain("DEAL_TERMS_DEFAULTS.floor_multiple");
  });

  it("uses DEAL_TERMS_DEFAULTS for ceiling_multiple", () => {
    expect(EMBED_SRC).toContain("DEAL_TERMS_DEFAULTS.ceiling_multiple");
  });

  it("does not pass user-entered floor/ceiling overrides to mapWidgetInputsToCanonical", () => {
    const callIdx = EMBED_SRC.indexOf("mapWidgetInputsToCanonical(");
    const callBlock = EMBED_SRC.slice(callIdx, callIdx + 300);
    expect(callBlock).not.toContain("{ floor_multiple: floor");
    expect(callBlock).not.toContain("ceiling_multiple: ceiling");
  });
});
