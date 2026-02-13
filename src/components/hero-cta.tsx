"use client";

import { Button } from "@/components/ui/button";
import { trackCustomEvent } from "@/lib/analytics";

export function HeroCta() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Button size="lg" asChild>
        <a
          href="#calculator"
          onClick={() =>
            trackCustomEvent("cta_signup_clicked", { location: "hero" })
          }
        >
          See Your Options
        </a>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <a
          href="#realtor-beta"
          onClick={() =>
            trackCustomEvent("cta_signup_clicked", { location: "hero" })
          }
        >
          Join Beta
        </a>
      </Button>
    </div>
  );
}
