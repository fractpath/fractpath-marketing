import { jsx as i, jsxs as c, Fragment as Y } from "react/jsx-runtime";
import { useState as E, useEffect as nt, useMemo as $, useCallback as D } from "react";
const at = 0.03, rt = 0.035, ot = 0.045, it = 0.025, lt = 1.1, st = 2, ct = 0.01, ut = 0.03, dt = 0.1, mt = 25e-4, P = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: at,
  transferFeeRate_standard: rt,
  transferFeeRate_early: ot,
  transferFeeRate_late: it,
  floorMultiple: lt,
  capMultiple: st,
  vesting: {
    upfrontEquityPct: dt,
    monthlyEquityPct: mt,
    months: 120
  },
  cpw: {
    startPct: ct,
    endPct: ut
  }
};
function g(t) {
  return Math.round((t + Number.EPSILON) * 100) / 100;
}
function J(t) {
  return Math.round((t + Number.EPSILON) * 1e6) / 1e6;
}
function yt(t) {
  return Math.round((t + Number.EPSILON) * 1e4) / 1e4;
}
const Q = 1e3, U = 1e-10;
function F(t, e) {
  let n = 0;
  for (let a = 0; a < e.length; a++)
    n += e[a] / Math.pow(1 + t, a);
  return n;
}
function ft(t, e) {
  let n = 0;
  for (let a = 1; a < e.length; a++)
    n += -a * e[a] / Math.pow(1 + t, a + 1);
  return n;
}
function ht(t) {
  if (t.length < 2)
    return null;
  let e = 0.01;
  for (let n = 0; n < Q; n++) {
    const a = F(e, t), o = ft(e, t);
    if (Math.abs(o) < 1e-20)
      return V(t);
    const r = e - a / o;
    if (r <= -1)
      return V(t);
    if (Math.abs(r - e) < U)
      return J(r);
    e = r;
  }
  return V(t);
}
function V(t) {
  let e = -0.999, n = 10;
  const a = F(e, t), o = F(n, t);
  if (a * o > 0)
    return null;
  for (let r = 0; r < Q; r++) {
    const u = (e + n) / 2, d = F(u, t);
    if (Math.abs(d) < U || (n - e) / 2 < U)
      return J(u);
    d * F(e, t) < 0 ? n = u : e = u;
  }
  return null;
}
function pt(t) {
  const e = Math.pow(1 + t, 12) - 1;
  return yt(e);
}
function _t(t) {
  const e = ht(t);
  return e === null ? 0 : pt(e);
}
const gt = "10.0.0";
function vt(t, e) {
  const n = e.exit_year * 12, a = Math.min(t.number_of_payments, n), o = g(t.upfront_payment + bt(t.monthly_payment, a)), r = g(St(t, e)), u = xt(t, e.annual_appreciation, a), d = g(r * u), h = g(d - o), f = Mt(t, e.exit_year), b = g(o + h * f), _ = g(o * t.floor_multiple), S = g(o * t.ceiling_multiple), v = g(Pt(t.downside_mode, b, _, S)), { isa_settlement: x, dyf_floor_amount: m, dyf_applied: A } = Tt(t, e.exit_year, o, v), M = g(x - o), l = g(o > 0 ? x / o : 0), y = At(t, a, n, x), R = _t(y);
  return {
    invested_capital_total: o,
    vested_equity_percentage: u,
    projected_fmv: r,
    base_equity_value: d,
    gain_above_capital: h,
    isa_pre_floor_cap: b,
    floor_amount: _,
    ceiling_amount: S,
    isa_settlement: x,
    dyf_floor_amount: m,
    dyf_applied: A,
    investor_profit: M,
    investor_multiple: l,
    investor_irr_annual: R,
    compute_version: gt
  };
}
function bt(t, e) {
  return t * e;
}
function St(t, e) {
  return e.fmv_override !== void 0 && e.fmv_override !== null && e.fmv_override > 0 ? e.fmv_override : t.property_value * Math.pow(1 + e.annual_appreciation, e.exit_year);
}
function xt(t, e, n) {
  const a = t.upfront_payment / t.property_value;
  let o = 0;
  for (let r = 1; r <= n; r++) {
    const u = t.property_value * Math.pow(1 + e, r / 12);
    o += t.monthly_payment / u;
  }
  return a + o;
}
function Mt(t, e) {
  return e < t.payback_window_start_year ? t.timing_factor_early : e > t.payback_window_end_year ? t.timing_factor_late : 1;
}
function Pt(t, e, n, a) {
  return Math.min(Math.max(e, n), a);
}
function Tt(t, e, n, a) {
  return { isa_settlement: a, dyf_floor_amount: 0, dyf_applied: !1 };
}
function At(t, e, n, a) {
  const o = new Array(n + 1).fill(0);
  o[0] = -t.upfront_payment;
  for (let r = 1; r <= e; r++)
    o[r] = -t.monthly_payment;
  return o[n] += a, o;
}
const Rt = (t, e, n) => Math.min(n, Math.max(e, t));
function Ft(t) {
  const e = {
    ...P,
    ...t,
    vesting: {
      ...P.vesting,
      ...t.vesting ?? {}
    },
    cpw: {
      ...P.cpw,
      ...t.cpw ?? {}
    }
  }, n = Math.max(0, Math.round(e.termYears * 12));
  return e.vesting.months = n, e;
}
function wt(t, e, n) {
  const a = n / 12;
  return t * Math.pow(1 + e, a);
}
function Et(t, e, n) {
  return Rt(t + e * n, 0, 1);
}
function kt(t, e) {
  const n = [];
  for (let a = 0; a <= e; a++) {
    const o = wt(t.homeValue, t.annualGrowthRate, a), r = Et(
      t.vesting.upfrontEquityPct,
      t.vesting.monthlyEquityPct,
      a
    );
    n.push({
      month: a,
      year: a / 12,
      homeValue: o,
      equityPct: r
    });
  }
  return n;
}
function z(t, e) {
  const n = t.vesting.months;
  return e === "standard" ? n : e === "early" ? Math.min(36, n) : e === "late" ? n + 24 : n;
}
function Lt(t) {
  return Math.max(0, Math.round(t.termYears * 12)), {
    property_value: t.homeValue,
    upfront_payment: t.initialBuyAmount,
    monthly_payment: t.vesting.monthlyEquityPct * t.homeValue,
    number_of_payments: t.vesting.months,
    // Payback window + timing factors:
    // The legacy widget had TF as a transfer fee rate; canonical compute uses timing factor multipliers.
    // Until UI collects these, we default to neutral (1) and place window across the term.
    payback_window_start_year: Math.max(0, Math.floor(t.termYears / 3)),
    payback_window_end_year: Math.max(1, Math.ceil(t.termYears * 2 / 3)),
    timing_factor_early: 1,
    timing_factor_late: 1,
    floor_multiple: t.floorMultiple,
    ceiling_multiple: t.capMultiple,
    downside_mode: "HARD_FLOOR",
    // Not currently modeled in widget UI; keep deterministic defaults.
    contract_maturity_years: 30,
    liquidity_trigger_year: 13,
    minimum_hold_years: 2,
    platform_fee: 0,
    servicing_fee_monthly: 0,
    exit_fee_pct: 0,
    // DYF defaults (disabled)
    duration_yield_floor_enabled: !1,
    duration_yield_floor_start_year: null,
    duration_yield_floor_min_multiple: null
  };
}
function q(t, e) {
  const n = z(t, e), a = n / 12, o = Lt(t), r = vt(o, {
    annual_appreciation: t.annualGrowthRate,
    exit_year: a
  }), u = r.isa_settlement === r.isa_pre_floor_cap ? "none" : r.isa_settlement === r.floor_amount ? "floor" : r.isa_settlement === r.ceiling_amount ? "cap" : "none", d = 0, h = 0, f = r.isa_settlement;
  return {
    timing: e,
    settlementMonth: n,
    homeValueAtSettlement: r.projected_fmv,
    equityPctAtSettlement: r.vested_equity_percentage,
    rawPayout: r.isa_pre_floor_cap,
    clampedPayout: r.isa_settlement,
    transferFeeAmount: h,
    netPayout: f,
    clamp: { floor: r.floor_amount, cap: r.ceiling_amount, applied: u },
    transferFeeRate: d
  };
}
function Ct(t = {}) {
  const e = Ft(t), n = Math.max(
    z(e, "standard"),
    z(e, "early"),
    z(e, "late")
  ), a = kt(e, n), o = q(e, "standard"), r = q(e, "early"), u = q(e, "late");
  return {
    normalizedInputs: e,
    series: a,
    settlements: { standard: o, early: r, late: u }
  };
}
function zt(t) {
  const e = t.series.map((a) => ({
    month: a.month,
    year: a.year,
    homeValue: a.homeValue,
    equityPct: a.equityPct
  })), n = ["early", "standard", "late"].map((a) => {
    const o = t.settlements[a];
    return {
      timing: a,
      month: o.settlementMonth,
      year: o.settlementMonth / 12,
      homeValueAtSettlement: o.homeValueAtSettlement,
      equityPctAtSettlement: o.equityPctAtSettlement,
      netPayout: o.netPayout
    };
  });
  return { points: e, markers: n };
}
function It(t, e, n) {
  return Math.min(n, Math.max(e, t));
}
function Nt(t) {
  return `${Math.round(t * 100)}%`;
}
function Dt(t) {
  return `${Math.round(t * 10) / 10}y`;
}
function Vt(t) {
  return t.timing === "early" ? "Early" : t.timing === "late" ? "Late" : "Std";
}
function qt({ series: t, width: e = 640, height: n = 240 }) {
  const { points: a, markers: o } = t;
  if (!a.length)
    return /* @__PURE__ */ i("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const r = { top: 16, right: 16, bottom: 28, left: 44 }, u = Math.max(10, e - r.left - r.right), d = Math.max(10, n - r.top - r.bottom), h = a[0].month, f = a[a.length - 1].month, b = 0, _ = 1, S = (l) => f === h ? r.left : r.left + (l - h) / (f - h) * u, v = (l) => {
    const y = It(l, b, _);
    return r.top + (1 - (y - b) / (_ - b)) * d;
  }, x = a.map((l, y) => {
    const R = S(l.month), w = v(l.equityPct);
    return `${y === 0 ? "M" : "L"} ${R.toFixed(2)} ${w.toFixed(2)}`;
  }).join(" "), m = [0, 0.5, 1].map((l) => ({
    v: l,
    y: v(l),
    label: Nt(l)
  })), A = Math.round((h + f) / 2), M = [h, A, f].map((l) => ({
    m: l,
    x: S(l),
    label: Dt(l / 12)
  }));
  return /* @__PURE__ */ c(
    "svg",
    {
      width: e,
      height: n,
      role: "img",
      "aria-label": "Equity over time",
      style: { display: "block" },
      children: [
        /* @__PURE__ */ i("rect", { x: 0, y: 0, width: e, height: n, fill: "white" }),
        m.map((l) => /* @__PURE__ */ c("g", { children: [
          /* @__PURE__ */ i(
            "line",
            {
              x1: r.left,
              x2: e - r.right,
              y1: l.y,
              y2: l.y,
              stroke: "#e5e7eb",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ i(
            "text",
            {
              x: r.left - 8,
              y: l.y + 4,
              fontSize: 12,
              textAnchor: "end",
              fill: "#6b7280",
              fontFamily: "system-ui, sans-serif",
              children: l.label
            }
          )
        ] }, l.v)),
        /* @__PURE__ */ i(
          "line",
          {
            x1: r.left,
            x2: e - r.right,
            y1: r.top + d,
            y2: r.top + d,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        M.map((l) => /* @__PURE__ */ c("g", { children: [
          /* @__PURE__ */ i(
            "line",
            {
              x1: l.x,
              x2: l.x,
              y1: r.top + d,
              y2: r.top + d + 6,
              stroke: "#9ca3af",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ i(
            "text",
            {
              x: l.x,
              y: r.top + d + 20,
              fontSize: 12,
              textAnchor: "middle",
              fill: "#6b7280",
              fontFamily: "system-ui, sans-serif",
              children: l.label
            }
          )
        ] }, l.m)),
        o.map((l) => {
          const y = S(l.month);
          return /* @__PURE__ */ c("g", { children: [
            /* @__PURE__ */ i(
              "line",
              {
                x1: y,
                x2: y,
                y1: r.top,
                y2: r.top + d,
                stroke: "#d1d5db",
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }
            ),
            /* @__PURE__ */ i(
              "rect",
              {
                x: y - 16,
                y: r.top - 2,
                width: 32,
                height: 16,
                rx: 6,
                fill: "#f3f4f6",
                stroke: "#e5e7eb"
              }
            ),
            /* @__PURE__ */ i(
              "text",
              {
                x: y,
                y: r.top + 10,
                fontSize: 11,
                textAnchor: "middle",
                fill: "#374151",
                fontFamily: "system-ui, sans-serif",
                children: Vt(l)
              }
            )
          ] }, l.timing);
        }),
        /* @__PURE__ */ i("path", { d: x, fill: "none", stroke: "#111827", strokeWidth: 2 }),
        /* @__PURE__ */ i(
          "text",
          {
            x: r.left,
            y: 14,
            fontSize: 12,
            fill: "#374151",
            fontFamily: "system-ui, sans-serif",
            children: "Equity ownership over time"
          }
        )
      ]
    }
  );
}
function T(t) {
    function S(t) {
      const n = typeof t === "number" ? t : Number(t);
      if (!Number.isFinite(n)) return "—";
      return "$" + n.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function j(t) {
  return `${(t * 100).toFixed(1)}%`;
}
function Ot(t) {
  const e = Math.floor(t / 12), n = t % 12;
  return e === 0 ? `${n}mo` : n === 0 ? `${e}yr` : `${e}yr ${n}mo`;
}
const G = {
  homeowner: {
    heroLabel: "Your Net Payout",
    heroValue: (t) => t.settlements.standard.netPayout,
    helperText: "Estimated net payout at standard settlement timing."
  },
  buyer: {
    heroLabel: "Projected Net Return",
    heroValue: (t) => t.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing."
  },
  investor: {
    heroLabel: "Projected Net Return",
    heroValue: (t) => t.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing."
  },
  realtor: {
    heroLabel: "Standard Net Payout",
    heroValue: (t) => t.settlements.standard.netPayout,
    helperText: "Standard net payout for commission reference."
  },
  ops: {
    heroLabel: "Standard Net Payout",
    heroValue: (t) => t.settlements.standard.netPayout,
    helperText: "Standard net payout at projected settlement."
  }
};
function Ut(t) {
  return G[t] ?? G.homeowner;
}
const B = "1.0.0", W = "1.0.0";
function X(t) {
  const e = {};
  for (const n of Object.keys(t).sort()) {
    const a = t[n];
    a !== null && typeof a == "object" && !Array.isArray(a) ? e[n] = X(a) : e[n] = a;
  }
  return JSON.stringify(e);
}
async function I(t) {
  const e = X(t), n = new TextEncoder().encode(e), a = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(a)).map((r) => r.toString(16).padStart(2, "0")).join("");
}
function K(t) {
  return {
    homeValue: t.homeValue,
    initialBuyAmount: t.initialBuyAmount,
    termYears: t.termYears,
    annualGrowthRate: t.annualGrowthRate
  };
}
function Bt(t) {
  return {
    standard_net_payout: t.settlements.standard.netPayout,
    early_net_payout: t.settlements.early.netPayout,
    late_net_payout: t.settlements.late.netPayout,
    standard_settlement_month: t.settlements.standard.settlementMonth,
    early_settlement_month: t.settlements.early.settlementMonth,
    late_settlement_month: t.settlements.late.settlementMonth
  };
}
function Wt(t) {
  return {
    standard_net_payout: t.settlements.standard.netPayout,
    early_net_payout: t.settlements.early.netPayout,
    late_net_payout: t.settlements.late.netPayout
  };
}
async function Yt(t, e, n) {
  const a = K(e), o = Bt(n), [r, u] = await Promise.all([
    I(a),
    I(o)
  ]);
  return {
    contract_version: B,
    schema_version: W,
    persona: t,
    mode: "marketing",
    inputs: a,
    basic_results: o,
    input_hash: r,
    output_hash: u,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function $t(t, e, n) {
  return {
    contract_version: B,
    schema_version: W,
    persona: t,
    inputs: K(e),
    basic_results: Wt(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function jt(t, e, n) {
  const [a, o] = await Promise.all([
    I(e),
    I({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: B,
    schema_version: W,
    persona: t,
    mode: "app",
    inputs: e,
    outputs: n,
    input_hash: a,
    output_hash: o,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
const k = {
  display: "block",
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4,
  fontWeight: 500
}, L = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box"
}, C = {
  marginBottom: 14
}, H = {
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  border: "1px solid #e5e7eb"
}, O = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif"
};
function Gt(t) {
  const { persona: e, mode: n = "marketing", onEvent: a, onDraftSnapshot: o, onShareSummary: r, onSave: u } = t, [d, h] = E(P.homeValue), [f, b] = E(P.initialBuyAmount), [_, S] = E(P.termYears), [v, x] = E(P.annualGrowthRate * 100);
  nt(() => {
    a?.({ type: "calculator_used", persona: e });
  }, [e, a]);
  const m = $(
    () => Ct({
      homeValue: d,
      initialBuyAmount: f,
      termYears: _,
      annualGrowthRate: v / 100
    }),
    [d, f, _, v]
  ), A = $(() => zt(m), [m]), M = Ut(e), l = M.heroValue(m), y = n === "marketing", R = [
    { label: "Early", data: m.settlements.early },
    { label: "Standard", data: m.settlements.standard },
    { label: "Late", data: m.settlements.late }
  ], w = (s, p) => {
    const N = Number(s.replace(/,/g, ""));
    return Number.isFinite(N) && N >= 0 ? N : p;
  }, Z = D(async () => {
    if (a?.({ type: "save_continue_clicked", persona: e }), o) {
      const s = await Yt(e, m.normalizedInputs, m);
      o(s);
    }
  }, [e, m, o, a]), tt = D(() => {
    if (a?.({ type: "share_clicked", persona: e }), r) {
      const s = $t(e, m.normalizedInputs, m);
      r(s);
    }
  }, [e, m, r, a]), et = D(async () => {
    if (a?.({ type: "save_clicked", persona: e }), u) {
      const s = await jt(e, m.normalizedInputs, m);
      u(s);
    }
  }, [e, m, u, a]);
  return /* @__PURE__ */ c(
    "div",
    {
      style: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 900
      },
      "data-fractpath-widget": !0,
      "data-persona": e,
      "data-mode": n,
      children: [
        /* @__PURE__ */ i("h2", { style: { margin: 0, marginBottom: 4, fontSize: 20 }, children: "FractPath Calculator" }),
        /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af", marginBottom: 12, fontStyle: "italic" }, children: y ? "Basic Results — upgrade for full analysis" : "Full Analysis" }),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, 2fr)",
              gap: 20
            },
            children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ i("h3", { style: { margin: "0 0 12px 0", fontSize: 14, color: "#374151" }, children: "Inputs" }),
                /* @__PURE__ */ c("div", { style: C, children: [
                  /* @__PURE__ */ i("label", { style: k, children: "Home Value ($)" }),
                  /* @__PURE__ */ i(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: L,
                      value: d.toLocaleString(),
                      onChange: (s) => h(w(s.target.value, d))
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: C, children: [
                  /* @__PURE__ */ i("label", { style: k, children: "Initial Buy Amount ($)" }),
                  /* @__PURE__ */ i(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: L,
                      value: f.toLocaleString(),
                      onChange: (s) => b(w(s.target.value, f))
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: C, children: [
                  /* @__PURE__ */ i("label", { style: k, children: "Term (years)" }),
                  /* @__PURE__ */ i(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      max: 30,
                      step: 1,
                      style: L,
                      value: _,
                      onChange: (s) => {
                        const p = parseInt(s.target.value, 10);
                        Number.isFinite(p) && p >= 1 && p <= 30 && S(p);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: C, children: [
                  /* @__PURE__ */ i("label", { style: k, children: "Annual Growth Rate (%)" }),
                  /* @__PURE__ */ i(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 20,
                      step: 0.1,
                      style: L,
                      value: v,
                      onChange: (s) => {
                        const p = parseFloat(s.target.value);
                        Number.isFinite(p) && p >= 0 && p <= 20 && x(p);
                      }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ c(
                  "div",
                  {
                    style: {
                      ...H,
                      marginBottom: 16,
                      textAlign: "center"
                    },
                    children: [
                      /* @__PURE__ */ i("div", { style: { fontSize: 12, color: "#6b7280", marginBottom: 4 }, children: M.heroLabel }),
                      /* @__PURE__ */ i("div", { style: { fontSize: 28, fontWeight: 700, color: "#111827" }, children: T(l) }),
                      /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af", marginTop: 4 }, children: M.helperText })
                    ]
                  }
                ),
                /* @__PURE__ */ i("h3", { style: { margin: "0 0 8px 0", fontSize: 14, color: "#374151" }, children: "Settlement Scenarios" }),
                /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }, children: R.map((s) => /* @__PURE__ */ c(
                  "div",
                  {
                    style: {
                      ...H,
                      display: "grid",
                      gridTemplateColumns: y ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: 8,
                      alignItems: "center",
                      padding: "10px 12px"
                    },
                    children: [
                      /* @__PURE__ */ c("div", { children: [
                        /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Timing" }),
                        /* @__PURE__ */ i("div", { style: { fontWeight: 600, fontSize: 13 }, children: s.label })
                      ] }),
                      /* @__PURE__ */ c("div", { children: [
                        /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "When" }),
                        /* @__PURE__ */ i("div", { style: { fontSize: 13 }, children: Ot(s.data.settlementMonth) })
                      ] }),
                      /* @__PURE__ */ c("div", { children: [
                        /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Net Payout" }),
                        /* @__PURE__ */ i("div", { style: { fontWeight: 600, fontSize: 13 }, children: T(s.data.netPayout) })
                      ] }),
                      !y && /* @__PURE__ */ c(Y, { children: [
                        /* @__PURE__ */ c("div", { children: [
                          /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Raw Payout" }),
                          /* @__PURE__ */ i("div", { style: { fontSize: 13 }, children: T(s.data.rawPayout) })
                        ] }),
                        /* @__PURE__ */ c("div", { children: [
                          /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Transfer Fee" }),
                          /* @__PURE__ */ c("div", { style: { fontSize: 13 }, children: [
                            T(s.data.transferFeeAmount),
                            " (",
                            j(s.data.transferFeeRate),
                            ")"
                          ] })
                        ] }),
                        /* @__PURE__ */ c("div", { children: [
                          /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Clamp" }),
                          /* @__PURE__ */ i("div", { style: { fontSize: 13 }, children: s.data.clamp.applied === "none" ? "—" : s.data.clamp.applied === "floor" ? "Floor" : "Cap" })
                        ] })
                      ] })
                    ]
                  },
                  s.label
                )) }),
                !y && /* @__PURE__ */ i(qt, { series: A, width: 520, height: 240 }),
                /* @__PURE__ */ c("div", { style: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }, children: [
                  y && /* @__PURE__ */ c(Y, { children: [
                    /* @__PURE__ */ i(
                      "button",
                      {
                        type: "button",
                        onClick: Z,
                        style: {
                          ...O,
                          background: "#111827",
                          color: "#fff"
                        },
                        "data-cta": "save-continue",
                        children: "Save & Continue"
                      }
                    ),
                    /* @__PURE__ */ i(
                      "button",
                      {
                        type: "button",
                        onClick: tt,
                        style: {
                          ...O,
                          background: "#fff",
                          color: "#111827",
                          border: "1px solid #d1d5db"
                        },
                        "data-cta": "share",
                        children: "Share"
                      }
                    )
                  ] }),
                  !y && /* @__PURE__ */ i(
                    "button",
                    {
                      type: "button",
                      onClick: et,
                      style: {
                        ...O,
                        background: "#111827",
                        color: "#fff"
                      },
                      "data-cta": "save",
                      children: "Save"
                    }
                  )
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ c("div", { style: { marginTop: 12, color: "#9ca3af", fontSize: 11, textAlign: "center" }, children: [
          "Viewing as ",
          /* @__PURE__ */ i("strong", { children: e }),
          " · ",
          "Mode: ",
          /* @__PURE__ */ i("strong", { children: n }),
          " · ",
          T(d),
          " home · ",
          T(f),
          " buy ·",
          " ",
          _,
          "yr · ",
          j(v / 100),
          " growth"
        ] })
      ]
    }
  );
}
function Qt(t) {
  return /* @__PURE__ */ i(Gt, { ...t });
}
export {
  B as CONTRACT_VERSION,
  qt as EquityChart,
  Qt as FractPathCalculatorWidget,
  W as SCHEMA_VERSION,
  zt as buildChartSeries,
  Yt as buildDraftSnapshot,
  jt as buildSavePayload,
  $t as buildShareSummary,
  Ct as computeScenario,
  I as deterministicHash,
  Ft as normalizeInputs
};
