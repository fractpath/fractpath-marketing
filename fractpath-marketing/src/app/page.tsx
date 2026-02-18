"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Container,
  Section,
  PageHeader,
  FeatureCard,
  TopNav,
  Footer,
} from "@/components/ui-kit";
import {
  CalculatorEmbed,
  type CalculatorPersona,
} from "@/components/calculator-embed";
import {
  Home,
  Key,
  Users,
  BarChart3,
  Handshake,
  FileCheck,
  Shield,
  Scale,
  Eye,
} from "lucide-react";

export default function HomePage() {
  const [persona, setPersona] = useState<CalculatorPersona>("homeowner");

  return (
    <div id="top" className="min-h-screen">
      <TopNav />

      <Section className="bg-gradient-to-b from-background to-muted/30 pt-20 sm:pt-28 lg:pt-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Scenario Modeling &middot; Not Financial Advice
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Debt-Free Equity Access
              <span className="block text-muted-foreground">
                &amp; a Path to Ownership
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Model scenarios for unlocking home equity or building ownership
              &mdash; without traditional debt. All outputs are estimates for
              informational purposes only.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#calculator">See Your Options</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#realtor-beta">Join Beta</a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="calculator" className="bg-muted/30">
        <Container>
          <PageHeader
            eyebrow="Scenario Calculator"
            title="Model Your Path"
            subtitle="Enter property details to see estimated equity scenarios. All outputs are for informational purposes only."
          />

          {/* IMPORTANT: actually render the embedded widget with required props */}
          <CalculatorEmbed persona={persona} onPersonaChange={setPersona} />
        </Container>
      </Section>

      {/* ...rest of the sections unchanged (Why FractPath, How It Works, FAQ, Realtor Beta, Trust & Compliance, Footer) */}
    </div>
  );
}
