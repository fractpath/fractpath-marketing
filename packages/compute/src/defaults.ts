import type { DealTerms, DownsideMode } from "./types.js";

const ALLOWED_DOWNSIDE_MODES: ReadonlySet<DownsideMode> = new Set([
  "HARD_FLOOR",
  "NO_FLOOR",
]);

export function defaultDealTerms(
  required: {
    iba_usd: number;
    maturity_months: number;
  },
  overrides?: Partial<Omit<DealTerms, "iba_usd" | "maturity_months">>
): DealTerms {
  if (required.iba_usd <= 0) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: iba_usd must be > 0"
    );
  }
  if (required.maturity_months <= 0) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: maturity_months must be > 0"
    );
  }

  const contract_version = overrides?.contract_version ?? "fp-10";
  const schema_version = overrides?.schema_version ?? "10.0.0";
  const floor_multiple = overrides?.floor_multiple ?? 0.8;
  const ceiling_multiple = overrides?.ceiling_multiple ?? 2.0;
  const downside_mode: DownsideMode = overrides?.downside_mode ?? "HARD_FLOOR";
  const timing_factor_gain_only =
    overrides?.timing_factor_gain_only ?? true;
  const notes = overrides?.notes;

  if (floor_multiple <= 0) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: floor_multiple must be > 0"
    );
  }
  if (ceiling_multiple <= 0) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: ceiling_multiple must be > 0"
    );
  }
  if (floor_multiple > ceiling_multiple) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: floor_multiple must not exceed ceiling_multiple"
    );
  }
  if (timing_factor_gain_only !== true) {
    throw new Error(
      "Invalid DealTerms defaults/overrides: timing_factor_gain_only must be true"
    );
  }
  if (!ALLOWED_DOWNSIDE_MODES.has(downside_mode)) {
    throw new Error(
      `Invalid DealTerms defaults/overrides: downside_mode must be one of ${[...ALLOWED_DOWNSIDE_MODES].join(", ")}`
    );
  }

  return {
    contract_version,
    schema_version,
    iba_usd: required.iba_usd,
    floor_multiple,
    ceiling_multiple,
    downside_mode,
    timing_factor_gain_only: true,
    maturity_months: required.maturity_months,
    notes,
  };
}
