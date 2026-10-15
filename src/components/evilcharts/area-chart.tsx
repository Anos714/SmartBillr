"use client";

/**
 * Slim EvilCharts-style area chart wrapper (fallback: the
 * `@evilcharts/recharts-area-chart` registry install could not run
 * non-interactively in this environment, so this file provides the same
 * slot in `src/components/evilcharts/` with our cream/green brand styling).
 * Built directly on recharts: green Billed area + ink Collected line.
 */
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthPoint } from "@/lib/stats";

export type { MonthPoint };

function fmtMoney(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

function TrendsTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-2 shadow-lg">
      <p className="text-xs font-bold text-stone-500">{label}</p>
      {payload.map((p) => (
        <p
          key={String(p.name)}
          className="mt-0.5 text-sm font-semibold"
          style={{ color: p.color ?? "#141412" }}
        >
          {p.name}: {currency}{" "}
          {fmtMoney(typeof p.value === "number" ? p.value : Number(p.value) || 0)}
        </p>
      ))}
    </div>
  );
}

export function TrendsAreaChart({
  data,
  currency,
}: {
  data: MonthPoint[];
  currency: string;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendBilledFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C6B4F" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0C6B4F" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#E7E2D8"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#78716c" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#78716c" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
            }
          />
          <Tooltip
            content={<TrendsTooltip currency={currency} />}
            cursor={{ stroke: "#0C6B4F", strokeOpacity: 0.3 }}
          />
          <Area
            type="monotone"
            dataKey="billed"
            name="Billed"
            stroke="#0C6B4F"
            strokeWidth={2.5}
            fill="url(#trendBilledFill)"
          />
          <Line
            type="monotone"
            dataKey="collected"
            name="Collected"
            stroke="#141412"
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
