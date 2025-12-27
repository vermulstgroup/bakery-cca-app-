"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRODUCTS, BAKERIES, getProductMarginPercent } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import type { DailyEntry } from '@/lib/types';

export default function SummaryPage() {
  const router = useRouter();
  const { data: onboardingData } = useOnboarding();
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [weekEntries, setWeekEntries] = useState<DailyEntry[]>([]);

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Load data
  useEffect(() => {
    if (!onboardingData.bakery) return;

    // Load today's entry
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayData = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${todayStr}`);
    if (todayData) {
      try {
        setTodayEntry(JSON.parse(todayData));
      } catch {
        // Skip corrupted entry
      }
    }

    // Load week entries
    const entries: DailyEntry[] = [];
    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
      if (stored) {
        try {
          entries.push(JSON.parse(stored));
        } catch {
          // Skip corrupted entry
        }
      }
    });
    setWeekEntries(entries);
  }, [onboardingData.bakery]);

  // Calculate today's totals
  const todayTotals = useMemo(() => {
    if (!todayEntry) {
      return { productionValue: 0, ingredientCost: 0, salesTotal: 0, profit: 0, margin: 0, kgFlour: 0 };
    }

    if (todayEntry.totals) {
      // Calculate kgFlour from production
      let kgFlour = 0;
      if (todayEntry.production) {
        Object.values(todayEntry.production).forEach(prod => {
          kgFlour += prod.kgFlour || 0;
        });
      }
      return { ...todayEntry.totals, kgFlour };
    }

    // Calculate from production/sales if totals not present
    let productionValue = 0;
    let ingredientCost = 0;
    let salesTotal = 0;
    let kgFlour = 0;

    if (todayEntry.production) {
      Object.values(todayEntry.production).forEach(prod => {
        productionValue += prod.productionValueUGX || 0;
        ingredientCost += prod.ingredientCostUGX || 0;
        kgFlour += prod.kgFlour || 0;
      });
    }

    if (todayEntry.sales) {
      Object.values(todayEntry.sales).forEach(amount => {
        salesTotal += amount;
      });
    }

    const profit = salesTotal - ingredientCost;
    const margin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

    return { productionValue, ingredientCost, salesTotal, profit, margin, kgFlour };
  }, [todayEntry]);

  // Get others data
  const todayOthers = useMemo(() => {
    if (!todayEntry?.others) {
      return { replacements: 0, bonuses: 0, debts: 0 };
    }
    return todayEntry.others;
  }, [todayEntry]);

  // Get status badge based on margin
  const getStatusBadge = (margin: number, hasData: boolean) => {
    if (!hasData) return { emoji: '📭', label: 'No Data', color: 'text-slate-400' };
    if (margin < 0) return { emoji: '⚠️', label: 'Loss', color: 'text-red-400' };
    if (margin >= 20) return { emoji: '💪', label: 'Strong', color: 'text-green-400' };
    if (margin >= 10) return { emoji: '👍', label: 'OK', color: 'text-amber-400' };
    return { emoji: '⚠️', label: 'Low', color: 'text-orange-400' };
  };

  const statusBadge = getStatusBadge(todayTotals.margin, !!todayEntry);

  // Calculate week-to-date totals
  const weekTotals = useMemo(() => {
    let productionValue = 0;
    let ingredientCost = 0;
    let salesTotal = 0;

    weekEntries.forEach(entry => {
      if (entry.totals) {
        productionValue += entry.totals.productionValue;
        ingredientCost += entry.totals.ingredientCost;
        salesTotal += entry.totals.salesTotal;
      } else if (entry.production) {
        Object.values(entry.production).forEach(prod => {
          productionValue += prod.productionValueUGX || 0;
          ingredientCost += prod.ingredientCostUGX || 0;
        });
        if (entry.sales) {
          Object.values(entry.sales).forEach(amount => {
            salesTotal += amount;
          });
        }
      }
    });

    const profit = salesTotal - ingredientCost;
    const margin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

    return { productionValue, ingredientCost, salesTotal, profit, margin, daysRecorded: weekEntries.length };
  }, [weekEntries]);

  // Get yesterday's data for comparison
  const yesterdayTotals = useMemo(() => {
    const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');
    const entry = weekEntries.find(e => e.date === yesterday);
    if (!entry?.totals) return null;
    return entry.totals;
  }, [weekEntries]);

  // Calculate change from yesterday
  const profitChange = yesterdayTotals
    ? ((todayTotals.profit - yesterdayTotals.profit) / Math.abs(yesterdayTotals.profit || 1)) * 100
    : null;

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
            <TrendingUp className="h-5 w-5" />
            Summary
          </h1>
          <p className="text-slate-400 text-sm">
            {currentBakery?.name || 'No bakery'} • {format(today, 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "mb-4 p-3 rounded-xl flex items-center justify-between",
          todayEntry ? (todayTotals.profit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20') : 'bg-slate-800/50'
        )}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{statusBadge.emoji}</span>
            <div>
              <div className={cn("font-bold", statusBadge.color)}>{statusBadge.label}</div>
              <div className="text-xs text-slate-400">
                {todayEntry ? `${todayTotals.margin.toFixed(1)}% margin` : 'Enter data to see status'}
              </div>
            </div>
          </div>
          {profitChange !== null && (
            <div className={cn(
              "text-sm flex items-center gap-1",
              profitChange >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {profitChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(profitChange).toFixed(0)}%
            </div>
          )}
        </div>

        {/* 6-Tile Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Kg Flour */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">🌾</div>
            <div className="text-xs text-slate-400 mb-1">Kg Flour</div>
            <div className="text-lg font-bold text-amber-400">
              {todayTotals.kgFlour.toFixed(1)}
            </div>
          </Card>

          {/* Replaced */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-xs text-slate-400 mb-1">Replaced</div>
            <div className="text-lg font-bold text-orange-400 font-currency">
              {todayOthers.replacements > 0 ? formatUGX(todayOthers.replacements) : '-'}
            </div>
          </Card>

          {/* Production */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">📦</div>
            <div className="text-xs text-slate-400 mb-1">Production</div>
            <div className="text-lg font-bold text-green-400 font-currency">
              {formatUGX(todayTotals.productionValue)}
            </div>
          </Card>

          {/* Bonus */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">🎁</div>
            <div className="text-xs text-slate-400 mb-1">Bonus</div>
            <div className="text-lg font-bold text-purple-400 font-currency">
              {todayOthers.bonuses > 0 ? formatUGX(todayOthers.bonuses) : '-'}
            </div>
          </Card>

          {/* Sales */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xs text-slate-400 mb-1">Sales</div>
            <div className="text-lg font-bold text-white font-currency">
              {formatUGX(todayTotals.salesTotal)}
            </div>
          </Card>

          {/* Debts */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-xl">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs text-slate-400 mb-1">Debts</div>
            <div className="text-lg font-bold text-red-400 font-currency">
              {todayOthers.debts > 0 ? formatUGX(todayOthers.debts) : '-'}
            </div>
          </Card>
        </div>

        {/* Profit Summary Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-4">
          <h3 className="font-bold text-white mb-3">Today's Profit</h3>
          {todayEntry ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sales</span>
                <span className="text-white font-currency">{formatUGX(todayTotals.salesTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ingredient Cost</span>
                <span className="text-red-400 font-currency">-{formatUGX(todayTotals.ingredientCost)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="font-bold text-white">Gross Profit</span>
                <span className={cn(
                  "font-bold font-currency",
                  todayTotals.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {formatUGX(todayTotals.profit)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-3">No data for today</p>
              <Button
                onClick={() => router.push('/entry')}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600"
              >
                Enter Data
              </Button>
            </div>
          )}
        </Card>

        {/* Per-Product Breakdown */}
        {todayEntry && todayEntry.production && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white mb-3">Product Breakdown</h3>
            <div className="space-y-3">
              {PRODUCTS.map((product) => {
                const prod = todayEntry.production?.[product.id];
                const sold = todayEntry.sales?.[product.id] || 0;
                const cost = prod?.ingredientCostUGX || 0;
                const profit = sold - cost;
                const kgUsed = prod?.kgFlour || 0;

                if (!prod && !sold) return null;

                return (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-xs text-slate-400">{kgUsed} kg flour</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-currency text-sm text-slate-300">
                        {formatUGX(sold)}
                      </div>
                      <div className={cn(
                        "text-sm font-bold font-currency",
                        profit >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {profit >= 0 ? '+' : ''}{formatUGX(profit)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Week-to-Date */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
          <h3 className="font-bold text-white mb-4">
            Week to Date
            <span className="text-sm font-normal text-slate-400 ml-2">
              ({weekTotals.daysRecorded} of 7 days recorded)
            </span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Production</span>
              <span className="text-green-400 font-bold font-currency">
                {formatUGX(weekTotals.productionValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Sales</span>
              <span className="text-white font-bold font-currency">
                {formatUGX(weekTotals.salesTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Costs</span>
              <span className="text-red-400 font-currency">
                {formatUGX(weekTotals.ingredientCost)}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between text-lg">
              <span className="text-white font-bold">Week Profit</span>
              <span className={cn(
                "font-bold font-currency",
                weekTotals.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {formatUGX(weekTotals.profit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Margin</span>
              <span className={cn(
                "font-bold",
                weekTotals.margin >= 20 ? 'text-green-400' :
                weekTotals.margin >= 10 ? 'text-amber-400' : 'text-red-400'
              )}>
                {weekTotals.margin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Week Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Days recorded</span>
              <span>{weekTotals.daysRecorded}/7</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${(weekTotals.daysRecorded / 7) * 100}%` }}
              />
            </div>
          </div>

        </Card>

        {/* Action Button */}
        <div className="mt-6">
          <Button
            onClick={() => router.push('/entry')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4"
          >
            {todayEntry ? 'Update Today\'s Entry' : 'Enter Today\'s Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
