"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { generatePriceSeries, seriesChangePercent } from "@/lib/priceHistory";

interface StockSparklineProps {
  ticker: string;
  avgReturn: number;
  volatility: number;
  price: number;
  points?: number;
  className?: string;
}

const POSITIVE_COLOR = "#22945c";
const NEGATIVE_COLOR = "#dc2626";

export default function StockSparkline({
  ticker,
  avgReturn,
  volatility,
  price,
  points = 24,
  className = "h-9 w-24",
}: StockSparklineProps) {
  const series = generatePriceSeries(ticker, avgReturn, volatility, price, points);
  const changePercent = seriesChangePercent(series);
  const isPositive = changePercent >= 0;
  const color = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;
  const gradientId = `spark-${ticker}`;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="h-full w-14 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={1.75}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span
        className="whitespace-nowrap text-xs font-medium"
        style={{ color }}
      >
        {isPositive ? "▲" : "▼"} {Math.abs(changePercent * 100).toFixed(1)}%
      </span>
    </div>
  );
}
