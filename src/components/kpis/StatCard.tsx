import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
      <p className="text-muted-foreground text-sm uppercase tracking-wider">{label}</p>
      <p className="text-foreground text-2xl font-bold mt-2 break-words">{value}</p>
    </div>
  );
}; 