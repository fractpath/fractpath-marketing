declare module "fractpath-calculator-widget" {
  import type { ComponentType } from "react";

  export type CalculatorPersona = "homeowner" | "buyer" | "realtor";
  export type CalculatorMode = "marketing" | "app";

  /**
   * V1 lite payload — marketing-safe.
   * Marketing must treat this as opaque; do not recompute, reinterpret, or fix values.
   * Marketing may ONLY use LiteShareSummaryV1 (never FullDealSnapshotV1).
   */
  export type LiteShareSummaryV1 = Record<string, unknown>;

  export type WidgetEvent = unknown;

  export type FractPathCalculatorWidgetProps = {
    mode?: CalculatorMode;
    onLiteSnapshot?: (lite: LiteShareSummaryV1) => void;
    onEvent?: (event: WidgetEvent) => void;
  };

  export const FractPathCalculatorWidget: ComponentType<FractPathCalculatorWidgetProps>;
}
