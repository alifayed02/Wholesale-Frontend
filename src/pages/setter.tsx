import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/kpis/StatCard';
import SetterCashTable from '../components/tables/SetterCashTable';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { SetterSelect } from '../components/filters/SetterSelect';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import {
  fetchData,
  calculateSetterKpis,
  SetterKpiData,
  GoogleSheetData,
  calculateSetterCashTable,
  SetterCashData,
  calculateShowRateTrend,
  ShowRateTrendData
} from '../data/googleSheetService';
import { useAuth } from '../auth/useAuth';

const SetterPage: React.FC = () => {
  const [rawData, setRawData] = useState<GoogleSheetData | null>(null);
  const [kpis, setKpis] = useState<SetterKpiData | null>(null);
  const [setterCashData, setSetterCashData] = useState<SetterCashData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platform, setPlatform] = useState('Select Platform');
  const [setter, setSetter] = useState('Select Setter');

  const [setterOptions, setSetterOptions] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);

  const [showRateTrend, setShowRateTrend] = useState<ShowRateTrendData[]>([]);

  const { getAuthToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('Unauthenticated');
        const data = await fetchData(token);
        setRawData(data);

        if (data && data[0]) {
          const platforms = [...new Set(data[0].map(c => c["Platform"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setPlatformOptions(["Select Platform", ...platforms]);

          const setters = [...new Set(data[0].map(item => item["Setter Name"]).filter(Boolean))] as string[];
          setSetterOptions(["Select Setter", ...setters]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [getAuthToken]);

  useEffect(() => {
    if (rawData) {
      const calculatedKpis = calculateSetterKpis(rawData, dateRange, platform, setter);
      setKpis(calculatedKpis);
      const calculatedSetterCash = calculateSetterCashTable(rawData, dateRange, platform, setter);
      setSetterCashData(calculatedSetterCash);
      const trend = calculateShowRateTrend(rawData, dateRange, platform, 'All', 'All', setter);
      setShowRateTrend(trend);
    }
  }, [rawData, dateRange, platform, setter]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  if (!kpis) {
    return <div className="text-white text-center p-8">No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-foreground mb-4">SETTER DATA</h1>

      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><SetterSelect value={setter} onChange={setSetter} options={setterOptions} /></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatCard label="Cash Collected" value={`$${kpis.cashCollected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-center transition-all hover:bg-blue-700">
          <p className="text-white/80 text-sm uppercase tracking-wider">SETTER COMMISSION</p>
          <p className="text-white text-2xl font-bold mt-2">${kpis.setterCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="grid grid-cols-5 xs:grid-cols-1 gap-6">
        <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Show Rate</p>
          <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.showRate.toFixed(2)}% <span className="text-muted-foreground text-sm tracking-wider">(true: {kpis.trueShowRate.toFixed(2)}%)</span></p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Close Rate</p>
          <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.closeRate.toFixed(2)}% <span className="text-muted-foreground text-sm tracking-wider">(true: {kpis.trueCloseRate.toFixed(2)}%)</span></p>
        </div>
        <StatCard label="Calls Due" value={kpis.callsDue.toString()} />
        <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
        <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatCard label="Avg. Cash / Call" value={`$${kpis.avgCashPerCall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Avg. Cash / Close" value={`$${kpis.avgCashPerClose.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
        <p className="text-muted-foreground text-sm uppercase tracking-wider text-center mb-3">SHOW RATE TREND</p>
        <ResponsiveContainer width="100%" height={500}>
          {isLoading ? <div className="text-white flex items-center justify-center h-full">Loading...</div> : (
            <LineChart data={showRateTrend}>
              <CartesianGrid stroke="#232533" vertical={false} />
              <XAxis dataKey="date" stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} />
              <YAxis stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #232533', color: '#000', fontSize: 14 }} />
              <Line type="monotone" dataKey="showRate" stroke="#1e3fae" strokeWidth={3} dot={{ r: 4, fill: '#162e80' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <SetterCashTable data={setterCashData} />
    </div>
  );
};

export default SetterPage; 