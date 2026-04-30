import Image from "next/image";
import {
  Container,
  Section,
  PageHeader,
  TopNav,
  Footer,
} from "@/components/ui-kit";
import { HeroCta } from "@/components/hero-cta";
import { PersonaPageContent } from "@/components/persona-page-content";
import { RealtorBetaForm } from "@/components/realtor-beta-form";
import { FaqAccordion } from "@/components/faq-accordion";
import { GenericRegisterButton } from "@/components/generic-register-modal";

const TRUST_ITEMS = [
  "Not a lender",
  "Open negotiation platform",
  "Guided deal workflow",
  "Licensed closing partners",
];

const HEA_CARDS = [
  {
    title: "No interest",
    body: "No compounding loan balance.",
  },
  {
    title: "Defined terms",
    body: "Value sharing, timing, and exit are agreed upfront.",
  },
  {
    title: "Future outcome",
    body: "Settled later through buyout, sale, refinance, or another agreed exit.",
  },
];

type StoplightValue = "green" | "gold" | "red" | "neutral";

type ComparisonRow = {
  feature: string;
  fractpath: string;
  mortgage: string;
  heloc: string;
  second: string;
  reverse: string;
  rto: string;
  fractpathColor?: StoplightValue;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Access cash today",
    fractpath: "Yes",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Yes",
    rto: "No",
    fractpathColor: "green",
  },
  {
    feature: "New monthly payment",
    fractpath: "No / flexible",
    mortgage: "Usually",
    heloc: "Often",
    second: "Yes",
    reverse: "Usually no",
    rto: "Yes",
    fractpathColor: "green",
  },
  {
    feature: "Interest charges",
    fractpath: "No",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Fees / interest",
    rto: "Varies",
    fractpathColor: "green",
  },
  {
    feature: "Owner stays in home",
    fractpath: "Yes",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Yes",
    rto: "No",
    fractpathColor: "green",
  },
  {
    feature: "Buyer can participate",
    fractpath: "Yes",
    mortgage: "No",
    heloc: "No",
    second: "No",
    reverse: "No",
    rto: "Yes",
    fractpathColor: "green",
  },
  {
    feature: "Terms can be negotiated",
    fractpath: "Yes",
    mortgage: "Limited",
    heloc: "Limited",
    second: "Limited",
    reverse: "Limited",
    rto: "Often",
    fractpathColor: "green",
  },
  {
    feature: "Path to future purchase",
    fractpath: "Possible",
    mortgage: "No",
    heloc: "No",
    second: "No",
    reverse: "No",
    rto: "Yes",
    fractpathColor: "gold",
  },
  {
    feature: "Best fit",
    fractpath: "Flexible equity deal",
    mortgage: "Replace main mortgage",
    heloc: "Credit line",
    second: "Additional loan",
    reverse: "Older homeowners",
    rto: "Lease-to-buy",
    fractpathColor: "neutral",
  },
];

const HOMEOWNER_BULLETS = [
  "Access value while staying in your home",
  "Avoid taking on a traditional loan",
  "Control timing, buyout, and exit terms",
  "Share privately or with verified buyers",
];

const BUYER_BULLETS = [
  "Start earlier in a neighborhood you want",
  "Structure around real affordability",
  "Build a relationship with the owner",
  "Negotiate future purchase rights",
];

const PRODUCT_STEPS = [
  {
    image: "/brand/media/product-verified-property.png",
    title: "Discover verified properties",
    body: "View verified properties or bring your own property into the workflow.",
  },
  {
    image: "/brand/media/product-scenario-model.png",
    title: "Model deal scenarios",
    body: "Compare scenarios and understand estimated economics before moving forward.",
  },
  {
    image: "/brand/media/product-offer-flow.png",
    title: "Negotiate structured offers",
    body: "Create, accept, reject, or counter offers with clear terms.",
  },
  {
    image: "/brand/media/product-deal-progress.png",
    title: "Track progress to execution",
    body: "Move accepted terms toward documents, signatures, and licensed partner handoff.",
  },
];

const TRUST_CARDS = [
  {
    title: "Clear terms",
    body: "Deal economics, timing, and exit assumptions are shown before users continue.",
  },
  {
    title: "Manual review",
    body: "Key property and deal steps can be reviewed before acceptance and execution.",
  },
  {
    title: "Partner-supported",
    body: "Closing, documentation, and servicing workflows are designed to work with qualified partners.",
  },
];

const REALTOR_BULLETS = [
  "Engage pre-list homeowners earlier",
  "Help buyers express serious interest in a target area",
  "Start soft-offer conversations around future purchase potential",
  "Receive product guidance and private consultation",
];

function stoplightClass(color?: StoplightValue): string {
  if (color === "green")
    return "bg-emerald-50 text-emerald-800 font-medium";
  if (color === "gold") return "bg-amber-50 text-amber-800 font-medium";
  if (color === "red") return "bg-red-50 text-red-800";
  return "";
}

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen">
      <TopNav />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <Section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 pt-20 sm:pt-28 lg:pt-32">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Copy */}
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Home Appreciation Agreements
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[52px]">
                A new path for homeowners and buyers to structure home equity
                deals together.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                FractPath helps people negotiate Home Appreciation Agreements
                &mdash; flexible contracts tied to a home&apos;s future value,
                without a traditional loan.
              </p>
              <HeroCta />

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
                {TRUST_ITEMS.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/media/image 1 (1).png"
                alt="Modern residential home representing a flexible path to home equity and ownership"
                className="w-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/4"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.15), transparent)",
                }}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── HEA EDUCATION ─────────────────────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <PageHeader
            eyebrow="What is an HEA?"
            title="A different kind of agreement."
            subtitle="A Home Appreciation Agreement is a contract tied to a home's future value — not a mortgage, HELOC, or second loan."
          />
          <p className="mx-auto -mt-4 mb-10 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:mb-12">
            The homeowner receives capital today. The buyer receives a defined
            share of future appreciation and a potential first opportunity to
            purchase later.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {HEA_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border bg-background p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <Section>
        <Container>
          <PageHeader
            title="A different model than traditional financing."
            subtitle="See how a FractPath HEA compares with familiar home-financing alternatives."
          />
          <div className="overflow-x-auto rounded-2xl border shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-[140px] bg-muted/80 px-4 py-3 text-left font-semibold text-foreground backdrop-blur-sm">
                    Feature
                  </th>
                  <th className="sticky left-[140px] z-20 min-w-[130px] bg-foreground px-4 py-3 text-left font-semibold text-background">
                    FractPath HEA
                  </th>
                  <th className="min-w-[120px] bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                    Mortgage refinance
                  </th>
                  <th className="min-w-[100px] bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                    HELOC
                  </th>
                  <th className="min-w-[120px] bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                    Second mortgage
                  </th>
                  <th className="min-w-[130px] bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                    Reverse mortgage
                  </th>
                  <th className="min-w-[110px] bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                    Rent-to-own
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <td className="sticky left-0 z-10 min-w-[140px] border-t bg-background px-4 py-3 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td
                      className={`sticky left-[140px] z-10 min-w-[130px] border-t px-4 py-3 ${stoplightClass(row.fractpathColor)} bg-emerald-50/60`}
                    >
                      {row.fractpath}
                    </td>
                    <td className="min-w-[120px] border-t px-4 py-3 text-muted-foreground">
                      {row.mortgage}
                    </td>
                    <td className="min-w-[100px] border-t px-4 py-3 text-muted-foreground">
                      {row.heloc}
                    </td>
                    <td className="min-w-[120px] border-t px-4 py-3 text-muted-foreground">
                      {row.second}
                    </td>
                    <td className="min-w-[130px] border-t px-4 py-3 text-muted-foreground">
                      {row.reverse}
                    </td>
                    <td className="min-w-[110px] border-t px-4 py-3 text-muted-foreground">
                      {row.rto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Comparison is for general education only. Terms vary. FractPath is
            not a lender and does not provide financial, legal, or investment
            advice.
          </p>
        </Container>
      </Section>

      {/* ── VALUE PROP / AUDIENCE SECTION ────────────────────────────── */}
      <Section className="bg-muted/30">
        <Container>
          <PageHeader
            title="A better deal conversation for both sides."
            subtitle="FractPath helps homeowners and buyers explore options before a traditional sale or loan becomes the only path."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Homeowner card */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="overflow-hidden" style={{ aspectRatio: "4/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/media/ChatGPT Image Apr 30, 2026, 08_12_15 AM (2).png"
                  alt="Homeowner relaxing in a bright living room while reviewing flexible home equity options"
                  className="h-full w-full object-cover"
                  style={{ filter: "saturate(0.85)" }}
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1 text-xl font-bold">For Homeowners</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Unlock flexibility without defaulting to a standard loan.
                </p>
                <ul className="space-y-2">
                  {HOMEOWNER_BULLETS.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Buyer card */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="overflow-hidden" style={{ aspectRatio: "4/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/media/ChatGPT Image Apr 30, 2026, 08_12_15 AM (1).png"
                  alt="Prospective homebuyers reviewing a future home opportunity together"
                  className="h-full w-full object-cover"
                  style={{ filter: "saturate(0.85)" }}
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1 text-xl font-bold">For Buyers</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a path before a full purchase is possible.
                </p>
                <ul className="space-y-2">
                  {BUYER_BULLETS.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── CALCULATOR ───────────────────────────────────────────────── */}
      <div>
        <Section className="pb-0">
          <Container>
            <PageHeader
              title="Model a scenario before you register."
              subtitle="Use the calculator to explore how a FractPath HEA could work. Save your scenario when you're ready to continue."
            />
          </Container>
        </Section>
        <PersonaPageContent />
      </div>

      {/* ── PRODUCT EXPERIENCE ───────────────────────────────────────── */}
      <Section id="product-section" className="bg-muted/30">
        <Container>
          <PageHeader
            title="Built for real deals, not just estimates."
            subtitle="FractPath guides the workflow from discovery to offer, negotiation, and closing support."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {PRODUCT_STEPS.map((step) => (
              <div
                key={step.title}
                className="group overflow-hidden rounded-[20px] border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-4 pb-0">
                  <div className="overflow-hidden rounded-xl bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-auto w-full object-contain"
                      style={{ maxHeight: "240px" }}
                    />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-1 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── TRUST SECTION ────────────────────────────────────────────── */}
      <Section>
        <Container>
          <PageHeader
            title="Transparent by design."
            subtitle="FractPath is designed to make agreement terms easier to understand, document, and review."
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border bg-background p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border bg-muted/50 p-6 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              FractPath provides software and workflow tools. It is not a
              lender, mortgage broker, financial advisor, or legal advisor.
            </p>
          </div>
        </Container>
      </Section>

      {/* ── REALTOR SECTION ──────────────────────────────────────────── */}
      <Section id="realtor-section" className="bg-muted/30">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <PageHeader
              eyebrow="For Realtors"
              title="Realtors: bring clients another path forward."
              subtitle="Use FractPath to engage homeowners before they list and buyers before the right home comes to market."
            />
            <p className="mx-auto -mt-4 mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
              FractPath gives realtors a way to start structured equity
              conversations with clients who may not be ready for a traditional
              sale, purchase, or loan.
            </p>
            <ul className="mb-10 space-y-3 text-left">
              {REALTOR_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <RealtorBetaForm />
        </Container>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Section id="faq">
        <Container>
          <PageHeader
            eyebrow="FAQ"
            title="Common Questions"
          />
          <FaqAccordion />
        </Container>
      </Section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <Section className="bg-foreground text-background">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore a new path forward.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
              Create a free account to view verified properties, upload your
              property, or continue a deal scenario.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <GenericRegisterButton className="inline-flex h-11 items-center justify-center rounded-md bg-background px-6 text-sm font-semibold text-foreground shadow transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Register
              </GenericRegisterButton>
              <a
                href="#calculator"
                className="inline-flex h-11 items-center justify-center rounded-md border border-background/30 px-6 text-sm font-semibold text-background transition-colors hover:bg-background/10"
              >
                Model a Scenario
              </a>
              <a
                href="#realtor-section"
                className="text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                Realtor? Request a consultation →
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
