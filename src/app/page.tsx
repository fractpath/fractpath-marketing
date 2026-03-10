import { Badge } from "@/components/ui/badge";
import {
  Container,
  Section,
  PageHeader,
  FeatureCard,
  TopNav,
  Footer,
} from "@/components/ui-kit";
import { HeroCta } from "@/components/hero-cta";
import { PersonaPageContent } from "@/components/persona-page-content";
import { RealtorBetaForm } from "@/components/realtor-beta-form";
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
  return (
    <div id="top" className="min-h-screen">
      <TopNav />

      <Section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/40 pt-24 sm:pt-32 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-[0.03]" />
        <Container>
          <div className="relative mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide">
              Home Appreciation Agreements
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Model Your Path to Equity
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              See how structured appreciation agreements could work for your
              property or your clients &mdash; all estimates, no obligations.
            </p>

            <HeroCta />
          </div>
        </Container>
      </Section>

      <PersonaPageContent />

      <Section>
        <Container>
          <PageHeader
            eyebrow="Why FractPath"
            title="Built for Every Side of the Table"
            subtitle="Whether you own, want to own, or help others own &mdash; FractPath models the possibilities."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Home}
              title="No Loans Required"
              body="Access a portion of your home equity without taking on debt, monthly payments, or interest charges."
            />
            <FeatureCard
              icon={Key}
              title="Participate in Appreciation"
              body="Model how structured agreements tied to future appreciation can create pathways to equity over time."
            />
            <FeatureCard
              icon={Users}
              title="Referral Opportunities"
              body="Realtors can model referral scenarios and offer clients a structured alternative to traditional financing."
            />
          </div>
        </Container>
      </Section>

      <Section id="how-it-works" className="bg-muted/30">
        <Container>
          <PageHeader
            eyebrow="How It Works"
            title="Three Simple Steps"
            subtitle="FractPath uses a manual-first operations model to ensure accuracy and compliance."
          />
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={BarChart3}
              title="1. Model"
              body="Enter your property details and scenario preferences. Our calculator generates estimates based on your inputs — no black boxes."
            />
            <FeatureCard
              icon={Handshake}
              title="2. Match"
              body="We connect homeowners and buyers with compatible goals. Every match is reviewed manually to ensure it meets both parties' needs."
            />
            <FeatureCard
              icon={FileCheck}
              title="3. Execute"
              body="All agreements are executed through vetted legal processes. Manual-first operations ensure transparency and compliance at every step."
            />
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
            <FeatureCard
              icon={Shield}
              title="No Hidden Fees"
              body="No hidden fees — all terms disclosed upfront in every scenario."
            />
            <FeatureCard
              icon={Scale}
              title="Legal Compliance"
              body="All agreements executed through vetted legal processes and state regulatory frameworks."
            />
            <FeatureCard
              icon={Eye}
              title="Auditability"
              body="Every calculation is deterministic and reproducible. Verify every number."
            />
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

      <Section id="faq" className="bg-muted/30">
        <Container>
          <PageHeader
            eyebrow="FAQ"
            title="Common Questions"
            subtitle="Get clarity on how FractPath works and what to expect."
          />
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">
                Is FractPath a loan or mortgage product?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No. FractPath models home appreciation agreement scenarios. It
                is not a lender and does not provide loans, mortgages, or
                financial advice. All outputs are estimates for scenario
                modeling purposes.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">
                How are equity calculations determined?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Calculations use deterministic formulas based on property value,
                contributions, appreciation rate, and time horizon. No machine
                learning or predictive models are used. Results are estimates
                only.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">Is my information safe?</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We take data privacy seriously. Scenario inputs are used only to
                generate your estimates. See our Privacy Policy for full
                details.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">
                What states does FractPath operate in?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                FractPath is initially launching in Maryland. We plan to expand
                to additional states as we grow. Check back for updates.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="realtor-beta">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <PageHeader
              eyebrow="Realtor Beta Program"
              title="Join the Beta"
              subtitle="Be among the first realtors to offer structured appreciation agreements to your clients. Early access, priority support, and referral opportunities."
            />
          </div>
          <RealtorBetaForm />
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
