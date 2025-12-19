"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BAKERIES, PRODUCTS } from '@/lib/data';
import { formatUGX } from '@/lib/utils';
import { format, subDays, startOfWeek } from 'date-fns';
import type { DailyEntry } from '@/lib/types';

// Type for bakery performance data
type BakeryPerformanceData = {
  status: 'profitable' | 'loss' | 'breakeven' | 'nodata';
  margin: number;
  weeklySales: number;
  weeklyProfit: number;
  trend: 'up' | 'down' | 'flat';
};

// Load entries for a bakery from localStorage for a date range
const loadEntriesForDateRange = (bakeryId: string, startDate: Date, endDate: Date): DailyEntry[] => {
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

// Calculate week data from entries
const calculateWeekData = (entries: DailyEntry[]) => {
  let sales = 0;
  let profit = 0;

  entries.forEach(entry => {
    if (entry.totals) {
      sales += entry.totals.salesTotal || 0;
      profit += entry.totals.profit || 0;
    }
  });

  return { sales, profit };
};

// Determine status based on profit
const getStatus = (profit: number, hasData: boolean): 'profitable' | 'loss' | 'breakeven' | 'nodata' => {
  if (!hasData) return 'nodata';
  if (profit > 1000) return 'profitable';
  if (profit < -1000) return 'loss';
  return 'breakeven';
};

// Calculate trend by comparing this week to last week
const getTrend = (thisWeekProfit: number, lastWeekProfit: number): 'up' | 'down' | 'flat' => {
  const diff = thisWeekProfit - lastWeekProfit;
  if (Math.abs(diff) < 1000) return 'flat';
  return diff > 0 ? 'up' : 'down';
};

export default function SupervisorDashboard() {
  const router = useRouter();
  const [selectedBakery, setSelectedBakery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'profit' | 'sales' | 'margin'>('profit');
  const [bakeriesData, setBakeriesData] = useState<{ [key: string]: BakeryPerformanceData }>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load real data from localStorage for all bakeries
  useEffect(() => {
    const loadAllBakeriesData = () => {
      setLoading(true);
      const today = new Date();
      const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const lastWeekStart = subDays(thisWeekStart, 7);
      const lastWeekEnd = subDays(thisWeekStart, 1);

      const newData: { [key: string]: BakeryPerformanceData } = {};

      BAKERIES.forEach(bakery => {
        // Load this week's entries
        const thisWeekEntries = loadEntriesForDateRange(bakery.id, thisWeekStart, today);
        const thisWeekData = calculateWeekData(thisWeekEntries);

        // Load last week's entries for trend calculation
        const lastWeekEntries = loadEntriesForDateRange(bakery.id, lastWeekStart, lastWeekEnd);
        const lastWeekData = calculateWeekData(lastWeekEntries);

        const hasData = thisWeekEntries.length > 0;
        const margin = thisWeekData.sales > 0
          ? Math.round((thisWeekData.profit / thisWeekData.sales) * 100)
          : 0;

        newData[bakery.name] = {
          status: getStatus(thisWeekData.profit, hasData),
          margin,
          weeklySales: thisWeekData.sales,
          weeklyProfit: thisWeekData.profit,
          trend: hasData ? getTrend(thisWeekData.profit, lastWeekData.profit) : 'flat'
        };
      });

      setBakeriesData(newData);
      setLoading(false);
      setLastRefresh(new Date());
    };

    loadAllBakeriesData();
  }, []);

  // Refresh function
  const handleRefresh = () => {
    const today = new Date();
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekStart, 1);

    const newData: { [key: string]: BakeryPerformanceData } = {};

    BAKERIES.forEach(bakery => {
      const thisWeekEntries = loadEntriesForDateRange(bakery.id, thisWeekStart, today);
      const thisWeekData = calculateWeekData(thisWeekEntries);
      const lastWeekEntries = loadEntriesForDateRange(bakery.id, lastWeekStart, lastWeekEnd);
      const lastWeekData = calculateWeekData(lastWeekEntries);

      const hasData = thisWeekEntries.length > 0;
      const margin = thisWeekData.sales > 0
        ? Math.round((thisWeekData.profit / thisWeekData.sales) * 100)
        : 0;

      newData[bakery.name] = {
        status: getStatus(thisWeekData.profit, hasData),
        margin,
        weeklySales: thisWeekData.sales,
        weeklyProfit: thisWeekData.profit,
        trend: hasData ? getTrend(thisWeekData.profit, lastWeekData.profit) : 'flat'
      };
    });

    setBakeriesData(newData);
    setLastRefresh(new Date());
  };

  // Merge bakery data with performance data
  const bakeries = useMemo(() => {
    return BAKERIES.map(bakery => ({
      ...bakery,
      ...(bakeriesData[bakery.name] || {
        status: 'nodata' as const,
        margin: 0,
        weeklySales: 0,
        weeklyProfit: 0,
        trend: 'flat' as const
      })
    }));
  }, [bakeriesData]);

  // Sort bakeries
  const sortedBakeries = useMemo(() => {
    return [...bakeries].sort((a, b) => {
      if (sortBy === 'profit') return b.weeklyProfit - a.weeklyProfit;
      if (sortBy === 'sales') return b.weeklySales - a.weeklySales;
      if (sortBy === 'margin') return b.margin - a.margin;
      return 0;
    });
  }, [bakeries, sortBy]);

  // Calculate totals
  const totalSales = bakeries.reduce((sum, b) => sum + b.weeklySales, 0);
  const totalProfit = bakeries.reduce((sum, b) => sum + b.weeklyProfit, 0);
  const avgMargin = bakeries.length > 0
    ? (bakeries.reduce((sum, b) => sum + b.margin, 0) / bakeries.length).toFixed(1)
    : '0';
  const profitableBakeries = bakeries.filter(b => b.weeklyProfit > 0).length;

  // Chart data
  const chartData = sortedBakeries.map(b => ({
    name: b.name,
    profit: b.weeklyProfit,
    sales: b.weeklySales,
    color: b.weeklyProfit >= 0 ? '#22c55e' : '#ef4444'
  }));

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      profitable: 'bg-green-500/20 text-green-400 border-green-500/30',
      loss: 'bg-red-500/20 text-red-400 border-red-500/30',
      breakeven: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      nodata: 'bg-slate-700 text-slate-400 border-slate-600'
    };
    return styles[status] || styles.nodata;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <div className="text-xl text-purple-400">Loading bakery data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">👁️</span>
              <h1 className="text-2xl font-bold">Bakery CCA Supervisor</h1>
            </div>
            <p className="text-slate-400">Multi-bakery overview • Read-only</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="text-right">
              <div className="text-sm text-slate-400">Viewing as</div>
              <div className="font-bold text-purple-400">Supervisor</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Total Weekly Sales</div>
            <div className="text-2xl font-bold text-white font-currency">{formatUGX(totalSales)}</div>
            <div className="text-xs text-slate-500">All bakeries</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Total Weekly Profit</div>
            <div className={`text-2xl font-bold font-currency ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatUGX(totalProfit)}
            </div>
            <div className="text-xs text-slate-500">Combined</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Avg Margin</div>
            <div className={`text-2xl font-bold ${parseFloat(avgMargin) >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {avgMargin}%
            </div>
            <div className="text-xs text-slate-500">Across all bakeries</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm">Profitable</div>
            <div className="text-2xl font-bold text-green-400">{profitableBakeries}/{bakeries.length}</div>
            <div className="text-xs text-slate-500">Bakeries this week</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Profit by Bakery</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'profit' | 'sales' | 'margin')}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
            >
              <option value="profit">Sort by Profit</option>
              <option value="sales">Sort by Sales</option>
              <option value="margin">Sort by Margin</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#94a3b8"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [formatUGX(value), 'Profit']}
              />
              <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bakery Cards */}
        <h3 className="font-bold mb-3">All Bakeries</h3>
        <div className="grid gap-3">
          {sortedBakeries.map((bakery) => (
            <div
              key={bakery.id}
              className={`bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 cursor-pointer hover:border-purple-500/50 transition-all ${
                selectedBakery === bakery.name ? 'border-purple-500 ring-1 ring-purple-500/30' : ''
              }`}
              onClick={() => setSelectedBakery(selectedBakery === bakery.name ? null : bakery.name)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏪</div>
                  <div>
                    <div className="font-bold text-lg">{bakery.name}</div>
                    <div className="text-sm text-slate-400">Manager: {bakery.manager}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-400">Sales</div>
                    <div className="font-bold font-currency">{formatUGX(bakery.weeklySales)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Profit</div>
                    <div className={`font-bold font-currency ${bakery.weeklyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatUGX(bakery.weeklyProfit)}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-400">Margin</div>
                    <div className={`font-bold ${bakery.margin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                      {bakery.margin}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(bakery.status)}`}>
                      {bakery.status}
                    </span>
                    <span className="text-lg mt-1">{getTrendIcon(bakery.trend)}</span>
                  </div>
                </div>
              </div>

              {selectedBakery === bakery.name && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400 mb-1">Products Active</div>
                      <div className="flex gap-2">
                        {PRODUCTS.map(p => (
                          <span key={p.id} title={p.name} className="text-xl">{p.emoji}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Week Trend</div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(bakery.trend)}
                        <span className={
                          bakery.trend === 'up' ? 'text-green-400' :
                          bakery.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                        }>
                          {bakery.trend === 'up' ? 'Improving' :
                           bakery.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Action Needed</div>
                      <div className={bakery.status === 'loss' ? 'text-red-400' : 'text-green-400'}>
                        {bakery.status === 'loss' ? '⚠️ Review costs' : '✓ On track'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Alert for Loss-Making Bakeries */}
        {bakeries.some(b => b.status === 'loss') && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <span>⚠️</span>
              <span>Attention Required</span>
            </div>
            <div className="text-slate-300 text-sm">
              {bakeries.filter(b => b.status === 'loss').map(b => b.name).join(', ')}
              {' '}showing losses this week. Review expense categories and production efficiency.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Read-only view • Last updated: {format(lastRefresh, 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
