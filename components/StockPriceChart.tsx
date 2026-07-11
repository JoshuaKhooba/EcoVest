"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { generatePriceSeries } from "@/lib/priceHistory";

interface StockPriceChartProps {
  ticker: string;
  avgReturn: number;
  volatility: number;
  price: number;
  points?: number;
  isPositive: boolean;
}

const POSITIVE_COLOR = "#22945c";
const NEGATIVE_COLOR = "#dc2626";

export default function StockPriceChart({
  ticker,
  avgReturn,
  volatility,
  price,
  points = 60,
  isPositive,
}: StockPriceChartProps) {
  const series = generatePriceSeries(ticker, avgReturn, volatility, price, points);
  const color = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;
  const gradientId = `chart-${ticker}`;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="index" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            width={54}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
            labelFormatter={() => ""}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
