"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, ChevronRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BAKERIES } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, subDays, parseISO } from 'date-fns';
import type { DailyEntry } from '@/lib/types';

export default function HistoryPage() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Load last 30 days of entries
  useEffect(() => {
    if (!onboardingData.bakery) return;

    setLoading(true);
    const loadEntries = () => {
      const entriesList: DailyEntry[] = [];
      const today = new Date();

      // Check last 30 days
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
        if (stored) {
          entriesList.push(JSON.parse(stored));
        }
      }

      // Sort by date descending
      entriesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(entriesList);
      setLoading(false);
    };

    loadEntries();
  }, [onboardingData.bakery]);

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

      const profit = salesTotal - ingredientCost;
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

  const viewEntry = (date: string) => {
    localStorage.setItem('biss-selected-date', date);
    router.push('/entry');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="-ml-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <History className="h-5 w-5" />
            Entry History
          </h1>
          <p className="text-slate-400 text-sm">
            {currentBakery?.name || 'No bakery'} • Last 30 days
          </p>
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
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        totals.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                      )} />
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
                          "font-bold font-currency",
                          totals.profit >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
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
