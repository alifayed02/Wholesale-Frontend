import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { StatCard } from '../components/kpis/StatCard';
import { BarChart } from '../components/charts/BarChart';
import { CallsTable } from '../components/tables/CallsTable';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { CoachSelect } from '../components/filters/CoachSelect';
import { CloserSelect } from '../components/filters/CloserSelect';
import LeadSourcePieChart from '../components/charts/LeadSourcePieChart';
import {
  fetchData,
  calculateKpis,
  KpiData,
  GoogleSheetData,
  calculateCashCollectedChart,
  CashCollectedChartData,
  calculateCallsTable,
  CallsTableData,
  calculateLeadSourceBreakdown,
  LeadSourceData,
} from '../data/googleSheetService';

const AcquisitionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [googleSheetData, setGoogleSheetData] = useState<GoogleSheetData | null>(null);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<CashCollectedChartData[]>([]);
  const [callsData, setCallsData] = useState<CallsTableData[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<LeadSourceData[]>([]);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platform, setPlatform] = useState('Select Platform');
  const [coach, setCoach] = useState('Select Coach');
  const [closer, setCloser] = useState('Select Closer');

  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [coachOptions, setCoachOptions] = useState<string[]>([]);
  const [closerOptions, setCloserOptions] = useState<string[]>([]);

  const { getAuthToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('Unauthenticated');
        const data: GoogleSheetData = await fetchData(token);
        setGoogleSheetData(data);
        
        if (data && data[0]) {
          const platforms = [...new Set(data[0].map(c => c["Platform"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setPlatformOptions(["Select Platform", ...platforms]);

          const coaches = [...new Set(data[0].map(c => c["Coach Name"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setCoachOptions(["Select Coach", ...coaches]);

          const closers = [...new Set(data[0].map(c => c["Closer Name"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setCloserOptions(["Select Closer", ...closers]);
        }
      } catch (error) {
        console.error("Failed to fetch acquisition data", error);
      }
    };

    loadData();
  }, [getAuthToken]);

  useEffect(() => {
    if (googleSheetData) {
      const kpiData = calculateKpis(googleSheetData, dateRange, platform, coach, closer);
      const cashChartData = calculateCashCollectedChart(googleSheetData, dateRange, platform, coach, closer);
      const callsTableData = calculateCallsTable(googleSheetData, dateRange, platform, coach, closer);
      const leadSrcData = calculateLeadSourceBreakdown(googleSheetData, dateRange, platform, coach, closer);
      
      setKpis(kpiData);
      setChartData(cashChartData);
      setCallsData(callsTableData);
      setLeadSourceData(leadSrcData);
      setIsLoading(false);
    }
  }, [googleSheetData, dateRange, platform, coach, closer]);
  
  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }
  
  if (!kpis) {
      return <div className="text-white text-center p-8">No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-center font-bold text-foreground mb-8">Dashboard</h1>
      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CoachSelect value={coach} onChange={setCoach} options={coachOptions} /></div>
        <div className="w-48"><CloserSelect value={closer} onChange={setCloser} options={closerOptions} /></div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-600 p-6 rounded-2xl text-center transition-all hover:bg-blue-700">
          <p className="text-white/80 text-sm uppercase tracking-wider">Cash Collected</p>
          <p className="text-white text-2xl font-bold mt-2">${kpis.cashCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
          <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        </div>
        <div className="grid grid-cols-5 xs:grid-cols-2 gap-6">
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
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/3 flex flex-col gap-6">
          <div className="bg-neutral-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Cash Collected Trend</h2>
            <BarChart data={chartData} />
          </div>
          <div className="bg-neutral-900 rounded-2xl p-6">
            <LeadSourcePieChart data={leadSourceData} />
          </div>
        </div>
      </div>
      
      <CallsTable data={callsData} />
    </div>
  );
};

export default AcquisitionPage; 