"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, TrendingUp, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRODUCTS, BAKERIES, getProductMargin, getProductMarginPercent } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { saveDailyEntry, getDailyEntry } from '@/lib/firebase/firestore';
import { format, subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { DailyEntry, ProductionItem } from '@/lib/types';

// Production input component for kg flour
const ProductionInput = ({
  product,
  kgFlour,
  onKgFlourChange,
}: {
  product: typeof PRODUCTS[0];
  kgFlour: number;
  onKgFlourChange: (kg: number) => void;
}) => {
  const productionValue = kgFlour * product.revenuePerKgFlour;
  const ingredientCost = kgFlour * product.costPerKgFlour;
  const margin = getProductMargin(product);
  const marginPercent = getProductMarginPercent(product);
  const profit = kgFlour * margin;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{product.emoji}</span>
        <div className="flex-1">
          <h3 className="font-bold text-white">{product.name}</h3>
          <p className="text-xs text-slate-400">
            Margin: {formatUGX(margin)}/kg ({marginPercent}%)
          </p>
        </div>
      </div>

      {/* kg Flour Input */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Flour Used (kg)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={kgFlour || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onKgFlourChange(isNaN(val) ? 0 : val);
            }}
            placeholder="0"
            className="flex-1 h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-400 font-medium">kg</span>
        </div>
        {/* Quick add buttons */}
        <div className="flex gap-2 mt-2">
          {[1, 2, 5, 10].map((val) => (
            <button
              key={val}
              onClick={() => onKgFlourChange(kgFlour + val)}
              className="flex-1 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              +{val}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-calculated values */}
      {kgFlour > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Production Value</span>
            <span className="text-green-400 font-bold font-currency">{formatUGX(productionValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Ingredient Cost</span>
            <span className="text-red-400 font-currency">{formatUGX(ingredientCost)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">Expected Profit</span>
            <span className="text-amber-400 font-currency">{formatUGX(profit)}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

// Sales input component
const SalesInput = ({
  product,
  productionValue,
  salesAmount,
  onSalesChange,
}: {
  product: typeof PRODUCTS[0];
  productionValue: number;
  salesAmount: number;
  onSalesChange: (amount: number) => void;
}) => {
  const salesPercent = productionValue > 0 ? (salesAmount / productionValue) * 100 : 0;
  const getProgressColor = () => {
    if (salesPercent >= 80) return 'bg-green-500';
    if (salesPercent >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{product.emoji}</span>
        <div className="flex-1">
          <h3 className="font-bold text-white">{product.name}</h3>
          <p className="text-xs text-slate-400">
            Production: {formatUGX(productionValue)}
          </p>
        </div>
      </div>

      {/* Sales UGX Input */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Sales Amount (UGX)</label>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1000"
          value={salesAmount || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onSalesChange(isNaN(val) ? 0 : val);
          }}
          placeholder="0"
          className="w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none font-currency [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {/* Quick add buttons */}
        <div className="flex gap-2 mt-2">
          {[10000, 25000, 50000, 100000].map((val) => (
            <button
              key={val}
              onClick={() => onSalesChange(salesAmount + val)}
              className="flex-1 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              +{(val / 1000)}k
            </button>
          ))}
        </div>
      </div>

      {/* Sales Progress */}
      {productionValue > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Sales vs Production</span>
            <span className={cn(
              "font-bold",
              salesPercent >= 80 ? 'text-green-400' :
              salesPercent >= 50 ? 'text-amber-400' : 'text-red-400'
            )}>
              {salesPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", getProgressColor())}
              style={{ width: `${Math.min(salesPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default function ProductionEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: onboardingData, isLoaded } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'production' | 'sales' | 'summary'>('production');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [date] = useState(new Date());

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Production data state (kg flour per product)
  const [production, setProduction] = useState<{ [productId: string]: ProductionItem }>({});
  // Sales data state (UGX per product)
  const [sales, setSales] = useState<{ [productId: string]: number }>({});

  // Load existing data for today
  useEffect(() => {
    if (!isLoaded || !onboardingData.bakery) return;

    const loadData = async () => {
      const dateString = format(date, 'yyyy-MM-dd');
      try {
        const existing = await getDailyEntry(onboardingData.bakery!, dateString);
        if (existing?.production) {
          setProduction(existing.production);
        }
        if (existing?.sales) {
          setSales(existing.sales);
        }
      } catch {
        // Fallback to localStorage
        const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateString}`);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.production) setProduction(data.production);
          if (data.sales) setSales(data.sales);
        }
      }
    };
    loadData();
  }, [isLoaded, onboardingData.bakery, date]);

  // Handle kg flour change for a product
  const handleKgFlourChange = (productId: string, kgFlour: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    setProduction(prev => ({
      ...prev,
      [productId]: {
        kgFlour,
        productionValueUGX: kgFlour * product.revenuePerKgFlour,
        ingredientCostUGX: kgFlour * product.costPerKgFlour,
      },
    }));
  };

  // Handle sales change for a product
  const handleSalesChange = (productId: string, amount: number) => {
    setSales(prev => ({
      ...prev,
      [productId]: amount,
    }));
  };

  // Calculate totals
  const totals = useMemo(() => {
    let productionValue = 0;
    let ingredientCost = 0;
    let salesTotal = 0;

    PRODUCTS.forEach(p => {
      const prod = production[p.id];
      if (prod) {
        productionValue += prod.productionValueUGX || 0;
        ingredientCost += prod.ingredientCostUGX || 0;
      }
      salesTotal += sales[p.id] || 0;
    });

    const grossProfit = salesTotal - ingredientCost;
    const margin = salesTotal > 0 ? (grossProfit / salesTotal) * 100 : 0;

    return {
      productionValue,
      ingredientCost,
      salesTotal,
      grossProfit,
      margin,
    };
  }, [production, sales]);

  // Save handler
  const handleSave = async () => {
    if (!onboardingData.bakery) {
      toast({ variant: 'destructive', title: 'Error', description: 'No bakery selected' });
      return;
    }

    setSaveStatus('saving');
    const dateString = format(date, 'yyyy-MM-dd');

    const dataToSave: DailyEntry = {
      date: dateString,
      bakeryId: onboardingData.bakery,
      production,
      sales,
      totals: {
        productionValue: totals.productionValue,
        ingredientCost: totals.ingredientCost,
        salesTotal: totals.salesTotal,
        profit: totals.grossProfit,
        margin: totals.margin,
      },
    };

    try {
      // Save to localStorage first
      localStorage.setItem(`biss-entry-${onboardingData.bakery}-${dateString}`, JSON.stringify(dataToSave));

      // Save to Firestore
      await saveDailyEntry(onboardingData.bakery, dataToSave);

      setSaveStatus('saved');
      toast({
        title: 'Saved successfully',
        description: `Entry saved for ${format(date, 'MMMM d')}`,
        className: "bg-green-600 text-white border-none"
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Saved locally, will sync when online.'
      });
      setSaveStatus('idle');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="-ml-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Daily Entry
            </h1>
            <p className="text-slate-400 text-sm">
              {currentBakery?.name || 'No bakery'} • {format(date, 'EEE, MMM d')}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              '✓ Saved'
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {(['production', 'sales', 'summary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 rounded-xl font-medium capitalize transition-all",
                activeTab === tab
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              {tab === 'production' && '📦 '}
              {tab === 'sales' && '💰 '}
              {tab === 'summary' && '📊 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-slate-400 text-sm">
                Enter kg of flour used for each product
              </p>
            </div>
            {PRODUCTS.map((product) => (
              <ProductionInput
                key={product.id}
                product={product}
                kgFlour={production[product.id]?.kgFlour || 0}
                onKgFlourChange={(kg) => handleKgFlourChange(product.id, kg)}
              />
            ))}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-slate-400 text-sm">
                Enter actual sales in UGX per product
              </p>
            </div>
            {PRODUCTS.map((product) => (
              <SalesInput
                key={product.id}
                product={product}
                productionValue={production[product.id]?.productionValueUGX || 0}
                salesAmount={sales[product.id] || 0}
                onSalesChange={(amount) => handleSalesChange(product.id, amount)}
              />
            ))}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Totals Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Today's Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Production Value</span>
                  <span className="text-green-400 font-bold font-currency">
                    {formatUGX(totals.productionValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ingredient Cost</span>
                  <span className="text-red-400 font-currency">
                    {formatUGX(totals.ingredientCost)}
                  </span>
                </div>
                <div className="border-t border-slate-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Sales</span>
                  <span className="text-white font-bold font-currency">
                    {formatUGX(totals.salesTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-white font-bold">Gross Profit</span>
                  <span className={cn(
                    "font-bold font-currency",
                    totals.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {formatUGX(totals.grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profit Margin</span>
                  <span className={cn(
                    "font-bold",
                    totals.margin >= 20 ? 'text-green-400' :
                    totals.margin >= 10 ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {totals.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Per-Product Breakdown */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-4">Product Breakdown</h3>
              <div className="space-y-3">
                {PRODUCTS.map((product) => {
                  const prod = production[product.id];
                  const sold = sales[product.id] || 0;
                  const cost = prod?.ingredientCostUGX || 0;
                  const profit = sold - cost;

                  return (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product.emoji}</span>
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-xs text-slate-400">
                            {prod?.kgFlour || 0} kg flour
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-currency text-sm text-slate-300">
                          Sold: {formatUGX(sold)}
                        </div>
                        <div className={cn(
                          "text-sm font-bold font-currency",
                          profit >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {profit >= 0 ? '+' : ''}{formatUGX(profit)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Reference Table */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-4">Product Reference</h3>
              <div className="text-xs">
                <div className="grid grid-cols-4 gap-2 text-slate-400 pb-2 border-b border-slate-700">
                  <div>Product</div>
                  <div>Rev/kg</div>
                  <div>Cost/kg</div>
                  <div>Margin</div>
                </div>
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="grid grid-cols-4 gap-2 py-2 border-b border-slate-700 last:border-0">
                    <div className="flex items-center gap-1">
                      <span>{product.emoji}</span>
                    </div>
                    <div className="text-green-400 font-currency">{(product.revenuePerKgFlour / 1000).toFixed(1)}k</div>
                    <div className="text-red-400 font-currency">{(product.costPerKgFlour / 1000).toFixed(1)}k</div>
                    <div className="text-amber-400">{getProductMarginPercent(product)}%</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-700">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Today's Profit</div>
            <div className={cn(
              "text-xl font-bold font-currency",
              totals.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {formatUGX(totals.grossProfit)}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              '✓ Saved!'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
