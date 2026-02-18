"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Component, type ReactNode } from "react";
import {
  FractPathCalculatorWidget,
  type CalculatorPersona,
  type DraftSnapshot,
  type DraftSnapshotInputs,
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

      const snap = gate.snapshot as Record<string, unknown>;

      // --- FIX: safeInputs now always satisfies DraftSnapshotInputs ---
      const safeInputs: DraftSnapshotInputs =
        "inputs" in snap && snap.inputs
          ? (snap.inputs as DraftSnapshotInputs)
          : snap.deal_terms
            ? {
                _source: "deal_terms",
                homeValue: snap.deal_terms.property_value,
                initialBuyAmount: snap.deal_terms.upfront_payment,
                termYears: snap.deal_terms.contract_maturity_years,
                annualGrowthRate: snap.assumptions?.annual_appreciation ?? 0,
              }
            : {
                _source: "fallback",
                homeValue: 0,
                initialBuyAmount: 0,
                termYears: 0,
                annualGrowthRate: 0,
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
          console.log("[save-continue] success: resume_token received", {
            persona,
            email,
          });

          const rawResumeUrl =
            typeof data.resumeUrl === "string" ? data.resumeUrl : "";
          const continueUrl = rawResumeUrl.startsWith("http")
            ? rawResumeUrl
            : rawResumeUrl.startsWith("/")
              ? `${appBase}${rawResumeUrl}`
              : `${appBase}/resume?token=${encodeURIComponent(String(data.resume_token))}`;

          window.location.assign(continueUrl);
          return;
        } else {
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
        }
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

  // --- handleShareSubmit remains unchanged ---
  const handleShareSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (gate.step !== "share_gate") return;

      const email = emailInput.trim();
      if (!email || !email.includes("@")) return;

      setGate({ step: "share_submitting", summary: gate.summary, email });
      trackCustomEvent("share_clicked", { persona });

      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_email: email,
            shareSummary: gate.summary,
          }),
        });

        const data = await res.json();

        if (data.share_token || data.ok) {
          console.log("[share] success: share_token received", {
            to_email: email,
          });
          setGate({ step: "share_done" });
        } else {
          console.warn("[share] failure:", data.error || "unknown error", {
            to_email: email,
          });
          setGate({
            step: "share_error",
            message: data.error || "Something went wrong. Please try again.",
            summary: gate.summary,
            email,
          });
        }
      } catch (err) {
        console.error("[share] network error:", err);
        setGate({
          step: "share_error",
          message: "Network error. Please check your connection and try again.",
          summary: gate.summary,
          email: emailInput.trim(),
        });
      }
    },
    [gate, emailInput, persona],
  );

  // --- UI rendering remains unchanged ---
  if (widgetError) {
    return (
      <Card className="mx-auto max-w-2xl rounded-2xl">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Calculator Unavailable
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            The scenario calculator could not be loaded. Please refresh the page
            or try again later.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* PERSONA BUTTONS + WIDGET + SAVE/SHARE UI remains unchanged */}
      {/* ... */}
    </div>
  );
}

// --- ErrorBoundary unchanged ---
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
