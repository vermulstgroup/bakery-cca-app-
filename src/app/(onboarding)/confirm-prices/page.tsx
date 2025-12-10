
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/hooks/use-onboarding';
import { PartyPopper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

const PriceSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 flex-grow" />
                <Skeleton className="h-14 w-36" />
            </div>
        ))}
    </div>
);


export default function ConfirmPricesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, updateData, isLoaded, completeOnboarding } = useOnboarding();
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  
  const selectedProducts = isLoaded ? PRODUCTS.filter(p => data.products?.includes(p.id)) : [];

  useEffect(() => {
    if (isLoaded && data.products) {
      const initialPrices = data.products.reduce((acc, productId) => {
        const product = PRODUCTS.find(p => p.id === productId);
        acc[productId] = data.prices?.[productId]?.toString() || product?.defaultPrice.toString() || '0';
        return acc;
      }, {} as { [key: string]: string });
      setPrices(initialPrices);
    }
  }, [isLoaded, data.products, data.prices]);

  const handlePriceChange = (productId: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setPrices(prev => ({ ...prev, [productId]: numericValue }));
  };

  const handleFinish = () => {
    const finalPrices = Object.entries(prices).reduce((acc, [id, price]) => {
      acc[id] = Number(price);
      return acc;
    }, {} as { [key: string]: number });
    
    updateData({ prices: finalPrices });
    completeOnboarding();
    router.replace('/dashboard');
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('set_selling_prices')}</h1>
        <p className="text-muted-foreground">{t('adjust_prices_if_needed')}</p>
      </div>

      <ScrollArea className="flex-grow pr-2 -mr-4">
        <Card>
          <CardContent className="p-4">
            {!isLoaded || !data.products ? (
                <PriceSkeleton />
            ) : (
                <div className="space-y-4">
                    {selectedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3">
                        <div className="text-2xl">{product.emoji}</div>
                        <Label htmlFor={`price-${product.id}`} className="flex-grow text-base">{product.name}</Label>
                        <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">UGX</span>
                        <Input
                            id={`price-${product.id}`}
                            type="tel"
                            inputMode="numeric"
                            value={prices[product.id] ? new Intl.NumberFormat().format(Number(prices[product.id])) : ''}
                            onChange={e => handlePriceChange(product.id, e.target.value)}
                            className="h-14 pl-12 text-right font-currency"
                        />
                        </div>
                    </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </ScrollArea>

      <div className="mt-auto pt-4">
        <Button
          onClick={handleFinish}
          className="w-full"
          size="lg"
          disabled={!isLoaded}
        >
          <PartyPopper className="mr-2 h-6 w-6" />
          {t('start_using_app')}
        </Button>
      </div>
    </div>
  );
}
