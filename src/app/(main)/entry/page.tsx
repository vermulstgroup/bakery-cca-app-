"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useOnboarding } from '@/hooks/use-onboarding';
import { format, addDays, subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';


const ProductCounter = ({ product }: { product: any }) => {
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
                <Button variant="accent" size="icon" className="h-14 w-14 rounded-full text-2xl font-bold" onClick={() => changeCount(-1)}><Minus /></Button>
                <div className="font-currency text-3xl h-14 w-24 flex items-center justify-center rounded-md bg-secondary">{count}</div>
                <Button variant="accent" size="icon" className="h-14 w-14 rounded-full text-2xl font-bold" onClick={() => changeCount(1)}><Plus /></Button>
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
    const { toast } = useToast();
    const { data: onboardingData, isLoaded } = useOnboarding();
    const [date, setDate] = useState(new Date());

    const userProducts = isLoaded ? PRODUCTS.filter(p => onboardingData.products?.includes(p.id)) : [];
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSave = () => {
        setSaveStatus('saving');
        // Simulate API call
        setTimeout(() => {
            setSaveStatus('saved');
            toast({
                title: "✓ Saved successfully!",
                description: `Entries for ${format(date, 'MMMM d')} have been saved.`,
                className: "bg-success text-white"
            })
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    }
    
    return (
        <div className="flex h-screen flex-col">
            <PageHeader title="Daily Entry">
                 <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Today</Button>
            </PageHeader>
            
            <div className="p-4">
                 <Card className="flex items-center justify-between p-2 bg-secondary rounded-xl">
                    <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 1))}><ChevronLeft/></Button>
                    <div className="text-center font-semibold text-base">
                        <p>{format(date, "eeee, MMMM d, yyyy")}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))}><ChevronRight/></Button>
                </Card>
            </div>

            <Tabs defaultValue="production" className="flex-grow flex flex-col">
                <div className="px-4">
                    <TabsList className="grid w-full grid-cols-3 h-14 p-1">
                        <TabsTrigger value="production" className="h-full">Production</TabsTrigger>
                        <TabsTrigger value="sales" className="h-full">Sales</TabsTrigger>
                        <TabsTrigger value="damages" className="h-full">Damages</TabsTrigger>
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
                <Button className="w-full" onClick={handleSave} disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Done for Today ✓'}
                </Button>
            </div>
        </div>
    )
}
