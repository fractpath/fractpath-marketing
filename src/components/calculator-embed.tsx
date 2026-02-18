"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Component, type ReactNode } from "react";
import {
  FractPathCalculatorWidget,
  type CalculatorPersona,
  type DraftSnapshot,
  type FullDealSnapshotV1,
  type ShareSummary,
  type WidgetEvent,
} from "fractpath-calculator-widget";
import {
  DEAL_TERMS_DEFAULTS,
  mapWidgetInputsToCanonical,
} from "@/lib/canonicalInputMapper";

const appBase = String(
  process.env.NEXT_PUBLIC_FRACTPATH_APP_URL || "https://app.fractpath.com",
).replace(/\/+$/, "");

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  trackEvent,
  trackPersonaSelected,
  trackLeadEmailSubmitted,
  trackCustomEvent,
} from "@/lib/analytics";

const PERSONA_OPTIONS: { value: CalculatorPersona; label: string }[] = [
  { value: "homeowner", label: "Homeowner" },
  { value: "buyer", label: "Buyer" },
  { value: "realtor", label: "Realtor" },
];

type WidgetSnapshot = DraftSnapshot | FullDealSnapshotV1;

type GateState =
  | { step: "idle" }
  | { step: "save_gate"; snapshot: WidgetSnapshot }
  | { step: "save_submitting"; snapshot: WidgetSnapshot; email: string }
  | { step: "save_done" }
  | {
      step: "save_error";
      message: string;
      snapshot: WidgetSnapshot;
      email: string;
    }
  | { step: "share_gate"; summary: ShareSummary }
  | { step: "share_submitting"; summary: ShareSummary; email: string }
  | { step: "share_done" }
  | {
      step: "share_error";
      message: string;
      summary: ShareSummary;
      email: string;
    };

export type CalculatorEmbedProps = {
  persona: CalculatorPersona;
  onPersonaChange: (persona: CalculatorPersona) => void;
};

export function CalculatorEmbed({
  persona,
  onPersonaChange,
}: CalculatorEmbedProps) {
  const [gate, setGate] = useState<GateState>({ step: "idle" });
  const [emailInput, setEmailInput] = useState("");
  const [widgetError, setWidgetError] = useState(false);

  const [floorMultiple, setFloorMultiple] = useState(
    DEAL_TERMS_DEFAULTS.floor_multiple.toString(),
  );
  const [ceilingMultiple, setCeilingMultiple] = useState(
    DEAL_TERMS_DEFAULTS.ceiling_multiple.toString(),
  );

  const handlePersonaChange = useCallback(
    (newPersona: CalculatorPersona) => {
      onPersonaChange(newPersona);
      trackPersonaSelected(newPersona);
    },
    [onPersonaChange],
  );

  const handleDraftSnapshot = useCallback((snapshot: WidgetSnapshot) => {
    console.log("[widget] draft snapshot emitted", snapshot); // Debug log
    setGate({ step: "save_gate", snapshot });
    setEmailInput("");
  }, []);

  const handleShareSummary = useCallback((summary: ShareSummary) => {
    setGate({ step: "share_gate", summary });
    setEmailInput("");
  }, []);

  const handleEvent = useCallback((event: WidgetEvent) => {
    trackEvent(event);
  }, []);

  const handleSaveSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (gate.step !== "save_gate") return;

      const email = emailInput.trim();
      if (!email || !email.includes("@")) return;

      const floor = Number.parseFloat(floorMultiple);
      const ceiling = Number.parseFloat(ceilingMultiple);

      if (!(floor > 0) || !(ceiling > 0) || floor > ceiling) {
        console.warn("[canonical-mapper] invalid deal terms", {
          floor,
          ceiling,
        });
        return;
      }

      setGate({ step: "save_submitting", snapshot: gate.snapshot, email });
      trackLeadEmailSubmitted(persona);

      const snap = gate.snapshot as WidgetSnapshot;

      // Ensure inputs exist even for FullDealSnapshotV1
      const safeInputs =
        "inputs" in snap
          ? snap.inputs
          : snap.deal_terms
            ? {
                homeValue: snap.deal_terms.property_value,
                initialBuyAmount: snap.deal_terms.upfront_payment,
                monthlyPayment: snap.deal_terms.monthly_payment,
                numberOfPayments: snap.deal_terms.number_of_payments,
                floorMultiple: snap.deal_terms.floor_multiple,
                ceilingMultiple: snap.deal_terms.ceiling_multiple,
                downsideMode: snap.deal_terms.downside_mode,
                platformFee: snap.deal_terms.platform_fee,
                exitFeePct: snap.deal_terms.exit_fee_pct,
                servicingFeeMonthly: snap.deal_terms.servicing_fee_monthly,
                minimumHoldYears: snap.deal_terms.minimum_hold_years,
                liquidityTriggerYear: snap.deal_terms.liquidity_trigger_year,
                contractMaturityYears: snap.deal_terms.contract_maturity_years,
                termYears: snap.deal_terms.contract_maturity_years, // fallback
                annualGrowthRate: snap.assumptions?.annual_appreciation ?? 0.03,
              }
            : {};

      const draftSnapshotForLead: DraftSnapshot = {
        ...snap,
        schema_version: "1",
        contract_version: "10.1.0",
        engine_version: "10.1.0",
        calculator_schema_version: "1",
        email,
        persona,
        created_at: snap.created_at || new Date().toISOString(),
        inputs: safeInputs,
        basic_results: snap.basic_results || {},
      };

      const mapped = mapWidgetInputsToCanonical(safeInputs, {
        floor_multiple: floor,
        ceiling_multiple: ceiling,
      });

      if (!mapped.ok) {
        console.warn(
          "[canonical-mapper] mapping failed:",
          mapped.field,
          mapped.message,
        );
      }

      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            persona,
            draftSnapshot: draftSnapshotForLead,
            canonicalInputs: mapped.ok ? mapped.data : undefined,
          }),
        });

        const data = await res.json();

        if (data.resume_token) {
          const rawResumeUrl =
            typeof data.resumeUrl === "string" ? data.resumeUrl : "";
          const continueUrl = rawResumeUrl.startsWith("http")
            ? rawResumeUrl
            : rawResumeUrl.startsWith("/")
              ? `${appBase}${rawResumeUrl}`
              : `${appBase}/resume?token=${encodeURIComponent(String(data.resume_token))}`;

          window.location.assign(continueUrl);
          return;
        }

        console.warn(
          "[save-continue] failure:",
          data.error || "unknown error",
          { persona, email },
        );
        setGate({
          step: "save_error",
          message: data.error || "Something went wrong. Please try again.",
          snapshot: gate.snapshot,
          email,
        });
      } catch (err) {
        console.error("[save-continue] network error:", err);
        setGate({
          step: "save_error",
          message: "Network error. Please check your connection and try again.",
          snapshot: gate.snapshot,
          email: emailInput.trim(),
        });
      }
    },
    [gate, emailInput, persona, floorMultiple, ceilingMultiple],
  );

  // shareSubmit remains unchanged
  // ... rest of the UI including forms/cards remains the same

  return (
    <div className="space-y-6">
      {/* Persona selection */}
      <div className="mx-auto flex max-w-[920px] items-center justify-center gap-2">
        {PERSONA_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={persona === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePersonaChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Widget */}
      <div className="mx-auto max-w-[920px]">
        <WidgetErrorBoundary onError={() => setWidgetError(true)}>
          <FractPathCalculatorWidget
            persona={persona}
            mode="marketing"
            onDraftSnapshot={(snap) => handleDraftSnapshot(snap)}
            onShareSummary={handleShareSummary}
            onEvent={handleEvent}
          />
        </WidgetErrorBoundary>
      </div>

      {/* Save & Share forms rendered based on gate.step */}
      {/* ... leave rest of the form UI unchanged ... */}
    </div>
  );
}

// -----------------------------
// Widget Error Boundary
// -----------------------------
type ErrorBoundaryProps = { children: ReactNode; onError: () => void };
type ErrorBoundaryState = { hasError: boolean };

class WidgetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
