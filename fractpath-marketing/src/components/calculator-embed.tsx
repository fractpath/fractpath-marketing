"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  FractPathCalculatorWidget,
  type LiteShareSummaryV1,
  type WidgetEvent,
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

type CalculatorEmbedProps = {
  persona: "homeowner" | "buyer" | "realtor";
  onPersonaChange: (persona: "homeowner" | "buyer" | "realtor") => void;
};

export function CalculatorEmbed({ persona, onPersonaChange }: CalculatorEmbedProps) {
  const [gate, setGate] = useState<GateState>({ step: "idle" });
  const [emailInput, setEmailInput] = useState("");
  const [widgetError, setWidgetError] = useState(false);

  const handleLiteSnapshot = useCallback((lite: LiteShareSummaryV1) => {
    setGate({ step: "email_gate", snapshot: lite });
    setEmailInput("");
    trackCustomEvent("lite_snapshot_received");
  }, []);

  const handleEvent = useCallback((event: unknown) => {
    trackEvent(event);
  }, []);

  const handleEmailSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
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
          body: JSON.stringify({ email, snapshot: gate.snapshot, persona }),
        });
        const data = await res.json();

        if (data.ok) setGate({ step: "saved" });
        else
          setGate({
            step: "error",
            message: data.error || "Something went wrong. Please try again.",
            snapshot: gate.snapshot,
            email,
          });
      } catch {
        setGate({
          step: "error",
          message: "Network error. Please check your connection and try again.",
          snapshot: gate.snapshot,
          email: emailInput.trim(),
        });
      }
    },
    [gate, emailInput, persona]
  );

  if (widgetError) {
    return (
      <Card className="mx-auto max-w-2xl rounded-2xl">
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">Calculator Unavailable</p>
          <p className="max-w-md text-sm text-muted-foreground">
            The scenario calculator could not be loaded. Please refresh the page or try again later.
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
          {/* Persona tabs could be added in parent component */}
          <FractPathCalculatorWidget
            mode="marketing"
            persona={persona}
            onLiteSnapshot={handleLiteSnapshot}
            onEvent={handleEvent}
          />
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}

type ErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type ErrorBoundaryState = { hasError: boolean };

class WidgetErrorBoundary extends Component<
