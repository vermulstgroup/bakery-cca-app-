"use client";

import { useState } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useToast } from "@/hooks/use-toast"

export default function ExpensesPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState<{ [key: string]: string }>({});

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekLabel = `Week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

  const totalExpenses = Object.values(expenses).reduce((acc, val) => acc + (Number(val) || 0), 0);

  const handleExpenseChange = (categoryId: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setExpenses(prev => ({ ...prev, [categoryId]: numericValue }));
  };
  
  const addExpense = (categoryId: string, amount: number) => {
    const currentAmount = Number(expenses[categoryId] || 0);
    handleExpenseChange(categoryId, (currentAmount + amount).toString());
  };

  const handleSave = () => {
    toast({
        title: "✓ Expenses Saved!",
        description: `Total expenses of ${formatUGX(totalExpenses)} saved for ${weekLabel}.`,
        className: 'bg-success text-white'
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title="Weekly Expenses" />

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
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total Expenses This Week</CardTitle>
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
              <AccordionTrigger className="text-lg p-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.emoji}</span>
                  <span>{category.name}</span>
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
          <Button className="w-full" onClick={handleSave}>
              Save Expenses ✓
          </Button>
      </div>
    </div>
  );
}