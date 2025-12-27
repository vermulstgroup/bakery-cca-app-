"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUGX, cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, FileText, Loader2, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Calendar, ScrollText, Target, CheckCircle2, Package } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useGoals } from '@/hooks/use-goals';
import { useInventory } from '@/hooks/use-inventory';
import { useBakeryPin } from '@/hooks/use-bakery-pin';
import { PinDialog } from '@/components/pin-dialog';
import { startOfWeek, endOfWeek, format as formatDate, eachDayOfInterval } from 'date-fns';
import { PRODUCTS, BAKERIES, getProductMarginPercent } from '@/lib/data';
import { getDailyEntriesForDateRange } from '@/lib/supabase';
import type { DailyEntry } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const router = useRouter();
  const { data: onboardingData, isLoaded: onboardingLoaded } = useOnboarding();
  const { goals, getProgress } = useGoals(onboardingData.bakery);
  const { inventory, weeklyUsage, isLowStock } = useInventory(onboardingData.bakery);
  const { isPinEnabled, isAuthenticated, verifyPin, isLoaded: pinLoaded } = useBakeryPin(onboardingData.bakery);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Use state for dates to avoid hydration mismatch (server vs client time)
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekEnd, setWeekEnd] = useState<Date | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  // Initialize dates on client side only
  useEffect(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    setWeekStart(start);
    setWeekEnd(end);
    setWeekDays(eachDayOfInterval({ start, end }));
  }, []);

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Load current week's entries from Supabase (with localStorage fallback)
  useEffect(() => {
    const loadEntries = async () => {
      if (!onboardingLoaded || !onboardingData.bakery || !weekStart || !weekEnd) return;

      setLoading(true);
      const weekStartStr = formatDate(weekStart, 'yyyy-MM-dd');
      const weekEndStr = formatDate(weekEnd, 'yyyy-MM-dd');

      // Try Supabase first
      try {
        const supabaseEntries = await getDailyEntriesForDateRange(
          onboardingData.bakery,
          weekStartStr,
          weekEndStr
        );
        if (supabaseEntries.length > 0) {
          setEntries(supabaseEntries);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to localStorage
      }

      // Fallback to localStorage
      const localEntries: DailyEntry[] = [];
      weekDays.forEach(day => {
        const dateStr = formatDate(day, 'yyyy-MM-dd');
        try {
          const newFormat = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
          if (newFormat) {
            localEntries.push(JSON.parse(newFormat));
          } else {
            const legacyFormat = localStorage.getItem(`daily_entry-${onboardingData.bakery}-${dateStr}`);
            if (legacyFormat) {
              localEntries.push(JSON.parse(legacyFormat));
            }
          }
        } catch {
          // Skip corrupted entry
        }
      });

      setEntries(localEntries);
      setLoading(false);
    };

    loadEntries();
  }, [onboardingLoaded, onboardingData.bakery, weekStart, weekEnd, weekDays]);

  // Calculate weekly stats from entries
  const weeklyStats = useMemo(() => {
    let totalProduction = 0;
    let totalCosts = 0;
    let totalSales = 0;
    let totalProfit = 0;

    entries.forEach(entry => {
      // New format with totals - use saved profit (includes others deductions)
      if (entry.totals) {
        totalProduction += entry.totals.productionValue || 0;
        totalCosts += entry.totals.ingredientCost || 0;
        totalSales += entry.totals.salesTotal || 0;
        totalProfit += entry.totals.profit || 0;
      }
      // New format with production/sales - calculate including others
      else if (entry.production) {
        let entryCost = 0;
        let entrySales = 0;
        Object.values(entry.production).forEach(prod => {
          totalProduction += prod.productionValueUGX || 0;
          entryCost += prod.ingredientCostUGX || 0;
        });
        if (entry.sales) {
          Object.values(entry.sales).forEach(amount => {
            entrySales += amount;
          });
        }
        totalCosts += entryCost;
        totalSales += entrySales;
        // Include others deductions in profit calculation
        const othersDeductions = (entry.others?.replacements || 0) + (entry.others?.bonuses || 0);
        totalProfit += entrySales - entryCost - othersDeductions;
      }
      // Legacy format with quantities
      else if (entry.quantities) {
        // Calculate from quantities and prices
        Object.entries(entry.quantities.sales || {}).forEach(([productId, quantity]) => {
          const product = PRODUCTS.find(p => p.id === productId);
          if (product) {
            const amount = quantity * (onboardingData.prices?.[productId] || product.defaultPrice);
            totalSales += amount;
            totalProfit += amount; // Legacy format doesn't have costs
          }
        });
      }
    });

    const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      production: totalProduction,
      costs: totalCosts,
      sales: totalSales,
      profit: totalProfit,
      margin,
      daysRecorded: entries.length,
    };
  }, [entries, onboardingData.prices]);

  const isLoading = !onboardingLoaded || loading || !weekStart || !weekEnd;
  const hasData = entries.length > 0;
  const weekLabel = weekStart && weekEnd
    ? `${formatDate(weekStart, 'MMM d')} - ${formatDate(weekEnd, 'MMM d, yyyy')}`
    : 'Loading...';

  // Show PIN dialog if authentication required
  const showPinDialog = pinLoaded && isPinEnabled && !isAuthenticated;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
        <div className="max-w-md mx-auto p-4">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-7 w-36 bg-slate-700 mb-2" />
                <Skeleton className="h-4 w-24 bg-slate-700" />
              </div>
              <Skeleton className="h-8 w-24 bg-slate-700 rounded-lg" />
            </div>
          </div>

          {/* Main Card Skeleton */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl mb-4">
            <Skeleton className="h-4 w-32 bg-slate-700 mb-2" />
            <Skeleton className="h-10 w-40 bg-slate-700 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-16 bg-slate-700 mb-1" />
                <Skeleton className="h-6 w-24 bg-slate-700" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 bg-slate-700 mb-1" />
                <Skeleton className="h-6 w-24 bg-slate-700" />
              </div>
            </div>
          </Card>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Skeleton className="h-20 bg-slate-700 rounded-xl" />
            <Skeleton className="h-20 bg-slate-700 rounded-xl" />
          </div>

          {/* Goals Skeleton */}
          <Skeleton className="h-32 bg-slate-700 rounded-xl mb-4" />

          {/* Inventory Skeleton */}
          <Skeleton className="h-24 bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PIN Authentication Dialog */}
      <PinDialog
        open={showPinDialog}
        onVerify={verifyPin}
        title="Enter PIN"
        description={`Enter PIN to access ${currentBakery?.name || 'bakery'} data`}
      />

    <div data-testid="dashboard-page" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 data-testid="bakery-name" className="text-2xl font-bold text-amber-400">
                {currentBakery?.name || 'BISS'} Bakery
              </h1>
              <p className="text-slate-400 text-sm">Manager: {currentBakery?.manager}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/welcome')}
              className="text-slate-400 hover:text-white"
            >
              Change Role
            </Button>
          </div>
        </div>

        {/* Week Label */}
        <div className="text-center mb-4">
          <span className="text-sm text-slate-400">Week of {weekLabel}</span>
        </div>

        {/* Main Profit Card */}
        <Card className={cn(
          "p-6 rounded-2xl border-0 mb-6",
          weeklyStats.profit >= 0
            ? "bg-gradient-to-br from-emerald-600 to-emerald-800"
            : "bg-gradient-to-br from-red-600 to-red-800"
        )}>
          <div className="text-white/80 text-sm font-medium mb-1 flex items-center gap-2">
            {weeklyStats.profit >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            This Week's {weeklyStats.profit >= 0 ? 'Profit' : 'Loss'}
          </div>
          <div className="text-4xl font-bold text-white font-currency mb-2 flex items-center gap-2">
            {weeklyStats.profit >= 0 ? '+' : ''}{formatUGX(weeklyStats.profit)}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              weeklyStats.margin >= 20 ? 'text-green-200' :
              weeklyStats.margin >= 10 ? 'text-amber-200' : 'text-red-200'
            )}>
              {weeklyStats.margin.toFixed(1)}% margin
            </span>
            <span className="text-white/60">•</span>
            <span className="text-white/80 text-sm">
              {weeklyStats.daysRecorded}/7 days recorded
            </span>
          </div>
        </Card>

        {/* Goals Progress */}
        {goals.enabled && (() => {
          const progress = getProgress(weeklyStats.profit, weeklyStats.margin);
          if (!progress) return null;
          return (
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  Weekly Goals
                </h3>
                {progress.allMet && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    All Goals Met!
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Profit Target</span>
                    <span className={cn(
                      "font-medium",
                      progress.profitMet ? 'text-green-400' : 'text-slate-300'
                    )}>
                      {formatUGX(weeklyStats.profit)} / {formatUGX(goals.weeklyProfitTarget)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(progress.profitProgress, 100)}
                    className={cn(
                      "h-2",
                      progress.profitMet ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'
                    )}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Margin Target</span>
                    <span className={cn(
                      "font-medium",
                      progress.marginMet ? 'text-green-400' : 'text-slate-300'
                    )}>
                      {weeklyStats.margin.toFixed(1)}% / {goals.weeklyMarginTarget}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(progress.marginProgress, 100)}
                    className={cn(
                      "h-2",
                      progress.marginMet ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'
                    )}
                  />
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Low Stock Alert */}
        {isLowStock && inventory.currentStock > 0 && (
          <Card className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-400" />
              <div>
                <h3 className="font-bold text-white">Low Flour Stock</h3>
                <p className="text-sm text-slate-400">
                  Only {inventory.currentStock.toFixed(1)} kg remaining
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
                onClick={() => router.push('/settings')}
              >
                Add Stock
              </Button>
            </div>
          </Card>
        )}

        {/* Inventory Summary */}
        {inventory.currentStock > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Flour Stock</div>
                  <div className="text-xl font-bold text-white">{inventory.currentStock.toFixed(1)} kg</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">This Week Used</div>
                <div className="text-lg font-medium text-amber-400">{weeklyUsage.toFixed(1)} kg</div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
            <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-400" />
              Production
            </div>
            <div className="text-xl font-bold text-green-400 font-currency">
              {formatUGX(weeklyStats.production)}
            </div>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
            <div className="text-slate-400 text-sm mb-1">Total Sales</div>
            <div className="text-xl font-bold text-white font-currency">
              {formatUGX(weeklyStats.sales)}
            </div>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
            <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-red-400" />
              Ingredient Costs
            </div>
            <div className="text-xl font-bold text-red-400 font-currency">
              {formatUGX(weeklyStats.costs)}
            </div>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
            <div className="text-slate-400 text-sm mb-1">Avg Margin</div>
            <div className={cn(
              "text-xl font-bold",
              weeklyStats.margin >= 20 ? 'text-green-400' :
              weeklyStats.margin >= 10 ? 'text-amber-400' : 'text-red-400'
            )}>
              {weeklyStats.margin.toFixed(1)}%
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <Button
            data-testid="enter-data-btn"
            onClick={() => router.push('/entry')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg"
          >
            <ScrollText className="h-5 w-5 mr-2" />
            Enter Today's Data
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/summary')}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Summary
            </Button>
            <Button
              onClick={() => router.push('/history')}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* No Data State */}
        {!hasData && (
          <Card className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">No data this week</h3>
            <p className="text-slate-400 text-sm mb-4">
              Start tracking your production and sales to see your progress
            </p>
            <Button
              onClick={() => router.push('/entry')}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Enter First Entry
            </Button>
          </Card>
        )}

        {/* Product Reference Table */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
          <h3 className="font-bold text-white mb-4">Product Reference</h3>
          <div className="space-y-3">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{product.emoji}</span>
                  <div>
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-xs text-slate-400">
                      Cost: {formatUGX(product.costPerKgFlour)}/kg
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-currency">
                    {formatUGX(product.revenuePerKgFlour)}/kg
                  </div>
                  <div className="text-xs text-amber-400">
                    {getProductMarginPercent(product)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Child Care Africa • Uganda
        </div>
      </div>
    </div>
    </>
  );
}
