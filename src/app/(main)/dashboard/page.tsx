"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX, cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, FileText, Loader2, AlertTriangle, ArrowRight, TrendingUp, Calendar, ScrollText } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { startOfWeek, endOfWeek, format as formatDate, eachDayOfInterval } from 'date-fns';
import { PRODUCTS, BAKERIES, getProductMarginPercent } from '@/lib/data';
import type { DailyEntry } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { data: onboardingData, isLoaded: onboardingLoaded } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Load current week's entries from localStorage
  useEffect(() => {
    if (onboardingLoaded && onboardingData.bakery) {
      setLoading(true);
      const weekStartStr = formatDate(weekStart, 'yyyy-MM-dd');
      const weekEndStr = formatDate(weekEnd, 'yyyy-MM-dd');

      const localEntries: DailyEntry[] = [];

      // Check localStorage for entries in this week
      weekDays.forEach(day => {
        const dateStr = formatDate(day, 'yyyy-MM-dd');
        // Check new format first
        const newFormat = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateStr}`);
        if (newFormat) {
          localEntries.push(JSON.parse(newFormat));
        } else {
          // Fallback to legacy format
          const legacyFormat = localStorage.getItem(`daily_entry-${onboardingData.bakery}-${dateStr}`);
          if (legacyFormat) {
            localEntries.push(JSON.parse(legacyFormat));
          }
        }
      });

      setEntries(localEntries);
      setLoading(false);
    }
  }, [onboardingLoaded, onboardingData.bakery, weekStart, weekEnd]);

  // Calculate weekly stats from entries
  const weeklyStats = useMemo(() => {
    let totalProduction = 0;
    let totalCosts = 0;
    let totalSales = 0;

    entries.forEach(entry => {
      // New format with totals
      if (entry.totals) {
        totalProduction += entry.totals.productionValue;
        totalCosts += entry.totals.ingredientCost;
        totalSales += entry.totals.salesTotal;
      }
      // New format with production/sales
      else if (entry.production) {
        Object.values(entry.production).forEach(prod => {
          totalProduction += prod.productionValueUGX || 0;
          totalCosts += prod.ingredientCostUGX || 0;
        });
        if (entry.sales) {
          Object.values(entry.sales).forEach(amount => {
            totalSales += amount;
          });
        }
      }
      // Legacy format with quantities
      else if (entry.quantities) {
        // Calculate from quantities and prices
        Object.entries(entry.quantities.sales || {}).forEach(([productId, quantity]) => {
          const product = PRODUCTS.find(p => p.id === productId);
          if (product) {
            totalSales += quantity * (onboardingData.prices?.[productId] || product.defaultPrice);
          }
        });
      }
    });

    const profit = totalSales - totalCosts;
    const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

    return {
      production: totalProduction,
      costs: totalCosts,
      sales: totalSales,
      profit,
      margin,
      daysRecorded: entries.length,
    };
  }, [entries, onboardingData.prices]);

  const isLoading = !onboardingLoaded || loading;
  const hasData = entries.length > 0;
  const weekLabel = `${formatDate(weekStart, 'MMM d')} - ${formatDate(weekEnd, 'MMM d, yyyy')}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-400">
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
          <div className="text-white/80 text-sm font-medium mb-1">This Week's Profit</div>
          <div className="text-4xl font-bold text-white font-currency mb-2">
            {formatUGX(weeklyStats.profit)}
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
            <div className="text-slate-400 text-sm mb-1">Production</div>
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
            <div className="text-slate-400 text-sm mb-1">Ingredient Costs</div>
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
  );
}
