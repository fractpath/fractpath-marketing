"use client";

import { useCallback, useState } from "react";
import { FractPathCalculatorWidget } from "fractpath-calculator-widget";
import type {
  LiteShareSummaryV1,
  WidgetEvent,
} from "fractpath-calculator-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent, trackCustomEvent } from "@/lib/analytics";

type GateState =
  | { step: "idle" }
  | { step: "email_gate"; snapshot: LiteShareSummaryV1 }
  | { step: "submitting"; snapshot: LiteShareSummaryV1; email: string }
  | { step: "saved" }
  | { step: "error"; message: string; snapshot: LiteShareSummaryV1; email: string };

export function CalculatorEmbed() {
  const [gate, setGate] = useState<GateState>({ step: "idle" });
  const [emailInput, setEmailInput] = useState("");
  const [widgetError, setWidgetError] = useState(false);

  const handleLiteSnapshot = useCallback((lite: LiteShareSummaryV1) => {
    setGate({ step: "email_gate", snapshot: lite });
    setEmailInput("");
    trackCustomEvent("lite_snapshot_received");
  }, []);

  const handleEvent = useCallback((event: WidgetEvent) => {
    trackEvent(event);
  }, []);

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (gate.step !== "email_gate") return;

      const email = emailInput.trim();
      if (!email || !email.includes("@")) return;

      setGate({ step: "submitting", snapshot: gate.snapshot, email });
      trackCustomEvent("lead_email_submitted");

      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, snapshot: gate.snapshot }),
        });

        const data = await res.json();

        if (data.ok) {
          setGate({ step: "saved" });
        } else {
          setGate({
            step: "error",
            message: data.error || "Something went wrong. Please try again.",
            snapshot: gate.snapshot,
            email,
          });
        }
      } catch {
        setGate({
          step: "error",
          message: "Network error. Please check your connection and try again.",
          snapshot: gate.snapshot,
          email: emailInput.trim(),
        });
      }
    },
    [gate, emailInput],
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
      <div className="mx-auto max-w-[920px]">
        <WidgetErrorBoundary onError={() => setWidgetError(true)}>
          <FractPathCalculatorWidget
            mode="marketing"
            onLiteSnapshot={handleLiteSnapshot}
            onEvent={handleEvent}
          />
        </WidgetErrorBoundary>
      </div>

      {gate.step === "email_gate" && (
        <Card className="mx-auto max-w-md rounded-2xl border-primary/20 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Save Your Scenario</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email to save this scenario and receive a summary.
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

      {gate.step === "submitting" && (
        <Card className="mx-auto max-w-md rounded-2xl">
          <CardContent className="flex items-center justify-center gap-3 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Saving your scenario...</p>
          </CardContent>
        </Card>
      )}

      {gate.step === "saved" && (
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

      {gate.step === "error" && (
        <Card className="mx-auto max-w-md rounded-2xl border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{gate.message}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGate({ step: "email_gate", snapshot: gate.snapshot })}
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

import { Component, type ReactNode, type ErrorInfo } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
