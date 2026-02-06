import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <PageHeader
              eyebrow="Choose Your Perspective"
              title="Who Are You?"
              subtitle="Select your role to see tailored scenarios, outputs, and value propositions."
            />
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            <Card className="cursor-pointer rounded-2xl border-2 border-primary shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Homeowner</h3>
                <p className="text-xs text-muted-foreground">
                  Access equity without selling
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer rounded-2xl shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <Key className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-semibold">Buyer</h3>
                <p className="text-xs text-muted-foreground">
                  Build equity toward ownership
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer rounded-2xl shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-semibold">Realtor</h3>
                <p className="text-xs text-muted-foreground">
                  Earn commissions on referrals
                </p>
              </CardContent>
            </Card>
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
          <Card className="mx-auto max-w-2xl rounded-2xl">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Calculator Coming Soon
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                The interactive equity scenario calculator will be available
                here. Enter property value, contributions, and time horizon to
                see personalized estimates.
              </p>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader
            eyebrow="Why FractPath"
            title="Built for Every Side of the Table"
            subtitle="Whether you own, want to own, or help others own — FractPath models the possibilities."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Home}
              title="Homeowners"
              body="Access your home equity without taking on debt. Model cash-out scenarios while retaining ownership and seeing the buyback window effect."
            />
            <FeatureCard
              icon={Key}
              title="Buyers"
              body="Build equity over time with monthly contributions. See projected ownership percentages, implied purchase prices, and payoff scenarios."
            />
            <FeatureCard
              icon={Users}
              title="Realtors"
              body="Generate referral commissions through a new model. See projected earnings from referral fees and ongoing share percentages."
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

      <Section id="faq">
        <Container>
          <PageHeader
            eyebrow="FAQ"
            title="Common Questions"
            subtitle="Get clarity on how FractPath works and what to expect."
          />
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">
                Is FractPath a loan or mortgage product?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No. FractPath models fractional equity scenarios. It is not a
                lender and does not provide loans, mortgages, or financial
                advice. All outputs are estimates for scenario modeling purposes.
              </p>
            </div>
            <div>
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
            <div>
              <h3 className="mb-2 font-semibold">
                Is my information safe?
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We take data privacy seriously. Scenario inputs are used only to
                generate your estimates. See our Privacy Policy for full details.
              </p>
            </div>
            <div>
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

      <Section id="realtor-beta" className="bg-muted/30">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <PageHeader
              eyebrow="Realtor Beta Program"
              title="Join the Beta"
              subtitle="Be among the first realtors to offer fractional equity paths to your clients. Early access, priority support, and referral commissions."
            />
            <Button size="lg" asChild>
              <a href="https://app.fractpath.com/signup">
                Request Beta Access
              </a>
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <PageHeader
            eyebrow="Trust & Compliance"
            title="Transparent by Design"
            subtitle="FractPath is built with transparency, auditability, and manual-first operations at its core."
          />
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="No Hidden Fees"
              body="All fees and timing factors are disclosed upfront in every scenario model. What you see is what you get."
            />
            <FeatureCard
              icon={Scale}
              title="Legal Compliance"
              body="All agreements are executed through vetted legal processes. We operate within state regulatory frameworks."
            />
            <FeatureCard
              icon={Eye}
              title="Auditability"
              body="Every calculation is deterministic and reproducible. No black-box models. You can verify every number."
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

      <Footer />
    </div>
  );
}
