import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ShowRateGaugeProps {
  value: number; // 0-1
}

const ShowRateGauge: React.FC<ShowRateGaugeProps> = ({ value }) => {
  const percent = Math.round(value * 100);
  const data = [
    { name: 'Show Rate', value: percent, fill: 'url(#glowRed)' },
    { name: 'Remainder', value: 100 - percent, fill: '#18181b' },
  ];

  return (
    <div className="relative w-full h-56 bg-neutral-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="text-white text-lg font-bold tracking-wide mb-2 font-sans">Show Rate</div>
      <ResponsiveContainer width="100%" height="80%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <defs>
            <linearGradient id="glowRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff1a1a" />
              <stop offset="100%" stopColor="#ff4d4d" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="value"
            cornerRadius={20}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-extrabold text-white drop-shadow-[0_0_10px_#ff1a1a] animate-pulse font-sans">
        {percent}%
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-3xl ring-2 ring-red-600/40 animate-pulse" />
    </div>
  );
};

export default ShowRateGauge; 