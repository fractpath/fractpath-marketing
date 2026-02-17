"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Component, type ReactNode } from "react";
import { FractPathCalculatorWidget, type CalculatorPersona, type DraftSnapshot, type ShareSummary, type WidgetEvent } from "fractpath-calculator-widget";
import {
  DEAL_TERMS_DEFAULTS,
  mapWidgetInputsToCanonical,
} from "@/lib/canonicalInputMapper";

const APP_BASE_URL = (
  process.env.NEXT_PUBLIC_FRACTPATH_APP_URL || "https://app.fractpath.com"
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

type GateState =
  | { step: "idle" }
  | { step: "save_gate"; snapshot: DraftSnapshot }
  | { step: "save_submitting"; snapshot: DraftSnapshot; email: string }
  | { step: "save_done" }
  | { step: "save_error"; message: string; snapshot: DraftSnapshot; email: string }
  | { step: "share_gate"; summary: ShareSummary }
  | { step: "share_submitting"; summary: ShareSummary; email: string }
  | { step: "share_done" }
  | { step: "share_error"; message: string; summary: ShareSummary; email: string };

type CalculatorEmbedProps = {
  persona: CalculatorPersona;
  onPersonaChange: (persona: CalculatorPersona) => void;
};

export function CalculatorEmbed({ persona, onPersonaChange }: CalculatorEmbedProps) {
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

  const handleDraftSnapshot = useCallback((snapshot: DraftSnapshot) => {
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
        console.warn("[canonical-mapper] invalid deal terms", { floor, ceiling });
        return;
      }

      setGate({ step: "save_submitting", snapshot: gate.snapshot, email });
      trackLeadEmailSubmitted(persona);

      const mapped = mapWidgetInputsToCanonical(gate.snapshot.inputs, {
        floor_multiple: floor,
        ceiling_multiple: ceiling,
      });

      if (!mapped.ok) {
        console.warn("[canonical-mapper] mapping failed:", mapped.field, mapped.message);
      }

      try {
        const draftSnapshotForLead = Object.assign({}, gate.snapshot, {
          schema_version: "1",
          contract_version: "10.1.0",
          engine_version: "10.1.0",
          calculator_schema_version: "1",
        });

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
          console.log("[save-continue] success: resume_token received", { persona, email });

          const rawResumeUrl = typeof data.resumeUrl === "string" ? data.resumeUrl : "";
          const continueUrl = rawResumeUrl.startsWith("http")
            ? rawResumeUrl
            : rawResumeUrl.startsWith("/")
              ? `${APP_BASE_URL}${rawResumeUrl}`
              : `${APP_BASE_URL}/resume?token=${encodeURIComponent(String(data.resume_token))}`;

          if (process.env.NODE_ENV !== "production") {
            console.log("[save-continue] navigation", { appBase: APP_BASE_URL, resumeToken: data.resume_token, continueUrl });
          }

          window.location.assign(continueUrl);
          return;
        } else {
          console.warn("[save-continue] failure:", data.error || "unknown error", { persona, email });
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
          console.log("[share] success: share_token received", { to_email: email });
          setGate({ step: "share_done" });
        } else {
          console.warn("[share] failure:", data.error || "unknown error", { to_email: email });
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

      {gate.step === "save_gate" && (
        <Card className="mx-auto max-w-md rounded-2xl border-primary/20 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Save Your Scenario</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email to save this scenario and continue in the app.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gate-email">Email</Label>
                <Input
                  id="gate-email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-3 rounded-xl border border-border/60 p-3">
                <div className="text-sm font-medium">Deal terms</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="gate-floor">Floor multiple</Label>
                    <Input
                      id="gate-floor"
                      inputMode="decimal"
                      placeholder="0.8"
                      value={floorMultiple}
                      onChange={(e) => setFloorMultiple(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gate-ceiling">Ceiling multiple</Label>
                    <Input
                      id="gate-ceiling"
                      inputMode="decimal"
                      placeholder="2.0"
                      value={ceilingMultiple}
                      onChange={(e) => setCeilingMultiple(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defaults shown. These terms are editable in the app.
                </p>
              </div>
              <Button type="submit" className="w-full">
                Save &amp; Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setGate({ step: "idle" })}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {gate.step === "share_gate" && (
        <Card className="mx-auto max-w-md rounded-2xl border-primary/20 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Share This Scenario</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send an illustrative scenario summary to someone. This is
                  non-binding and for informational purposes only.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="share-email">Recipient Email</Label>
                <Input
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
                onClick={() => setGate({ step: "idle" })}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {(gate.step === "save_submitting" || gate.step === "share_submitting") && (
        <Card className="mx-auto max-w-md rounded-2xl">
          <CardContent className="flex items-center justify-center gap-3 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              {gate.step === "save_submitting"
                ? "Saving your scenario..."
                : "Sharing your scenario..."}
            </p>
          </CardContent>
        </Card>
      )}

      {gate.step === "save_done" && (
        <Card className="mx-auto max-w-md rounded-2xl border-green-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Saved! Check your email for a scenario summary.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setGate({ step: "idle" })}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {gate.step === "share_done" && (
        <Card className="mx-auto max-w-md rounded-2xl border-green-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Shared! The recipient will receive an illustrative scenario summary.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setGate({ step: "idle" })}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {gate.step === "save_error" && (
        <Card className="mx-auto max-w-md rounded-2xl border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{gate.message}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setGate({ step: "save_gate", snapshot: gate.snapshot })
                }
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGate({ step: "idle" })}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gate.step === "share_error" && (
        <Card className="mx-auto max-w-md rounded-2xl border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{gate.message}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setGate({ step: "share_gate", summary: gate.summary })
                }
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGate({ step: "idle" })}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type ErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

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
