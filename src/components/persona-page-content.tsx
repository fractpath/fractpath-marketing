"use client";

import { useState } from "react";
import type { CalculatorPersona } from "fractpath-calculator-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section, PageHeader, FeatureCard } from "@/components/ui-kit";
import { CalculatorEmbed } from "@/components/calculator-embed";
import { personaContent, type PersonaKey } from "@/content/personas";
import { trackCustomEvent } from "@/lib/analytics";
import { Home, Key, Users, Shield, Scale, Eye } from "lucide-react";

const PERSONA_ICONS = {
  homeowner: Home,
  buyer: Key,
  realtor: Users,
} as const;

const TRUST_ICONS = [Shield, Scale, Eye] as const;
const TRUST_TITLES = ["No Hidden Fees", "Legal Compliance", "Auditability"] as const;

export function PersonaPageContent() {
  const [persona, setPersona] = useState<PersonaKey>("homeowner");
  const content = personaContent[persona];

  const handlePersonaFromWidget = (p: CalculatorPersona) => {
    if (p === "homeowner" || p === "buyer" || p === "realtor") {
      setPersona(p);
    }
  };

  return (
    <>
      <Section className="bg-gradient-to-b from-background to-muted/30 pt-20 sm:pt-28 lg:pt-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            {content.hero.eyebrow && (
              <Badge variant="secondary" className="mb-4">
                {content.hero.eyebrow}
              </Badge>
            )}

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {content.hero.headline}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {content.hero.subheadline}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <a
                  href="#calculator"
                  onClick={() =>
                    trackCustomEvent("cta_signup_clicked", {
                      location: "hero",
                      persona,
                    })
                  }
                >
                  {content.hero.primaryCtaLabel}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="#realtor-beta"
                  onClick={() =>
                    trackCustomEvent("cta_signup_clicked", {
                      location: "hero",
                      persona,
                    })
                  }
                >
                  {content.hero.secondaryCtaLabel}
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="calculator" className="bg-muted/30">
        <Container>
          <PageHeader
            eyebrow="Scenario Calculator"
            title={content.calculator.title}
            subtitle={content.calculator.description}
          />
          <CalculatorEmbed
            persona={persona}
            onPersonaChange={handlePersonaFromWidget}
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader
            eyebrow="Why FractPath"
            title="Built for Every Side of the Table"
            subtitle="Whether you own, want to own, or help others own &mdash; FractPath models the possibilities."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.valueProps.map((vp, i) => {
              const Icon = PERSONA_ICONS[persona] ?? Home;
              return (
                <FeatureCard
                  key={`${persona}-${i}`}
                  icon={Icon}
                  title={vp.title}
                  body={vp.body}
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader
            eyebrow="Trust &amp; Compliance"
            title="Transparent by Design"
            subtitle="FractPath is built with transparency, auditability, and manual-first operations at its core."
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {content.trust.bullets.map((bullet, i) => (
              <FeatureCard
                key={`trust-${i}`}
                icon={TRUST_ICONS[i] ?? Shield}
                title={TRUST_TITLES[i] ?? "Trust"}
                body={bullet}
              />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-muted/50 p-6 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong>Disclaimer:</strong> FractPath provides scenario modeling
              tools for informational purposes only. Outputs are estimates and
              do not constitute financial, legal, or investment advice. All
              scenarios are subject to change based on market conditions, legal
              requirements, and other factors. FractPath does not guarantee any
              returns or outcomes. Past performance is not indicative of future
              results. Consult with qualified professionals before making
              financial decisions.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
