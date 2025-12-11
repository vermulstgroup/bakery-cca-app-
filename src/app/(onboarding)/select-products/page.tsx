
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS, BAKERIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/use-onboarding';
import { formatUGX } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const defaultSelected = ['yeast_mandazi', 'doughnuts', 'loaf_1kg', 'loaf_500g', 'chapati'];

export default function SelectProductsPage() {
  const router = useRouter();
  const { data, updateData, isLoaded } = useOnboarding();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  
  const bakeryName = isLoaded ? BAKERIES.find(b => b.id === data.bakery)?.name || t('your_bakery') : t('your_bakery');

  useEffect(() => {
    // Redirect if already onboarded
    if (isLoaded && localStorage.getItem('onboardingComplete') === 'true') {
        router.replace('/settings');
        return;
    }
    if (isLoaded) {
      setSelectedProducts(new Set(data.products || defaultSelected));
    }
  }, [isLoaded, data.products, router]);

  const toggleProduct = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };
  
  const selectAll = () => {
    const allProductIds = new Set(PRODUCTS.map(p => p.id));
    setSelectedProducts(allProductIds);
  };

  const clearAll = () => {
    setSelectedProducts(new Set());
  };


  const handleContinue = () => {
    updateData({ products: Array.from(selectedProducts) });
    router.push('/confirm-prices');
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('which_products_do_you_make')}</h1>
        <p className="text-muted-foreground">{t('select_for_bakery', { bakery: bakeryName })}</p>
      </div>

      <div className="sticky top-0 z-10 bg-background py-2">
        <Card className="flex justify-between items-center p-3 rounded-xl bg-secondary">
          <p className="font-semibold">{t('products_selected', { count: selectedProducts.size })}</p>
          <div className='flex gap-2'>
            <Button variant="outline" size="sm" onClick={selectAll}>{t('select_all')}</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>{t('clear_all')}</Button>
          </div>
        </Card>
      </div>

      <div className="flex-grow overflow-y-auto pt-4 -mr-2 pr-2">
        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map(product => {
            const isSelected = selectedProducts.has(product.id);
            return (
              <Card
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  'cursor-pointer p-3 transition-all aspect-[4/5] flex flex-col justify-between items-center relative shadow-sm text-center',
                  isSelected && 'bg-primary/10 border-primary ring-2 ring-primary'
                )}
              >
                <div className="absolute top-2 right-2">
                   {isSelected ? <CheckCircle2 className="h-5 w-5 text-primary"/> : <div className="h-5 w-5 rounded-full border-2 border-muted" /> }
                </div>
                <div className="flex flex-col items-center text-center gap-2 mt-4">
                  <div className="text-5xl">{product.emoji}</div>
                  <p className="font-semibold text-sm leading-tight">{product.name}</p>
                </div>
                 <p className="text-sm text-muted-foreground font-currency">{formatUGX(product.defaultPrice).replace('UGX ', '')}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button
          onClick={handleContinue}
          disabled={selectedProducts.size === 0}
          className="w-full"
          size="lg"
        >
          {t('continue')} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
