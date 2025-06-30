import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface CloseRateTrendDatum {
  date: string;
  rate: number;
}

interface CloseRateTrendChartProps {
  data: CloseRateTrendDatum[];
}

const CloseRateTrendChart: React.FC<CloseRateTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72 bg-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} />
          <Tooltip contentStyle={{ background: '#222', color: '#FFF', border: 'none' }} formatter={v => `${Math.round(v * 100)}%`} />
          <Line type="monotone" dataKey="rate" stroke="#FF0000" strokeWidth={3} dot={{ r: 5, fill: '#FF0000' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dummy usage
// <CloseRateTrendChart data={[
//   { date: "Jun 10", rate: 0.25 },
//   { date: "Jun 11", rate: 0.33 },
// ]} />

export default CloseRateTrendChart;
