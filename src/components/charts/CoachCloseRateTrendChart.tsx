import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export interface CoachCloseRateTrendDatum {
  coach: string;
  date: string;
  rate: number;
}

interface CoachCloseRateTrendChartProps {
  data: CoachCloseRateTrendDatum[];
}

const COLORS = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

function groupByCoach(data: CoachCloseRateTrendDatum[]) {
  const coaches = Array.from(new Set(data.map(d => d.coach)));
  const dates = Array.from(new Set(data.map(d => d.date)));
  return { coaches, dates };
}

const CoachCloseRateTrendChart: React.FC<CoachCloseRateTrendChartProps> = ({ data }) => {
  const { coaches, dates } = groupByCoach(data);
  // Transform data for multi-line chart
  const chartData = dates.map(date => {
    const entry: any = { date };
    coaches.forEach(coach => {
      const found = data.find(d => d.coach === coach && d.date === date);
      entry[coach] = found ? found.rate : null;
    });
    return entry;
  });

  return (
    <div className="w-full h-80 bg-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#FFF" tick={{ fill: '#FFF' }} axisLine={false} tickLine={false} domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} />
          <Tooltip contentStyle={{ background: '#222', color: '#FFF', border: 'none' }} formatter={v => `${Math.round(v * 100)}%`} />
          <Legend iconType="circle" formatter={v => <span style={{ color: '#FFF' }}>{v}</span>} />
          {coaches.map((coach, idx) => (
            <Line key={coach} type="monotone" dataKey={coach} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 5, fill: COLORS[idx % COLORS.length] }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dummy usage
// <CoachCloseRateTrendChart data={[
//   { coach: "Kevin", date: "Jun 10", rate: 0.5 },
//   { coach: "Sam", date: "Jun 10", rate: 0.25 },
// ]} />

export default CoachCloseRateTrendChart;
