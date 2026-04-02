// Canonical transport mapper — v11
//
// Marketing is a transport/embed consumer only, not a compute authority.
// If the widget snapshot already contains canonical deal_terms and outputs,
// transport those directly without reconstruction.
//
// This mapper handles minimal input validation and produces a lightweight
// transport payload for the draft mint API.

export interface CanonicalDealTerms {
  property_value: number;
  upfront_payment: number;
  monthly_payment: number;
  number_of_payments: number;
  contract_maturity_years: number;
  servicing_fee_monthly?: number;
  // v11 fee fields (present when widget emits them)
  setup_fee_pct?: number;
  setup_fee_floor?: number;
  setup_fee_cap?: number;
  payment_admin_fee?: number;
  exit_admin_fee_amount?: number;
  // v11 timeline fields
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
}

export interface CanonicalScenarioAssumptions {
  annual_appreciation: number;
  closing_cost_pct: number;
  exit_year: number;
  fmv_override?: number;
}

export interface CanonicalInputs {
  deal_terms: CanonicalDealTerms;
  scenario: CanonicalScenarioAssumptions;
}

export interface MapperError {
  ok: false;
  field: string;
  message: string;
}

export interface MapperSuccess {
  ok: true;
  data: CanonicalInputs;
}

export type MapperResult = MapperSuccess | MapperError;

// Minimal transport defaults — not the compute engine's authority.
// Only fields used for transport payload when widget inputs are the source.
export const DEAL_TERMS_DEFAULTS = {
  monthly_payment: 0,
  number_of_payments: 0,
  contract_maturity_years: 5,
  servicing_fee_monthly: 0,
} as const;

export const SCENARIO_DEFAULTS = {
  closing_cost_pct: 0,
  exit_year: 5,
} as const;

export interface WidgetInputs {
  homeValue: number;
  initialBuyAmount: number;
  termYears: number;
  annualGrowthRate: number;
}

function finitePositive(v: unknown, field: string): MapperError | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
    return {
      ok: false,
      field,
      message: `${field} must be a finite positive number`,
    };
  }
  return null;
}

export function mapWidgetInputsToCanonical(inputs: WidgetInputs): MapperResult {
  let err: MapperError | null;

  err = finitePositive(inputs.homeValue, "homeValue");
  if (err) return err;

  err = finitePositive(inputs.initialBuyAmount, "initialBuyAmount");
  if (err) return err;

  err = finitePositive(inputs.termYears, "termYears");
  if (err) return err;

  if (
    typeof inputs.annualGrowthRate !== "number" ||
    !Number.isFinite(inputs.annualGrowthRate)
  ) {
    return {
      ok: false,
      field: "annualGrowthRate",
      message: "annualGrowthRate must be a finite number",
    };
  }

  const deal_terms: CanonicalDealTerms = {
    property_value: inputs.homeValue,
    upfront_payment: inputs.initialBuyAmount,
    monthly_payment: DEAL_TERMS_DEFAULTS.monthly_payment,
    number_of_payments: DEAL_TERMS_DEFAULTS.number_of_payments,
    contract_maturity_years: inputs.termYears,
    servicing_fee_monthly: DEAL_TERMS_DEFAULTS.servicing_fee_monthly,
  };

  const scenario: CanonicalScenarioAssumptions = {
    annual_appreciation: inputs.annualGrowthRate / 100,
    closing_cost_pct: SCENARIO_DEFAULTS.closing_cost_pct,
    exit_year: inputs.termYears,
  };

  return { ok: true, data: { deal_terms, scenario } };
}

/** @deprecated Use mapWidgetInputsToCanonical. Kept for legacy call-sites. */
export function extractDealTermsDefaultsUsed(): Record<string, unknown> {
  return {
    contract_maturity_years: DEAL_TERMS_DEFAULTS.contract_maturity_years,
    source: "canonical_mapper_v11",
  };
}
