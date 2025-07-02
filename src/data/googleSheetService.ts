import { coachCommissionRateMap } from '../constants/emailCoachMap';

export interface CloserRecord {
    "Timestamp": string;
    "Prospect Name": string;
    "Offer Made": string;
    "Call Outcome": string;
    "Cash Collected": string;
    "Revenue Generated": string;
    "Closer Name": string;
    "Setter Name": string;
    "Coach Name": string;
    "Platform": string;
    "Funnel": string;
    "Fathom Link": string;
    "Date Call Was Taken"?: string;
    "Call Notes \n(Please include where you processed the payment)"?: string;
    "Who did lead come from?"?: string;
    "What platform did the lead come from?"?: string;
    "What funnel?"?: string;
    "Revenue Generated\nThe total value of the contract (ex: 3000, 4000)\nYour answer"?: string;
}

export type GoogleSheetData = [CloserRecord[]];

export interface KpiData {
    cashCollected: number;
    revenueGenerated: number;
    callsDue: number;
    callsTaken: number;
    callsClosed: number;
    showRate: number;
    closeRate: number;
    closerCommission: number;
    avgCashPerCall: number;
    callsCancelledNoConfirmation: number;
    callsTakenNotClosedNoConfirmation: number;
}

export interface RevenueByCloserData {
  closer: string;
  revenue: number;
}

export interface LeadSourceData {
  source: string;
  value: number;
}

export interface ShowRateTrendData {
  date: string;
  showRate: number;
}

export interface DetailedTableRowData {
  prospect: string;
  source: string;
  dateCallTaken: string;
  setter: string;
  closer: string;
  callOutcome: string;
  cashCollected: string;
  setterShowRate: string;
  closerCloseRate: string;
  avgDealSize: string;
}

export interface CloserMetricData {
  name: string;
  calls: number;
  closes: number;
  closeRate: number;
  revenue: number;
  commission: number;
  cashCollected: number;
  averageCloseSize: number;
}

export interface DealStatusData {
  source: string;
  value: number;
}

export interface CloseRateTrendData {
  date: string;
  closeRate: number;
}

export interface SDRMetricData {
  name: string;
  shows: number;
  showRate: number;
  commission: number;
}

export interface SDRChartData {
  callsByDay: { day: string; calls: number }[];
  leadSourceBreakdown: { source: string; value: number }[];
  showRateTrend: { date: string; showRate: number }[];
}

export interface CloserChartData {
    revenueByCloser: RevenueByCloserData[];
    dealStatusBreakdown: DealStatusData[];
    closeRateTrend: CloseRateTrendData[];
}

export interface ChartData {
    revenueByCloser: RevenueByCloserData[];
    leadSourceBreakdown: LeadSourceData[];
    showRateTrend: ShowRateTrendData[];
}

export interface LeadApplicationRecord {
  showRate: number;
  closeRate: number;
}

export interface CoachKpiData {
  totalCalls: number;
  coachCommission: number;
}

const API_BASE =
  import.meta.env.VITE_ENVIRONMENT === 'production'
    ? import.meta.env.VITE_BACKEND_URL
    : 'http://localhost:5005';

export const fetchData = async (token: string): Promise<GoogleSheetData> => {
  const response = await fetch(`${API_BASE}/data/eoc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export interface FunnelBreakdownData {
    name: string;
    value: number; // percentage
    cash: number;  // total cash collected
}

export const getFilteredData = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string,
    setter?: string,
): CloserRecord[] => {
    if (!data || !Array.isArray(data) || !data[0]) {
        return [];
    }
    const closerData: CloserRecord[] = data[0];

    const adjustedDateRange = dateRange && dateRange.from && dateRange.to ? {
        from: new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)),
        to: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999))
    } : null;

    const isPlaceholder = (val?: string) => !val || val.toLowerCase().startsWith('select');

    return closerData.filter(record => {
        if (adjustedDateRange) {
            const recordDate = new Date(record["Timestamp"]);
            if (isNaN(recordDate.getTime())) return false;
            if (recordDate < adjustedDateRange.from || recordDate > adjustedDateRange.to) {
                return false;
            }
        }

        if (platform && !isPlaceholder(platform) && platform !== 'All' && record["Platform"] !== platform) {
            return false;
        }

        if (coach && !isPlaceholder(coach) && coach !== 'All' && record["Coach Name"] !== coach) {
            return false;
        }

        if (closer && !isPlaceholder(closer) && closer !== 'All' && record["Closer Name"] !== closer) {
            return false;
        }

        if (setter && !isPlaceholder(setter) && setter !== 'All' && record["Setter Name"] !== setter) {
            return false;
        }

        return true;
    });
};

export const calculateFunnelBreakdown = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): FunnelBreakdownData[] => {
    const filteredData = getFilteredData(data, dateRange, platform, coach, closer);
    
    if (filteredData.length === 0) {
        return [];
    }

    const validFunnelData = filteredData.filter(r => r["Funnel"]); // exclude null/undefined funnels

    if (validFunnelData.length === 0) {
        return [];
    }

    const funnelCount = new Map<string, number>();
    const funnelCash = new Map<string, number>();

    validFunnelData.forEach(record => {
        const funnel = record["Funnel"] as string;
        funnelCount.set(funnel, (funnelCount.get(funnel) || 0) + 1);

        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        funnelCash.set(funnel, (funnelCash.get(funnel) || 0) + cash);
    });

    const totalCount = validFunnelData.length;

    return Array.from(funnelCount.entries()).map(([name, count]) => ({
        name,
        value: (count / totalCount) * 100,
        cash: funnelCash.get(name) || 0
    }));
};

export const calculateLeadSourceBreakdown = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): LeadSourceData[] => {
    const filteredData = getFilteredData(data, dateRange, platform, coach, closer);

    if (filteredData.length === 0) {
        return [];
    }

    const validSourceData = filteredData.filter(r => r["Platform"]); // exclude null/undefined sources

    if (validSourceData.length === 0) {
        return [];
    }

    const sourceMap = new Map<string, number>();
    validSourceData.forEach(record => {
        const src = record["Platform"] || "Unknown";
        sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    });

    return Array.from(sourceMap.entries()).map(([source, value]) => ({ source, value }));
};

const revenueKey = "Revenue Generated";

export const calculateKpis = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): KpiData => {
  const initialKpis: KpiData = {
    cashCollected: 0,
    revenueGenerated: 0,
    callsDue: 0,
    callsTaken: 0,
    callsClosed: 0,
    showRate: 0,
    closeRate: 0,
    closerCommission: 0,
    avgCashPerCall: 0,
    callsCancelledNoConfirmation: 0,
    callsTakenNotClosedNoConfirmation: 0,
  };
  
  const filteredData = getFilteredData(data, dateRange, platform, coach, closer);

  const cashCollected = filteredData.reduce((sum, record) => {
    const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g,"")) || 0;
    return sum + cash;
  }, 0);

  const revenueGenerated = filteredData.reduce((sum, record) => {
    const revenueStr = record[revenueKey as keyof CloserRecord] as string;
    const revenue = parseFloat(String(revenueStr || "0").replace(/[^0-9.-]+/g,"")) || 0;
    return sum + revenue;
  }, 0);

  const callsDue = filteredData.filter(r => r["Call Outcome"] !== "Cancelled" && r["Call Outcome"] !== "Rescheduled").length;

  const callsTaken = filteredData.filter(r => {
    const outcome = r["Call Outcome"];
    return outcome !== "Cancelled" && outcome !== "Rescheduled" && outcome !== "No Show" && outcome !== "MRR" && outcome !== "Deposit Collected";
  }).length;

  const callsClosed = filteredData.filter(r => r["Call Outcome"] === "Closed").length;

  const callsCancelledNoConf = filteredData.filter(r => r["Call Outcome"] === "Cancelled by sales team (no confirmation)").length;

  const callsTakenNotClosedNoConf = filteredData.filter(r => r["Call Outcome"] === "Taken - Not Closed").length;

  const showRate = callsDue > 0 ? (callsTaken / callsDue) * 100 : 0;
  const closeRate = callsTaken > 0 ? (callsClosed / callsTaken) * 100 : 0;
  const closerCommission = cashCollected * 0.1;
  const avgCashPerCall = callsClosed > 0 ? cashCollected / callsTaken : 0;

  return {
    cashCollected,
    revenueGenerated,
    callsDue,
    callsTaken,
    callsClosed,
    showRate,
    closeRate,
    closerCommission,
    avgCashPerCall,
    callsCancelledNoConfirmation: callsCancelledNoConf,
    callsTakenNotClosedNoConfirmation: callsTakenNotClosedNoConf,
  };
};

export const calculateCoachKpis = (
    data: GoogleSheetData,
    coach: string,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
): CoachKpiData => {
    const initialKpis: CoachKpiData = { totalCalls: 0, coachCommission: 0 };

    if (!data || !Array.isArray(data) || !data[0]) {
        return initialKpis;
    }

    // Use the shared filtering helper; pass closer as 'All' to ignore that filter
    const filteredData = getFilteredData(data, dateRange, platform, coach, 'Select Closer');

    if (filteredData.length === 0) {
        return initialKpis;
    }

    const totalCalls = filteredData.filter(r => {
        const outcome = r["Call Outcome"];
        return outcome !== "Cancelled" && outcome !== "Rescheduled" && outcome !== "No Show";
    }).length;

    let coachCommission = 0;
    const totalCashCollected = filteredData.reduce((sum, record) => {
        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        const coachName = record["Coach Name"] || 'Unknown';
        const rate = coachCommissionRateMap[coachName] ?? 0.325;
        coachCommission += cash * rate;
        return sum + cash;
    }, 0);

    // If coach param is specified and mapped, overwrite commission with its rate times totalCashCollected to avoid accumulation errors
    if (coach && coach !== 'Select Coach' && coachCommissionRateMap[coach]) {
        coachCommission = totalCashCollected * (coachCommissionRateMap[coach] ?? 0.325);
    }

    return { totalCalls, coachCommission };
};

export interface CashCollectedChartData {
    date: string;
    cash: number;
}

export const calculateCashCollectedChart = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): CashCollectedChartData[] => {
    if (!data || !data[0]) return [];

    const filteredData = getFilteredData(data, dateRange, platform, coach, closer);

    const cashByDate = new Map<string, number>();

    filteredData.forEach(record => {
        const ts = record["Timestamp"];
        if (!ts) return;

        // Extract the raw date portion (e.g. "6/26/2025") without any timezone conversions
        const dateKey = ts.split(' ')[0];

        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        cashByDate.set(dateKey, (cashByDate.get(dateKey) || 0) + cash);
    });

    const toDate = (mdy: string) => {
        const [m, d, y] = mdy.split('/').map(Number);
        return new Date(y, m - 1, d);
    };

    return Array.from(cashByDate.entries())
        .map(([dateKey, cash]) => ({ dateKey, cash }))
        .sort((a, b) => toDate(a.dateKey).getTime() - toDate(b.dateKey).getTime())
        .map(item => ({
            date: toDate(item.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            cash: item.cash,
        }));
};

export const calculateCloseRateTrend = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): CloseRateTrendData[] => {
    const filtered = getFilteredData(data, dateRange, platform, coach, closer);

    const byDate = new Map<string, { taken: number; closed: number }>();

    filtered.forEach(record => {
        const dateStr = record["Timestamp"];
        if (!dateStr) return;
        const dateKey = dateStr.split(' ')[0]; // keeps original m/d/yyyy format
        const stats = byDate.get(dateKey) || { taken: 0, closed: 0 };
        const outcome = record["Call Outcome"];
        if (outcome !== "Cancelled" && outcome !== "Rescheduled" && outcome !== "No Show" && outcome !== "MRR" && outcome !== "Deposit Collected") {
            stats.taken += 1;
        }
        if (outcome === "Closed") {
            stats.closed += 1;
        }
        byDate.set(dateKey, stats);
    });

    const result: CloseRateTrendData[] = [];
    byDate.forEach((stats, dateKey) => {
        const closeRate = stats.taken > 0 ? Number(((stats.closed / stats.taken) * 100).toFixed(2)) : 0;
        const [monthStr, dayStr, yearStr] = dateKey.split('/');
        const displayDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        result.push({ date: displayDate, closeRate });
    });

    // sort by date ascending
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export interface CallsTableData {
    date: string;
    closer: string;
    setter: string;
    prospect: string;
    outcome: string;
    cashCollected: string;
    coach: string;
    platform: string;
}

export const calculateCallsTable = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach?: string,
    closer?: string
): CallsTableData[] => {
    if (!data || !data[0]) return [];

    const filteredData = getFilteredData(data, dateRange, platform, coach, closer);

    return filteredData
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => {
            const dateA = a["Timestamp"] ? new Date(a["Timestamp"]).getTime() : 0;
            const dateB = b["Timestamp"] ? new Date(b["Timestamp"]).getTime() : 0;
            return dateB - dateA; // Sort descending
        })
        .map(record => ({
            date: record["Timestamp"] ? record["Timestamp"].split(' ')[0] : "N/A",
            closer: record["Closer Name"] || "N/A",
            setter: record["Setter Name"] || "N/A",
            prospect: record["Prospect Name"] || "N/A",
            outcome: record["Call Outcome"] || "N/A",
            cashCollected: `$${(parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            coach: record["Coach Name"] || "N/A",
            platform: record["Platform"] || "N/A",
        }));
};

export interface SetterKpiData {
    setterCommission: number;
    avgCashPerCall: number;
    showRate: number;
    closeRate: number;
}

export const calculateSetterKpis = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    setter?: string
): SetterKpiData => {
    const filteredData = getFilteredData(data, dateRange, platform, 'Select Coach', 'Select Closer').filter(r => {
        if (setter && !isPlaceholderValue(setter) && r["Setter Name"] !== setter) {
            return false;
        }
        return true;
    });

    let setterCommission = filteredData.reduce((sum, record) => {
        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        return sum + cash;
    }, 0);
    setterCommission = setterCommission * 0.05;

    const callsDue = filteredData.filter(r => {
        const out = r["Call Outcome"];
        return out !== "Cancelled" && out !== "Rescheduled";
    }).length;

    const callsTaken = filteredData.filter(r => {
        const out = r["Call Outcome"];
        return out !== "Cancelled" && out !== "Rescheduled" && out !== "No Show" && out !== "MRR" && out !== "Deposit Collected";
    }).length;

    const closedCalls = filteredData.filter(r => r["Call Outcome"] === "Closed");
    const closedCallsCount = closedCalls.length;
    
    const cashFromClosedCalls = closedCalls.reduce((sum, record) => {
        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        return sum + cash;
    }, 0);

    const avgCashPerCall = closedCallsCount > 0 ? cashFromClosedCalls / closedCallsCount : 0;

    const showRate = callsDue > 0 ? (callsTaken / callsDue) * 100 : 0;
    const closeRate = callsTaken > 0 ? (closedCallsCount / callsTaken) * 100 : 0;

    return {
        setterCommission,
        avgCashPerCall,
        showRate,
        closeRate,
    };
};

export interface SetterCashData {
    setterName: string;
    totalCash: number;
    avgCashPerCall: number;
}

export const calculateSetterCashTable = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    setter?: string
): SetterCashData[] => {
    const filteredData = getFilteredData(data, dateRange, platform, 'Select Coach', 'Select Closer').filter(r => {
        if (setter && !isPlaceholderValue(setter) && r["Setter Name"] !== setter) {
            return false;
        }
        return true;
    });

    const setterStats = new Map<string, { totalCash: number, closedCallsCount: number, cashFromClosedCalls: number }>();

    filteredData.forEach(record => {
        const setterName = record["Setter Name"];
        if (!setterName) return;

        if (!setterStats.has(setterName)) {
            setterStats.set(setterName, { totalCash: 0, closedCallsCount: 0, cashFromClosedCalls: 0 });
        }
        const stats = setterStats.get(setterName)!;

        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        stats.totalCash += cash;

        if (record["Call Outcome"] === "Closed") {
            stats.closedCallsCount++;
            stats.cashFromClosedCalls += cash;
        }
    });

    return Array.from(setterStats.entries()).map(([setterName, stats]) => ({
        setterName,
        totalCash: stats.totalCash,
        avgCashPerCall: stats.closedCallsCount > 0 ? stats.cashFromClosedCalls / stats.closedCallsCount : 0,
    }));
};

export const calculateSDRMetrics = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date }
): SDRMetricData[] => {
    if (!data || !Array.isArray(data) || !data[0] || !Array.isArray(data[0])) {
        return [];
    }

    const closerData: CloserRecord[] = data[0];

    const filteredData = closerData.filter(record => {
        if (!dateRange || (!dateRange.from && !dateRange.to)) {
            return true;
        }
        try {
            const recordDate = new Date(record["Timestamp"]);
            if (isNaN(recordDate.getTime())) return false;
            if (dateRange.from && recordDate < dateRange.from) return false;
            if (dateRange.to && recordDate > dateRange.to) return false;
            return true;
        } catch (e) {
            return false;
        }
    });

    const sdrMap = new Map<string, { shows: number, cashCollected: number }>();
    filteredData.forEach(record => {
        const sdrName = record["Setter Name"];
        if (!sdrName) return;

        if (!sdrMap.has(sdrName)) {
            sdrMap.set(sdrName, { shows: 0, cashCollected: 0 });
        }
        const sdrStats = sdrMap.get(sdrName)!;

        const outcome = record["Call Outcome"];
        if (outcome !== "Cancelled" && outcome !== "Rescheduled" && outcome !== "No Show") {
            sdrStats.shows++;
        }

        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        sdrStats.cashCollected += cash;
    });

    return Array.from(sdrMap.entries()).map(([name, stats]) => ({
        name,
        shows: stats.shows,
        showRate: stats.shows > 0 ? (stats.shows / filteredData.length) * 100 : 0,
        commission: stats.cashCollected * 0.175,
    }));
};

export const calculateShowRateTrend = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach: string = 'All',
    closer?: string,
    setter?: string
): ShowRateTrendData[] => {
    const filtered = getFilteredData(data, dateRange, platform, coach, 'Select Closer', setter); 

    const byDate = new Map<string, { due: number; taken: number }>();

    filtered.forEach(record => {
        const dateStr = record["Timestamp"];
        if (!dateStr) return;
        const dateKey = dateStr.split(' ')[0]; // keeps original m/d/yyyy format
        const stats = byDate.get(dateKey) || { due: 0, taken: 0 };

        const outcome = record["Call Outcome"];

        if (outcome !== "Cancelled" && outcome !== "Rescheduled") {
            stats.due += 1;
        }

        if (outcome !== "Cancelled" && outcome !== "Rescheduled" && outcome !== "No Show" && outcome !== "MRR" && outcome !== "Deposit Collected") {
            stats.taken += 1;
        }

        byDate.set(dateKey, stats);
    });

    const result: ShowRateTrendData[] = [];
    byDate.forEach((stats, dateKey) => {
        const showRate = stats.due > 0 ? Number(((stats.taken / stats.due) * 100).toFixed(2)) : 0;
        result.push({ date: new Date(dateKey.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), showRate });
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateCoachCommissionBreakdown = (
    data: GoogleSheetData,
    dateRange?: { from?: Date; to?: Date },
    platform?: string,
    coach: string = 'All'
): LeadSourceData[] => {
    const filtered = getFilteredData(data, dateRange, platform, coach, 'Select Closer', 'Select Setter');

    if (filtered.length === 0) return [];

    const commissionMap = new Map<string, number>();

    filtered.forEach(record => {
        const coachName = record["Coach Name"] || 'Unknown';
        const cash = parseFloat(String(record["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")) || 0;
        const rate = coachCommissionRateMap[coachName] ?? 0.325;
        const commission = cash * rate;

        if (commission > 0) {
            commissionMap.set(coachName, (commissionMap.get(coachName) || 0) + commission);
        }
    });

    return Array.from(commissionMap.entries()).map(([source, value]) => ({ source, value }));
};

const isPlaceholderValue = (val?: string) => !val || val.toLowerCase().startsWith('select');

// ===== Leads/Applicants utilities =====
export interface ApplicantRecord {
  Timestamp: string;
  [key: string]: any;
}

export type LeadsData = ApplicantRecord[];

export const fetchLeadsData = async (token: string): Promise<LeadsData> => {
  const response = await fetch(`${API_BASE}/data/leads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export interface ApplicantsOverTimeDatum {
  date: string; // formatted date label e.g. "Jun 15"
  applicants: number;
}

export const calculateApplicantsOverTime = (
  data: LeadsData,
  dateRange?: { from?: Date; to?: Date },
): ApplicantsOverTimeDatum[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Prepare date filtering like getFilteredData
  const adjustedDateRange = dateRange && dateRange.from && dateRange.to ? {
    from: new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)),
    to: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999))
  } : null;

  const countByDate = new Map<string, number>();

  data.forEach(record => {
    const ts = record.Timestamp;
    if (!ts) return;
    const dateObj = new Date(ts);
    if (isNaN(dateObj.getTime())) return;

    if (adjustedDateRange) {
      if (dateObj < adjustedDateRange.from || dateObj > adjustedDateRange.to) return;
    }

    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    countByDate.set(dateKey, (countByDate.get(dateKey) || 0) + 1);
  });

  return Array.from(countByDate.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([dateKey, applicants]) => ({
      date: new Date(dateKey.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applicants,
    }));
};

export interface IncomeReplaceData {
  name: string;
  value: number; // percentage of total
  count: number; // raw count
}

export const calculateIncomeReplaceBreakdown = (
  data: LeadsData,
  dateRange?: { from?: Date; to?: Date },
): IncomeReplaceData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const adjustedDateRange = dateRange && dateRange.from && dateRange.to ? {
    from: new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)),
    to: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)),
  } : null;

  const map = new Map<string, number>();

  data.forEach(rec => {
    const ts = rec.Timestamp;
    if (!ts) return;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return;
    if (adjustedDateRange) {
      if (d < adjustedDateRange.from || d > adjustedDateRange.to) return;
    }
    const income = rec["Desired Income"] || 'Unknown';
    map.set(income, (map.get(income) || 0) + 1);
  });

  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
  return Array.from(map.entries()).map(([name, count]) => ({
    name,
    count,
    value: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => b.value - a.value);
};

export interface ApplicantSourceData {
  name: string;
  value: number; // percentage of total applicants
  count: number; // total applicants for this source
}

export const calculateApplicantSourceBreakdown = (
  data: LeadsData,
  dateRange?: { from?: Date; to?: Date },
): ApplicantSourceData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const adjustedDateRange = dateRange && dateRange.from && dateRange.to ? {
    from: new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)),
    to: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)),
  } : null;

  const map = new Map<string, number>();

  data.forEach(rec => {
    const ts = rec.Timestamp;
    if (!ts) return;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return;
    if (adjustedDateRange) {
      if (d < adjustedDateRange.from || d > adjustedDateRange.to) return;
    }

    const src = rec["Source"] || 'Unknown';
    map.set(src, (map.get(src) || 0) + 1);
  });

  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
  return Array.from(map.entries()).map(([name, count]) => ({
    name,
    count,
    value: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
};

export interface InvestmentWillingData {
  name: string; // the distinct "Willing to Invest" value
  count: number; // total occurrences
}

export const calculateInvestmentWillingnessBreakdown = (
  data: LeadsData,
  dateRange?: { from?: Date; to?: Date },
): InvestmentWillingData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Align date filtering with other helpers
  const adjustedDateRange = dateRange && dateRange.from && dateRange.to ? {
    from: new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)),
    to: new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)),
  } : null;

  const map = new Map<string, number>();

  data.forEach(rec => {
    const ts = rec.Timestamp;
    if (!ts) return;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return;
    if (adjustedDateRange) {
      if (d < adjustedDateRange.from || d > adjustedDateRange.to) return;
    }

    const val = rec["Willing to Invest"] || 'Unknown';
    map.set(val, (map.get(val) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};