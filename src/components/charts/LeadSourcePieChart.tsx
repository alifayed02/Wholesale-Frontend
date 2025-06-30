import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

export interface LeadSourceDatum {
  source: string;
  value: number;
}

interface LeadSourcePieChartProps {
  data: LeadSourceDatum[];
}

const COLORS = [
  '#0088FE',
  '#FFBB28',
  '#FF0000',
  '#FF6666',
  '#FFA500',
  '#FFD700',
  '#00C49F',
];

const PIE_COLORS = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

const LeadSourcePieChart: React.FC<LeadSourcePieChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full rounded-3xl flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="text-muted-foreground text-sm uppercase tracking-wider">LEAD SOURCE BREAKDOWN</div>
      <ResponsiveContainer width="100%" height={600}>
        <PieChart>
          <defs>
            <linearGradient id="glowRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff1a1a" />
              <stop offset="100%" stopColor="#ff4d4d" />
            </linearGradient>
            <linearGradient id="glowRed2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#ff1a1a" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={250}
            label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#fff', color: '#000', border: 'none' }} formatter={(v) => `${v}`} />
          <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span style={{ color: '#FFF', fontWeight: 600 }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 pointer-events-none rounded-3xl animate-pulse" />
    </div>
  );
};

// Dummy usage
// <LeadSourcePieChart data={[
//   { source: "Instagram", value: 24 },
//   { source: "YouTube", value: 10 },
// ]} />

export default LeadSourcePieChart; 