import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export interface CoachCommissionDatum {
  coach: string;
  commission: number;
}

interface CoachCommissionPieChartProps {
  data: CoachCommissionDatum[];
}

const COLORS = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

const CoachCommissionPieChart: React.FC<CoachCommissionPieChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="commission"
            nameKey="coach"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ coach, percent }) => `${coach}: ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span style={{ color: '#FFF' }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dummy usage
// <CoachCommissionPieChart data={[
//   { coach: "Kevin", commission: 3200 },
//   { coach: "Sam", commission: 1800 },
// ]} />

export default CoachCommissionPieChart;
