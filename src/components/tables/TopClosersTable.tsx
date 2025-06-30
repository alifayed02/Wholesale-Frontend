import React from 'react';

export interface Closer {
  closer: string;
  prospects: number;
  cashCollected: number;
}

interface TopClosersTableProps {
  data: Closer[];
}

export const TopClosersTable: React.FC<TopClosersTableProps> = ({ data }) => {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4 px-4">Top Closers</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted-foreground border-b border-neutral-800">
            <th className="p-4 font-medium">Closer</th>
            <th className="p-4 font-medium">Prospects</th>
            <th className="p-4 font-medium">Cash Collected</th>
          </tr>
        </thead>
        <tbody>
          {data.map((closer, index) => (
            <tr key={index} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50 transition-colors">
              <td className="p-4">{closer.closer}</td>
              <td className="p-4">{closer.prospects}</td>
              <td className="p-4">${closer.cashCollected.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 