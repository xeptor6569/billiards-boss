"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

interface StatsChartProps {
  chartData: Array<{
    name: string;
    value: number;
  }>;
}

// Custom tooltip component that supports dark mode
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: isDark ? 'rgb(30 41 59)' : 'rgb(248 250 252)',
          border: `1px solid ${isDark ? 'rgb(51 65 85)' : 'rgb(226 232 240)'}`,
          color: isDark ? 'rgb(241 245 249)' : 'rgb(15 23 42)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
        }}
      >
        <p style={{ margin: 0, marginBottom: '4px', fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ margin: 0, color: isDark ? 'rgb(203 213 225)' : 'rgb(51 65 85)' }}>
          Value: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
}

export default function StatsChart({ chartData }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis 
          dataKey="name" 
          className="text-slate-600 dark:text-slate-400"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          className="text-slate-600 dark:text-slate-400"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="var(--accent)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

