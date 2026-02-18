"use client";

import { useState, useCallback, useRef } from "react";
import type { CalculatorPersona } from "fractpath-calculator-widget";

/**
 * Local type for the canonical snapshot passed from the widget.
 * Only used for typing in the marketing site.
 */
export interface FullDealSnapshotV1 {
  contract_version: string;
  schema_version: string;
  persona: CalculatorPersona;
  mode: "app" | "marketing";
  inputs: Record<string, unknown>;
  basic_results?: Record<string, unknown>;
  outputs: Record<string, unknown>;
  created_at?: string;
  now_iso?: string;
}

declare global {
  interface Window {
    __fractpath_saveSnapshot?: (snapshot: FullDealSnapshotV1) => void;
  }
}

export interface CalculatorEmbedProps {
  persona: CalculatorPersona;
  onPersonaChange?: (persona: CalculatorPersona) => void;
  snapshot?: FullDealSnapshotV1;
  onSave?: (snapshot: FullDealSnapshotV1) => void;
}

export function CalculatorEmbed({
  persona,
  onPersonaChange,
  snapshot,
  onSave,
}: CalculatorEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(
    async (snap: FullDealSnapshotV1) => {
      setSaving(true);
      try {
        onSave?.(snap);
        const w = window as any;
        if (typeof w.__fractpath_saveSnapshot === "function") {
          w.__fractpath_saveSnapshot(snap);
        }
      } finally {
        setSaving(false);
      }
    },
    [onSave],
  );

  return (
    <div
      ref={containerRef}
      id="fractpath-calculator"
      className="rounded-md border-2 border-dashed border-muted-foreground/25 p-8 text-center"
    >
      <p className="text-sm text-muted-foreground">
        FractPath Calculator Widget will mount here.
      </p>
      {saving && <p className="mt-2 text-sm font-medium">Saving snapshot...</p>}
    </div>
  );
}

// ✅ Export type for marketing usage
export type { CalculatorPersona };
