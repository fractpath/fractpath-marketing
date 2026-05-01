import { Container, TopNav, Footer } from "@/components/ui-kit";
import { HeroCta } from "@/components/hero-cta";
import { PersonaPageContent } from "@/components/persona-page-content";
import { RealtorBetaForm } from "@/components/realtor-beta-form";
import { FaqAccordion } from "@/components/faq-accordion";
import { GenericRegisterButton } from "@/components/generic-register-modal";
import { ScrollFade } from "@/components/scroll-fade";
import { Ban, RefreshCw, TrendingUp } from "lucide-react";

/* ─── Data ────────────────────────────────────────────────────────────── */

const TRUST_ITEMS = [
  "Not a lender",
  "Open negotiation platform",
  "Guided deal workflow",
  "Licensed closing partners",
];

const HEA_HIGHLIGHTS = [
  {
    icon: Ban,
    label: "No interest",
    body: "No compounding loan balance.",
  },
  {
    icon: RefreshCw,
    label: "Flexible terms",
    body: "Value sharing, timing, and exit are agreed upfront.",
  },
  {
    icon: TrendingUp,
    label: "Shared future value",
    body: "Settled through buyout, sale, refinance, or agreed exit.",
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
    feature: "Cash today",
    fractpath: "✔  Yes",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Yes",
    rto: "✕  No",
    fractpathColor: "green",
  },

  {
    feature: "Monthly interest",
    fractpath: "✔  No",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Fees / interest",
    rto: "Varies",
    fractpathColor: "green",
  },
  {
    feature: "Owner stays in home",
    fractpath: "✔  Yes",
    mortgage: "Yes",
    heloc: "Yes",
    second: "Yes",
    reverse: "Yes",
    rto: "✕  No",
    fractpathColor: "green",
  },
  {
    feature: "Buyer participates",
    fractpath: "✔  Yes",
    mortgage: "✕  No",
    heloc: "✕  No",
    second: "✕  No",
    reverse: "✕  No",
    rto: "Yes",
    fractpathColor: "green",
  },
  {
    feature: "Negotiated terms",
    fractpath: "✔  Yes",
    mortgage: "–  Limited",
    heloc: "–  Limited",
    second: "–  Limited",
    reverse: "–  Limited",
    rto: "Often",
    fractpathColor: "green",
  },
  {
    feature: "Path to ownership",
    fractpath: "✔  Yes",
    mortgage: "✕  No",
    heloc: "✕  No",
    second: "✕  No",
    reverse: "✕  No",
    rto: "Yes",
    fractpathColor: "green",
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

const TRUST_ITEMS_SECTION = [
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

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function comparisonCellClass(feature: string, value: string): string {
  const normalized = value.toLowerCase();
  const downsideRows = ["Monthly interest"];

  if (feature === "Best fit") {
    return "bg-white text-[#18181B]";
  }

  if (downsideRows.includes(feature)) {
    if (normalized.includes("no") || normalized.includes("flexible")) {
      return "bg-green-50 text-[#16A34A] font-semibold";
    }

    if (
      normalized.includes("usually") ||
      normalized.includes("often") ||
      normalized.includes("varies") ||
      normalized.includes("fees")
    ) {
      return "bg-yellow-50 text-[#CA8A04] font-semibold";
    }

    return "bg-red-50 text-[#DC2626] font-semibold";
  }

  if (normalized.includes("yes")) {
    return "bg-green-50 text-[#16A34A] font-semibold";
  }

  if (
    normalized.includes("possible") ||
    normalized.includes("limited") ||
    normalized.includes("often") ||
    normalized.includes("usually") ||
    normalized.includes("varies")
  ) {
    return "bg-yellow-50 text-[#CA8A04] font-semibold";
  }

  if (normalized.includes("no")) {
    return "bg-red-50 text-[#DC2626] font-semibold";
  }

  return "bg-white text-[#71717A]";
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-white">
      <TopNav />

    <section className="relative overflow-hidden bg-white" style={{ minHeight: "600px" }}>
      <div className="absolute inset-0">
        <img
          src="/brand/media/hero-home-gradient.png"
          alt="Modern residential home representing a flexible path to home equity and ownership"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/78 lg:bg-white/0" />
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-white via-white/90 to-transparent" />
      </div>

      <div className="relative z-10">
        <Container>
          <div className="py-24 lg:py-36" style={{ maxWidth: "560px" }}>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CA8A04]">
              Home Appreciation Agreements
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-[#18181B] sm:text-5xl lg:text-[56px]">
              A new path for homeowners and buyers to structure home equity deals together.
            </h1>
            <p className="mt-6 max-w-[520px] text-lg leading-[1.6] text-[#71717A]">
              FractPath helps people negotiate Home Appreciation Agreements &mdash; flexible contracts tied to a home&apos;s future value, without a traditional loan.
            </p>
            <HeroCta />

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-[#18181B]">
                  <span style={{ color: "#16A34A" }}>✔</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>

      {/* ── 2. MERGED HEA + TABLE ─ neutral-50 ────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: "#FAFAFA" }}>
        <Container>
          {/* Section heading */}
          <div className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#71717A]">
              What is an HEA?
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
              A different model than traditional financing.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#71717A]">
              A Home Appreciation Agreement is tied to a home&apos;s future
              value &mdash; not a mortgage, HELOC, or second loan. The homeowner
              receives capital today; the buyer receives a defined share of
              future appreciation.
            </p>
          </div>

          {/* Inline feature highlights — no cards */}
          <div className="mb-14 flex flex-col gap-8 sm:flex-row sm:gap-14">
            {HEA_HIGHLIGHTS.map(({ icon: Icon, label, body }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#18181B]">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#18181B]">{label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#71717A]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-30 w-[115px] min-w-[115px] bg-[#F4F4F5] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                    Feature
                  </th><th className="sticky left-[117px] z-30 min-w-[115px] bg-[#18181B] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white">
                    FractPath HEA
                  </th>
                  <th className="min-w-[140px] bg-[#F4F4F5] px-5 py-4 text-left text-xs font-medium text-[#71717A]">
                    Mortgage refi
                  </th>
                  <th className="min-w-[112px] bg-[#F4F4F5] px-5 py-4 text-left text-xs font-medium text-[#71717A]">
                    HELOC
                  </th>
                  <th className="min-w-[115px] bg-[#F4F4F5] px-5 py-4 text-left text-xs font-medium text-[#71717A]">
                    2nd mortgage
                  </th>
                  <th className="min-w-[148px] bg-[#F4F4F5] px-5 py-4 text-left text-xs font-medium text-[#71717A]">
                    Reverse mortgage
                  </th>
                  <th className="min-w-[124px] bg-[#F4F4F5] px-5 py-4 text-left text-xs font-medium text-[#71717A]">
                    Rent-to-own
                  </th>
                </tr>
              </thead>

              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td className="sticky left-0 z-20 w-[115px] min-w-[115px] border-t border-[#E4E4E7] bg-white px-4 py-3.5 font-medium text-[#18181B]">
                      {row.feature}
                    </td>

                    <td
                      className={`sticky left-[117px] z-20 min-w-[115px] border-t border-[#E4E4E7] px-4 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.fractpath,
                      )}`}
                    >
                      {row.fractpath}
                    </td>

                    <td
                      className={`min-w-[140px] border-t border-[#E4E4E7] px-5 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.mortgage,
                      )}`}
                    >
                      {row.mortgage}
                    </td>

                    <td
                      className={`min-w-[112px] border-t border-[#E4E4E7] px-5 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.heloc,
                      )}`}
                    >
                      {row.heloc}
                    </td>

                    <td
                      className={`min-w-[115px] border-t border-[#E4E4E7] px-5 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.second,
                      )}`}
                    >
                      {row.second}
                    </td>

                    <td
                      className={`min-w-[148px] border-t border-[#E4E4E7] px-5 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.reverse,
                      )}`}
                    >
                      {row.reverse}
                    </td>

                    <td
                      className={`min-w-[124px] border-t border-[#E4E4E7] px-5 py-3.5 ${comparisonCellClass(
                        row.feature,
                        row.rto,
                      )}`}
                    >
                      {row.rto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[#A1A1AA]">
            Comparison is for general education only. Terms vary. FractPath is
            not a lender and does not provide financial, legal, or investment
            advice.
          </p>
        </Container>
      </section>

      {/* ── 3. AUDIENCE SECTION ─ white ────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
              A better path for homeowners and buyers.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#71717A]">
              FractPath helps homeowners and buyers explore options before a
              traditional sale or loan becomes the only path.
            </p>
          </div>

          <div className="space-y-20">
            {/* Homeowner — image left, text right */}
            <ScrollFade>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
                <div className="w-full lg:w-[60%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/media/homeowner-emotional.png"
                    alt="Homeowner struggling to finance their bills"
                    className="w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                    style={{
                      aspectRatio: "4/3",
                      borderRadius: "16px",
                      filter: "saturate(0.88)",
                    }}
                  />
                </div>
                <div className="w-full lg:w-[40%]">
                  <h3 className="text-2xl font-bold tracking-[-0.015em] text-[#18181B]">
                    For Homeowners
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#71717A]">
                    Unlock flexibility without defaulting to a standard loan.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {HOMEOWNER_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-[#18181B]"
                      >
                        <span
                          className="mt-0.5 shrink-0 font-bold"
                          style={{ color: "#16A34A" }}
                          aria-hidden="true"
                        >
                          ✔
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollFade>

            {/* Buyer — image right, text left */}
            <ScrollFade delay={80}>
              <div className="flex flex-col gap-10 lg:flex-row-reverse lg:items-center lg:gap-16">
                <div className="w-full lg:w-[60%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/media/buyer-emotional.png"
                    alt="Prospective homebuyers struggling to afford rising home costs"
                    className="w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                    style={{
                      aspectRatio: "4/3",
                      borderRadius: "16px",
                      filter: "saturate(0.88)",
                    }}
                  />
                </div>
                <div className="w-full lg:w-[40%]">
                  <h3 className="text-2xl font-bold tracking-[-0.015em] text-[#18181B]">
                    For Buyers
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#71717A]">
                    Create a path before a full purchase is possible.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {BUYER_BULLETS.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-[#18181B]"
                      >
                        <span
                          className="mt-0.5 shrink-0 font-bold"
                          style={{ color: "#16A34A" }}
                          aria-hidden="true"
                        >
                          ✔
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollFade>
          </div>
        </Container>
      </section>

      {/* ── 4. CALCULATOR ─ neutral-50 ─────────────────────────────────── */}
    <section
      id="calculator"
      className="pt-20 sm:pt-28"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      <PersonaPageContent />
    </section>

      {/* ── 5. PRODUCT SECTION ─ white ─────────────────────────────────── */}
      <section id="product-section" className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="mb-14">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
              Built for real deals, not just estimates.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#71717A]">
              FractPath guides the workflow from discovery to offer,
              negotiation, and closing support.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {PRODUCT_STEPS.map((step, i) => (
              <ScrollFade key={step.title} delay={i * 80}>
                <div className="group h-full overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                      <div className="overflow-hidden bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 text-base font-semibold text-[#18181B]">
                      {i + 1}. {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#71717A]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 6. TRUST SECTION ─ neutral-50 ──────────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <Container>
          <div className="mb-14">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
              Transparent by design.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#71717A]">
              FractPath is designed to make agreement terms easier to
              understand, document, and review.
            </p>
          </div>

          {/* Borderless layout — Tier 1 (pure layout, no cards) */}
          <div className="grid gap-10 sm:grid-cols-3">
            {TRUST_ITEMS_SECTION.map((item) => (
              <div key={item.title}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F4F5] text-[#18181B]">
                  {item.title === "Clear terms" && "📄"}
                  {item.title === "Manual review" && "🔍"}
                  {item.title === "Partner-supported" && "🤝"}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#18181B]">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[#71717A]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-14 text-xs leading-relaxed text-[#A1A1AA]">
            FractPath provides software and workflow tools. It is not a lender,
            mortgage broker, financial advisor, or legal advisor.
          </p>
        </Container>
      </section>

      {/* ── 7. REALTOR SECTION ─ white ─────────────────────────────────── */}
      <section id="realtor-section" className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
            {/* Left: text block */}
            <div className="w-full lg:w-1/2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                For Realtors
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
                Realtors: bring clients another path forward.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#71717A]">
                Use FractPath to engage homeowners before they list and buyers
                before the right home comes to market. FractPath gives realtors
                a way to start structured equity conversations with clients who
                may not be ready for a traditional sale, purchase, or loan.
              </p>
              <ul className="mt-8 space-y-4">
                {REALTOR_BULLETS.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-[#18181B]"
                  >
                    <span
                      className="mt-0.5 shrink-0 font-bold"
                      style={{ color: "#16A34A" }}
                      aria-hidden="true"
                    >
                      ✔
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: form */}
            <div className="w-full lg:w-1/2">
              <RealtorBetaForm />
            </div>
          </div>
        </Container>
      </section>

      {/* ── 8. FAQ ─ neutral-50 ────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-28" style={{ backgroundColor: "#FAFAFA" }}>
        <Container>
          <div className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#71717A]">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#18181B] sm:text-4xl">
              Common questions
            </h2>
          </div>
          <FaqAccordion />
        </Container>
      </section>

      {/* ── 9. FINAL CTA ─ black ───────────────────────────────────────── */}
      <section
        className="py-28 sm:py-36"
        style={{ backgroundColor: "#000000" }}
      >
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl lg:text-[56px]"
            >
              Explore a new path forward.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60">
              Create a free account to view verified properties, upload your
              property, or continue a deal scenario.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GenericRegisterButton className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-[#18181B] shadow transition-all duration-150 hover:scale-[1.02] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Register
              </GenericRegisterButton>
              <a
                href="#calculator"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 px-8 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:border-white/50 hover:bg-white/5"
              >
                Model a Scenario
              </a>
            </div>
            <a
              href="#realtor-section"
              className="mt-6 inline-block text-sm font-medium text-white/50 transition-colors hover:text-white/80"
            >
              Realtor? Request a consultation →
            </a>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
