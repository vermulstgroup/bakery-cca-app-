"use client";

import { AppHeader } from '@/components/shared/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUGX } from '@/lib/utils';
import { ArrowUp, ArrowDown, HandCoins, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPersonalizedOffers } from '@/ai/flows/personalized-offers';

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
  const [aiOffers, setAiOffers] = useState<any[] | null>(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  useEffect(() => {
    // Simulate time passing for sync status
    const interval = setInterval(() => {
      setLastSynced('2 minutes ago');
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleGetOffers = async () => {
    setIsLoadingOffers(true);
    setAiOffers(null);
    try {
      const salesData = {
        salesData: JSON.stringify([
          {"customer": "A", "product": "Yeast Mandazi", "quantity": 5},
          {"customer": "B", "product": "Chapati", "quantity": 10},
          {"customer": "A", "product": "Yeast Mandazi", "quantity": 3},
        ]),
      };
      const result = await getPersonalizedOffers(salesData);
      const parsedOffers = JSON.parse(result.offers);
      setAiOffers(parsedOffers.offers);
    } catch (e) {
      console.error(e);
      // You could use a toast to show an error here
    } finally {
      setIsLoadingOffers(false);
    }
  };


  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className={`rounded-3xl p-1 ${isProfit ? 'profit-card-gradient' : 'loss-card-gradient'}`}>
            <Card className="rounded-3xl border-0 bg-transparent text-primary-foreground shadow-2xl shadow-primary/30">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                        {isProfit ? "This Week's Profit" : "This Week's Loss"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-2">
                    <div className="text-5xl font-bold">
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
        
        <Card>
            <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Analyze sales data to get personalized offers for your customers.</p>
                <Button onClick={handleGetOffers} disabled={isLoadingOffers}>
                    {isLoadingOffers ? 'Generating...' : 'Get Personalized Offers'}
                </Button>

                {aiOffers && (
                    <div className="mt-4 space-y-2">
                        <h3 className="font-semibold">Recommended Offers:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                        {aiOffers.map((offer, index) => (
                            <li key={index}>{offer.offer}</li>
                        ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Last synced: {lastSynced}</p>
        </div>
      </div>
    </div>
  );
}
