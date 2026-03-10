import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const EMBED_PATH = path.resolve("src/components/calculator-embed.tsx");
const EMBED_SRC = fs.readFileSync(EMBED_PATH, "utf-8");

describe("FullDealSnapshotV1 canonical compliance", () => {
  it("always emits contract_version 10.2.0 in draft payload builder", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    expect(idx).toBeGreaterThan(-1);
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toMatch(/contract_version:\s*(CONTRACT_VERSION|"10\.2\.0")/);
  });

  it("always emits schema_version in draft payload builder", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toMatch(/schema_version:\s*(SCHEMA_VERSION|"1")/);
  });

  it("always emits engine_version in draft payload builder", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toMatch(/engine_version:\s*(ENGINE_VERSION|"10\.2\.0")/);
  });

  it("always emits compute_version in draft payload builder", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 600);
    expect(block).toMatch(/compute_version:\s*(COMPUTE_VERSION|"10\.2\.0")/);
  });

  it("includes deal_terms in draft payload", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 900);
    expect(block).toContain("deal_terms: dealTerms");
  });

  it("includes assumptions (scenario) in draft payload", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 900);
    expect(block).toContain("assumptions: scenario");
  });

  it("includes computed_at timestamp in draft payload", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 900);
    expect(block).toContain("computed_at:");
  });

  it("includes mode: marketing in draft payload", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 900);
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
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    expect(idx).toBeGreaterThan(-1);
    const block = EMBED_SRC.slice(idx, idx + 800);
    expect(block).toContain("deal_terms");
    expect(block).toContain("assumptions");
    expect(block).toContain("inputs");
    expect(block).toContain("basic_results");
  });
});

describe("Save & Continue — token-based draft flow", () => {
  it("calls /api/draft to mint token before opening modal", () => {
    expect(EMBED_SRC).toContain('fetch("/api/draft"');
    const mintIdx = EMBED_SRC.indexOf("const mintDraftToken");
    expect(mintIdx).toBeGreaterThan(-1);
    const block = EMBED_SRC.slice(mintIdx, mintIdx + 500);
    expect(block).toContain("/api/draft");
    expect(block).toContain("draftSnapshot");
    expect(block).toContain("persona");
  });

  it("transitions to minting state before calling /api/draft", () => {
    const handlerIdx = EMBED_SRC.indexOf("const handleDraftSnapshot");
    expect(handlerIdx).toBeGreaterThan(-1);
    const block = EMBED_SRC.slice(handlerIdx, handlerIdx + 1500);
    expect(block).toContain('step: "minting"');
    expect(block).toContain("mintDraftToken");
  });

  it("opens registration_gate with resumeUrl on successful mint", () => {
    const handlerIdx = EMBED_SRC.indexOf("const handleDraftSnapshot");
    const block = EMBED_SRC.slice(handlerIdx, handlerIdx + 1500);
    expect(block).toContain('step: "registration_gate"');
    expect(block).toContain("resumeUrl: result.resumeUrl");
  });

  it("shows mint_error state on token failure", () => {
    const handlerIdx = EMBED_SRC.indexOf("const handleDraftSnapshot");
    const block = EMBED_SRC.slice(handlerIdx, handlerIdx + 1500);
    expect(block).toContain('step: "mint_error"');
    expect(block).toContain("message: result.error");
  });

  it("includes persona in draft payload", () => {
    const idx = EMBED_SRC.indexOf("const buildDraftPayload");
    const block = EMBED_SRC.slice(idx, idx + 900);
    expect(block).toContain("persona");
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

  it("also persists draft to localStorage as backup", () => {
    const handlerIdx = EMBED_SRC.indexOf("const handleDraftSnapshot");
    const block = EMBED_SRC.slice(handlerIdx, handlerIdx + 1500);
    expect(block).toContain("persistDraftToStorage");
  });
});

describe("Share flow — token-based draft flow", () => {
  it("Share handler also mints a draft token", () => {
    const handlerIdx = EMBED_SRC.indexOf("const handleShareSummary");
    expect(handlerIdx).toBeGreaterThan(-1);
    const block = EMBED_SRC.slice(handlerIdx, handlerIdx + 2000);
    expect(block).toContain('step: "minting"');
    expect(block).toContain("mintDraftToken");
    expect(block).toContain('step: "registration_gate"');
    expect(block).toContain("resumeUrl: result.resumeUrl");
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
  it("constructs resume URL from token", () => {
    expect(EMBED_SRC).toContain("/resume?token=");
  });

  it("handles both resume_token and token response fields (legacy save flow)", () => {
    expect(EMBED_SRC).toContain("data.resume_token || data.token");
  });

  it("registration modal receives resumeUrl prop", () => {
    expect(EMBED_SRC).toContain("resumeUrl={");
    expect(EMBED_SRC).toContain("gate.resumeUrl");
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

describe("Registration gate modal — token-based redirect", () => {
  const MODAL_PATH = path.resolve("src/components/registration-gate-modal.tsx");
  const MODAL_SRC = fs.readFileSync(MODAL_PATH, "utf-8");

  it("accepts resumeUrl prop", () => {
    expect(MODAL_SRC).toContain("resumeUrl");
  });

  it("accepts tokenError prop", () => {
    expect(MODAL_SRC).toContain("tokenError");
  });

  it("accepts minting prop", () => {
    expect(MODAL_SRC).toContain("minting");
  });

  it("uses resumeUrl to build returnTo param, not hardcoded /dashboard", () => {
    expect(MODAL_SRC).toContain("returnTo");
    expect(MODAL_SRC).not.toContain('"/dashboard"');
  });

  it("shows flow-specific helper text for share", () => {
    expect(MODAL_SRC).toContain("continue to your draft and share it securely");
  });

  it("shows flow-specific helper text for save", () => {
    expect(MODAL_SRC).toContain("save this scenario and continue in FractPath");
  });

  it("disables submit when resumeUrl is not available", () => {
    expect(MODAL_SRC).toContain("!resumeUrl");
  });
});

describe("Realtor beta form — CRM only", () => {
  const REALTOR_PATH = path.resolve("src/components/realtor-beta-form.tsx");
  const REALTOR_SRC = fs.readFileSync(REALTOR_PATH, "utf-8");

  it("posts to /api/realtor-interest, not /api/lead", () => {
    expect(REALTOR_SRC).toContain("/api/realtor-interest");
    expect(REALTOR_SRC).not.toContain("/api/lead");
  });

  it("does not send draftSnapshot", () => {
    expect(REALTOR_SRC).not.toContain("draftSnapshot");
    expect(REALTOR_SRC).not.toContain("contract_version");
    expect(REALTOR_SRC).not.toContain("schema_version");
  });

  it("sends email, name, brokerage only", () => {
    expect(REALTOR_SRC).toContain("email:");
    expect(REALTOR_SRC).toContain("name:");
    expect(REALTOR_SRC).toContain("brokerage:");
  });
});

describe("/api/draft endpoint", () => {
  const DRAFT_PATH = path.resolve("src/app/api/draft/route.ts");
  const DRAFT_SRC = fs.readFileSync(DRAFT_PATH, "utf-8");

  it("exists and exports POST handler", () => {
    expect(DRAFT_SRC).toContain("export async function POST");
  });

  it("does not require email", () => {
    expect(DRAFT_SRC).not.toContain('"Valid email required"');
  });

  it("requires persona", () => {
    expect(DRAFT_SRC).toContain("Valid persona required");
  });

  it("validates contract_version 10.2.0", () => {
    expect(DRAFT_SRC).toContain('"10.2.0"');
  });

  it("uses remote mint with local fallback", () => {
    expect(DRAFT_SRC).toContain("/api/draft-tokens/mint");
    expect(DRAFT_SRC).toContain("localMint");
  });

  it("returns ok, token, resumeUrl", () => {
    expect(DRAFT_SRC).toContain("ok: true");
    expect(DRAFT_SRC).toContain("token");
    expect(DRAFT_SRC).toContain("resumeUrl");
  });

  it("does not do HubSpot upsert", () => {
    expect(DRAFT_SRC).not.toContain("hubspot");
    expect(DRAFT_SRC).not.toContain("HUBSPOT");
  });
});

describe("/api/realtor-interest endpoint", () => {
  const RI_PATH = path.resolve("src/app/api/realtor-interest/route.ts");
  const RI_SRC = fs.readFileSync(RI_PATH, "utf-8");

  it("exists and exports POST handler", () => {
    expect(RI_SRC).toContain("export async function POST");
  });

  it("does not mint tokens", () => {
    expect(RI_SRC).not.toContain("generateToken");
    expect(RI_SRC).not.toContain("localMint");
    expect(RI_SRC).not.toContain("draft-tokens/mint");
  });

  it("does not return resumeUrl", () => {
    expect(RI_SRC).not.toContain("resumeUrl");
  });

  it("does HubSpot upsert for realtor", () => {
    expect(RI_SRC).toContain("hubspot");
    expect(RI_SRC).toContain("realtor");
  });

  it("returns simple success", () => {
    expect(RI_SRC).toContain("ok: true");
  });
});
