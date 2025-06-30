import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface DealStatusDatum {
  status: string;
  count: number;
}

interface DealStatusBreakdownChartProps {
  data: DealStatusDatum[];
}

const COLORS = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

const DealStatusBreakdownChart: React.FC<DealStatusBreakdownChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72 bg-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis dataKey="status" stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#222', color: '#FFF', border: 'none' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DealStatusBreakdownChart;
