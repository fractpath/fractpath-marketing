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

  // v11 deal_terms shape — widget is the canonical source.
  // Marketing transports these; does not reconstruct them.
  export type FullDealTermsV11 = {
    property_value: number;
    upfront_payment: number;
    monthly_payment: number;
    number_of_payments: number;
    contract_maturity_years: number;
    servicing_fee_monthly?: number;
    // v11 fee fields
    setup_fee_pct?: number;
    setup_fee_floor?: number;
    setup_fee_cap?: number;
    payment_admin_fee?: number;
    exit_admin_fee_amount?: number;
    // v11 timeline / exit window
    target_exit_year?: number;
    target_exit_window_start_year?: number;
    target_exit_window_end_year?: number;
    long_stop_year?: number;
    first_extension_start_year?: number;
    first_extension_end_year?: number;
    first_extension_premium_pct?: number;
    second_extension_start_year?: number;
    second_extension_end_year?: number;
    second_extension_premium_pct?: number;
    // v11 partial buyout
    partial_buyout_allowed?: boolean;
    partial_buyout_min_fraction?: number;
    partial_buyout_increment_fraction?: number;
    // v11 buyer purchase option
    buyer_purchase_option_enabled?: boolean;
    buyer_purchase_notice_days?: number;
    buyer_purchase_closing_days?: number;
    // allow any extra fields the widget adds
    [key: string]: unknown;
  };

  // v11 result shape
  export type DealResultsV11 = {
    // core funding
    total_scheduled_buyer_funding?: number;
    actual_buyer_funding_to_date?: number;
    funding_completion_factor?: number;
    // appreciation share
    scheduled_buyer_appreciation_share?: number;
    effective_buyer_appreciation_share?: number;
    buyer_base_capital_component?: number;
    buyer_appreciation_claim?: number;
    // contract / participation value
    current_contract_value?: number;
    current_participation_value?: number;
    // buyout amounts
    base_buyout_amount?: number;
    extension_adjusted_buyout_amount?: number;
    partial_buyout_amount_25?: number;
    partial_buyout_amount_50?: number;
    partial_buyout_amount_75?: number;
    discount_purchase_price?: number;
    // window / status
    current_window?: string;
    // revenue
    fractpath_setup_fee_amount?: number;
    fractpath_revenue_to_date?: number;
    realtor_fee_total_projected?: number;
    // versioning
    compute_version?: string;
    // legacy — present in some widget versions
    isa_settlement?: number;
    [key: string]: unknown;
  };

  export type FullDealSnapshotV1 = {
    contract_version: string;
    schema_version: string;
    deal_terms: FullDealTermsV11;
    assumptions: { annual_appreciation: number; exit_year?: number; closing_cost_pct?: number; [key: string]: unknown };
    outputs: DealResultsV11;
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

  // Additional exports available in newer widget builds
  export const EquityChart: ComponentType<{ data?: unknown; [key: string]: unknown }>;
  export function buildDraftSnapshot(inputs: unknown): DraftSnapshot;
  export function buildSavePayload(inputs: unknown): unknown;
  export function buildShareSummary(inputs: unknown): ShareSummary;
  export function computeScenario(inputs: unknown): unknown;
  export function normalizeInputs(inputs: unknown): unknown;
  export function deterministicHash(data: unknown): string;
  export function buildChartSeries(data: unknown): unknown;
}
