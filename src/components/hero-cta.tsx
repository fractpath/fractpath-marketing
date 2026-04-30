"use client";

import { trackCustomEvent } from "@/lib/analytics";
import { GenericRegisterButton } from "@/components/generic-register-modal";

export function HeroCta() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
      <GenericRegisterButton
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Register
      </GenericRegisterButton>

      <a
        href="#calculator"
        onClick={() =>
          trackCustomEvent("cta_model_clicked", { location: "hero" })
        }
        className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-semibold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Model a Scenario
      </a>

      <a
        href="#realtor-section"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() =>
          trackCustomEvent("cta_realtor_link_clicked", { location: "hero" })
        }
      >
        Realtor? Learn how FractPath can help your clients →
      </a>
    </div>
  );
}
