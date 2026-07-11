"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import IconChip from "./IconChip";
import { GaugeIcon, LeafIcon, ArrowRightIcon } from "./Icons";

function scoreColor(score: number): string {
  if (score >= 7.5) return "#22945c";
  if (score >= 5) return "#eab308";
  return "#dc2626";
}

interface GaugeProps {
  label: string;
  score: number;
}

function Gauge({ label, score }: GaugeProps) {
  const color = scoreColor(score);
  const data = [{ name: "score", value: score, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="90%"
            innerRadius="76%"
            outerRadius="98%"
            barSize={11}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
            <RadialBar background={{ fill: "#eef1f5" }} dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-7 flex items-baseline justify-center gap-0.5">
        <span className="text-xl font-bold leading-none" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] font-medium text-slate-400">/10</span>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

interface CleanEnergyGaugeProps {
  originalScore: number;
  suggestedScore: number;
}

export default function CleanEnergyGauge({
  originalScore,
  suggestedScore,
}: CleanEnergyGaugeProps) {
  const delta = suggestedScore - originalScore;
  const isPositive = delta >= 0;

  return (
    <div className="card h-full">
      <div className="mb-1 flex items-center gap-2">
        <IconChip icon={<LeafIcon className="h-4 w-4" />} color="green" size="sm" />
        <h3 className="text-sm font-semibold text-navy-900">Clean-Energy Tilt Score</h3>
      </div>
      <p className="mb-2 text-xs text-slate-500">
        Weighted average ESG / clean-energy alignment, scale 1–10
      </p>
      <div className="relative grid grid-cols-2 gap-2">
        <Gauge label="Current" score={originalScore} />
        <div
          className={`pointer-events-none absolute left-1/2 top-9 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm ${
            isPositive ? "bg-forest-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </div>
        <Gauge label="Suggested" score={suggestedScore} />
      </div>
      <div className="mt-1 flex justify-center">
        <span
          className={`badge gap-1.5 ${
            isPositive ? "bg-forest-500/10 text-forest-600" : "bg-red-50 text-red-600"
          }`}
        >
          <GaugeIcon className="h-3.5 w-3.5" />
          {isPositive ? "+" : ""}
          {delta.toFixed(1)} pts clean-energy tilt
        </span>
      </div>
    </div>
  );
}
