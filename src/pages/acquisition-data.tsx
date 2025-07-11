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
  calculateProspectTable,
  ProspectTableRow,
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
  const [prospectTable, setProspectTable] = useState<ProspectTableRow[]>([]);
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
            setSituationOptions(["Select Situation", ...situationsFormatted.sort()]);
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

      const prospectRows = calculateProspectTable(dataFiltered, dateRange, platform, coach, closer, situation, funnel);
      setProspectTable(prospectRows);
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
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-600 p-6 rounded-2xl text-center transition-all hover:bg-blue-700">
              <p className="text-white/80 text-sm uppercase tracking-wider">SETTER COMMISSION</p>
              <p className="text-white text-2xl font-bold mt-2">${kpis.cashCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {/* <StatCard label="Cash Collected" value={`$${kpis.cashCollected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} /> */}
            <StatCard label="Revenue Generated" value={`$${kpis.revenueGenerated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-2 gap-6">
            <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Show Rate</p>
              <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.showRate.toFixed(2)}% <span className="text-muted-foreground text-sm tracking-wider">(true: {kpis.trueShowRate.toFixed(2)}%)</span></p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-2xl text-center transition-all hover:bg-neutral-800/50">
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Close Rate</p>
              <p className="text-foreground text-2xl font-bold mt-2 break-words">{kpis.closeRate.toFixed(2)}%</p>
            </div>
          </div>
          <div className="grid grid-cols-5 xs:grid-cols-1 gap-6">
            <StatCard label="Calls Due" value={kpis.callsDue.toString()} />
            <StatCard label="Calls Taken" value={kpis.callsTaken.toString()} />
            <StatCard label="Calls Closed" value={kpis.callsClosed.toString()} />
            <StatCard label="Calls Cancelled (No Conf.)" value={kpis.callsCancelledNoConfirmation.toString()} />
            <StatCard label="Calls Taken Not Closed (No Conf.)" value={kpis.callsTakenNotClosedNoConfirmation.toString()} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <StatCard label="AVG. CASH / CALL" value={`$${kpis.avgCashPerCall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatCard label="AVG. CASH / CLOSE" value={`$${kpis.avgCashPerClose.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        </div>
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
      <div className="bg-neutral-900 rounded-2xl p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted-foreground border-b border-neutral-800">
              <th className="p-4 font-medium">PLATFORM</th>
              <th className="p-4 font-medium">COACH</th>
              <th className="p-4 font-medium">CLOSER</th>
              <th className="p-4 font-medium">SETTER</th>
              <th className="p-4 font-medium">FUNNEL</th>
              <th className="p-4 font-medium">DATE</th>
              <th className="p-4 font-medium">PROSPECT</th>
            </tr>
          </thead>
          <tbody>
            {prospectTable.map((row, index) => (
              <tr key={index} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50 transition-colors">
                <td className="p-4">{row.platform}</td>
                <td className="p-4">{row.coach}</td>
                <td className="p-4">{row.closer}</td>
                <td className="p-4">{row.setter}</td>
                <td className="p-4">{row.funnel}</td>
                <td className="p-4">{row.date}</td>
                <td className="p-4">{row.prospect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default AcquisitionDataPage; 