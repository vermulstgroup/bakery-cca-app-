
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesInsights, SalesInsightsOutput } from '@/ai/flows/sales-insights';
import { Loader, Loader2, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

// Mock sales data for demonstration
const mockSalesData = {
  "week1": [
    { "product": "Yeast Mandazi", "quantity": 120 },
    { "product": "Doughnuts", "quantity": 80 },
    { "product": "Loaf (1kg)", "quantity": 50 }
  ],
  "week2": [
    { "product": "Yeast Mandazi", "quantity": 150 },
    { "product": "Doughnuts", "quantity": 70 },
    { "product": "Chapati", "quantity": 90 }
  ]
};

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

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate delay for spinner visibility
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await getSalesInsights({ salesData: JSON.stringify(mockSalesData) });
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
    fetchInsights();
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title={t('ai_insights')} showBackButton={false}>
         <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
          {loading ? (
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
        {loading && <InsightSkeleton />}

        {error && !loading && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('error_occurred')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}

        {!loading && !error && insights.length > 0 && (
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
        
        {!loading && !error && insights.length === 0 && (
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
