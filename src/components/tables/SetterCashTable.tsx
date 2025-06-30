import React from 'react';

interface SetterCash {
  setterName: string;
  totalCash: number;
  avgCashPerCall: number;
}

interface SetterCashTableProps {
  data: SetterCash[];
}

const SetterCashTable: React.FC<SetterCashTableProps> = ({ data }) => {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted-foreground border-b border-neutral-800">
            <th className="p-4 font-medium">SETTER NAME</th>
            <th className="p-4 font-medium">TOTAL CASH COLLECTED</th>
            <th className="p-4 font-medium">AVG. CASH / CALL</th>
          </tr>
        </thead>
        <tbody>
          {data.map((setter, index) => (
            <tr key={index} className="border-b border-neutral-800 last:border-b-0">
              <td className="p-4">{setter.setterName}</td>
              <td className="p-4">${setter.totalCash.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td className="p-4">${setter.avgCashPerCall.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetterCashTable; 