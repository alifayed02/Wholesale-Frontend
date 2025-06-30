import React from 'react';

export interface DummyCall {
  date: string;
  closer: string;
  setter: string;
  prospect: string;
  outcome: string;
  cashCollected: string;
  coach: string;
  platform: string;
}

interface CallsTableProps {
  data: DummyCall[];
}

export const CallsTable: React.FC<CallsTableProps> = ({ data }) => {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted-foreground border-b border-neutral-800">
            <th className="p-4 font-medium">DATE</th>
            <th className="p-4 font-medium">CLOSER</th>
            <th className="p-4 font-medium">SETTER</th>
            <th className="p-4 font-medium">PROSPECT</th>
            <th className="p-4 font-medium">OUTCOME</th>
            <th className="p-4 font-medium">CASH COLLECTED</th>
            <th className="p-4 font-medium">COACH</th>
            <th className="p-4 font-medium">PLATFORM</th>
          </tr>
        </thead>
        <tbody>
          {data.map((call, index) => (
            <tr key={index} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50 transition-colors">
              <td className="p-4">{call.date}</td>
              <td className="p-4">{call.closer}</td>
              <td className="p-4">{call.setter}</td>
              <td className="p-4">{call.prospect}</td>
              <td className="p-4">{call.outcome}</td>
              <td className="p-4">{call.cashCollected}</td>
              <td className="p-4">{call.coach}</td>
              <td className="p-4">{call.platform}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 