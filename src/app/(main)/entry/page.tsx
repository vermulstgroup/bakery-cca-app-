
"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2, Settings } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, addDays, subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';


const ProductCounter = ({ product }: { product: any }) => {
    const { t } = useTranslation();
    const [count, setCount] = useState(0);

    const quickAddValues = [10, 25, 50, 100];

    const changeCount = (amount: number) => {
        setCount(prev => Math.max(0, prev + amount));
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{product.emoji} {product.name}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <Button 
                    variant="accent" 
                    size="icon" 
                    className="rounded-full text-2xl font-bold" 
                    onClick={() => changeCount(-1)}
                    aria-label={t('decrease_count', { product: product.name })}
                >
                    <Minus />
                </Button>
                <div className="font-currency text-3xl h-14 w-24 flex items-center justify-center rounded-md bg-secondary" aria-live="polite">{count}</div>
                <Button 
                    variant="accent" 
                    size="icon" 
                    className="rounded-full text-2xl font-bold" 
                    onClick={() => changeCount(1)}
                    aria-label={t('increase_count', { product: product.name })}
                >
                    <Plus />
                </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {quickAddValues.map(val => (
                     <Button key={val} variant="accent" size="accent" onClick={() => changeCount(val)}>+{val}</Button>
                ))}
            </div>
        </Card>
    )
}

export default function DailyEntryPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { data: onboardingData, isLoaded } = useOnboarding();
    const [date, setDate] = useState(new Date());

    const userProducts = isLoaded && onboardingData.products ? PRODUCTS.filter(p => onboardingData.products?.includes(p.id)) : [];
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSave = () => {
        setSaveStatus('saving');
        // Simulate API call
        setTimeout(() => {
            setSaveStatus('saved');
            toast({
                title: t('saved_successfully'),
                description: t('entries_saved_for_date', { date: format(date, 'MMMM d') }),
                className: "bg-success text-white"
            })
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    }

    if (!isLoaded) {
        return (
             <div className="flex h-screen flex-col">
                <PageHeader title={t('daily_entry')}>
                    <Button variant="ghost" size="sm">{t('today')}</Button>
                </PageHeader>
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (userProducts.length === 0) {
        return (
            <div className="flex h-screen flex-col">
                <PageHeader title={t('daily_entry')} />
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="p-4 bg-secondary rounded-full">
                        <Settings className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{t('no_products_setup_title')}</h2>
                    <p className="text-muted-foreground">{t('no_products_setup_subtitle')}</p>
                    <Button asChild size="lg">
                        <Link href="/select-products">{t('go_to_product_settings')}</Link>
                    </Button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="flex h-screen flex-col">
            <PageHeader title={t('daily_entry')}>
                 <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>{t('today')}</Button>
            </PageHeader>
            
            <div className="p-4">
                 <Card className="flex items-center justify-between p-2 bg-secondary rounded-xl">
                    <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 1))} aria-label={t('previous_day')}><ChevronLeft/></Button>
                    <div className="text-center font-semibold text-base">
                        <p>{format(date, "eeee, MMMM d, yyyy")}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))} aria-label={t('next_day')}><ChevronRight/></Button>
                </Card>
            </div>

            <Tabs defaultValue="production" className="flex-grow flex flex-col">
                <div className="px-4">
                    <TabsList className="grid w-full grid-cols-3 h-14 p-1">
                        <TabsTrigger value="production" className="h-full text-base">{t('production')}</TabsTrigger>
                        <TabsTrigger value="sales" className="h-full text-base">{t('sales')}</TabsTrigger>
                        <TabsTrigger value="damages" className="h-full text-base">{t('damages')}</TabsTrigger>
                    </TabsList>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    <TabsContent value="production" className="mt-0">
                        <div className="space-y-3">
                            {userProducts.map(p => <ProductCounter key={p.id} product={p} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="sales" className="mt-0">
                        <div className="space-y-3">
                            {userProducts.map(p => <ProductCounter key={p.id} product={p} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="damages" className="mt-0">
                        <div className="space-y-3">
                            {userProducts.map(p => <ProductCounter key={p.id} product={p} />)}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            <div className="sticky bottom-[64px] p-4 bg-background/80 backdrop-blur-lg border-t">
                <Button size="lg" className="w-full" onClick={handleSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
                    {saveStatus === 'saving' ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            {t('saving')}
                        </>
                    ) : saveStatus === 'saved' ? t('saved') : t('done_for_today')}
                </Button>
            </div>
        </div>
    )
}
