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
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface StatsChartProps {
  chartData: Array<{
    name: string;
    value: number;
  }>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

// Custom tooltip component that supports dark mode
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
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
  const [mounted, setMounted] = useState(false);
  const [chartHeight, setChartHeight] = useState(200);

  useEffect(() => {
    setMounted(true);
    // Adjust chart height based on viewport
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        setChartHeight(isMobile ? 250 : 200);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full" style={{ height: chartHeight }}>
        <div className="flex items-center justify-center h-full text-slate-600 dark:text-slate-400">
          Loading chart...
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full" style={{ height: chartHeight }}>
        <div className="flex items-center justify-center h-full text-slate-600 dark:text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="name" 
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: '11px' }}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: '12px' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

