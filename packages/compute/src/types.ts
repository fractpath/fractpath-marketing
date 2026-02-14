export type DownsideMode = "HARD_FLOOR" | "NO_FLOOR";

export interface DealTerms {
  contract_version: string;
  schema_version: string;
  iba_usd: number;
  floor_multiple: number;
  ceiling_multiple: number;
  downside_mode: DownsideMode;
  timing_factor_gain_only: true;
  maturity_months: number;
  notes?: string;
}

export interface ScenarioAssumptions {
  start_fmv_usd: number;
  end_fmv_usd: number;
  months_held: number;
  sale_cost_rate?: number;
}

export interface DealOutputs {
  investor_settlement_usd: number;
  investor_multiple: number;
  investor_profit_usd: number;
  monthly_irr: number;
  annual_irr: number;
  floor_applied: boolean;
  ceiling_applied: boolean;
  timing_factor_effective: number;
}

export interface DealSnapshot {
  compute_version: string;
  computed_at: string;
  inputs: DealTerms;
  assumptions: ScenarioAssumptions;
  outputs: DealOutputs;
}

export type DealResults = DealSnapshot;
