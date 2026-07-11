"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  TooltipProps,
} from "recharts";
import { PortfolioMetrics } from "@/lib/types";
import IconChip from "./IconChip";
import { BarChartIcon } from "./Icons";

const CURRENT_COLOR = "#25477a"; // navy-600
const SUGGESTED_COLOR = "#22945c"; // forest-500

interface ReturnRiskChartProps {
  original: PortfolioMetrics;
  suggested: PortfolioMetrics;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-card">
      <div className="mb-1 font-semibold text-navy-900">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-slate-500">{p.dataKey}</span>
          <span className="font-semibold text-navy-900">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function ReturnRiskChart({ original, suggested }: ReturnRiskChartProps) {
  const data = [
    {
      metric: "Expected Return",
      Current: Math.round(original.expectedReturn * 1000) / 10,
      Suggested: Math.round(suggested.expectedReturn * 1000) / 10,
    },
    {
      metric: "Volatility (Risk)",
      Current: Math.round(original.volatility * 1000) / 10,
      Suggested: Math.round(suggested.volatility * 1000) / 10,
    },
  ];

  return (
    <div className="card relative h-full overflow-hidden">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-navy-700/10 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconChip icon={<BarChartIcon className="h-4 w-4" />} color="green" size="sm" />
            <h3 className="text-sm font-semibold text-navy-900">Return &amp; Risk Comparison</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: CURRENT_COLOR }}
              />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: SUGGESTED_COLOR }}
              />
              Suggested
            </span>
          </div>
        </div>
        <p className="mb-2 text-xs text-slate-500">
          Weighted-average annualized figures (%) — simulated, for illustration only
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 18, right: 10, left: -10, bottom: 0 }} barGap={6}>
              <defs>
                <linearGradient id="currentBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25477a" />
                  <stop offset="100%" stopColor="#152a4a" />
                </linearGradient>
                <linearGradient id="suggestedBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34b075" />
                  <stop offset="100%" stopColor="#1f7a4d" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                unit="%"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f8fa" }} />
              <Bar dataKey="Current" fill="url(#currentBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={48}>
                <LabelList
                  dataKey="Current"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#25477a" }}
                />
              </Bar>
              <Bar
                dataKey="Suggested"
                fill="url(#suggestedBarGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="Suggested"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#1f7a4d" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
