import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/kpis/StatCard';
import DonutChart from '../components/charts/DonutChart';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { CoachSelect } from '../components/filters/CoachSelect';
import { CloserSelect } from '../components/filters/CloserSelect';
import { FunnelSelect } from '../components/filters/FunnelSelect';
import { SituationSelect } from '../components/filters/SituationSelect';
import {
  fetchData,
  calculateKpis,
  KpiData,
  GoogleSheetData,
  calculateFunnelBreakdown,
  FunnelBreakdownData,
  calculateSituationBreakdown,
  SituationBreakdownData,
  calculateDealStatusBreakdown,
  DealStatusDatum,
  SITUATION_DISPLAY_MAP
} from '../data/googleSheetService';
import { useAuth } from '../auth/useAuth';

const donutColors = ["#1E3FAE", "#AE1D1D", "#AE8D1D", "#66AE1D", "#AE1D66", "#651DAE"];

const AcquisitionDataPage: React.FC = () => {
  const [rawData, setRawData] = useState<GoogleSheetData | null>(null);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelBreakdownData[]>([]);
  const [situationData, setSituationData] = useState<SituationBreakdownData[]>([]);
  const [dealStatusData, setDealStatusData] = useState<DealStatusDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platform, setPlatform] = useState<string>('Select Platform');
  const [coach, setCoach] = useState<string>('Select Coach');
  const [closer, setCloser] = useState<string>('Select Closer');
  const [funnel, setFunnel] = useState<string>('Select Funnel');
  const [situation, setSituation] = useState<string>('Select Situation');

  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [coachOptions, setCoachOptions] = useState<string[]>([]);
  const [closerOptions, setCloserOptions] = useState<string[]>([]);
  const [funnelOptions, setFunnelOptions] = useState<string[]>([]);
  const [situationOptions, setSituationOptions] = useState<string[]>([]);

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
            const coaches = [...new Set(data[0].map(item => item["Coach Name"]).filter(Boolean))] as string[];
            setCloserOptions(["Select Closer", ...closers]);
            setCoachOptions(["Select Coach", ...coaches]);

            const funnels = [...new Set(data[0].map(c => c["Funnel"] || 'Unknown').filter(f => f !== 'Unknown' && f.trim() !== ''))];
            setFunnelOptions(["Select Funnel", ...funnels]);

            const situationsRaw = [...new Set(data[0].map(item => (item as any)["Situation"]).filter(Boolean))] as string[];
            const situationsFormatted = [...new Set(situationsRaw.map(s => SITUATION_DISPLAY_MAP[s] ?? s))];
            setSituationOptions(["Select Situation", ...situationsFormatted]);
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
      let dataFiltered: GoogleSheetData = rawData;
      if (funnel && funnel !== 'Select Funnel' && rawData[0]) {
        const filteredRecords = rawData[0].filter(rec => rec["What funnel?"] === funnel);
        dataFiltered = [filteredRecords];
      }

      const calculatedKpis = calculateKpis(dataFiltered, dateRange, platform, coach, closer, situation);
      setKpis(calculatedKpis);

      const funnelBreakdown = calculateFunnelBreakdown(dataFiltered, dateRange, platform, coach, closer, situation);
      setFunnelData(funnelBreakdown);

      const situationBreakdown = calculateSituationBreakdown(dataFiltered, dateRange, platform, coach, closer, situation);
      setSituationData(situationBreakdown);

      const dealStatusBreakdown = calculateDealStatusBreakdown(dataFiltered, dateRange, platform, coach, closer, situation);
      setDealStatusData(dealStatusBreakdown);
    }
  }, [rawData, dateRange, platform, coach, closer, funnel, situation]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  if (!kpis) {
    return <div className="text-white text-center p-8">No data available.</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-foreground mb-4">ACQUISITION DATA</h1>
            <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
      </div>
      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CoachSelect value={coach} onChange={setCoach} options={coachOptions} /></div>
        <div className="w-48"><CloserSelect value={closer} onChange={setCloser} options={closerOptions} /></div>
        <div className="w-48"><FunnelSelect value={funnel} onChange={setFunnel} options={funnelOptions} /></div>
        <div className="w-48"><SituationSelect value={situation} onChange={setSituation} options={situationOptions} /></div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">FUNNEL BREAKDOWN</p>
          <DonutChart data={funnelData} colors={donutColors} />
        </div>
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">PROSPECT SITUATION</p>
          <DonutChart data={situationData} colors={donutColors} />
        </div>
        <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
          <p className="text-muted-foreground text-sm uppercase tracking-wider text-center mb-3">DEAL STATUS BREAKDOWN</p>
          <DonutChart data={dealStatusData} colors={donutColors} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <StatCard label="Cash Collected" value={`$${kpis.cashCollected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
            <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
            <StatCard label="Show Rate" value={`${kpis.showRate.toFixed(2)}%`} />
            <StatCard label="Close Rate" value={`${kpis.closeRate.toFixed(2)}%`} />
          </div>
          <div className="grid grid-cols-3 gap-6">
              <StatCard label="Calls Due" value={kpis.callsDue.toString()} />
              <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
              <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <StatCard label="Calls Cancelled (No Confirmation)" value={kpis.callsCancelledNoConfirmation.toString()} />
            <StatCard label="Calls Taken Not Closed (No Confirmation)" value={kpis.callsTakenNotClosedNoConfirmation.toString()} />
            <StatCard label="True Show Rate" value={`${kpis.trueShowRate.toFixed(2)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcquisitionDataPage; 