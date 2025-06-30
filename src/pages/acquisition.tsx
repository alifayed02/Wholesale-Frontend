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
          const platforms = [...new Set(data[0].map(c => c["What platform did the lead come from?"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setPlatformOptions(["Select Platform", ...platforms]);

          const coaches = [...new Set(data[0].map(c => c["Who did lead come from?"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
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
      <div className="flex justify-center flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CoachSelect value={coach} onChange={setCoach} options={coachOptions} /></div>
        <div className="w-48"><CloserSelect value={closer} onChange={setCloser} options={closerOptions} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard label="Cash Collected" value={`$${kpis.cashCollected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
        <StatCard label="Calls Due" value={kpis.callsDue.toString()} />
        <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
        <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
      </div>
      <div className="grid grid-cols-2 gap-6">
            <StatCard label="Show Rate" value={`${kpis.showRate.toFixed(2)}%`} />
            <StatCard label="Close Rate" value={`${kpis.closeRate.toFixed(2)}%`} />
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