"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, ChevronRight, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BAKERIES, PRODUCTS } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, subDays, parseISO } from 'date-fns';
import { getDailyEntriesForDateRange } from '@/lib/supabase';
import type { DailyEntry } from '@/lib/types';

type DateRange = '7' | '30' | '90' | 'all';

export default function HistoryPage() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30');

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Load entries based on date range from Supabase (with localStorage fallback)
  useEffect(() => {
    if (!onboardingData.bakery) return;

    const loadEntries = async () => {
      setLoading(true);
      const today = new Date();
      const daysToCheck = dateRange === 'all' ? 365 : parseInt(dateRange);
      const startDate = subDays(today, daysToCheck);

      // Try Supabase first
      try {
        const supabaseEntries = await getDailyEntriesForDateRange(
          onboardingData.bakery,
          format(startDate, 'yyyy-MM-dd'),
          format(today, 'yyyy-MM-dd')
        );
        if (supabaseEntries.length > 0) {
          // Sort by date descending
          supabaseEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setEntries(supabaseEntries);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to localStorage
      }

      // Fallback to localStorage
      const entriesList: DailyEntry[] = [];
      for (let i = 0; i < daysToCheck; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
        if (stored) {
          try {
            entriesList.push(JSON.parse(stored));
          } catch {
            // Skip corrupted entry
          }
        }
      }

      entriesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(entriesList);
      setLoading(false);
    };

    loadEntries();
  }, [onboardingData.bakery, dateRange]);

  // Calculate totals for each entry
  const entriesWithTotals = useMemo(() => {
    return entries.map(entry => {
      if (entry.totals) {
        return { ...entry, calculatedTotals: entry.totals };
      }

      // Calculate if not present
      let productionValue = 0;
      let ingredientCost = 0;
      let salesTotal = 0;

      if (entry.production) {
        Object.values(entry.production).forEach(prod => {
          productionValue += prod.productionValueUGX || 0;
          ingredientCost += prod.ingredientCostUGX || 0;
        });
      }

      if (entry.sales) {
        Object.values(entry.sales).forEach(amount => {
          salesTotal += amount;
        });
      }

      // Include others deductions in profit calculation
      const othersDeductions = (entry.others?.replacements || 0) + (entry.others?.bonuses || 0);
      const profit = salesTotal - ingredientCost - othersDeductions;
      const margin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

      return {
        ...entry,
        calculatedTotals: { productionValue, ingredientCost, salesTotal, profit, margin }
      };
    });
  }, [entries]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (entries.length === 0) return null;

    let totalSales = 0;
    let totalProfit = 0;
    let profitableDays = 0;

    entriesWithTotals.forEach(entry => {
      totalSales += entry.calculatedTotals.salesTotal;
      totalProfit += entry.calculatedTotals.profit;
      if (entry.calculatedTotals.profit > 0) profitableDays++;
    });

    const avgDailySales = entries.length > 0 ? totalSales / entries.length : 0;
    const avgDailyProfit = entries.length > 0 ? totalProfit / entries.length : 0;

    return {
      totalSales,
      totalProfit,
      profitableDays,
      totalDays: entries.length,
      avgDailySales,
      avgDailyProfit
    };
  }, [entriesWithTotals]);

  // Export entries to CSV
  const exportToCSV = () => {
    if (entries.length === 0) return;

    // CSV header
    const headers = ['Date', 'Product', 'Kg Flour', 'Production Value (UGX)', 'Ingredient Cost (UGX)', 'Sales (UGX)', 'Profit (UGX)'];

    // Build rows
    const rows: string[][] = [];

    entriesWithTotals.forEach(entry => {
      if (entry.production) {
        Object.entries(entry.production).forEach(([productId, prod]) => {
          const product = PRODUCTS.find(p => p.id === productId);
          const sales = entry.sales?.[productId] || 0;
          const profit = sales - (prod.ingredientCostUGX || 0);

          rows.push([
            entry.date,
            product?.name || productId,
            (prod.kgFlour || 0).toString(),
            (prod.productionValueUGX || 0).toString(),
            (prod.ingredientCostUGX || 0).toString(),
            sales.toString(),
            profit.toString()
          ]);
        });
      }
    });

    // Add summary row
    if (summaryStats) {
      rows.push([]);
      rows.push(['SUMMARY', '', '', '', '', '', '']);
      rows.push(['Total Days', summaryStats.totalDays.toString(), '', '', '', '', '']);
      rows.push(['Total Sales', '', '', '', '', summaryStats.totalSales.toString(), '']);
      rows.push(['Total Profit', '', '', '', '', '', summaryStats.totalProfit.toString()]);
      rows.push(['Avg Daily Sales', '', '', '', '', summaryStats.avgDailySales.toFixed(0), '']);
      rows.push(['Avg Daily Profit', '', '', '', '', '', summaryStats.avgDailyProfit.toFixed(0)]);
    }

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bakery-entries-${currentBakery?.id || 'unknown'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewEntry = (date: string) => {
    localStorage.setItem('biss-selected-date', date);
    router.push('/entry');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="-ml-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            {entries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            )}
          </div>
          <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <History className="h-5 w-5" />
            Entry History
          </h1>
          <p className="text-slate-400 text-sm">
            {currentBakery?.name || 'No bakery'}
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {([
            { value: '7', label: '7 Days' },
            { value: '30', label: '30 Days' },
            { value: '90', label: '90 Days' },
            { value: 'all', label: 'All Time' },
          ] as { value: DateRange; label: string }[]).map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(option.value)}
              className={cn(
                "min-h-[44px] px-4 whitespace-nowrap",
                dateRange === option.value
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        {summaryStats && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white mb-3">Period Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-sm text-slate-300 mb-1">Days Recorded</div>
                <div className="text-xl font-bold text-white">{summaryStats.totalDays}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-sm text-slate-300 mb-1">Profitable Days</div>
                <div className="text-xl font-bold text-green-400">
                  {summaryStats.profitableDays}/{summaryStats.totalDays}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-sm text-slate-300 mb-1">Total Sales</div>
                <div className="text-lg font-bold text-white font-currency">
                  {formatUGX(summaryStats.totalSales)}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-sm text-slate-300 mb-1">Total Profit</div>
                <div className={cn(
                  "text-lg font-bold font-currency",
                  summaryStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {formatUGX(summaryStats.totalProfit)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Daily Sales</span>
                <span className="text-white font-currency">{formatUGX(summaryStats.avgDailySales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Daily Profit</span>
                <span className={cn(
                  "font-currency",
                  summaryStats.avgDailyProfit >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatUGX(summaryStats.avgDailyProfit)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Entries List */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
          <h3 className="font-bold text-white mb-3">All Entries</h3>

          {loading ? (
            <div className="text-center py-8 text-slate-400">
              Loading entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No entries recorded yet</p>
              <Button
                onClick={() => router.push('/entry')}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Record First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {entriesWithTotals.map((entry, index) => {
                const totals = entry.calculatedTotals;
                const prevEntry = entriesWithTotals[index + 1];
                const profitChange = prevEntry
                  ? totals.profit - prevEntry.calculatedTotals.profit
                  : null;
                const isToday = entry.date === format(new Date(), 'yyyy-MM-dd');

                return (
                  <button
                    key={entry.date}
                    onClick={() => viewEntry(entry.date)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                      isToday
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6">
                        {totals.profit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-white">
                          {format(parseISO(entry.date), 'EEE, MMM d')}
                          {isToday && (
                            <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded ml-2">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          Sales: {formatUGX(totals.salesTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={cn(
                          "font-bold font-currency flex items-center gap-1",
                          totals.profit >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          <span aria-hidden="true">{totals.profit >= 0 ? '▲' : '▼'}</span>
                          {totals.profit >= 0 ? '+' : ''}{formatUGX(totals.profit)}
                        </div>
                        {profitChange !== null && (
                          <div className={cn(
                            "text-xs flex items-center justify-end gap-1",
                            profitChange >= 0 ? 'text-green-500' : 'text-red-500'
                          )}>
                            {profitChange >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatUGX(Math.abs(profitChange))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Action */}
        <div className="mt-6">
          <Button
            onClick={() => router.push('/entry')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4"
          >
            Add New Entry
          </Button>
        </div>
      </div>
    </div>
  );
}
