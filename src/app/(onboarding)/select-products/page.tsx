"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from '@/hooks/use-onboarding';
import { formatUGX } from '@/lib/utils';
import { cn } from '@/lib/utils';

const defaultSelected = ['yeast_mandazi', 'doughnuts', 'loaf_1kg', 'loaf_500g', 'chapati'];

export default function SelectProductsPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(data.products || defaultSelected)
  );

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
    <div className="flex h-[80vh] flex-col gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Which products do you make?</h1>
        <p className="text-muted-foreground">Select all that apply. You can change this later.</p>
      </div>

      <div className="sticky top-0 z-10 bg-background py-2">
        <div className="flex justify-between items-center p-2 rounded-lg bg-secondary">
          <p className="font-medium">{selectedProducts.size} selected</p>
          <div className='flex gap-2'>
            <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map(product => {
            const isSelected = selectedProducts.has(product.id);
            return (
              <Card
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  'cursor-pointer p-3 transition-all aspect-square flex flex-col justify-between relative shadow-sm',
                  isSelected && 'bg-primary/10 border-primary ring-2 ring-primary'
                )}
              >
                <div className="absolute top-2 right-2">
                   <Checkbox checked={isSelected} />
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="text-4xl">{product.emoji}</div>
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-currency">{formatUGX(product.defaultPrice).replace('UGX ', '')}</p>
                </div>
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
        >
          Continue with {selectedProducts.size} products
        </Button>
      </div>
    </div>
  );
}
