import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/kpis/StatCard';
import { CallsTable } from '../components/tables/CallsTable';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { CloserSelect } from '../components/filters/CloserSelect';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import {
  fetchData,
  calculateKpis,
  KpiData,
  GoogleSheetData,
  calculateCallsTable,
  CallsTableData,
  getFilteredData,
  calculateCloseRateTrend,
  CloseRateTrendData
} from '../data/googleSheetService';
import { useAuth } from '../auth/useAuth';
import type { DealStatusDatum } from '../components/charts/DealStatusBreakdownChart';
import type { CloserRecord } from '../data/googleSheetService';

// Colors for pie slices
const PIE_COLORS = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

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
          const platforms = [...new Set(data[0].map(c => c["What platform did the lead come from?"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
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

      const filtered = getFilteredData(rawData, dateRange, platform, 'All', closer);
      const statusMap = new Map<string, number>();
      (filtered as CloserRecord[]).forEach((record) => {
        const status = record["Call Outcome"] || 'Unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const breakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
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

      <div className="flex justify-center flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CloserSelect value={closer} onChange={setCloser} options={closerOptions} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Close Rate" value={`${kpis.closeRate.toFixed(2)}%`} />
        <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
        <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
        <div className="bg-red-600 p-6 rounded-2xl text-center transition-all hover:bg-red-700">
          <p className="text-white/80 text-sm uppercase tracking-wider">Closer Commission</p>
          <p className="text-white text-2xl font-bold mt-2">${kpis.closerCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <StatCard label="AVG. CASH / CALL" value={`$${kpis.avgCashPerCall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />

      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
        <div className="text-muted-foreground text-sm uppercase tracking-wider text-center">DEAL STATUS BREAKDOWN</div>
        <ResponsiveContainer width="100%" height={500}>
          {isLoading ? (
            <div className="text-white flex items-center justify-center h-full">Loading...</div>
          ) : (
            <PieChart>
              <Pie
                data={dealStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={200}
                labelLine={false}
              >
                {dealStatusData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #232533', color: '#000', fontSize: 14 }} />
              <Legend iconType="circle" formatter={(value) => <span style={{ color: '#F3F4F6', fontSize: 14 }}>{value}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
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
              <Line type="monotone" dataKey="closeRate" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#991b1c' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <CallsTable data={callsData} />
    </div>
  );
};

export default CloserPage; 