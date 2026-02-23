"use client";

import {
  useCallback,
  useState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
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
  SCENARIO_DEFAULTS,
  mapWidgetInputsToCanonical,
} from "@/lib/canonicalInputMapper";

import {
  CONTRACT_VERSION,
  SCHEMA_VERSION,
  COMPUTE_VERSION,
  ENGINE_VERSION,
} from "@/lib/contractVersion";

const appBase = String(
  process.env.NEXT_PUBLIC_FRACTPATH_APP_URL || "https://app.fractpath.com",
).replace(/\/+$/, "");

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

function isFullDealSnapshot(snap: WidgetSnapshot): snap is FullDealSnapshotV1 {
  return "deal_terms" in snap;
}

function buildCanonicalDealTerms(
  snap: WidgetSnapshot,
): Record<string, unknown> {
  if (isFullDealSnapshot(snap) && snap.deal_terms) {
    return {
      property_value: snap.deal_terms.property_value,
      upfront_payment: snap.deal_terms.upfront_payment,
      monthly_payment:
        snap.deal_terms.monthly_payment ?? DEAL_TERMS_DEFAULTS.monthly_payment,
      number_of_payments:
        snap.deal_terms.number_of_payments ??
        DEAL_TERMS_DEFAULTS.number_of_payments,
      payback_window_start_year: DEAL_TERMS_DEFAULTS.payback_window_start_year,
      payback_window_end_year: DEAL_TERMS_DEFAULTS.payback_window_end_year,
      timing_factor_early: DEAL_TERMS_DEFAULTS.timing_factor_early,
      timing_factor_late: DEAL_TERMS_DEFAULTS.timing_factor_late,
      floor_multiple:
        snap.deal_terms.floor_multiple ?? DEAL_TERMS_DEFAULTS.floor_multiple,
      ceiling_multiple:
        snap.deal_terms.ceiling_multiple ??
        DEAL_TERMS_DEFAULTS.ceiling_multiple,
      downside_mode:
        snap.deal_terms.downside_mode ?? DEAL_TERMS_DEFAULTS.downside_mode,
      contract_maturity_years:
        snap.deal_terms.contract_maturity_years ??
        DEAL_TERMS_DEFAULTS.contract_maturity_years,
      liquidity_trigger_year:
        snap.deal_terms.liquidity_trigger_year ??
        DEAL_TERMS_DEFAULTS.liquidity_trigger_year,
      minimum_hold_years:
        snap.deal_terms.minimum_hold_years ??
        DEAL_TERMS_DEFAULTS.minimum_hold_years,
      platform_fee:
        snap.deal_terms.platform_fee ?? DEAL_TERMS_DEFAULTS.platform_fee,
      servicing_fee_monthly:
        snap.deal_terms.servicing_fee_monthly ??
        DEAL_TERMS_DEFAULTS.servicing_fee_monthly,
      exit_fee_pct:
        snap.deal_terms.exit_fee_pct ?? DEAL_TERMS_DEFAULTS.exit_fee_pct,
      duration_yield_floor_enabled:
        DEAL_TERMS_DEFAULTS.duration_yield_floor_enabled,
    };
  }
  if ("inputs" in snap && snap.inputs) {
    const inp = snap.inputs;
    return {
      property_value: inp.homeValue,
      upfront_payment: inp.initialBuyAmount,
      monthly_payment: DEAL_TERMS_DEFAULTS.monthly_payment,
      number_of_payments: DEAL_TERMS_DEFAULTS.number_of_payments,
      payback_window_start_year: DEAL_TERMS_DEFAULTS.payback_window_start_year,
      payback_window_end_year: DEAL_TERMS_DEFAULTS.payback_window_end_year,
      timing_factor_early: DEAL_TERMS_DEFAULTS.timing_factor_early,
      timing_factor_late: DEAL_TERMS_DEFAULTS.timing_factor_late,
      floor_multiple: DEAL_TERMS_DEFAULTS.floor_multiple,
      ceiling_multiple: DEAL_TERMS_DEFAULTS.ceiling_multiple,
      downside_mode: DEAL_TERMS_DEFAULTS.downside_mode,
      contract_maturity_years:
        inp.termYears ?? DEAL_TERMS_DEFAULTS.contract_maturity_years,
      liquidity_trigger_year: DEAL_TERMS_DEFAULTS.liquidity_trigger_year,
      minimum_hold_years: DEAL_TERMS_DEFAULTS.minimum_hold_years,
      platform_fee: DEAL_TERMS_DEFAULTS.platform_fee,
      servicing_fee_monthly: DEAL_TERMS_DEFAULTS.servicing_fee_monthly,
      exit_fee_pct: DEAL_TERMS_DEFAULTS.exit_fee_pct,
      duration_yield_floor_enabled:
        DEAL_TERMS_DEFAULTS.duration_yield_floor_enabled,
    };
  }
  return {
    property_value: 500000,
    upfront_payment: 100000,
    monthly_payment: DEAL_TERMS_DEFAULTS.monthly_payment,
    number_of_payments: DEAL_TERMS_DEFAULTS.number_of_payments,
    payback_window_start_year: DEAL_TERMS_DEFAULTS.payback_window_start_year,
    payback_window_end_year: DEAL_TERMS_DEFAULTS.payback_window_end_year,
    timing_factor_early: DEAL_TERMS_DEFAULTS.timing_factor_early,
    timing_factor_late: DEAL_TERMS_DEFAULTS.timing_factor_late,
    floor_multiple: DEAL_TERMS_DEFAULTS.floor_multiple,
    ceiling_multiple: DEAL_TERMS_DEFAULTS.ceiling_multiple,
    downside_mode: DEAL_TERMS_DEFAULTS.downside_mode,
    contract_maturity_years: DEAL_TERMS_DEFAULTS.contract_maturity_years,
    liquidity_trigger_year: DEAL_TERMS_DEFAULTS.liquidity_trigger_year,
    minimum_hold_years: DEAL_TERMS_DEFAULTS.minimum_hold_years,
    platform_fee: DEAL_TERMS_DEFAULTS.platform_fee,
    servicing_fee_monthly: DEAL_TERMS_DEFAULTS.servicing_fee_monthly,
    exit_fee_pct: DEAL_TERMS_DEFAULTS.exit_fee_pct,
    duration_yield_floor_enabled:
      DEAL_TERMS_DEFAULTS.duration_yield_floor_enabled,
  };
}

function buildCanonicalScenario(snap: WidgetSnapshot): Record<string, unknown> {
  if (isFullDealSnapshot(snap) && snap.assumptions) {
    return {
      annual_appreciation: snap.assumptions.annual_appreciation ?? 0.03,
      closing_cost_pct: SCENARIO_DEFAULTS.closing_cost_pct,
      exit_year:
        snap.deal_terms?.contract_maturity_years ?? SCENARIO_DEFAULTS.exit_year,
    };
  }
  if ("inputs" in snap && snap.inputs) {
    return {
      annual_appreciation: snap.inputs.annualGrowthRate ?? 0.03,
      closing_cost_pct: SCENARIO_DEFAULTS.closing_cost_pct,
      exit_year: snap.inputs.termYears ?? SCENARIO_DEFAULTS.exit_year,
    };
  }
  return {
    annual_appreciation: 0.03,
    closing_cost_pct: SCENARIO_DEFAULTS.closing_cost_pct,
    exit_year: SCENARIO_DEFAULTS.exit_year,
  };
}

function buildCanonicalInputs(snap: WidgetSnapshot): Record<string, unknown> {
  if ("inputs" in snap && snap.inputs) {
    return snap.inputs as Record<string, unknown>;
  }
  const dt = isFullDealSnapshot(snap) ? snap.deal_terms : null;
  if (dt) {
    return {
      homeValue: dt.property_value,
      initialBuyAmount: dt.upfront_payment,
      termYears: dt.contract_maturity_years,
      annualGrowthRate:
        (snap as FullDealSnapshotV1).assumptions?.annual_appreciation ?? 0.03,
    };
  }
  return {
    homeValue: 500000,
    initialBuyAmount: 100000,
    termYears: 5,
    annualGrowthRate: 0.03,
  };
}

function buildBasicResults(snap: WidgetSnapshot): Record<string, unknown> {
  if ("basic_results" in snap && snap.basic_results) {
    return snap.basic_results as Record<string, unknown>;
  }
  return {};
}

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
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gate.step === "save_gate" || gate.step === "share_gate") {
      requestAnimationFrame(() => emailRef.current?.focus());
    }
  }, [gate.step]);

  const handlePersonaChange = useCallback(
    (newPersona: CalculatorPersona) => {
      onPersonaChange(newPersona);
      trackPersonaSelected(newPersona);
    },
    [onPersonaChange],
  );

  const handleDraftSnapshot = useCallback((snapshot: WidgetSnapshot) => {
    console.log("[widget] snapshot emitted", {
      type: isFullDealSnapshot(snapshot)
        ? "FullDealSnapshotV1"
        : "DraftSnapshot",
      hasInputs: "inputs" in snapshot,
      hasDealTerms: "deal_terms" in snapshot,
    });

    const w = window as Window & {
      __fractpath_saveSnapshot?: (snapshot: WidgetSnapshot) => void;
    };
    if (typeof w.__fractpath_saveSnapshot === "function") {
      w.__fractpath_saveSnapshot(snapshot);
    }
    
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

  const closeModal = useCallback(() => {
    setGate({ step: "idle" });
  }, []);

  const isSaveModalOpen =
    gate.step === "save_gate" ||
    gate.step === "save_submitting" ||
    gate.step === "save_error";

  const isShareModalOpen =
    gate.step === "share_gate" ||
    gate.step === "share_submitting" ||
    gate.step === "share_error";

  const isDoneModalOpen =
    gate.step === "save_done" || gate.step === "share_done";

  const handleSaveSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (gate.step !== "save_gate") return;

      const email = emailInput.trim();
      if (!email || !email.includes("@")) return;

      setGate({ step: "save_submitting", snapshot: gate.snapshot, email });
      trackLeadEmailSubmitted(persona);

      const dealTerms = buildCanonicalDealTerms(gate.snapshot);
      const scenario = buildCanonicalScenario(gate.snapshot);
      const inputs = buildCanonicalInputs(gate.snapshot);
      const basicResults = buildBasicResults(gate.snapshot);
      const now = new Date().toISOString();

      const draftSnapshotForLead: Record<string, unknown> = {
        contract_version: CONTRACT_VERSION,
        schema_version: SCHEMA_VERSION,
        engine_version: ENGINE_VERSION,
        compute_version: COMPUTE_VERSION,
        email,
        persona,
        mode: "marketing",
        created_at: gate.snapshot.created_at || now,
        computed_at: now,
        deal_terms: dealTerms,
        assumptions: scenario,
        inputs,
        basic_results: basicResults,
      };

      if (isFullDealSnapshot(gate.snapshot) && gate.snapshot.outputs) {
        draftSnapshotForLead.outputs = gate.snapshot.outputs;
      }

      const mapped = mapWidgetInputsToCanonical(
        inputs as {
          homeValue: number;
          initialBuyAmount: number;
          termYears: number;
          annualGrowthRate: number;
        },
      );

      if (!mapped.ok) {
        console.warn(
          "[canonical-mapper] mapping note:",
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

        if (data.resume_token || data.token) {
          const token = data.resume_token || data.token;
          console.log("[save-continue] success: token received", {
            persona,
            email,
          });

          const rawResumeUrl =
            typeof data.resumeUrl === "string" ? data.resumeUrl : "";
          const continueUrl = rawResumeUrl.startsWith("http")
            ? rawResumeUrl
            : rawResumeUrl.startsWith("/")
              ? `${appBase}${rawResumeUrl}`
              : `${appBase}/resume?token=${encodeURIComponent(String(token))}`;

          if (process.env.NODE_ENV !== "production") {
            console.log("[save-continue] navigation", {
              appBase,
              token,
              continueUrl,
            });
          }

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
          message:
            "Network error. Please check your connection and try again.",
          snapshot: gate.snapshot,
          email: emailInput.trim(),
        });
      }
    },
    [gate, emailInput, persona],
  );

  const handleShareSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const email = emailInput.trim();
      if (!email || !email.includes("@")) return;

      if (gate.step !== "share_gate") return;

      setGate({
        step: "share_submitting",
        summary: gate.summary,
        email,
      });
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

      <div className="mx-auto max-w-[920px]">
        <WidgetErrorBoundary onError={() => setWidgetError(true)}>
          <FractPathCalculatorWidget
            persona={persona}
            mode="marketing"
            onDraftSnapshot={handleDraftSnapshot}
            onShareSummary={handleShareSummary}
            onEvent={handleEvent}
          />
        </WidgetErrorBoundary>
      </div>

      <Dialog
        open={isSaveModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Scenario</DialogTitle>
            <DialogDescription>
              Enter your email to save this scenario and continue in the app.
              This is for scenario modeling purposes only and does not
              constitute financial advice.
            </DialogDescription>
          </DialogHeader>

          {(gate.step === "save_gate" || gate.step === "save_submitting") && (
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gate-email">Email</Label>
                <Input
                  ref={emailRef}
                  id="gate-email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  autoFocus
                  disabled={gate.step === "save_submitting"}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={gate.step === "save_submitting"}
              >
                {gate.step === "save_submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save & Continue"
                )}
              </Button>
              {gate.step === "save_gate" && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
              )}
            </form>
          )}

          {gate.step === "save_error" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{gate.message}</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGate({ step: "save_gate", snapshot: gate.snapshot })
                  }
                >
                  Try Again
                </Button>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isShareModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share This Scenario</DialogTitle>
            <DialogDescription>
              Send an illustrative scenario summary to someone. This is
              non-binding and for informational purposes only.
            </DialogDescription>
          </DialogHeader>

          {gate.step === "share_gate" && (
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-email">Recipient Email</Label>
                <Input
                  ref={emailRef}
                  id="share-email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Share Scenario
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={closeModal}
              >
                Cancel
              </Button>
            </form>
          )}

          {gate.step === "share_submitting" && (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Sharing your scenario...
              </p>
            </div>
          )}

          {gate.step === "share_error" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{gate.message}</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGate({ step: "share_gate", summary: gate.summary })
                  }
                >
                  Try Again
                </Button>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDoneModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          {gate.step === "save_done" && (
            <div className="py-4 text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Saved! Redirecting you to the app...
              </p>
            </div>
          )}
          {gate.step === "share_done" && (
            <div className="space-y-3 py-4 text-center">
              <DialogHeader>
                <DialogTitle>Shared Successfully</DialogTitle>
              </DialogHeader>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                The recipient will receive an illustrative scenario summary.
              </p>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
