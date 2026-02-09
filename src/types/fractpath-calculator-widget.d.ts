declare module "fractpath-calculator-widget" {
  import type { ComponentType } from "react";

  /**
   * Marketing must treat widget payloads as opaque, contract-defined objects.
   * Do not reference or derive from fields inside DraftSnapshot / ShareSummary in marketing code.
   */
  export type CalculatorPersona = "homeowner" | "buyer" | "realtor";
  export type CalculatorMode = "marketing" | "app";

  // Opaque payloads: prevent schema drift in marketing
  export type DraftSnapshot = unknown;
  export type ShareSummary = unknown;
  export type WidgetEvent = unknown;

  export type FractPathCalculatorWidgetProps = {
    persona: CalculatorPersona;
    mode?: CalculatorMode;
    onDraftSnapshot?: (snapshot: DraftSnapshot) => void;
    onShareSummary?: (summary: ShareSummary) => void;
    onEvent?: (event: WidgetEvent) => void;
  };

  export const FractPathCalculatorWidget: ComponentType<FractPathCalculatorWidgetProps>;
}
