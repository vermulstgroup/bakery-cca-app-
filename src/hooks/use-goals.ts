"use client";

import { useState, useEffect, useCallback } from 'react';

export type BakeryGoals = {
  weeklyProfitTarget: number;
  weeklyMarginTarget: number;
  enabled: boolean;
};

const DEFAULT_GOALS: BakeryGoals = {
  weeklyProfitTarget: 500000, // 500k UGX default
  weeklyMarginTarget: 30, // 30% default
  enabled: false,
};

export function useGoals(bakeryId: string | undefined) {
  const [goals, setGoals] = useState<BakeryGoals>(DEFAULT_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load goals from localStorage
  useEffect(() => {
    if (!bakeryId) return;

    const key = `bakery-goals-${bakeryId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setGoals({ ...DEFAULT_GOALS, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults on error
    }
    setIsLoaded(true);
  }, [bakeryId]);

  // Save goals to localStorage
  const updateGoals = useCallback((newGoals: Partial<BakeryGoals>) => {
    if (!bakeryId) return;

    const updated = { ...goals, ...newGoals };
    setGoals(updated);

    const key = `bakery-goals-${bakeryId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }, [bakeryId, goals]);

  // Calculate progress towards goals
  const getProgress = useCallback((currentProfit: number, currentMargin: number) => {
    if (!goals.enabled) return null;

    const profitProgress = goals.weeklyProfitTarget > 0
      ? Math.min((currentProfit / goals.weeklyProfitTarget) * 100, 150)
      : 0;
    const marginProgress = goals.weeklyMarginTarget > 0
      ? Math.min((currentMargin / goals.weeklyMarginTarget) * 100, 150)
      : 0;

    const profitMet = currentProfit >= goals.weeklyProfitTarget;
    const marginMet = currentMargin >= goals.weeklyMarginTarget;

    return {
      profitProgress,
      marginProgress,
      profitMet,
      marginMet,
      allMet: profitMet && marginMet,
    };
  }, [goals]);

  return {
    goals,
    updateGoals,
    getProgress,
    isLoaded,
  };
}
