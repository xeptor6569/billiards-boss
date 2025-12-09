"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsChartProps {
  chartData: Array<{
    name: string;
    value: number;
  }>;
}

export default function StatsChart({ chartData }: StatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="name" 
          style={{ fill: 'var(--color-textSecondary)', fontSize: '12px' }}
        />
        <YAxis 
          style={{ fill: 'var(--color-textSecondary)', fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-textPrimary)',
          }}
        />
        <Bar dataKey="value" fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

