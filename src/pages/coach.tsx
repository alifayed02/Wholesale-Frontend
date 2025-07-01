import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/kpis/StatCard';
import { CallsTable } from '../components/tables/CallsTable';
import { DateRangePicker } from '../components/filters/DateRangePicker';
import { PlatformSelect } from '../components/filters/PlatformSelect';
import { CoachSelect } from '../components/filters/CoachSelect';
import LeadSourcePieChart from '../components/charts/LeadSourcePieChart';
import { fetchData, calculateCoachKpis, GoogleSheetData, CoachKpiData, calculateCoachCommissionBreakdown, LeadSourceData, calculateCloseRateTrend, CloseRateTrendData } from '../data/googleSheetService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../auth/useAuth';
import { emailCoachMap } from '../constants/emailCoachMap';
import { useNavigate } from 'react-router-dom';

const CoachPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GoogleSheetData | null>(null);
  const [coachKpis, setCoachKpis] = useState<CoachKpiData>({ totalCalls: 0, coachCommission: 0 });
  const [coachOptions, setCoachOptions] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<string[]>([]);
  
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [platform, setPlatform] = useState('Select Platform');
  const [coach, setCoach] = useState('Select Coach');
  const [commissionData, setCommissionData] = useState<LeadSourceData[]>([]);
  const [closeRateTrend, setCloseRateTrend] = useState<CloseRateTrendData[]>([]);

  const { getAuthToken, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) return;
        const fetchedData = await fetchData(token);
        setData(fetchedData);
        if (fetchedData && fetchedData[0]) {
          const platforms = [...new Set(fetchedData[0].map(c => c["Platform"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          setPlatformOptions(["Select Platform", ...platforms]);

          const allCoaches = [...new Set(fetchedData[0].map(c => c["Coach Name"] || 'Unknown').filter(c => c !== 'Unknown' && c.trim() !== ''))];
          if (isAdmin) {
            setCoachOptions(["Select Coach", ...allCoaches]);
          } else {
            const allowedName = user?.email ? emailCoachMap[user.email.toLowerCase()] : undefined;
            if (!allowedName) {
              setCoachOptions([]);
            } else {
              setCoach(allowedName);
              setCoachOptions([allowedName]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    load();
  }, [getAuthToken, user, isAdmin]);

  useEffect(() => {
    if (data) {
      const selectedCoach = isAdmin ? coach : (emailCoachMap[user?.email?.toLowerCase() || ''] || 'Select Coach');
      const kpis = calculateCoachKpis(data, selectedCoach, dateRange, platform);
      setCoachKpis(kpis);
      const breakdown = calculateCoachCommissionBreakdown(
        data,
        dateRange,
        platform,
        selectedCoach
      );
      setCommissionData(breakdown);
      const trend = calculateCloseRateTrend(data, dateRange, platform, selectedCoach, 'Select Closer');
      setCloseRateTrend(trend);
      setIsLoading(false);
    }
  }, [data, dateRange, platform, isAdmin, coach, user]);

  // Redirect non-admin users without allowed coach mapping
  useEffect(() => {
    if (user && !isAdmin) {
      const email = (user.email || '').toLowerCase();
      const allowed = emailCoachMap[email];
      if (!allowed) {
        navigate('/acquisition', { replace: true });
      }
    }
  }, [user, isAdmin, navigate]);

  if (isLoading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl text-center font-bold text-foreground mb-8">Coach Dashboard</h1>
      
      <div className="flex justify-start flex-wrap gap-4 mb-4">
        <div className="w-64"><DateRangePicker from={dateRange.from as Date} to={dateRange.to as Date} onChange={setDateRange} /></div>
        <div className="w-48"><PlatformSelect platform={platform} onChange={setPlatform} options={platformOptions} /></div>
        <div className="w-48"><CoachSelect value={coach} onChange={setCoach} options={coachOptions} /></div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <StatCard label="Total Calls" value={coachKpis.totalCalls.toLocaleString()} />
        <StatCard label="Coach Commission" value={`$${coachKpis.coachCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="flex flex-col bg-neutral-900 rounded-2xl p-6 mb-4">
        <LeadSourcePieChart data={commissionData} />
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
    </div>
  );
};

export default CoachPage; 