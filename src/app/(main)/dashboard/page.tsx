
"use client";

import { AppHeader } from '@/components/shared/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/lib/utils';
import { ArrowUp, ArrowDown, FileText, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { useOnboarding } from '@/hooks/use-onboarding';
import { startOfWeek, endOfWeek, format as formatDate } from 'date-fns';
import { PRODUCTS } from '@/lib/data';
import type { DailyEntry, WeeklyExpense } from '@/lib/types';
import { getDailyEntriesForDateRange, getWeeklyExpenses } from '@/lib/firebase/firestore';


const CountUp = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) {
        setCount(end);
        return;
    };

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      const current = Math.floor(progress * (end - start) + start);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [to]);

  return <span className="font-currency">{formatUGX(count)}</span>;
};


export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: onboardingData, isLoaded: onboardingLoaded } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [expenses, setExpenses] = useState<WeeklyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  useEffect(() => {
    if (onboardingLoaded && onboardingData.bakery) {
      const loadData = async () => {
        setLoading(true);
        const weekStartStr = formatDate(weekStart, 'yyyy-MM-dd');
        const weekEndStr = formatDate(weekEnd, 'yyyy-MM-dd');

        try {
          // Only fetch current week's data for better performance
          const [weekEntries, weekExpenseDoc] = await Promise.all([
            getDailyEntriesForDateRange(onboardingData.bakery as string, weekStartStr, weekEndStr),
            getWeeklyExpenses(onboardingData.bakery as string, weekStartStr)
          ]);
          setEntries(weekEntries);
          setExpenses(weekExpenseDoc ? [weekExpenseDoc] : []);
        } catch (e) {
          // Fallback for offline or errors - filter localStorage to current week
          const localEntries: DailyEntry[] = [];
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`daily_entry-${onboardingData.bakery}-`)) {
              const entry = JSON.parse(localStorage.getItem(key)!);
              // Filter to current week only
              if (entry.date >= weekStartStr && entry.date <= weekEndStr) {
                localEntries.push(entry);
              }
            }
          });
          setEntries(localEntries);

          // Get only current week's expenses
          const expenseKey = `expenses-${onboardingData.bakery}-${weekStartStr}`;
          const localExpense = localStorage.getItem(expenseKey);
          setExpenses(localExpense ? [JSON.parse(localExpense)] : []);
        } finally {
            setLoading(false);
        }
      };
      loadData();
    }
  }, [onboardingLoaded, onboardingData.bakery, weekStart, weekEnd]);


  const productPrices = useMemo(() => {
    const prices: { [key: string]: number } = {};
    if (onboardingLoaded && onboardingData.products && onboardingData.prices) {
        PRODUCTS.forEach(p => {
            prices[p.id] = onboardingData.prices?.[p.id] ?? p.defaultPrice;
        });
    }
    return prices;
  }, [onboardingLoaded, onboardingData.products, onboardingData.prices]);

  const weeklyStats = useMemo(() => {
    // entries already filtered to current week by the query
    const thisWeeksExpensesDoc = expenses[0]; // We only fetch current week's expense
    const totalExpenses = thisWeeksExpensesDoc ? Object.values(thisWeeksExpensesDoc.expenses).reduce((sum, val) => sum + val, 0) : 0;

    const revenue = entries.reduce((total, entry) => {
        const dayRevenue = Object.entries(entry.quantities.sales || {}).reduce((dayTotal, [productId, quantity]) => {
            return dayTotal + (quantity * (productPrices[productId] || 0));
        }, 0);
        return total + dayRevenue;
    }, 0);

    const profit = revenue - totalExpenses;

    // TODO: Trend calculation logic needed
    const trend = 12;

    return { revenue, totalExpenses, profit, trend, expensesEntered: !!thisWeeksExpensesDoc };
  }, [entries, expenses, productPrices]);

  // Calculate top selling products this week
  const topProducts = useMemo(() => {
    const productSales: { [productId: string]: number } = {};

    entries.forEach(entry => {
      Object.entries(entry.quantities.sales || {}).forEach(([productId, quantity]) => {
        productSales[productId] = (productSales[productId] || 0) + quantity;
      });
    });

    // Sort by quantity sold and get top 5
    const sorted = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sorted.map(([productId, quantity]) => {
      const product = PRODUCTS.find(p => p.id === productId);
      return {
        id: productId,
        name: product?.name || productId,
        emoji: product?.emoji || '',
        quantity,
        revenue: quantity * (productPrices[productId] || 0)
      };
    });
  }, [entries, productPrices]);


  const isLoading = !onboardingLoaded || loading;
  const isProfit = weeklyStats.profit >= 0;
  const hasData = entries.length > 0;
  const weekLabel = `Week of ${formatDate(weekStart, 'MMM d')} - ${formatDate(weekEnd, 'd')}`;

  if (isLoading) {
    return (
        <div className="flex flex-col">
            <AppHeader />
            <div className="flex flex-1 items-center justify-center p-8 text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-2xl font-bold">{t('loading_bakery_app')}</h2>
            </div>
        </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col">
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="p-4 bg-secondary rounded-full">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t('welcome_to_dashboard')}</h2>
          <p className="text-muted-foreground">{t('welcome_dashboard_subtext')}</p>
          <Button asChild size="lg">
            <Link href="/entry">{t('go_to_daily_entry')}</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const revenuePercent = 100;
  const expensePercent = weeklyStats.revenue > 0 ? (weeklyStats.totalExpenses / weeklyStats.revenue) * 100 : 0;
  const profitPercent = weeklyStats.revenue > 0 ? (weeklyStats.profit / weeklyStats.revenue) * 100 : 0;


  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <Card className="shadow-none border-0">
            <CardHeader>
                <CardDescription>{weekLabel}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`rounded-2xl p-6 shadow-lg ${isProfit ? 'profit-card-gradient' : 'loss-card-gradient'}`}>
                    <div className="text-white/80 uppercase tracking-widest text-xs font-semibold">{t('this_weeks_profit')}</div>
                    <div className="text-white text-4xl font-bold mt-2">
                        <CountUp to={weeklyStats.profit} />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm text-white mt-4 w-fit">
                        {weeklyStats.trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        <span>{weeklyStats.trend}% {t('vs_last_week')}</span>
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg font-semibold">{t('revenue')}</span>
                            <span className="text-lg font-semibold font-currency">{formatUGX(weeklyStats.revenue)}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                            <div className="bg-success h-full" style={{ width: `${revenuePercent}%` }} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <div className="flex justify-between items-baseline">
                            <span className="text-lg font-semibold text-muted-foreground">- {t('expenses')}</span>
                            <span className="text-lg font-semibold font-currency">{formatUGX(weeklyStats.totalExpenses)}</span>
                        </div>
                         <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                            <div className="bg-destructive/70 h-full" style={{ width: `${expensePercent}%` }} />
                        </div>
                    </div>

                     <div className="border-t-2 border-dashed my-4" />

                     <div className="space-y-2">
                         <div className="flex justify-between items-baseline">
                            <span className="text-xl font-bold text-primary">= {t('profit')}</span>
                            <span className="text-xl font-bold font-currency text-primary">{formatUGX(weeklyStats.profit)}</span>
                        </div>
                         <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${profitPercent}%` }} />
                        </div>
                    </div>
                </div>

                {!weeklyStats.expensesEntered && (
                    <Card className="mt-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-amber-500"/>
                                <p className="font-semibold text-amber-700 dark:text-amber-300">{t('expenses_not_entered')}</p>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                                <Link href="/expenses">
                                    {t('enter_expenses')} <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {topProducts.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">{t('top_products_this_week')}</h3>
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{product.emoji}</span>
                                        <div>
                                            <p className="text-lg font-semibold">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.quantity} {t('units_sold')}</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold font-currency text-primary">
                                        {formatUGX(product.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
      </div>
    </div>
  );
}
