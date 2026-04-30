"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackCustomEvent } from "@/lib/analytics";

export function RealtorBetaForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimEmail = email.trim();
    if (!trimEmail || !trimEmail.includes("@")) return;

    setSubmitting(true);
    setError(null);
    trackCustomEvent("realtor_beta_submitted", { email: trimEmail });

    try {
      const res = await fetch("/api/realtor-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimEmail,
          name: name.trim() || undefined,
          brokerage: brokerage.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mb-3 text-2xl">&#10003;</div>
        <h3 className="mb-2 text-lg font-semibold">You&apos;re on the list</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll be in touch with early access details. Thank you for your
          interest in FractPath.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 rounded-xl border bg-background p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" name="persona" value="realtor" />
      <input type="hidden" name="interest" value="fractpath" />
      <input type="hidden" name="stage" value="early-access" />

      <div className="space-y-2">
        <Label htmlFor="realtor-name">Name</Label>
        <Input
          id="realtor-name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="realtor-email">Email</Label>
        <Input
          id="realtor-email"
          type="email"
          placeholder="you@brokerage.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="realtor-brokerage">Brokerage (optional)</Label>
        <Input
          id="realtor-brokerage"
          type="text"
          placeholder="Brokerage name"
          value={brokerage}
          onChange={(e) => setBrokerage(e.target.value)}
          disabled={submitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Request Realtor Consultation"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll only contact you about FractPath realtor opportunities.
      </p>
    </form>
  );
}
