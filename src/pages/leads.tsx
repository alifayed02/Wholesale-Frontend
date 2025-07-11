import React, { useState, useEffect } from 'react';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../auth/useAuth';
import {
  fetchLeadsData,
  calculateApplicantsOverTime,
  LeadsData,
  ApplicantsOverTimeDatum,
  calculateIncomeReplaceBreakdown,
  IncomeReplaceData,
  calculateApplicantSourceBreakdown,
  ApplicantSourceData,
  calculateInvestmentWillingnessBreakdown,
  InvestmentWillingData,
  calculateLeadsTable,
  LeadTableRow,
} from '../data/googleSheetService';
import DonutChart from '../components/charts/DonutChart';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { FunnelSelect } from '../components/filters/FunnelSelect';
import { CoachSelect } from '../components/filters/CoachSelect';

const donutColors = ["#1E3FAE", "#AE1D1D", "#AE8D1D", "#66AE1D", "#AE1D66", "#651DAE"];

const LeadsPage: React.FC = () => {
  const [rawData, setRawData] = useState<LeadsData | null>(null);
  const [trendData, setTrendData] = useState<ApplicantsOverTimeDatum[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeReplaceData[]>([]);
  const [sourceData, setSourceData] = useState<ApplicantSourceData[]>([]);
  const [investData, setInvestData] = useState<InvestmentWillingData[]>([]);
  const [leadsTable, setLeadsTable] = useState<LeadTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [platform, setPlatform] = useState('Select Source');

  // Funnel & Coach filter state
  const [funnelOptions, setFunnelOptions] = useState<string[]>([]);
  const [funnel, setFunnel] = useState('Select Funnel');
  const [coachOptions, setCoachOptions] = useState<string[]>([]);
  const [coach, setCoach] = useState('Select Coach');

  const { getAuthToken } = useAuth();

  // Fetch applicants data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('Unauthenticated');
        const data = await fetchLeadsData(token);
        setRawData(data);
      } catch (err) {
        console.error('Failed to fetch leads data', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [getAuthToken]);

  // Derive options for all select filters whenever raw data changes
  useEffect(() => {
    if (rawData) {
      // Source / Platform options
      const platforms = [...new Set(rawData.map(rec => (rec as any)["Source"] || 'Unknown').filter(p => p !== 'Unknown' && String(p).trim() !== ''))];
      setPlatformOptions(["Select Source", ...platforms]);

      // Funnel options
      const funnels = [...new Set(rawData.map(rec => (rec as any)["Funnel"] || 'Unknown').filter(f => f !== 'Unknown' && String(f).trim() !== ''))];
      setFunnelOptions(["Select Funnel", ...funnels]);

      // Coach options
      const coaches = [...new Set(rawData.map(rec => (rec as any)["Coach"] || 'Unknown').filter(c => c !== 'Unknown' && String(c).trim() !== ''))];
      setCoachOptions(["Select Coach", ...coaches]);
    }
  }, [rawData]);

  // Calculate applicants over time & income breakdown whenever data or filter changes
  useEffect(() => {
    if (rawData) {
      let filtered = rawData;

      // Source filter
      if (platform && platform !== 'Select Source') {
        filtered = filtered.filter(rec => (rec as any)["Source"] === platform);
      }

      // Funnel filter
      if (funnel && funnel !== 'Select Funnel') {
        filtered = filtered.filter(rec => (rec as any)["Funnel"] === funnel);
      }

      // Coach filter
      if (coach && coach !== 'Select Coach') {
        filtered = filtered.filter(rec => (rec as any)["Coach"] === coach);
      }

      const trend = calculateApplicantsOverTime(filtered, dateRange);
      setTrendData(trend);

      const incomeBreakdown = calculateIncomeReplaceBreakdown(filtered, dateRange);
      setIncomeData(incomeBreakdown);

      const srcBreakdown = calculateApplicantSourceBreakdown(filtered, dateRange);
      setSourceData(srcBreakdown);

      const investBreakdown = calculateInvestmentWillingnessBreakdown(filtered, dateRange);
      setInvestData(investBreakdown);

      const tbl = calculateLeadsTable(filtered, dateRange);
      setLeadsTable(tbl);
    }
  }, [rawData, dateRange, platform, funnel, coach]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-foreground mb-4">LEADS DATA</h1>

      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64">
          <DateRangePicker
            from={dateRange.from as Date}
            to={dateRange.to as Date}
            onChange={setDateRange}
          />
        </div>
        <div className="w-48">
          <PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} />
        </div>
        <div className="w-48">
          <FunnelSelect value={funnel} onChange={setFunnel} options={funnelOptions} />
        </div>
        <div className="w-48">
          <CoachSelect value={coach} onChange={setCoach} options={coachOptions} />
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 flex flex-col">
        <p className="text-muted-foreground text-sm uppercase tracking-wider text-center mb-3">
          APPLICANTS OVER TIME
        </p>
        <ResponsiveContainer width="100%" height={500}>
          {trendData.length === 0 ? (
            <div className="text-white flex items-center justify-center h-full">No data</div>
          ) : (
            <LineChart data={trendData}>
              <CartesianGrid stroke="#232533" vertical={false} />
              <XAxis dataKey="date" stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} />
              <YAxis stroke="#BDBDBD" tick={{ fill: '#F3F4F6', fontSize: 14 }} axisLine={{ stroke: '#232533' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #232533', color: '#000', fontSize: 14 }}
                formatter={(value) => [`${value}`, 'Applicants']}
              />
              <Line type="monotone" dataKey="applicants" stroke="#1e3fae" strokeWidth={3} dot={{ r: 4, fill: '#162e80' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-center transition-all hover:bg-blue-700">
          <p className="text-white/80 text-sm uppercase tracking-wider">Total Applicants</p>
          <p className="text-white text-2xl font-bold mt-2">{leadsTable.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">CASH ON HAND</p>
          <ResponsiveContainer width="100%" height={350}>
              {investData.length === 0 ? (
                <div className="text-white flex items-center justify-center h-full">No data</div>
            ) : (
              <BarChart data={investData}>
                <CartesianGrid stroke="#232533" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#BDBDBD"
                  tick={{ fill: "#F3F4F6", fontSize: 14 }}
                  axisLine={{ stroke: "#232533" }}
                />
                <YAxis
                  stroke="#BDBDBD"
                  tick={{ fill: "#F3F4F6", fontSize: 14 }}
                  axisLine={{ stroke: "#232533" }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #232533', color: '#000', fontSize: 14 }} formatter={(value) => [`${value}`, 'Applicants']} />
                <Bar dataKey="count" fill="#1e3fae" barSize={30} />
              </BarChart>
              )}
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">APPLICANT SOURCE</p>
          <DonutChart data={sourceData} colors={donutColors} />
        </div>
      </div>

      <div className="bg-neutral-900 rounded-2xl p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted-foreground border-b border-neutral-800">
              <th className="p-4 font-medium">SOURCE</th>
              <th className="p-4 font-medium">FUNNEL</th>
              <th className="p-4 font-medium">CASH ON HAND</th>
              <th className="p-4 font-medium">DATE</th>
              <th className="p-4 font-medium">NAME</th>
              <th className="p-4 font-medium">PHONE</th>
              <th className="p-4 font-medium">EMAIL</th>
            </tr>
          </thead>
          <tbody>
            {leadsTable.map((row, index) => (
              <tr key={index} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50 transition-colors">
                <td className="p-4">{row.source}</td>
                <td className="p-4">{row.funnel}</td>
                <td className="p-4">{row.moneyOnHand}</td>
                <td className="p-4">{row.date}</td>
                <td className="p-4">{row.name}</td>
                <td className="p-4">{row.phone}</td>
                <td className="p-4">{row.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsPage; 