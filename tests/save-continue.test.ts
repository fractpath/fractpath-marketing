import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const EMBED_PATH = path.resolve("src/components/calculator-embed.tsx");
const EMBED_SRC = fs.readFileSync(EMBED_PATH, "utf-8");

describe("Save & Continue — snapshot injection", () => {
  it("injects email into draftSnapshot object", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 500);
    expect(block).toContain("email");
  });

  it("injects persona into draftSnapshot object", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 500);
    expect(block).toContain("persona");
  });

  it("injects created_at with fallback into draftSnapshot", () => {
    const idx = EMBED_SRC.indexOf("const draftSnapshotForLead");
    const block = EMBED_SRC.slice(idx, idx + 500);
    expect(block).toContain("created_at");
    expect(block).toContain("new Date().toISOString()");
  });

  it("provides inputs fallback for FullDealSnapshotV1", () => {
    expect(EMBED_SRC).toContain("extractInputsFromSnapshot");
    expect(EMBED_SRC).toContain("deal_terms");
    expect(EMBED_SRC).toContain("homeValue: snap.deal_terms.property_value");
  });

  it("provides basic_results fallback for FullDealSnapshotV1", () => {
    expect(EMBED_SRC).toContain("extractBasicResultsFromSnapshot");
    const fnBody = EMBED_SRC.slice(
      EMBED_SRC.indexOf("function extractBasicResultsFromSnapshot"),
      EMBED_SRC.indexOf("export type CalculatorEmbedProps"),
    );
    expect(fnBody).toContain("basic_results");
    expect(fnBody).toContain("return {}");
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
