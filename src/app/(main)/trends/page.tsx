
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedOffers, PersonalizedOffersOutput } from '@/ai/flows/personalized-offers';
import { Loader } from 'lucide-react';

// Mock sales data for demonstration
const mockSalesData = JSON.stringify({
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
});

export default function TrendsPage() {
  const [offers, setOffers] = useState<PersonalizedOffersOutput['offers']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPersonalizedOffers({ salesData: mockSalesData });
      if (result && result.offers) {
        setOffers(result.offers);
      } else {
        setOffers([]);
        setError("Couldn't get offers. The AI model might be busy. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch personalized offers. Please try again later.');
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
      <PageHeader title="AI-Powered Trends" showBackButton={false}>
         <Button variant="ghost" size="sm" onClick={fetchOffers} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
         </Button>
      </PageHeader>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating AI insights...</p>
            </div>
          </div>
        )}

        {error && !loading && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}

        {!loading && !error && offers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Personalized Offers</CardTitle>
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
                    <p className="text-muted-foreground">No offers generated. Try refreshing.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
