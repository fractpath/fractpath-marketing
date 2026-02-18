declare module "fractpath-calculator-widget" {
  import type { ComponentType } from "react";

  export type CalculatorPersona = "homeowner" | "buyer" | "realtor" | "investor" | "ops";
  export type CalculatorMode = "marketing" | "app";

  export type DraftSnapshotInputs = {
    homeValue: number;
    initialBuyAmount: number;
    termYears: number;
    annualGrowthRate: number;
  };

  export type DraftSnapshotBasicResults = {
    standard_net_payout: number;
    early_net_payout: number;
    late_net_payout: number;
    standard_settlement_month: number;
    early_settlement_month: number;
    late_settlement_month: number;
  };

  export type DraftSnapshot = {
    contract_version: string;
    schema_version: string;
    persona: CalculatorPersona;
    mode: "marketing";
    inputs: DraftSnapshotInputs;
    basic_results: DraftSnapshotBasicResults;
    input_hash: string;
    output_hash: string;
    created_at: string;
  };

  export type FullDealSnapshotV1 = {
    contract_version: string;
    schema_version: string;
    deal_terms: {
      property_value: number;
      upfront_payment: number;
      monthly_payment: number;
      number_of_payments: number;
      floor_multiple: number;
      ceiling_multiple: number;
      downside_mode: string;
      contract_maturity_years: number;
      liquidity_trigger_year: number;
      minimum_hold_years: number;
      platform_fee: number;
      servicing_fee_monthly: number;
      exit_fee_pct: number;
    };
    assumptions: { annual_appreciation: number };
    outputs: unknown;
    now_iso: string;
    created_at: string;
  };

  export type ShareSummaryBasicResults = {
    standard_net_payout: number;
    early_net_payout: number;
    late_net_payout: number;
  };

  export type ShareSummary = {
    contract_version: string;
    schema_version: string;
    persona: CalculatorPersona;
    inputs: DraftSnapshotInputs;
    basic_results: ShareSummaryBasicResults;
    created_at: string;
  };

  export type WidgetEvent =
    | { type: "calculator_used"; persona: CalculatorPersona }
    | { type: "share_clicked"; persona: CalculatorPersona }
    | { type: "save_continue_clicked"; persona: CalculatorPersona }
    | { type: "save_clicked"; persona: CalculatorPersona };

  export type FractPathCalculatorWidgetProps = {
    persona: CalculatorPersona;
    mode?: CalculatorMode;
    initialSnapshot?: FullDealSnapshotV1 | null;
    onDraftSnapshot?: (snapshot: DraftSnapshot | FullDealSnapshotV1) => void;
    onShareSummary?: (summary: ShareSummary) => void;
    onEvent?: (event: WidgetEvent) => void;
  };

  export const CONTRACT_VERSION: string;
  export const SCHEMA_VERSION: string;

  export const FractPathCalculatorWidget: ComponentType<FractPathCalculatorWidgetProps>;
}
