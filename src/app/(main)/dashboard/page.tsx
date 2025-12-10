
"use client";

import { AppHeader } from '@/components/shared/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/lib/utils';
import { ArrowUp, ArrowDown, HandCoins, ReceiptText, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { useOnboarding } from '@/hooks/use-onboarding';
import { startOfWeek, endOfWeek, format as formatDate } from 'date-fns';
import { PRODUCTS } from '@/lib/data';
import type { DailyEntry } from '@/lib/types';


const CountUp = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
        setCount(to);
        return;
    }

    let start = 0;
    const end = to;
    if (end === 0) {
        // If the target is 0, just set it and don't animate.
        setCount(0);
        return;
    };
    
    hasAnimated.current = true;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      const current = Math.floor(progress * end);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure the final value is exact
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
  const [lastSynced, setLastSynced] = useState(t('just_now'));
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [expenses, setExpenses] = useState<{ expenses: { [key: string]: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);

  useEffect(() => {
    if (onboardingLoaded) {
      const allEntries: DailyEntry[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`daily_entry-${onboardingData.bakery}-`)) {
          try {
            allEntries.push(JSON.parse(localStorage.getItem(key)!));
          } catch (e) {
            // Silently fail on parse error
          }
        }
      });
      setEntries(allEntries);

      const weekId = formatDate(weekStart, 'yyyy-MM-dd');
      const storageKey = `expenses-${onboardingData.bakery}-${weekId}`;
      const savedExpenses = localStorage.getItem(storageKey);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
      setLoading(false);
    }
  }, [onboardingLoaded, onboardingData.bakery, weekStart]);


  const productPrices = useMemo(() => {
    const prices: { [key: string]: number } = {};
    PRODUCTS.forEach(p => {
        prices[p.id] = onboardingData.prices?.[p.id] ?? p.defaultPrice;
    });
    return prices;
  }, [onboardingData.prices]);

  const { revenue, totalExpenses, profit, margin } = useMemo(() => {
    const revenue = entries.reduce((total, entry) => {
        const dayRevenue = Object.entries(entry.quantities.sales || {}).reduce((dayTotal, [productId, quantity]) => {
            return dayTotal + (quantity * (productPrices[productId] || 0));
        }, 0);
        return total + dayRevenue;
    }, 0);

    const totalExpenses = Object.values(expenses?.expenses || {}).reduce((acc, val) => acc + val, 0);
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    return { revenue, totalExpenses, profit, margin };
  }, [entries, expenses, productPrices]);

  // TODO: Calculate trend vs last week
  const [trend] = useState(0);
  
  const isLoading = !onboardingLoaded || loading;
  const isProfit = profit >= 0;
  const hasData = entries.length > 0 || (expenses && Object.keys(expenses.expenses).length > 0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(t('minutes_ago', { count: 2 }));
    }, 120000);
    return () => clearInterval(interval);
  }, [t]);

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

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className={`rounded-2xl p-6 shadow-profit ${isProfit ? 'profit-card-gradient' : 'loss-card-gradient'}`}>
            <Card className="relative rounded-xl border-0 bg-transparent text-primary-foreground shadow-none overflow-hidden p-0">
                <CardHeader className="p-0">
                    <CardTitle className="text-xs font-medium uppercase tracking-[2px] text-white/80">
                        {t('this_weeks_profit')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-2 p-0 mt-2">
                    <div className="text-[clamp(2.25rem,10vw,2.75rem)] font-bold font-currency text-white">
                        <CountUp to={profit} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="rounded-full bg-white/20 px-3 py-1 text-sm">{margin}% {t('margin')}</div>
                        <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
                            {trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            <span>{trend}% {t('vs_last_week')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('revenue')}</CardTitle>
              <HandCoins className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.25rem,6.5vw,1.5rem)] font-bold font-currency text-success"><CountUp to={revenue} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses')}</CardTitle>
              <ReceiptText className="h-5 w-5 text-stone-500" />
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.25rem,6.5vw,1.5rem)] font-bold font-currency text-foreground"><CountUp to={totalExpenses} /></div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{t('last_synced')}: {lastSynced}</p>
        </div>
      </div>
    </div>
  );
}
