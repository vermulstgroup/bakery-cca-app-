"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Download, RefreshCw, FileSpreadsheet, Calendar, Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRODUCTS, BAKERIES, getProductMargin, getProductMarginPercent } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, startOfWeek, endOfWeek, subWeeks, subMonths, addDays } from 'date-fns';
import { getDailyEntriesForDateRange, getAllDailyEntries, getAllWeeklyExpenses } from '@/lib/supabase';
import type { WeeklyData, DailyEntry, WeeklyExpense } from '@/lib/types';

type ExportRange = 'week' | 'month' | 'all';

// Bakery performance summary for overview
type BakeryPerformanceSummary = {
  bakeryId: string;
  bakeryName: string;
  manager: string;
  weeklyProfit: number;
  weeklySales: number;
  weeklyMargin: number;
  status: 'profitable' | 'loss' | 'breakeven' | 'nodata';
  daysRecorded: number;
};

// Load entries from localStorage as fallback
const loadEntriesFromLocalStorage = (bakeryId: string, startDate: Date, endDate: Date): DailyEntry[] => {
  const entries: DailyEntry[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const key = `biss-entry-${bakeryId}-${dateStr}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        entries.push(JSON.parse(stored));
      }
    } catch {
      // Skip invalid entries
    }
    current.setDate(current.getDate() + 1);
  }
  return entries;
};

// Load real data from Supabase (with localStorage fallback) for 12 weeks
const loadRealData = async (bakeryId: string): Promise<WeeklyData[]> => {
  const data: WeeklyData[] = [];
  const today = new Date();
  const twelveWeeksAgo = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 11);

  // Try to load from Supabase first
  let entries: DailyEntry[] = [];
  try {
    entries = await getDailyEntriesForDateRange(
      bakeryId,
      format(twelveWeeksAgo, 'yyyy-MM-dd'),
      format(today, 'yyyy-MM-dd')
    );
  } catch {
    // Fallback to localStorage
    entries = loadEntriesFromLocalStorage(bakeryId, twelveWeeksAgo, today);
  }

  // If no Supabase data, try localStorage
  if (entries.length === 0) {
    entries = loadEntriesFromLocalStorage(bakeryId, twelveWeeksAgo, today);
  }

  // Group entries by week
  const entriesByWeek: { [weekStart: string]: DailyEntry[] } = {};
  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = format(startOfWeek(entryDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    if (!entriesByWeek[weekStart]) {
      entriesByWeek[weekStart] = [];
    }
    entriesByWeek[weekStart].push(entry);
  });

  // Build weekly data for last 12 weeks
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekNum = 12 - i;
    const weekEntries = entriesByWeek[weekStartStr] || [];

    // Aggregate the week's data
    let production = 0;
    let sales = 0;
    let costs = 0;

    weekEntries.forEach(entry => {
      if (entry.totals) {
        production += entry.totals.productionValue || 0;
        sales += entry.totals.salesTotal || 0;
        costs += entry.totals.ingredientCost || 0;
      }
    });

    const profit = sales - costs;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : '0.0';

    data.push({
      week: `W${weekNum}`,
      date: weekStartStr,
      production,
      sales,
      costs,
      profit,
      margin
    });
  }
  return data;
};

// Load all weekly expenses for a bakery from localStorage
const loadAllWeeklyExpensesFromLocalStorage = (bakeryId: string): { [weekStart: string]: number } => {
  const expenses: { [weekStart: string]: number } = {};

  // Scan localStorage for expense keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`expenses-${bakeryId}-`)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.expenses) {
          const total = Object.values(data.expenses as { [k: string]: number }).reduce((sum, val) => sum + val, 0);
          expenses[data.weekStartDate] = total;
        }
      } catch {
        // Skip invalid entries
      }
    }
  }
  return expenses;
};

// Get the week start date for a given date
const getWeekStartForDate = (date: Date): string => {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
};

// Load all daily entries from localStorage fallback
const loadAllDailyEntriesFromLocalStorage = (bakeryId: string): DailyEntry[] => {
  const entries: DailyEntry[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`biss-entry-${bakeryId}-`)) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        if (entry.date) {
          entries.push(entry);
        }
      } catch {
        // Skip invalid entries
      }
    }
  }

  // Sort by date ascending
  return entries.sort((a, b) => a.date.localeCompare(b.date));
};

// Load all daily entries from Supabase with localStorage fallback
const loadAllDailyEntriesAsync = async (bakeryId: string): Promise<DailyEntry[]> => {
  try {
    const entries = await getAllDailyEntries(bakeryId);
    if (entries.length > 0) {
      return entries.sort((a, b) => a.date.localeCompare(b.date));
    }
  } catch {
    // Fall through to localStorage
  }
  return loadAllDailyEntriesFromLocalStorage(bakeryId);
};

// Load current week's performance for a single bakery
const loadBakeryWeeklyPerformance = async (bakeryId: string): Promise<{ profit: number; sales: number; margin: number; daysRecorded: number }> => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  let entries: DailyEntry[] = [];

  try {
    entries = await getDailyEntriesForDateRange(
      bakeryId,
      format(weekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd')
    );
  } catch {
    // Fallback to localStorage
  }

  // If no Supabase data, try localStorage
  if (entries.length === 0) {
    entries = loadEntriesFromLocalStorage(bakeryId, weekStart, weekEnd);
  }

  let totalSales = 0;
  let totalCosts = 0;

  entries.forEach(entry => {
    if (entry.totals) {
      totalSales += entry.totals.salesTotal || 0;
      totalCosts += entry.totals.ingredientCost || 0;
    }
  });

  const profit = totalSales - totalCosts;
  const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  return { profit, sales: totalSales, margin, daysRecorded: entries.length };
};

// Load performance data for ALL bakeries
const loadAllBakeriesPerformance = async (): Promise<BakeryPerformanceSummary[]> => {
  const performances: BakeryPerformanceSummary[] = [];

  for (const bakery of BAKERIES) {
    const { profit, sales, margin, daysRecorded } = await loadBakeryWeeklyPerformance(bakery.id);

    let status: BakeryPerformanceSummary['status'] = 'nodata';
    if (daysRecorded > 0) {
      if (profit > 0) status = 'profitable';
      else if (profit < 0) status = 'loss';
      else status = 'breakeven';
    }

    performances.push({
      bakeryId: bakery.id,
      bakeryName: bakery.name,
      manager: bakery.manager,
      weeklyProfit: profit,
      weeklySales: sales,
      weeklyMargin: margin,
      status,
      daysRecorded,
    });
  }

  // Sort by profit (highest to lowest)
  return performances.sort((a, b) => b.weeklyProfit - a.weeklyProfit);
};

export default function StrategicDashboard() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [bakery, setBakery] = useState(onboardingData.bakery || 'morulem');
  const [data, setData] = useState<WeeklyData[]>([]);
  const [view, setView] = useState<'overview' | 'trends' | 'products'>('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [exportRange, setExportRange] = useState<ExportRange>('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [allBakeriesPerformance, setAllBakeriesPerformance] = useState<BakeryPerformanceSummary[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const currentBakery = BAKERIES.find(b => b.id === bakery);

  // Calculate totals across all bakeries
  const totalProfit = allBakeriesPerformance.reduce((sum, b) => sum + b.weeklyProfit, 0);
  const totalSales = allBakeriesPerformance.reduce((sum, b) => sum + b.weeklySales, 0);
  const bakeriesWithData = allBakeriesPerformance.filter(b => b.status !== 'nodata').length;
  const profitableBakeries = allBakeriesPerformance.filter(b => b.status === 'profitable').length;

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showExportMenu && !target.closest('[data-export-menu]')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  // Load all bakeries' performance data on mount
  useEffect(() => {
    const loadOverview = async () => {
      setLoadingOverview(true);
      try {
        const performances = await loadAllBakeriesPerformance();
        setAllBakeriesPerformance(performances);
      } catch {
        setAllBakeriesPerformance([]);
      }
      setLoadingOverview(false);
    };
    loadOverview();
  }, []);

  // Load real data from Supabase (with localStorage fallback)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const realData = await loadRealData(bakery);
        setData(realData);
        setLastRefresh(new Date());
      } catch {
        // On error, show empty weeks
        setData([]);
      }
      setLoading(false);
    };
    loadData();
  }, [bakery]);

  // Refresh function
  const handleRefresh = async () => {
    setLoading(true);
    setLoadingOverview(true);
    try {
      const [realData, performances] = await Promise.all([
        loadRealData(bakery),
        loadAllBakeriesPerformance()
      ]);
      setData(realData);
      setAllBakeriesPerformance(performances);
      setLastRefresh(new Date());
    } catch {
      // Keep existing data on error
    }
    setLoading(false);
    setLoadingOverview(false);
  };

  const latestWeek = data[data.length - 1] || {} as WeeklyData;
  const previousWeek = data[data.length - 2] || {} as WeeklyData;

  // Single-bakery 12-week totals
  const bakery12WeekSales = data.reduce((sum, w) => sum + w.sales, 0);
  const bakery12WeekProfit = data.reduce((sum, w) => sum + w.profit, 0);
  const bakeryAvgMargin = data.length > 0
    ? (data.reduce((sum, w) => sum + parseFloat(w.margin), 0) / data.length).toFixed(1)
    : '0';

  const salesChange = previousWeek.sales
    ? (((latestWeek.sales - previousWeek.sales) / previousWeek.sales) * 100).toFixed(1)
    : '0';
  const profitChange = previousWeek.profit
    ? (((latestWeek.profit - previousWeek.profit) / previousWeek.profit) * 100).toFixed(1)
    : '0';

  // Export weekly summary (existing functionality)
  const exportWeeklySummary = () => {
    const csv = [
      ['Week', 'Date', 'Production (UGX)', 'Sales (UGX)', 'Costs (UGX)', 'Profit (UGX)', 'Margin (%)'],
      ...data.map(w => [w.week, w.date, w.production, w.sales, w.costs, w.profit, w.margin])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBakery?.name || bakery}-12week-report.csv`;
    a.click();
  };

  // Export detailed daily data with date range
  const exportDetailedData = useCallback(async (range: ExportRange) => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = subMonths(today, 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Far back enough to get all data
        break;
    }

    // Load all daily entries from Supabase (with localStorage fallback)
    const allEntries = await loadAllDailyEntriesAsync(bakery);
    const weeklyExpenses = loadAllWeeklyExpensesFromLocalStorage(bakery);

    // Filter by date range
    const filteredEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= today;
    });

    if (filteredEntries.length === 0) {
      alert('No data found for the selected date range');
      return;
    }

    // Calculate total flour kg for each entry
    const getFlourKg = (entry: DailyEntry): number => {
      if (!entry.production) return 0;
      return Object.values(entry.production).reduce((sum, p) => sum + (p.kgFlour || 0), 0);
    };

    // Build CSV rows
    const headers = [
      'Date',
      'Bakery',
      'Flour KG',
      'Production Value',
      'Sales',
      'Expenses (Weekly)',
      'Replacements',
      'Bonuses',
      'Debts',
      'Profit',
      'Margin %'
    ];

    const rows = filteredEntries.map(entry => {
      const entryDate = new Date(entry.date);
      const weekStart = getWeekStartForDate(entryDate);
      const weeklyExpenseTotal = weeklyExpenses[weekStart] || 0;
      // Divide weekly expense by 7 to approximate daily expense
      const dailyExpense = Math.round(weeklyExpenseTotal / 7);

      const flourKg = getFlourKg(entry);
      const productionValue = entry.totals?.productionValue || 0;
      const sales = entry.totals?.salesTotal || 0;
      const ingredientCost = entry.totals?.ingredientCost || 0;
      const replacements = entry.others?.replacements || 0;
      const bonuses = entry.others?.bonuses || 0;
      const debts = entry.others?.debts || 0;

      // Profit = Sales - Ingredient Cost - Replacements - Bonuses - Daily Expenses
      const profit = sales - ingredientCost - replacements - bonuses - dailyExpense;
      const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : '0.0';

      return [
        entry.date,
        currentBakery?.name || bakery,
        flourKg.toFixed(1),
        productionValue,
        sales,
        dailyExpense,
        replacements,
        bonuses,
        debts,
        profit,
        margin
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cca-bakery-data-${format(today, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  }, [bakery, currentBakery?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-blue-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/welcome')}
              className="mb-2 -ml-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change Role
            </Button>
            <h1 className="text-2xl font-bold text-blue-400">Bakery CCA Strategic</h1>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={bakery}
                onChange={(e) => setBakery(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
              >
                {BAKERIES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <span className="text-slate-400 text-sm">• 12 Week View</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="relative" data-export-menu>
              <Button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50" data-export-menu>
                  <div className="p-2 border-b border-slate-700">
                    <div className="text-xs text-slate-400 px-2 py-1">Daily Data Export</div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => exportDetailedData('week')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-700 rounded"
                    >
                      <Calendar className="h-4 w-4 text-blue-400" />
                      This Week
                    </button>
                    <button
                      onClick={() => exportDetailedData('month')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-700 rounded"
                    >
                      <Calendar className="h-4 w-4 text-green-400" />
                      This Month
                    </button>
                    <button
                      onClick={() => exportDetailedData('all')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-700 rounded"
                    >
                      <Calendar className="h-4 w-4 text-amber-400" />
                      All Time
                    </button>
                  </div>
                  <div className="p-1 border-t border-slate-700">
                    <button
                      onClick={() => { exportWeeklySummary(); setShowExportMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-700 rounded"
                    >
                      <Download className="h-4 w-4" />
                      12-Week Summary
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== ALL BAKERIES OVERVIEW - PRIMARY VIEW ========== */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-blue-500/30 p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📊 All Bakeries Overview
              <span className="text-sm font-normal text-slate-400">This Week</span>
            </h2>
            {bakeriesWithData > 0 && (
              <span className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                profitableBakeries === bakeriesWithData ? "bg-green-500/20 text-green-400" :
                profitableBakeries === 0 ? "bg-red-500/20 text-red-400" :
                "bg-amber-500/20 text-amber-400"
              )}>
                {profitableBakeries}/{bakeriesWithData} Profitable
              </span>
            )}
          </div>

          {/* Total Profit Across All Bakeries */}
          <div className={cn(
            "p-4 rounded-xl mb-4 text-center",
            totalProfit >= 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
          )}>
            <div className="text-sm text-slate-300 mb-1">Total Profit (All Bakeries)</div>
            <div className={cn(
              "text-3xl font-bold font-currency",
              totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {totalProfit >= 0 ? '+' : ''}{formatUGX(totalProfit)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              from {formatUGX(totalSales)} in sales
            </div>
          </div>

          {/* Bakery Cards Grid */}
          {loadingOverview ? (
            <div className="text-center py-8 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading bakeries...
            </div>
          ) : bakeriesWithData === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">No data this week</h3>
              <p className="text-slate-400 text-sm">
                No bakeries have recorded entries this week yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allBakeriesPerformance.map((perf, index) => (
                <button
                  key={perf.bakeryId}
                  onClick={() => setBakery(perf.bakeryId)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                    bakery === perf.bakeryId
                      ? "bg-blue-500/20 border-2 border-blue-500"
                      : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && perf.status === 'profitable' ? "bg-amber-500 text-black" :
                      "bg-slate-700 text-slate-300"
                    )}>
                      {index + 1}
                    </div>

                    {/* Bakery Info */}
                    <div className="text-left">
                      <div className="font-bold text-white flex items-center gap-2">
                        {perf.bakeryName}
                        {/* Status Badge */}
                        {perf.status === 'profitable' && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            🟢 Profitable
                          </span>
                        )}
                        {perf.status === 'loss' && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            🔴 Loss
                          </span>
                        )}
                        {perf.status === 'breakeven' && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            🟡 Break-even
                          </span>
                        )}
                        {perf.status === 'nodata' && (
                          <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full">
                            No data
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Manager: {perf.manager} • {perf.daysRecorded}/7 days
                      </div>
                    </div>
                  </div>

                  {/* Profit/Sales */}
                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-bold font-currency",
                      perf.weeklyProfit > 0 ? "text-green-400" :
                      perf.weeklyProfit < 0 ? "text-red-400" :
                      "text-slate-400"
                    )}>
                      {perf.weeklyProfit >= 0 ? '+' : ''}{formatUGX(perf.weeklyProfit)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {perf.weeklyMargin.toFixed(1)}% margin
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* ========== SINGLE BAKERY DETAIL VIEW ========== */}
        <div className="border-t border-slate-700 pt-6 mb-4">
          <h2 className="text-lg font-bold text-slate-300 mb-4">
            📈 {currentBakery?.name || 'Bakery'} Detail View
          </h2>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">This Week Sales</div>
            <div className="text-2xl font-bold text-green-400 font-currency">
              {formatUGX(latestWeek.sales || 0)}
            </div>
            <div className={`text-sm ${parseFloat(salesChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(salesChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(salesChange))}% vs last week
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">This Week Profit</div>
            <div className={`text-2xl font-bold font-currency ${(latestWeek.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatUGX(latestWeek.profit || 0)}
            </div>
            <div className={`text-sm ${parseFloat(profitChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(profitChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(profitChange))}% vs last week
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">12-Week Total</div>
            <div className="text-2xl font-bold text-blue-400 font-currency">{formatUGX(bakery12WeekSales)}</div>
            <div className="text-sm text-slate-500">Total Sales</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Avg Margin</div>
            <div className="text-2xl font-bold text-amber-400">{bakeryAvgMargin}%</div>
            <div className="text-sm text-slate-500">Profit Margin</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {(['overview', 'trends', 'products'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                view === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Chart */}
        {view === 'overview' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Sales vs Profit (12 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number) => [formatUGX(value), '']}
                />
                <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trends Chart */}
        {view === 'trends' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Profit Margin Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number) => [value + '%', 'Margin']}
                />
                <Bar dataKey="margin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Products View */}
        {view === 'products' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Product Reference Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Revenue/kg</th>
                    <th className="pb-3">Cost/kg</th>
                    <th className="pb-3">Margin/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map(p => (
                    <tr key={p.id} className="border-b border-slate-700">
                      <td className="py-3">
                        <span className="mr-2">{p.emoji}</span>
                        {p.name}
                      </td>
                      <td className="py-3 text-green-400 font-currency">{formatUGX(p.revenuePerKgFlour)}</td>
                      <td className="py-3 text-red-400 font-currency">{formatUGX(p.costPerKgFlour)}</td>
                      <td className="py-3 text-amber-400">
                        <span className="font-currency">{formatUGX(getProductMargin(p))}</span>
                        <span className="text-slate-500 text-sm ml-1">
                          ({getProductMarginPercent(p)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly Data Table */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-4">Weekly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2">Week</th>
                  <th className="pb-2">Production</th>
                  <th className="pb-2">Sales</th>
                  <th className="pb-2">Costs</th>
                  <th className="pb-2">Profit</th>
                  <th className="pb-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.slice().reverse().map((week, i) => (
                  <tr key={week.week} className={`border-b border-slate-700 ${i === 0 ? 'bg-slate-700/50' : ''}`}>
                    <td className="py-2 font-medium">{week.week}</td>
                    <td className="py-2 font-currency">{formatUGX(week.production)}</td>
                    <td className="py-2 text-green-400 font-currency">{formatUGX(week.sales)}</td>
                    <td className="py-2 text-red-400 font-currency">{formatUGX(week.costs)}</td>
                    <td className={`py-2 font-bold font-currency ${week.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatUGX(week.profit)}
                    </td>
                    <td className="py-2 text-amber-400">{week.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          {currentBakery?.name || bakery} Bakery • Last updated: {format(lastRefresh, 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
