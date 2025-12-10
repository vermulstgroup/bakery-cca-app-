
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesInsights, SalesInsightsOutput } from '@/ai/flows/sales-insights';
import { Loader2, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { PRODUCTS } from '@/lib/data';
import type { DailyEntry } from '@/lib/types';

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

export default function TrendsPage() {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<SalesInsightsOutput['insights']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: onboardingData, isLoaded: onboardingLoaded } = useOnboarding();
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    if (onboardingLoaded) {
      const allEntries: DailyEntry[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`daily_entry-${onboardingData.bakery}-`)) {
          try {
            allEntries.push(JSON.parse(localStorage.getItem(key)!));
          } catch (e) {
            console.error('Failed to parse daily entry from localStorage', e);
          }
        }
      });
      setEntries(allEntries);
    }
  }, [onboardingLoaded, onboardingData.bakery]);


  const salesDataForAI = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    const productMap = new Map(PRODUCTS.map(p => [p.id, p.name]));

    const weeklySales: { [week: string]: { product: string, quantity: number }[] } = {};

    entries.forEach(entry => {
      // Basic week calculation (can be improved)
      const entryDate = new Date(entry.date);
      const weekStart = new Date(entryDate.setDate(entryDate.getDate() - entryDate.getDay() + 1)).toISOString().split('T')[0];

      if (!weeklySales[weekStart]) {
        weeklySales[weekStart] = [];
      }
      
      const sales = entry.quantities.sales || {};
      for (const productId in sales) {
        if (sales[productId] > 0) {
           const productName = productMap.get(productId) || productId;
           const existingProduct = weeklySales[weekStart].find(p => p.product === productName);
           if (existingProduct) {
              existingProduct.quantity += sales[productId];
           } else {
              weeklySales[weekStart].push({ product: productName, quantity: sales[productId] });
           }
        }
      }
    });
    return weeklySales;

  }, [entries]);

  const fetchInsights = async () => {
    if (!salesDataForAI) {
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
      console.error(e);
      setError(t('error_fetching_insights'));
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (onboardingLoaded) {
      fetchInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingLoaded, salesDataForAI])

  const hasData = useMemo(() => entries && entries.length > 0, [entries]);
  const isLoading = loading || !onboardingLoaded;

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title={t('ai_insights')} showBackButton={false}>
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
      </PageHeader>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading && <InsightSkeleton />}

        {error && !isLoading && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('error_occurred')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}

        {!isLoading && !error && insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('sales_trends_and_insights')}</CardTitle>
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
