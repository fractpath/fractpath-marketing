// Canonical compute authority:
// fractpath-calculator-widget/docs/contracts/CANONICAL_COMPUTE_CONTRACT_V10_1.md
//
// IMPORTANT:
// - Do NOT hardcode compute_version in marketing.
// - Marketing only maps + transports canonical inputs (snake_case).
// - The compute engine (widget/app) owns compute_version and outputs.

export type DownsideMode = "HARD_FLOOR" | "NO_FLOOR";

export interface CanonicalDealTerms {
  property_value: number;
  upfront_payment: number;
  monthly_payment: number;
  number_of_payments: number;
  payback_window_start_year: number;
  payback_window_end_year: number;
  timing_factor_early: number;
  timing_factor_late: number;
  floor_multiple: number;
  ceiling_multiple: number;
  downside_mode: DownsideMode;
  contract_maturity_years: number;
  liquidity_trigger_year: number;
  minimum_hold_years: number;
  platform_fee: number;
  servicing_fee_monthly: number;
  exit_fee_pct: number;
  duration_yield_floor_enabled: boolean;
  duration_yield_floor_start_year?: number;
  duration_yield_floor_min_multiple?: number;
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

// Marketing defaults only: these are NOT the compute engine outputs.
// Keep all defaults centralized here to prevent drift.
export const DEAL_TERMS_DEFAULTS = {
  monthly_payment: 0,
  number_of_payments: 0,
  payback_window_start_year: 3,
  payback_window_end_year: 7,
  timing_factor_early: 0.85,
  timing_factor_late: 1.15,
  floor_multiple: 0.8,
  ceiling_multiple: 2.0,
  downside_mode: "HARD_FLOOR" as DownsideMode,
  contract_maturity_years: 5,
  liquidity_trigger_year: 1,
  minimum_hold_years: 1,
  platform_fee: 0,
  servicing_fee_monthly: 0,
  exit_fee_pct: 0,
  duration_yield_floor_enabled: false,
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

export function mapWidgetInputsToCanonical(
  inputs: WidgetInputs,
  overrides?: {
    floor_multiple?: number;
    ceiling_multiple?: number;
  },
): MapperResult {
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

  const floor = overrides?.floor_multiple ?? DEAL_TERMS_DEFAULTS.floor_multiple;
  const ceiling =
    overrides?.ceiling_multiple ?? DEAL_TERMS_DEFAULTS.ceiling_multiple;

  err = finitePositive(floor, "floor_multiple");
  if (err) return err;

  err = finitePositive(ceiling, "ceiling_multiple");
  if (err) return err;

  if (floor > ceiling) {
    return {
      ok: false,
      field: "floor_multiple",
      message: "floor_multiple must not exceed ceiling_multiple",
    };
  }

  const deal_terms: CanonicalDealTerms = {
    property_value: inputs.homeValue,
    upfront_payment: inputs.initialBuyAmount,
    monthly_payment: DEAL_TERMS_DEFAULTS.monthly_payment,
    number_of_payments: DEAL_TERMS_DEFAULTS.number_of_payments,
    payback_window_start_year: DEAL_TERMS_DEFAULTS.payback_window_start_year,
    payback_window_end_year: DEAL_TERMS_DEFAULTS.payback_window_end_year,
    timing_factor_early: DEAL_TERMS_DEFAULTS.timing_factor_early,
    timing_factor_late: DEAL_TERMS_DEFAULTS.timing_factor_late,
    floor_multiple: floor,
    ceiling_multiple: ceiling,
    downside_mode: DEAL_TERMS_DEFAULTS.downside_mode,
    contract_maturity_years: inputs.termYears,
    liquidity_trigger_year: DEAL_TERMS_DEFAULTS.liquidity_trigger_year,
    minimum_hold_years: DEAL_TERMS_DEFAULTS.minimum_hold_years,
    platform_fee: DEAL_TERMS_DEFAULTS.platform_fee,
    servicing_fee_monthly: DEAL_TERMS_DEFAULTS.servicing_fee_monthly,
    exit_fee_pct: DEAL_TERMS_DEFAULTS.exit_fee_pct,
    duration_yield_floor_enabled:
      DEAL_TERMS_DEFAULTS.duration_yield_floor_enabled,
  };

  const scenario: CanonicalScenarioAssumptions = {
    annual_appreciation: inputs.annualGrowthRate / 100,
    closing_cost_pct: SCENARIO_DEFAULTS.closing_cost_pct,
    exit_year: inputs.termYears,
  };

  return { ok: true, data: { deal_terms, scenario } };
}

export function extractDealTermsDefaultsUsed(overrides?: {
  floor_multiple?: number;
  ceiling_multiple?: number;
}): Record<string, unknown> {
  return {
    floor_multiple:
      overrides?.floor_multiple ?? DEAL_TERMS_DEFAULTS.floor_multiple,
    ceiling_multiple:
      overrides?.ceiling_multiple ?? DEAL_TERMS_DEFAULTS.ceiling_multiple,
    downside_mode: DEAL_TERMS_DEFAULTS.downside_mode,
    contract_maturity_years: DEAL_TERMS_DEFAULTS.contract_maturity_years,
    source: "canonical_mapper_v10.1",
  };
}
