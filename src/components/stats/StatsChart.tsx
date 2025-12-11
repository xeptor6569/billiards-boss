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
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgb(248 250 252)',
            border: '1px solid rgb(226 232 240)',
            color: 'rgb(15 23 42)',
          }}
          className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
        />
        <Bar dataKey="value" fill="var(--accent)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

