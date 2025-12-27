"use client";

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  term: string;
  explanation: string;
  className?: string;
}

export function HelpTooltip({ term, explanation, className }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex items-center gap-1", className)}>
      <span>{term}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
        aria-label={`Help for ${term}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-200">
          <div className="font-bold text-amber-400 mb-1">{term}</div>
          <p className="text-slate-300 leading-relaxed">{explanation}</p>
        </div>
      )}
    </span>
  );
}

// Common financial term definitions
export const HELP_DEFINITIONS = {
  margin: "Profit Margin is the percentage of sales that becomes profit. Higher margin = more efficient bakery.",
  grossProfit: "Gross Profit is Sales minus Ingredient Costs. This is your profit before overhead expenses.",
  productionValue: "The total value of goods produced, calculated from flour used and standard pricing.",
  ingredientCost: "The cost of flour, yeast, and other ingredients used in production.",
  revenuePerKg: "How much money you earn per kilogram of flour used for this product.",
  costPerKg: "How much it costs in ingredients per kilogram of flour used.",
  replacements: "Products given for free to replace defective or unsatisfactory items.",
  bonuses: "Products given as gifts or bonuses to staff or customers.",
  debts: "Money owed by customers who took products on credit.",
} as const;
