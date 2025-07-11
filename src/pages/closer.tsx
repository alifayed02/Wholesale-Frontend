import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/kpis/StatCard';
import { CallsTable } from '../components/tables/CallsTable';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { CloserSelect } from '../components/filters/CloserSelect';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, Tooltip } from 'recharts';
import DonutChart from '../components/charts/DonutChart';
import {
  fetchData,
  calculateKpis,
  KpiData,
  GoogleSheetData,
  calculateCallsTable,
  CallsTableData,
  calculateDealStatusBreakdown,
  DealStatusDatum,
  calculateCloseRateTrend,
  CloseRateTrendData
} from '../data/googleSheetService';
import { useAuth } from '../auth/useAuth';
import type { CloserRecord } from '../data/googleSheetService';

// Colors for pie slices
const PIE_COLORS = ["#1E3FAE", "#AE1D1D", "#AE8D1D", "#66AE1D", "#AE1D66", "#651DAE"];

const CloserPage: React.FC = () => {
  const [rawData, setRawData] = useState<GoogleSheetData | null>(null);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [callsData, setCallsData] = useState<CallsTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealStatusData, setDealStatusData] = useState<DealStatusDatum[]>([]);
  const [closeRateTrend, setCloseRateTrend] = useState<CloseRateTrendData[]>([]);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platform, setPlatform] = useState('Select Platform');
  const [closer, setCloser] = useState('Select Closer');

  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [closerOptions, setCloserOptions] = useState<string[]>([]);

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

          const closers = [...new Set(data[0].map(item => item["Closer Name"]).filter(Boolean))] as string[];
          setCloserOptions(["Select Closer", ...closers]);
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
      const calculatedKpis = calculateKpis(rawData, dateRange, platform, 'All', closer);
      setKpis(calculatedKpis);
      const callsTableData = calculateCallsTable(rawData, dateRange, platform, 'All', closer);
      setCallsData(callsTableData);

      const breakdown = calculateDealStatusBreakdown(rawData, dateRange, platform, 'All', closer);
      setDealStatusData(breakdown);

      const trend = calculateCloseRateTrend(rawData, dateRange, platform, 'All', closer);
      setCloseRateTrend(trend);
    }
  }, [rawData, dateRange, platform, closer]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  if (!kpis) {
    return <div className="text-white text-center p-8">No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-foreground mb-4">CLOSER DATA</h1>

      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CloserSelect value={closer} onChange={setCloser} options={closerOptions} /></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <StatCard label="Cash Collected" value={`$${kpis.cashCollected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-center transition-all hover:bg-blue-700">
          <p className="text-white/80 text-sm uppercase tracking-wider">Closer Commission</p>
          <p className="text-white text-2xl font-bold mt-2">${kpis.closerCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 xs:grid-cols-1 gap-6">
        <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Show Rate</p>
          <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.showRate.toFixed(2)}% <span className="text-muted-foreground text-sm tracking-wider">(true: {kpis.trueShowRate.toFixed(2)}%)</span></p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Close Rate</p>
          <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.closeRate.toFixed(2)}%</p>
        </div>
        <StatCard label="Calls Due" value={kpis.callsDue.toString()} />
        <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
        <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <StatCard label="AVG. CASH / CALL" value={`$${kpis.avgCashPerCall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="AVG. CASH / CLOSE" value={`$${kpis.avgCashPerClose.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
        <p className="text-muted-foreground text-sm uppercase tracking-wider text-center mb-3">DEAL STATUS BREAKDOWN</p>
        {isLoading ? (
          <div className="text-white flex items-center justify-center h-[500px]">Loading...</div>
        ) : (
          <DonutChart data={dealStatusData} colors={PIE_COLORS} />
        )}
      </div>

      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
        <p className="text-muted-foreground text-sm uppercase tracking-wider text-center mb-3">CLOSE RATE TREND</p>
        <ResponsiveContainer width="100%" height={500}>
          {isLoading ? <div className="text-white flex items-center justify-center h-full">Loading...</div> : (
            <LineChart data={closeRateTrend}>
              <CartesianGrid stroke="#232533" vertical={false} />
              <XAxis dataKey="date" stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} />
              <YAxis stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #232533', color: '#000', fontSize: 14 }} />
              <Line type="monotone" dataKey="closeRate" stroke="#1e3fae" strokeWidth={3} dot={{ r: 4, fill: '#162e80' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <CallsTable data={callsData} />
    </div>
  );
};

export default CloserPage; 