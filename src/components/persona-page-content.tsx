"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CalculatorPersona } from "fractpath-calculator-widget";
import { Container, Section, PageHeader } from "@/components/ui-kit";
import type { PersonaKey } from "@/content/personas";

const CalculatorEmbed = dynamic(
  () => import("@/components/calculator-embed").then((m) => m.CalculatorEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[920px] rounded-2xl border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading calculator…</p>
      </div>
    ),
  },
);

export function PersonaPageContent() {
  const [persona, setPersona] = useState<PersonaKey>("homeowner");

  const handlePersonaFromWidget = (p: CalculatorPersona) => {
    if (p === "homeowner" || p === "buyer" || p === "realtor") {
      setPersona(p);
    }
  };

  return (
    <Section id="calculator" className="bg-muted/30">
      <Container>
        <PageHeader
          eyebrow="Scenario Calculator"
          title="Model Your Scenario"
          subtitle="Enter your details to see estimated equity scenarios. All outputs are for informational purposes only."
        />
        <CalculatorEmbed
          persona={persona}
          onPersonaChange={handlePersonaFromWidget}
        />
      </Container>
    </Section>
  );
}
