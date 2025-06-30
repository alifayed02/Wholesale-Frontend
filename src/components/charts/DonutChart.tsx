import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number }[];
  colors: string[];
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col justify-center h-full pl-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          <span className="text-white text-lg">{`${entry.payload.name} (${entry.payload.value.toFixed(2)}%)`}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart: React.FC<DonutChartProps> = ({ data, colors }) => {
  return (
    <div className="flex items-center w-full h-full">
      <div className="w-1/2">
        <ResponsiveContainer width="100%" height={500}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={200}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', color: '#000', border: 'none' }}
              formatter={(value, _name, props) => {
                const payload = props?.payload?.payload;
                if (payload) {
                  // Cash value handling (AcquisitionData)
                  if (typeof payload.cash === 'number') {
                    return `$${payload.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  }
                  // Count handling (LeadsPage)
                  if (typeof payload.count === 'number') {
                    // Display name of the slice along with the raw count
                    return [payload.count, payload.name ?? ''];
                  }
                }
                // Fallback to numeric rounding
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2">
        {(() => {
          const sorted = [...data].sort((a, b) => b.value - a.value);
          return <CustomLegend payload={sorted.map((entry, index) => ({ color: colors[index % colors.length], payload: entry }))} />;
        })()}
      </div>
    </div>
  );
};

export default DonutChart; 