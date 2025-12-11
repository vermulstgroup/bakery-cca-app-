
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesInsights, SalesInsightsOutput } from '@/ai/flows/sales-insights';
import { Loader2, BarChart, Lightbulb, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { PRODUCTS } from '@/lib/data';
import type { DailyEntry, WeeklyExpense } from '@/lib/types';
import { startOfWeek, parseISO, format as formatDate } from 'date-fns';
import { getAllDailyEntries, getAllWeeklyExpenses } from '@/lib/firebase/firestore';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { formatUGX } from '@/lib/utils';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';


const InsightSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/2"/>
        </CardHeader>
        <CardContent>
            <Skeleton className="h-48 w-full"/>
        </CardContent>
    </Card>
)

export default function TrendsPage() {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<SalesInsightsOutput['insights']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: onboardingData, isLoaded: onboardingLoaded } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [expenses, setExpenses] = useState<WeeklyExpense[]>([]);

   useEffect(() => {
    if (onboardingLoaded && onboardingData.bakery) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [allEntries, allExpenses] = await Promise.all([
            getAllDailyEntries(onboardingData.bakery as string),
            getAllWeeklyExpenses(onboardingData.bakery as string)
          ]);
          setEntries(allEntries);
          setExpenses(allExpenses);
        } catch (e) {
            // Fallback for offline or errors
            const localEntries: DailyEntry[] = [];
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith(`daily_entry-${onboardingData.bakery}-`)) {
                localEntries.push(JSON.parse(localStorage.getItem(key)!));
              }
            });
            setEntries(localEntries);
            const localExpenses: WeeklyExpense[] = [];
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`expenses-${onboardingData.bakery}-`)) {
                    localExpenses.push(JSON.parse(localStorage.getItem(key)!));
                }
            });
            setExpenses(localExpenses);
        } finally {
            setLoading(false);
        }
      };
      loadData();
    }
  }, [onboardingLoaded, onboardingData.bakery]);


  const productPrices = useMemo(() => {
    const prices: { [key: string]: number } = {};
    if (onboardingLoaded && onboardingData.products) {
        onboardingData.products.forEach(productId => {
            const product = PRODUCTS.find(p => p.id === productId);
            if (product) {
                prices[productId] = onboardingData.prices?.[productId] ?? product.defaultPrice;
            }
        });
    }
    return prices;
  }, [onboardingLoaded, onboardingData.products, onboardingData.prices]);

  const processedChartData = useMemo(() => {
    const weeklyData: { [week: string]: { income: number; cost: number; profit: number } } = {};

    entries.forEach(entry => {
      try {
        const entryDate = parseISO(entry.date);
        const weekStartDate = startOfWeek(entryDate, { weekStartsOn: 1 }).toISOString().split('T')[0];
        if (!weeklyData[weekStartDate]) {
          weeklyData[weekStartDate] = { income: 0, cost: 0, profit: 0 };
        }
        const dailyRevenue = Object.entries(entry.quantities.sales || {}).reduce((acc, [productId, quantity]) => {
          return acc + (quantity * (productPrices[productId] || 0));
        }, 0);
        weeklyData[weekStartDate].income += dailyRevenue;
      } catch (e) {}
    });

    expenses.forEach(expense => {
      const weekStartDate = expense.weekStartDate;
      if (weeklyData[weekStartDate]) {
        const weeklyCost = Object.values(expense.expenses).reduce((acc, value) => acc + value, 0);
        weeklyData[weekStartDate].cost += weeklyCost;
      }
    });
    
    return Object.entries(weeklyData).map(([week, data]) => ({
      date: formatDate(parseISO(week), 'MMM d'),
      income: data.income,
      cost: data.cost,
      profit: data.income - data.cost,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [entries, expenses, productPrices]);

  const allTimeStats = useMemo(() => {
    return processedChartData.reduce((acc, week) => {
        acc.revenue += week.income;
        acc.expenses += week.cost;
        acc.profit += week.profit;
        return acc;
    }, { revenue: 0, expenses: 0, profit: 0 });
  }, [processedChartData]);


  const salesDataForAI = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const productMap = new Map(PRODUCTS.map(p => [p.id, p.name]));
    const weeklySales: { [week: string]: { [productName: string]: number } } = {};
    entries.forEach(entry => {
      try {
        const entryDate = parseISO(entry.date);
        const weekStartDate = startOfWeek(entryDate, { weekStartsOn: 1 }).toISOString().split('T')[0];
        if (!weeklySales[weekStartDate]) {
          weeklySales[weekStartDate] = {};
        }
        const sales = entry.quantities.sales || {};
        for (const productId in sales) {
          if (sales[productId] > 0) {
            const productName = productMap.get(productId) || productId;
            weeklySales[weekStartDate][productName] = (weeklySales[weekStartDate][productName] || 0) + sales[productId];
          }
        }
      } catch(e) {}
    });
    return Object.entries(weeklySales).map(([week, sales]) => ({ week, sales }));
  }, [entries]);

  const fetchInsights = useCallback(async () => {
    if (!salesDataForAI || salesDataForAI.length === 0) {
      setInsights([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getSalesInsights({ salesData: JSON.stringify(salesDataForAI, null, 2) });
      if (result && result.insights) {
        setInsights(result.insights);
      } else {
        setInsights([]);
        setError(t('error_getting_insights'));
      }
    } catch (e) {
      setError(t('error_fetching_insights'));
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [salesDataForAI, t]);
  
  useEffect(() => {
    if (onboardingLoaded && (entries.length > 0 || expenses.length > 0)) {
      fetchInsights();
    } else if (onboardingLoaded) {
      setLoading(false);
    }
  }, [onboardingLoaded, entries, expenses, fetchInsights]);

  const handleExport = useCallback(() => {
    const headers = ['Week', 'Income', 'Cost', 'Profit'];
    const rows = processedChartData.map(d => [d.date, d.income, d.cost, d.profit].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "biss-bakery-trends.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedChartData]);

  const hasData = useMemo(() => entries.length > 0 || expenses.length > 0, [entries, expenses]);
  const isLoading = loading || !onboardingLoaded;

  return (
    <div className="flex flex-col">
      <PageHeader title={t('trends')} showBackButton={false}>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !hasData}>
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={isLoading || !hasData}>
            {isLoading ? (
                <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('refreshing')}
                </>
            ) : (
                t('refresh')
            )}
            </Button>
        </div>
      </PageHeader>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading && (
            <>
                <InsightSkeleton/>
                <ChartSkeleton/>
            </>
        )}

        {error && !isLoading && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="text-destructive">{t('error_occurred')}</CardTitle></CardHeader>
                <CardContent><p>{error}</p></CardContent>
            </Card>
        )}

        {!isLoading && !error && hasData && (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('financial_summary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Card className="p-4 bg-secondary">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="text-success"/>{t('total_revenue')}
                            </CardTitle>
                            <p className="text-2xl font-bold font-currency mt-1">{formatUGX(allTimeStats.revenue)}</p>
                        </Card>
                         <Card className="p-4 bg-secondary">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingDown className="text-destructive"/>{t('total_expenses')}
                            </CardTitle>
                            <p className="text-2xl font-bold font-currency mt-1">{formatUGX(allTimeStats.expenses)}</p>
                        </Card>
                        <Card className="col-span-2 p-4 profit-card-gradient text-primary-foreground">
                            <CardTitle className="text-sm font-medium text-white/80">{t('total_profit')}</CardTitle>
                            <p className="text-3xl font-bold font-currency mt-1">{formatUGX(allTimeStats.profit)}</p>
                        </Card>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('weekly_performance')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={processedChartData}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatUGX(value as number / 1000)}k`} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                                                            <span className="font-bold text-muted-foreground">
                                                                Profit
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground text-right">Value</span>
                                                             <span className="font-bold text-right text-success">
                                                                {formatUGX(payload[0].payload.profit)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="income" fill="hsl(var(--success))" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" fill="hsl(var(--destructive))" name="Cost" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {insights.length > 0 && (
                    <Card>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb/> {t('ai_insights')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                        {insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
                            <span className="text-2xl mt-1">{insight.emoji || '💡'}</span>
                            <div>
                                <h3 className="font-semibold">{insight.title}</h3>
                                <p className="text-muted-foreground text-sm">{insight.insight}</p>
                            </div>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                )}
            </>
        )}
        
        {!isLoading && !error && !hasData && (
             <Card>
                <CardContent className="p-6 text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="p-3 bg-secondary rounded-full">
                         <BarChart className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold">{t('no_insights_yet')}</h3>
                    <p className="text-muted-foreground">{t('no_insights_subtext')}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

    

    