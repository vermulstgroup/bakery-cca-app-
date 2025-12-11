
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTranslation } from '@/hooks/use-translation';
import { PRODUCTS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export function ProductSelection() {
    const { t } = useTranslation();
    const { data: onboardingData, updateData, isLoaded } = useOnboarding();
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isLoaded) {
            setSelectedProducts(new Set(onboardingData.products || []));
        }
    }, [isLoaded, onboardingData.products]);

    const handleProductToggle = useCallback((productId: string) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
        updateData({ products: Array.from(newSelection) });
    }, [selectedProducts, updateData]);

    const selectAll = () => {
        const allProductIds = new Set(PRODUCTS.map(p => p.id));
        setSelectedProducts(allProductIds);
        updateData({ products: Array.from(allProductIds) });
    };

    const clearAll = () => {
        setSelectedProducts(new Set());
        updateData({ products: [] });
    };

    if (!isLoaded || !onboardingData.bakery) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('manage_active_products')}</CardTitle>
                <CardDescription>
                    {t('products_selected', { count: selectedProducts.size })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={selectAll}>{t('select_all')}</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll}>{t('clear_all')}</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {PRODUCTS.map(product => {
                        const isSelected = selectedProducts.has(product.id);
                        return (
                            <Card
                                key={product.id}
                                onClick={() => handleProductToggle(product.id)}
                                className={cn(
                                    'cursor-pointer p-3 transition-all aspect-[4/5] flex flex-col justify-between items-center relative shadow-sm text-center',
                                    isSelected ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'hover:bg-accent'
                                )}
                            >
                                <div className="absolute top-2 right-2 pointer-events-none">
                                    {isSelected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <div className="h-5 w-5 rounded-full border-2 border-muted bg-background" />}
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 mt-4 pointer-events-none">
                                    <div className="text-4xl sm:text-5xl">{product.emoji}</div>
                                    <p className="font-semibold text-sm leading-tight">{product.name}</p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
