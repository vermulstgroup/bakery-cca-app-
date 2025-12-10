
"use client";

import { AppHeader } from '@/components/shared/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/lib/utils';
import { ArrowUp, ArrowDown, HandCoins, ReceiptText, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';

const CountUp = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      const current = Math.floor(progress * end);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [to]);

  return <span className="font-currency">{formatUGX(count)}</span>;
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [profit, setProfit] = useState(470000);
  const [trend, setTrend] = useState(12);
  const [margin, setMargin] = useState(32);
  const [revenue, setRevenue] = useState(1450000);
  const [expenses, setExpenses] = useState(980000);
  const [lastSynced, setLastSynced] = useState(t('just_now'));

  const isProfit = profit >= 0;
  const hasData = revenue > 0 || expenses > 0;

  useEffect(() => {
    // Simulate time passing for sync status
    const interval = setInterval(() => {
      setLastSynced(t('minutes_ago', { count: 2 }));
    }, 120000);
    return () => clearInterval(interval);
  }, [t]);

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
                            {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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
              <div className="text-[clamp(1.25rem,6.5vw,1.5rem)] font-bold font-currency text-success">{formatUGX(revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses')}</CardTitle>
              <ReceiptText className="h-5 w-5 text-stone-500" />
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.25rem,6.5vw,1.5rem)] font-bold font-currency text-foreground">{formatUGX(expenses)}</div>
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
