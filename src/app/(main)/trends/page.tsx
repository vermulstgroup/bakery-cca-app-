
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedOffers, PersonalizedOffersOutput } from '@/ai/flows/personalized-offers';
import { Loader } from 'lucide-react';
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

const OfferSkeleton = () => (
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
  const [offers, setOffers] = useState<PersonalizedOffersOutput['offers']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPersonalizedOffers({ salesData: JSON.stringify(mockSalesData) });
      if (result && result.offers) {
        setOffers(result.offers);
      } else {
        setOffers([]);
        setError(t('error_getting_offers'));
      }
    } catch (e) {
      console.error(e);
      setError(t('error_fetching_offers'));
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOffers();
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title={t('ai_powered_trends')} showBackButton={false}>
         <Button variant="ghost" size="sm" onClick={fetchOffers} disabled={loading}>
          {loading ? t('refreshing') : t('refresh')}
         </Button>
      </PageHeader>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading && <OfferSkeleton />}

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

        {!loading && !error && offers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('personalized_offers')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {offers.map((offer, index) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
                  <span className="text-2xl mt-1">{offer.emoji || '💡'}</span>
                  <div>
                    <h3 className="font-semibold">{offer.productName}</h3>
                    <p className="text-muted-foreground text-sm">{offer.offer}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {!loading && !error && offers.length === 0 && (
             <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">{t('no_offers_generated')}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
