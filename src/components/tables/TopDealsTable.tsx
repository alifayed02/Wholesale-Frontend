import React from 'react';

interface Deal {
  closerName: string;
  prospectName: string;
  cashCollected: string;
}

interface TopDealsTableProps {
  data: Deal[];
}

const TopDealsTable: React.FC<TopDealsTableProps> = ({ data }) => {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-4 font-medium text-muted-foreground">Closer Name</th>
            <th className="p-4 font-medium text-muted-foreground">Prospect Name</th>
            <th className="p-4 font-medium text-white bg-blue-600 rounded-t-lg">Cash Collected</th>
          </tr>
        </thead>
        <tbody>
          {data.map((deal, index) => (
            <tr key={index} className="border-b border-neutral-800 last:border-b-0">
              <td className="p-4">{deal.closerName}</td>
              <td className="p-4">{deal.prospectName}</td>
              <td className="p-4">{deal.cashCollected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopDealsTable; 