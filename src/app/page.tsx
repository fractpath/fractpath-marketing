import {
  Container,
  Section,
  PageHeader,
  FeatureCard,
  TopNav,
  Footer,
} from "@/components/ui-kit";
import { PersonaPageContent } from "@/components/persona-page-content";
import { BarChart3, Handshake, FileCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen">
      <TopNav />

      <PersonaPageContent />

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
              <h3 className="mb-2 font-semibold">Is my information safe?</h3>
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
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
