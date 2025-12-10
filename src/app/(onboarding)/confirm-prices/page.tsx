"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Check, PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ConfirmPricesPage() {
  const router = useRouter();
  const { data, updateData, isLoaded, completeOnboarding } = useOnboarding();
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  
  const selectedProducts = PRODUCTS.filter(p => data.products?.includes(p.id));

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

  if (!isLoaded || !data.products) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  return (
    <div className="flex h-[80vh] flex-col gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set your selling prices</h1>
        <p className="text-muted-foreground">We've added typical prices. Adjust to match yours.</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <Card className="p-4">
          <div className="space-y-4">
            {selectedProducts.map(product => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="text-2xl">{product.emoji}</div>
                <Label htmlFor={product.id} className="flex-grow text-base">{product.name}</Label>
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">UGX</span>
                  <Input
                    id={product.id}
                    type="tel"
                    inputMode="numeric"
                    value={prices[product.id] || ''}
                    onChange={e => handlePriceChange(product.id, e.target.value)}
                    className="h-14 pl-12 text-right font-currency"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-auto pt-4">
        <Button
          onClick={handleFinish}
          className="w-full"
          size="lg"
        >
          <PartyPopper className="mr-2 h-6 w-6" />
          Start Using App
        </Button>
      </div>
    </div>
  );
}