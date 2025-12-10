
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { useTranslation } from '@/hooks/use-translation';

const PriceSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
                <div className="text-2xl w-8 h-8 bg-secondary rounded-full animate-pulse" />
                <div className="h-5 flex-grow bg-secondary rounded animate-pulse" />
                <div className="h-14 w-36 bg-secondary rounded-xl animate-pulse" />
            </div>
        ))}
    </div>
);


export default function EditPricesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data, updateData, isLoaded } = useOnboarding();
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const selectedProducts = isLoaded && data.products ? PRODUCTS.filter(p => data.products?.includes(p.id)) : [];

  useEffect(() => {
    if (isLoaded) {
      if (data.products) {
        const initialPrices = data.products.reduce((acc, productId) => {
          const product = PRODUCTS.find(p => p.id === productId);
          // Use saved price if available, otherwise default price
          const price = data.prices?.[productId]?.toString() || product?.defaultPrice.toString() || '0';
          acc[productId] = price;
          return acc;
        }, {} as { [key: string]: string });
        setPrices(initialPrices);
      }
    }
  }, [isLoaded, data.products, data.prices]);

  const handlePriceChange = (productId: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPrices(prev => ({ ...prev, [productId]: numericValue }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const finalPrices = Object.entries(prices).reduce((acc, [id, price]) => {
      acc[id] = Number(price) || 0;
      return acc;
    }, {} as { [key: string]: number });
    
    await updateData({ prices: finalPrices });

    setIsSaving(false);
    toast({
      title: t('prices_updated'),
      description: t('new_prices_saved'),
      className: "bg-success text-white"
    });
    router.back();
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('edit_selling_prices')} />
      
      <ScrollArea className="flex-grow p-4">
        <Card>
          <CardContent className="p-4">
            {!isLoaded ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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

      <div className="sticky bottom-[64px] p-4 bg-background/80 backdrop-blur-lg border-t">
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={!isLoaded || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              {t('saving')}...
            </>
          ) : (
             <>
              <Check className="mr-2 h-6 w-6" />
              {t('save_prices')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
