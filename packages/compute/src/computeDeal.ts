import type { DealTerms, ScenarioAssumptions, DealSnapshot } from "./types.js";
import { roundMoney, roundRate, clamp } from "./rounding.js";
import { irrMonthlySingleOutflowInflow, annualizeMonthly } from "./irr.js";
import { COMPUTE_VERSION } from "./version.js";

export function computeDeal(
  terms: DealTerms,
  assumptions: ScenarioAssumptions,
  nowIso: string,
): DealSnapshot {
  if (!nowIso || typeof nowIso !== "string" || nowIso.trim().length < 10) {
    throw new Error("nowIso is required for deterministic compute");
  }

  const {
    iba_usd,
    floor_multiple,
    ceiling_multiple,
    downside_mode,
    maturity_months,
  } = terms;

  const {
    start_fmv_usd,
    end_fmv_usd,
    months_held,
    sale_cost_rate = 0,
  } = assumptions;

  if (start_fmv_usd <= 0) {
    throw new Error("start_fmv_usd must be > 0");
  }
  if (months_held <= 0) {
    throw new Error("months_held must be > 0");
  }
  if (iba_usd <= 0) {
    throw new Error("iba_usd must be > 0");
  }

  const ratio = end_fmv_usd / start_fmv_usd;

  const tf_eff = roundRate(clamp(months_held / maturity_months, 0, 1));

  let adj_multiple: number;
  if (ratio >= 1) {
    const gain = ratio - 1;
    adj_multiple = 1 + gain * tf_eff;
  } else {
    adj_multiple = ratio;
  }

  let ceiling_applied = false;
  if (adj_multiple > ceiling_multiple) {
    adj_multiple = ceiling_multiple;
    ceiling_applied = true;
  }

  let floor_applied = false;
  if (downside_mode === "HARD_FLOOR" && adj_multiple < floor_multiple) {
    adj_multiple = floor_multiple;
    floor_applied = true;
  }

  adj_multiple = roundRate(adj_multiple);

  const gross_settlement = iba_usd * adj_multiple;
  const sale_costs = gross_settlement * sale_cost_rate;
  const investor_settlement_usd = roundMoney(gross_settlement - sale_costs);
  const investor_profit_usd = roundMoney(investor_settlement_usd - iba_usd);
  const investor_multiple = roundRate(investor_settlement_usd / iba_usd);

  const monthly_irr = irrMonthlySingleOutflowInflow(
    iba_usd,
    investor_settlement_usd,
    months_held,
  );
  const annual_irr = annualizeMonthly(monthly_irr);

  return {
    compute_version: COMPUTE_VERSION,
    computed_at: nowIso,
    inputs: {
      deal_terms: terms,
      scenario: assumptions,
    },
    outputs: {
      results: {
        // Canonical KPI names expected by app
        isa_settlement: investor_settlement_usd,
        investor_multiple,
        investor_profit_usd,
        investor_irr_annual: annual_irr,

        // Keep detailed metrics (can expand UI later)
        monthly_irr,
        floor_applied,
        ceiling_applied,
        timing_factor_effective: tf_eff,
      },
    },
  };
}
