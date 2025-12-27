"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, TrendingUp, TrendingDown, Calculator, CheckCircle2, AlertTriangle, X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PRODUCTS, BAKERIES, getProductMargin, getProductMarginPercent, VALIDATION_LIMITS } from '@/lib/data';
import { formatUGX, cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { saveDailyEntry, getDailyEntry } from '@/lib/supabase';
import { format, subDays, addDays, isToday, isFuture } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { DailyEntry, ProductionItem, OthersData } from '@/lib/types';

// Production input component for kg flour
const ProductionInput = ({
  product,
  kgFlour,
  onKgFlourChange,
  onClear,
  disabled = false,
}: {
  product: typeof PRODUCTS[0];
  kgFlour: number;
  onKgFlourChange: (kg: number) => void;
  onClear: () => void;
  disabled?: boolean;
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
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={kgFlour}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onKgFlourChange(isNaN(val) ? 0 : val);
              }}
              disabled={disabled}
              placeholder="0"
              className={cn(
                "w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
            {kgFlour > 0 && !disabled && (
              <button
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Clear value"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <span className="text-slate-400 font-medium">kg</span>
        </div>
        {/* Quick add buttons */}
        <div className="flex gap-2 mt-2">
          {[1, 2, 5, 10].map((val) => (
            <button
              key={val}
              onClick={() => onKgFlourChange(kgFlour + val)}
              disabled={disabled}
              className={cn(
                "flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors",
                disabled && "opacity-50 cursor-not-allowed hover:bg-slate-700"
              )}
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
            <span className="text-slate-300">Production Value</span>
            <span className="text-green-400 font-bold font-currency flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {formatUGX(productionValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Ingredient Cost</span>
            <span className="text-red-400 font-currency flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              {formatUGX(ingredientCost)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-200">Expected Profit</span>
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
  onClear,
  disabled = false,
}: {
  product: typeof PRODUCTS[0];
  productionValue: number;
  salesAmount: number;
  onSalesChange: (amount: number) => void;
  onClear: () => void;
  disabled?: boolean;
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
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            value={salesAmount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onSalesChange(isNaN(val) ? 0 : val);
            }}
            disabled={disabled}
            placeholder="0"
            className={cn(
              "w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none font-currency [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {salesAmount > 0 && !disabled && (
            <button
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Clear value"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {/* Quick add buttons */}
        <div className="flex gap-2 mt-2">
          {[10000, 25000, 50000, 100000].map((val) => (
            <button
              key={val}
              onClick={() => onSalesChange(salesAmount + val)}
              disabled={disabled}
              className={cn(
                "flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors",
                disabled && "opacity-50 cursor-not-allowed hover:bg-slate-700"
              )}
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
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
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

type PendingAction =
  | { type: 'back' }
  | { type: 'prevDay' }
  | { type: 'nextDay' }
  | { type: 'today' };

export default function ProductionEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: onboardingData, isLoaded } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'production' | 'sales' | 'others' | 'summary'>('production');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [date, setDate] = useState<Date | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialDataLoaded = useRef(false);
  const initialFormValues = useRef<{ production: typeof production; sales: typeof sales; others: OthersData } | null>(null);

  const currentBakery = BAKERIES.find(b => b.id === onboardingData.bakery);

  // Get selected products from onboarding (default to all if none selected)
  const selectedProducts = useMemo(() => {
    if (onboardingData.products && onboardingData.products.length > 0) {
      return PRODUCTS.filter(p => onboardingData.products!.includes(p.id));
    }
    return PRODUCTS;
  }, [onboardingData.products]);

  // Helper to reset form for a new date
  const resetFormForDate = useCallback((newDate: Date) => {
    setDate(newDate);
    setProduction({});
    setSales({});
    setOthers({ replacements: 0, bonuses: 0, debts: 0 });
    setIsDirty(false);
    setSaveStatus('idle');
    initialDataLoaded.current = false;
    initialFormValues.current = null;
  }, []);

  // Date navigation handlers
  const goToPreviousDay = useCallback(() => {
    if (isDirty && saveStatus !== 'saved') {
      setPendingAction({ type: 'prevDay' });
      setShowExitDialog(true);
      return;
    }
    resetFormForDate(subDays(date, 1));
  }, [date, isDirty, saveStatus, resetFormForDate]);

  const goToNextDay = useCallback(() => {
    if (isFuture(addDays(date, 1))) return; // Can't go to future
    if (isDirty && saveStatus !== 'saved') {
      setPendingAction({ type: 'nextDay' });
      setShowExitDialog(true);
      return;
    }
    resetFormForDate(addDays(date, 1));
  }, [date, isDirty, saveStatus, resetFormForDate]);

  const goToToday = useCallback(() => {
    if (isToday(date)) return;
    if (isDirty && saveStatus !== 'saved') {
      setPendingAction({ type: 'today' });
      setShowExitDialog(true);
      return;
    }
    resetFormForDate(new Date());
  }, [date, isDirty, saveStatus, resetFormForDate]);

  // Initialize date on client side and check for pre-selected date (from history page navigation)
  useEffect(() => {
    const selectedDate = localStorage.getItem('biss-selected-date');
    if (selectedDate) {
      localStorage.removeItem('biss-selected-date'); // Clear it
      try {
        const parsedDate = new Date(selectedDate);
        if (!isNaN(parsedDate.getTime()) && !isFuture(parsedDate)) {
          setDate(parsedDate);
          return;
        }
      } catch {
        // Invalid date, fall through to use today
      }
    }
    // Default to today if no pre-selected date
    setDate(new Date());
  }, []);

  // Production data state (kg flour per product)
  const [production, setProduction] = useState<{ [productId: string]: ProductionItem }>({});
  // Sales data state (UGX per product)
  const [sales, setSales] = useState<{ [productId: string]: number }>({});
  // Others data state (replacements, bonuses, debts)
  const [others, setOthers] = useState<OthersData>({ replacements: 0, bonuses: 0, debts: 0 });

  // Track dirty state by comparing current values against initial values
  useEffect(() => {
    if (!initialDataLoaded.current || !initialFormValues.current) {
      return;
    }

    const initial = initialFormValues.current;

    // Deep compare production
    const productionChanged = JSON.stringify(production) !== JSON.stringify(initial.production);

    // Deep compare sales
    const salesChanged = JSON.stringify(sales) !== JSON.stringify(initial.sales);

    // Compare others
    const othersChanged =
      others.replacements !== initial.others.replacements ||
      others.bonuses !== initial.others.bonuses ||
      others.debts !== initial.others.debts;

    setIsDirty(productionChanged || salesChanged || othersChanged);
  }, [production, sales, others]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && saveStatus !== 'saved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveStatus]);

  // Auto-save draft every 30 seconds (protects against power cuts)
  useEffect(() => {
    if (!onboardingData.bakery || !isDirty || saveStatus === 'saved' || !date) return;

    const timer = setInterval(() => {
      const dateString = format(date, 'yyyy-MM-dd');
      const draftKey = `draft-${onboardingData.bakery}-${dateString}`;
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          production,
          sales,
          others,
          timestamp: Date.now()
        }));
      } catch {
        // Silent fail - localStorage might be full
      }
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [onboardingData.bakery, date, production, sales, others, isDirty, saveStatus]);

  // Handle back navigation with unsaved changes
  const handleBack = () => {
    if (isDirty && saveStatus !== 'saved') {
      setPendingAction({ type: 'back' });
      setShowExitDialog(true);
    } else {
      router.push('/dashboard');
    }
  };

  // Execute pending action after user confirms "Leave Anyway"
  const executePendingAction = useCallback(() => {
    if (!pendingAction) return;

    setShowExitDialog(false);
    setIsDirty(false);

    switch (pendingAction.type) {
      case 'back':
        router.push('/dashboard');
        break;
      case 'prevDay':
        resetFormForDate(subDays(date, 1));
        break;
      case 'nextDay':
        resetFormForDate(addDays(date, 1));
        break;
      case 'today':
        resetFormForDate(new Date());
        break;
    }

    setPendingAction(null);
  }, [pendingAction, date, router, resetFormForDate]);

  // Redirect to bakery selection if no bakery selected
  useEffect(() => {
    if (isLoaded && !onboardingData.bakery) {
      router.replace('/select-bakery');
    }
  }, [isLoaded, onboardingData.bakery, router]);

  // Load existing data for today
  useEffect(() => {
    if (!isLoaded || !onboardingData.bakery || !date) return;

    const loadData = async () => {
      const dateString = format(date, 'yyyy-MM-dd');
      let loadedProduction: { [productId: string]: ProductionItem } = {};
      let loadedSales: { [productId: string]: number } = {};
      let loadedOthers: OthersData = { replacements: 0, bonuses: 0, debts: 0 };
      let dataLoaded = false;

      // Try Firestore first
      try {
        const existing = await getDailyEntry(onboardingData.bakery!, dateString);
        if (existing?.production) {
          loadedProduction = existing.production;
          dataLoaded = true;
        }
        if (existing?.sales) {
          loadedSales = existing.sales;
          dataLoaded = true;
        }
        if (existing?.others) {
          loadedOthers = existing.others;
          dataLoaded = true;
        }
      } catch {
        // Firestore failed, will try localStorage below
      }

      // Fallback to localStorage if Firestore returned no data
      if (!dataLoaded) {
        const stored = localStorage.getItem(`biss-entry-${onboardingData.bakery}-${dateString}`);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.production) loadedProduction = data.production;
            if (data.sales) loadedSales = data.sales;
            if (data.others) loadedOthers = data.others;
            dataLoaded = true;
          } catch {
            // Corrupted data, continue to check draft
          }
        }

        // Check for auto-saved draft (from power cut recovery)
        if (!dataLoaded) {
          const draftKey = `draft-${onboardingData.bakery}-${dateString}`;
          const draft = localStorage.getItem(draftKey);
          if (draft) {
            try {
              const draftData = JSON.parse(draft);
              if (draftData.production) loadedProduction = draftData.production;
              if (draftData.sales) loadedSales = draftData.sales;
              if (draftData.others) loadedOthers = draftData.others;
              toast({
                title: "Draft recovered",
                description: "Unsaved changes from earlier were restored",
              });
            } catch {
              // Invalid draft, ignore
            }
          }
        }
      }

      // Apply loaded data to state
      setProduction(loadedProduction);
      setSales(loadedSales);
      setOthers(loadedOthers);

      // Store initial form values for dirty state comparison (deep clone)
      initialFormValues.current = {
        production: JSON.parse(JSON.stringify(loadedProduction)),
        sales: JSON.parse(JSON.stringify(loadedSales)),
        others: { ...loadedOthers }
      };

      // Mark initial data as loaded so we can track changes
      initialDataLoaded.current = true;
    };
    loadData();
  }, [isLoaded, onboardingData.bakery, date, toast]);

  // Handle kg flour change for a product (with validation)
  const handleKgFlourChange = useCallback((productId: string, kgFlour: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Clamp to valid range
    let safeValue = Math.max(0, kgFlour);
    if (safeValue > VALIDATION_LIMITS.MAX_KG_FLOUR) {
      safeValue = VALIDATION_LIMITS.MAX_KG_FLOUR;
      toast({
        title: 'Maximum exceeded',
        description: `Max flour is ${VALIDATION_LIMITS.MAX_KG_FLOUR} kg per product`,
        variant: 'destructive'
      });
    }

    setProduction(prev => ({
      ...prev,
      [productId]: {
        kgFlour: safeValue,
        productionValueUGX: safeValue * product.revenuePerKgFlour,
        ingredientCostUGX: safeValue * product.costPerKgFlour,
      },
    }));
  }, [toast]);

  // Handle sales change for a product (with validation)
  const handleSalesChange = useCallback((productId: string, amount: number) => {
    // Clamp to valid range
    let safeValue = Math.max(0, amount);
    if (safeValue > VALIDATION_LIMITS.MAX_SALES_UGX) {
      safeValue = VALIDATION_LIMITS.MAX_SALES_UGX;
      toast({
        title: 'Maximum exceeded',
        description: `Max sales is ${formatUGX(VALIDATION_LIMITS.MAX_SALES_UGX)} per product`,
        variant: 'destructive'
      });
    }

    setSales(prev => ({
      ...prev,
      [productId]: safeValue,
    }));
  }, [toast]);

  // Calculate totals
  const totals = useMemo(() => {
    let productionValue = 0;
    let ingredientCost = 0;
    let salesTotal = 0;

    // Use selectedProducts instead of all PRODUCTS
    selectedProducts.forEach(p => {
      const prod = production[p.id];
      if (prod) {
        productionValue += prod.productionValueUGX || 0;
        ingredientCost += prod.ingredientCostUGX || 0;
      }
      salesTotal += sales[p.id] || 0;
    });

    // Gross profit includes "Others" deductions:
    // - Replacements: products given away (reduces profit)
    // - Bonuses: extra staff payments (reduces profit)
    // - Debts: money owed TO bakery (does NOT reduce profit)
    const othersDeductions = (others.replacements || 0) + (others.bonuses || 0);
    const grossProfit = salesTotal - ingredientCost - othersDeductions;
    const margin = salesTotal > 0 ? (grossProfit / salesTotal) * 100 : 0;

    return {
      productionValue,
      ingredientCost,
      salesTotal,
      grossProfit,
      margin,
      othersDeductions,
    };
  }, [production, sales, others, selectedProducts]);

  // Check if there's any data to save
  const hasData = useMemo(() => {
    const hasProduction = Object.values(production).some(p => p.kgFlour > 0);
    const hasSales = Object.values(sales).some(s => s > 0);
    const hasOthers = others.replacements > 0 || others.bonuses > 0 || others.debts > 0;
    return hasProduction || hasSales || hasOthers;
  }, [production, sales, others]);

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
      others,
      totals: {
        productionValue: totals.productionValue,
        ingredientCost: totals.ingredientCost,
        salesTotal: totals.salesTotal,
        profit: totals.grossProfit,
        margin: totals.margin,
      },
    };

    try {
      // Save to localStorage first (always succeeds)
      localStorage.setItem(`biss-entry-${onboardingData.bakery}-${dateString}`, JSON.stringify(dataToSave));

      // Save to Firestore with timeout to prevent UI hanging
      const saveWithTimeout = Promise.race([
        saveDailyEntry(onboardingData.bakery, dataToSave),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save timeout')), 5000)
        )
      ]);

      await saveWithTimeout;

      setSaveStatus('saved');
      setIsDirty(false); // Reset dirty state on successful save

      // Haptic feedback on save success
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      toast({
        title: '✓ Saved successfully',
        description: `Entry saved for ${format(date, 'MMMM d')}`,
        className: "bg-green-600 text-white border-none"
      });

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Saved locally, will sync when online.'
      });
      setSaveStatus('idle');
    }
  };

  if (!isLoaded || !date) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div data-testid="entry-page" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-40">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="-ml-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || !hasData}
              className={cn(
                "transition-all duration-300",
                saveStatus === 'saved'
                  ? "bg-emerald-500 hover:bg-emerald-500"
                  : !hasData
                  ? "bg-slate-600 hover:bg-slate-600 opacity-50"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {saveStatus === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
          <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2 mt-2">
            <Calculator className="h-5 w-5" />
            Daily Entry
          </h1>
          <p className="text-slate-400 text-sm mb-3">
            {currentBakery?.name || 'No bakery'}
          </p>
          {/* Date Navigation */}
          <div data-testid="date-navigation" className="flex items-center justify-center gap-2 bg-slate-800/50 rounded-xl p-2">
            <Button
              data-testid="prev-day-btn"
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              data-testid="today-btn"
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className={cn(
                "min-w-[140px] text-sm font-medium",
                isToday(date)
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "text-slate-300 hover:bg-slate-700"
              )}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {isToday(date) ? 'Today' : format(date, 'EEE, MMM d')}
            </Button>
            <Button
              data-testid="next-day-btn"
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              disabled={isToday(date)}
              className={cn(
                "h-10 w-10",
                isToday(date)
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div data-testid="tab-navigation" className="flex gap-2 mb-6">
          {(['production', 'sales', 'others', 'summary'] as const).map((tab) => (
            <button
              key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 min-h-[48px] rounded-xl font-medium capitalize transition-all text-sm",
                activeTab === tab
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              {tab === 'production' && '📦 '}
              {tab === 'sales' && '💰 '}
              {tab === 'others' && '📋 '}
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
            {selectedProducts.map((product) => (
              <ProductionInput
                key={product.id}
                product={product}
                kgFlour={production[product.id]?.kgFlour || 0}
                onKgFlourChange={(kg) => handleKgFlourChange(product.id, kg)}
                onClear={() => handleKgFlourChange(product.id, 0)}
                disabled={saveStatus === 'saving'}
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
            {selectedProducts.map((product) => (
              <SalesInput
                key={product.id}
                product={product}
                productionValue={production[product.id]?.productionValueUGX || 0}
                salesAmount={sales[product.id] || 0}
                onSalesChange={(amount) => handleSalesChange(product.id, amount)}
                onClear={() => handleSalesChange(product.id, 0)}
                disabled={saveStatus === 'saving'}
              />
            ))}
          </div>
        )}

        {/* Others Tab */}
        {activeTab === 'others' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-slate-400 text-sm">
                Enter replacements, bonuses, and debts
              </p>
            </div>

            {/* Replacements */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔄</span>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Replacements</h3>
                  <p className="text-xs text-slate-400">
                    Value of replaced/exchanged products
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={others.replacements}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setOthers(prev => ({ ...prev, replacements: isNaN(val) ? 0 : val }));
                  }}
                  disabled={saveStatus === 'saving'}
                  placeholder="0"
                  className="w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none font-currency [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000, 50000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setOthers(prev => ({ ...prev, replacements: prev.replacements + val }))}
                    disabled={saveStatus === 'saving'}
                    className="flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  >
                    +{(val / 1000)}k
                  </button>
                ))}
              </div>
            </Card>

            {/* Bonuses */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎁</span>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Bonuses</h3>
                  <p className="text-xs text-slate-400">
                    Staff bonuses and incentives paid
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={others.bonuses}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setOthers(prev => ({ ...prev, bonuses: isNaN(val) ? 0 : val }));
                  }}
                  disabled={saveStatus === 'saving'}
                  placeholder="0"
                  className="w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none font-currency [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000, 50000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setOthers(prev => ({ ...prev, bonuses: prev.bonuses + val }))}
                    disabled={saveStatus === 'saving'}
                    className="flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  >
                    +{(val / 1000)}k
                  </button>
                ))}
              </div>
            </Card>

            {/* Debts */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📝</span>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Debts</h3>
                  <p className="text-xs text-slate-400">
                    Outstanding customer debts
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={others.debts}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setOthers(prev => ({ ...prev, debts: isNaN(val) ? 0 : val }));
                  }}
                  disabled={saveStatus === 'saving'}
                  placeholder="0"
                  className="w-full h-14 text-2xl font-bold text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none font-currency [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000, 50000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setOthers(prev => ({ ...prev, debts: prev.debts + val }))}
                    disabled={saveStatus === 'saving'}
                    className="flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  >
                    +{(val / 1000)}k
                  </button>
                ))}
              </div>
            </Card>

            {/* Others Summary */}
            {(others.replacements > 0 || others.bonuses > 0 || others.debts > 0) && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
                <h3 className="font-bold text-white mb-3">Others Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🔄 Replacements</span>
                    <span className="text-amber-400 font-currency">{formatUGX(others.replacements)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🎁 Bonuses</span>
                    <span className="text-green-400 font-currency">{formatUGX(others.bonuses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">📝 Debts</span>
                    <span className="text-red-400 font-currency">{formatUGX(others.debts)}</span>
                  </div>
                </div>
              </Card>
            )}
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
                {selectedProducts.map((product) => {
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
              <div className="text-sm">
                <div className="grid grid-cols-4 gap-2 text-slate-400 pb-2 border-b border-slate-700">
                  <div>Product</div>
                  <div>Rev/kg</div>
                  <div>Cost/kg</div>
                  <div>Margin</div>
                </div>
                {selectedProducts.map((product) => (
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

      {/* Bottom Save Bar - positioned above bottom nav (88px) */}
      <div data-testid="bottom-save-bar" className="fixed bottom-[88px] left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-700 z-40">
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
            data-testid="save-entry-btn"
            onClick={handleSave}
            disabled={saveStatus === 'saving' || !hasData}
            size="lg"
            className={cn(
              "px-8 transition-all duration-300",
              saveStatus === 'saved'
                ? "bg-emerald-500 hover:bg-emerald-500 scale-105"
                : !hasData
                ? "bg-slate-600 hover:bg-slate-600 opacity-50"
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 animate-bounce" />
                Saved!
              </>
            ) : !hasData ? (
              <>
                <Save className="h-5 w-5 mr-2" />
                Enter Data First
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={(open) => {
        setShowExitDialog(open);
        if (!open) setPendingAction(null);
      }}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You have unsaved changes. Are you sure you want to leave? Your data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executePendingAction}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
