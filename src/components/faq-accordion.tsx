"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Is FractPath a loan or mortgage product?",
    a: "No. FractPath is a platform for modeling and structuring Home Appreciation Agreements. It is not a lender and does not provide mortgages, HELOCs, or financial advice.",
  },
  {
    q: "What is a Home Appreciation Agreement?",
    a: "A contract tied to a home's future value. A homeowner can receive capital today, while a buyer may receive a defined share of future appreciation and potential purchase rights later.",
  },
  {
    q: "Who can use FractPath?",
    a: "Homeowners, buyers, and realtors can use FractPath to model scenarios, explore verified properties, and create structured deal conversations.",
  },
  {
    q: "Can I stay in my home?",
    a: "Yes. FractPath HEA scenarios are designed around homeowners staying in the home unless the parties later agree to a sale, buyout, or other exit.",
  },
  {
    q: "How do exits work?",
    a: "Exit terms are defined in the agreement. Common outcomes may include buyout, sale, refinance, or another agreed settlement event.",
  },
  {
    q: "Is FractPath available everywhere?",
    a: "FractPath is starting with a controlled pilot and will expand as legal, operational, and partner requirements are validated.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="rounded-xl border bg-background shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-sm sm:text-base">{item.q}</span>
            <ChevronDown
              className={cn(
                "ml-4 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open === i && "rotate-180",
              )}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
