
"use client";

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EXPENSE_CATEGORIES } from '@/lib/data';
import { formatUGX } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from '@/hooks/use-translation';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function ExpensesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: onboardingData, isLoaded: isOnboardingLoaded } = useOnboarding();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekLabel = t('week_of_date_range', { 
    start: format(start, 'MMM d'), 
    end: format(end, 'MMM d, yyyy') 
  });
  
  const getStorageKey = useCallback(() => {
    if (!onboardingData.bakery) return null;
    const weekId = format(start, 'yyyy-MM-dd');
    return `expenses-${onboardingData.bakery}-${weekId}`;
  }, [onboardingData.bakery, start]);
  
  useEffect(() => {
    if (isOnboardingLoaded) {
      const storageKey = getStorageKey();
      if (storageKey) {
        const savedExpenses = localStorage.getItem(storageKey);
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        } else {
          setExpenses({}); // Clear expenses for new week
        }
      }
    }
  }, [currentDate, isOnboardingLoaded, getStorageKey]);

  const totalExpenses = Object.values(expenses).reduce((acc, val) => acc + (Number(val) || 0), 0);

  const handleExpenseChange = (categoryId: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setExpenses(prev => ({ ...prev, [categoryId]: numericValue }));
  };
  
  const addExpense = (categoryId: string, amount: number) => {
    const currentAmount = Number(expenses[categoryId] || 0);
    handleExpenseChange(categoryId, (currentAmount + amount).toString());
  };

  const handleSave = async () => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot save expenses without a selected bakery.'
      });
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(expenses));
      toast({
          title: t('expenses_saved'),
          description: t('total_expenses_saved_for_week', { total: formatUGX(totalExpenses), week: weekLabel }),
          className: 'bg-success text-white'
      });
    } catch (error) {
       console.error("Error saving weekly expenses to localStorage:", error);
       toast({
           variant: 'destructive',
           title: 'Save failed',
           description: 'Could not save your weekly expenses. Please try again.'
       });
    } finally {
       setIsSaving(false);
    }
  };

  if (!isOnboardingLoaded) {
    return (
      <div className="flex h-screen flex-col">
        <PageHeader title={t('weekly_expenses')} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title={t('weekly_expenses')} />

      <div className="p-4 space-y-4">
        <Card className="flex items-center justify-between p-2 bg-secondary rounded-xl">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}><ChevronLeft/></Button>
          <div className="text-center font-semibold text-base">
            <p>{weekLabel}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}><ChevronRight/></Button>
        </Card>

        <Card className="sticky top-[70px] z-20">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">{t('total_expenses_this_week')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-currency text-foreground">{formatUGX(totalExpenses)}</p>

          </CardContent>
        </Card>
      </div>

      <div className="flex-grow overflow-y-auto px-4">
        <Accordion type="single" collapsible className="w-full">
          {EXPENSE_CATEGORIES.map(category => (
            <AccordionItem value={category.id} key={category.id} className="border-b-0">
             <Card className="mb-2 rounded-xl overflow-hidden">
              <AccordionTrigger className="text-lg p-4 hover:no-underline min-h-[56px]">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.emoji}</span>
                  <span>{t(`expense_category_${category.id}`)}</span>
                </div>
                <span className="font-currency text-lg text-muted-foreground mr-2">{formatUGX(Number(expenses[category.id] || 0))}</span>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-secondary/50 rounded-b-md">
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">UGX</span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      className="pl-12 text-lg text-right h-14 font-currency"
                      value={expenses[category.id] || ''}
                      onChange={e => handleExpenseChange(category.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {category.quickAmounts.map(amount => (
                      <Button key={amount} variant="accent" size="accent" onClick={() => addExpense(category.id, amount)}>
                        +{formatUGX(amount).replace('UGX ', '')}
                      </Button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
       <div className="sticky bottom-[64px] p-4 bg-background/80 backdrop-blur-lg border-t">
          <Button size="lg" className="w-full" onClick={handleSave} disabled={isSaving || !isOnboardingLoaded}>
              {isSaving ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t('saving')}
                </>
              ) : (
                <>{t('save_expenses')} ✓</>
              )}
          </Button>
      </div>
    </div>
  );
}
