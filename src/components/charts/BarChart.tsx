import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface BarChartProps {
  data: { date: string; cash: number }[];
}

const formatCashValue = (value: number) => value === 0 ? `` : `$${(value / 1000).toFixed(1)}K`;

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={600}>
      <RechartsBarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis hide={true} />
        <Tooltip
          cursor={{ fill: 'hsla(var(--muted), 0.3)'}}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Cash"]}
        />
        <Bar dataKey="cash" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="cash" position="top" formatter={formatCashValue} fill="hsl(var(--foreground))" fontSize={12} />
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}; 