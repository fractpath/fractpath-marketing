"use client";

import { trackCustomEvent } from "@/lib/analytics";
import { GenericRegisterButton } from "@/components/generic-register-modal";

export function HeroCta() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <GenericRegisterButton className="inline-flex h-11 items-center justify-center rounded-md bg-[#18181B] px-7 text-sm font-semibold text-white shadow transition-all duration-150 hover:scale-[1.02] hover:bg-[#27272A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]">
        Register
      </GenericRegisterButton>

      <a
        href="#calculator"
        onClick={() =>
          trackCustomEvent("cta_model_clicked", { location: "hero" })
        }
        className="inline-flex h-11 items-center justify-center rounded-md border border-[#E4E4E7] bg-white px-7 text-sm font-semibold text-[#18181B] transition-all duration-150 hover:scale-[1.02] hover:border-[#A1A1AA]"
      >
        Model a Scenario
      </a>

      <a
        href="#realtor-section"
        className="text-sm font-medium text-[#71717A] transition-colors hover:text-[#18181B]"
        onClick={() =>
          trackCustomEvent("cta_realtor_link_clicked", { location: "hero" })
        }
      >
        Realtor? Learn how FractPath can help →
      </a>
    </div>
  );
}
