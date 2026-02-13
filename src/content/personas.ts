export type PersonaKey = "homeowner" | "buyer" | "realtor";

export type PersonaContent = {
  key: PersonaKey;
  navLabel: string;

  hero: {
    eyebrow?: string;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };

  valueProps: Array<{
    title: string;
    body: string;
  }>;

  calculator: {
    title: string;
    description: string;
  };

  trust: {
    bullets: string[];
  };
};

export const PERSONAS: PersonaKey[] = ["homeowner", "buyer", "realtor"];

export const personaContent: Record<PersonaKey, PersonaContent> = {
  homeowner: {
    key: "homeowner",
    navLabel: "Homeowner",
    hero: {
      eyebrow: "Scenario Modeling for Homeowners",
      headline: "Access Your Equity Without Debt",
      subheadline:
        "Model cash-out scenarios while retaining ownership. See how fractional equity could work for your property — all estimates, no obligations.",
      primaryCtaLabel: "See Your Options",
      secondaryCtaLabel: "Join Beta",
    },
    valueProps: [
      {
        title: "No Loans Required",
        body: "Access a portion of your home equity without taking on debt, monthly payments, or interest charges.",
      },
      {
        title: "Retain Ownership",
        body: "Stay in your home and maintain control. Model how partial equity sales affect your long-term position.",
      },
      {
        title: "Transparent Timing",
        body: "See estimated buyback windows and settlement scenarios upfront — no surprises, no hidden terms.",
      },
    ],
    calculator: {
      title: "Model Your Equity Scenario",
      description:
        "Enter your property details to see estimated equity scenarios. All outputs are for informational purposes only.",
    },
    trust: {
      bullets: [
        "No hidden fees — all terms disclosed upfront in every scenario.",
        "All agreements executed through vetted legal processes.",
        "Every calculation is deterministic and reproducible.",
      ],
    },
  },

  buyer: {
    key: "buyer",
    navLabel: "Buyer",
    hero: {
      eyebrow: "Scenario Modeling for Buyers",
      headline: "Build Equity Over Time",
      subheadline:
        "Model how monthly contributions can build ownership in a property. See projected equity growth and payoff scenarios — estimates only.",
      primaryCtaLabel: "See Your Path",
      secondaryCtaLabel: "Join Beta",
    },
    valueProps: [
      {
        title: "Start With Less",
        body: "Begin building equity with an initial contribution rather than a full down payment. Model your path to ownership.",
      },
      {
        title: "Projected Growth",
        body: "See how monthly contributions and market appreciation could grow your equity stake over time.",
      },
      {
        title: "Clear Milestones",
        body: "Understand estimated timelines for reaching ownership milestones and potential buyout scenarios.",
      },
    ],
    calculator: {
      title: "Model Your Ownership Path",
      description:
        "Enter contribution details to see estimated equity growth. All outputs are for informational purposes only.",
    },
    trust: {
      bullets: [
        "Transparent contribution schedules with no hidden costs.",
        "All terms reviewed and executed through legal processes.",
        "Calculations are deterministic — verify every number.",
      ],
    },
  },

  realtor: {
    key: "realtor",
    navLabel: "Realtor",
    hero: {
      eyebrow: "Scenario Modeling for Realtors",
      headline: "A New Referral Model",
      subheadline:
        "Model potential referral commissions through fractional equity transactions. See projected earnings and client scenarios — estimates only.",
      primaryCtaLabel: "See Referral Scenarios",
      secondaryCtaLabel: "Join Beta",
    },
    valueProps: [
      {
        title: "Referral Commissions",
        body: "Model projected referral fees from connecting homeowners and buyers through the FractPath platform.",
      },
      {
        title: "Client Retention",
        body: "Offer your clients a new option alongside traditional listings. Help them explore equity alternatives.",
      },
      {
        title: "Beta Access",
        body: "Join early to establish your referral pipeline. Priority support and early access to platform features.",
      },
    ],
    calculator: {
      title: "Model Referral Scenarios",
      description:
        "Enter property and referral details to see estimated commission scenarios. All outputs are for informational purposes only.",
    },
    trust: {
      bullets: [
        "Commission structures disclosed upfront — no surprises.",
        "All agreements comply with state regulatory frameworks.",
        "Transparent, reproducible calculations for client presentations.",
      ],
    },
  },
};
