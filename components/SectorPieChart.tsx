"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import IconChip from "./IconChip";
import { PieChartIcon } from "./Icons";

// Fixed color-per-sector mapping so the same sector always gets the same
// color across both charts (previously colors were assigned by array index,
// so "Financials" in one chart could be blue and purple in the other).
const SECTOR_COLORS: Record<string, string> = {
  Technology: "#22945c",
  Financials: "#2563eb",
  Energy: "#7c3aed",
  Industrials: "#f59e0b",
  Utilities: "#e11d48",
  "Clean Energy": "#34b075",
  "Consumer Staples": "#0f1f38",
  Healthcare: "#a3e4c4",
  Materials: "#475569",
  "Green Bonds": "#0d7a45",
};
const FALLBACK_COLOR = "#94a3b8";

interface SectorPieChartProps {
  title: string;
  data: { sector: string; weight: number }[];
}

export default function SectorPieChart({ title, data }: SectorPieChartProps) {
  const [hovered, setHovered] = useState<{ name: string; value: number } | null>(null);

  const chartData = data
    .map((d) => ({ name: d.sector, value: Math.round(d.weight * 1000) / 10 }))
    .sort((a, b) => b.value - a.value); // largest sector first, consistent ordering

  return (
    <div className="card h-full">
      <div className="mb-4 flex items-center gap-2">
        <IconChip icon={<PieChartIcon className="h-4 w-4" />} color="blue" size="sm" />
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Chart with centered total label */}
        <div className="relative h-52 w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={3}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                onMouseEnter={(_, idx) => setHovered(chartData[idx])}
                onMouseLeave={() => setHovered(null)}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={SECTOR_COLORS[entry.name] ?? FALLBACK_COLOR}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{
                      opacity: hovered && hovered.name !== entry.name ? 0.45 : 1,
                      transition: "opacity 120ms",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            {hovered ? (
              <>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-navy-900">
                  {hovered.name}
                </span>
                <span className="text-lg font-bold text-navy-900">{hovered.value}%</span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-navy-900">{chartData.length}</span>
                <span className="text-[11px] text-slate-500">sectors</span>
              </>
            )}
          </div>
        </div>

        {/* Legend as a two-column grid with % values, below the chart */}
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
          {chartData.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: SECTOR_COLORS[entry.name] ?? FALLBACK_COLOR }}
                />
                <span className="truncate text-slate-700">{entry.name}</span>
              </span>
              <span className="font-semibold text-navy-900">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}