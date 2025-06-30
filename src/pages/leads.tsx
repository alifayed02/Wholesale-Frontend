import React, { useState, useEffect } from 'react';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
} from '../data/googleSheetService';
import DonutChart from '../components/charts/DonutChart';
import { PlatformSelect } from '../components/filters/PlatformSelect';

const donutColors = ['#FF0000', '#FF6666', '#FFA500', '#FFD700', '#00C49F', '#0088FE', '#FFBB28'];

const LeadsPage: React.FC = () => {
  const [rawData, setRawData] = useState<LeadsData | null>(null);
  const [trendData, setTrendData] = useState<ApplicantsOverTimeDatum[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeReplaceData[]>([]);
  const [sourceData, setSourceData] = useState<ApplicantSourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  const [platform, setPlatform] = useState('Select Platform');

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

  // Derive platform options whenever raw data changes
  useEffect(() => {
    if (rawData) {
      const platforms = [...new Set(rawData.map(rec => (rec as any)["Source"] || 'Unknown').filter(p => p !== 'Unknown' && String(p).trim() !== ''))];
      setPlatformOptions(["Select Platform", ...platforms]);
    }
  }, [rawData]);

  // Calculate applicants over time & income breakdown whenever data or filter changes
  useEffect(() => {
    if (rawData) {
      // Apply platform filter first
      let platformFiltered = rawData;
      if (platform && platform !== 'Select Platform') {
        platformFiltered = rawData.filter(rec => (rec as any)["Source"] === platform);
      }

      const trend = calculateApplicantsOverTime(platformFiltered, dateRange);
      setTrendData(trend);

      const incomeBreakdown = calculateIncomeReplaceBreakdown(platformFiltered, dateRange);
      setIncomeData(incomeBreakdown);

      const srcBreakdown = calculateApplicantSourceBreakdown(platformFiltered, dateRange);
      setSourceData(srcBreakdown);
    }
  }, [rawData, dateRange, platform]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-foreground mb-4">LEADS DATA</h1>

      <div className="flex justify-center flex-wrap gap-4 mb-4">
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
              <Line type="monotone" dataKey="applicants" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#991b1c' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2  gap-6">
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">APPLICANT SOURCE</p>
          <DonutChart data={sourceData} colors={donutColors} />
        </div>
        <div className="bg-neutral-900 rounded-2xl p-6">
          <p className="text-muted-foreground text-center text-sm uppercase tracking-wider">INCOME NEEDED TO REPLACE CURRENT INCOME</p>
          <DonutChart data={incomeData} colors={donutColors} />
        </div>
      </div>
    </div>
  );
};

export default LeadsPage; 