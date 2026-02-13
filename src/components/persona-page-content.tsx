"use client";

import { useState } from "react";
import type { CalculatorPersona } from "fractpath-calculator-widget";
import { Container, Section, PageHeader } from "@/components/ui-kit";
import { CalculatorEmbed } from "@/components/calculator-embed";
import type { PersonaKey } from "@/content/personas";

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
