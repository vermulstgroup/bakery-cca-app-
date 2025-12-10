"use client";

import { AppHeader } from '@/components/shared/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUGX } from '@/lib/utils';
import { ArrowUp, ArrowDown, HandCoins, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';

const CountUp = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (end === 0) return;
    const duration = 800;
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
  const profit = 470000;
  const isProfit = profit >= 0;
  const trend = 12; // percentage
  const revenue = 1450000;
  const expenses = 980000;
  const [lastSynced, setLastSynced] = useState('just now');

  useEffect(() => {
    // Simulate time passing for sync status
    const interval = setInterval(() => {
      setLastSynced('2 minutes ago');
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className={`rounded-xl p-1 ${isProfit ? 'profit-card-gradient' : 'loss-card-gradient'}`}>
            <Card className="relative rounded-xl border-0 bg-transparent text-primary-foreground shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
                <CardHeader>
                    <CardTitle className="text-xs font-medium uppercase tracking-[2px] text-primary-foreground/60">
                        {isProfit ? "PROFIT" : "LOSS"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-2">
                    <div className="text-[56px] font-bold font-currency">
                        <CountUp to={profit} />
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm">
                        {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        <span>{trend}% vs last week</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <HandCoins className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-currency">{formatUGX(revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <ReceiptText className="h-5 w-5 text-loss" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-currency">{formatUGX(expenses)}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Last synced: {lastSynced}</p>
        </div>
      </div>
    </div>
  );
}
