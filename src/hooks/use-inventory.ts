"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import type { DailyEntry } from '@/lib/types';

export type FlourInventory = {
  currentStock: number; // kg
  lastUpdated: string;
  lowStockThreshold: number; // kg
};

const DEFAULT_INVENTORY: FlourInventory = {
  currentStock: 0,
  lastUpdated: new Date().toISOString(),
  lowStockThreshold: 50, // Alert when below 50kg
};

export function useInventory(bakeryId: string | undefined) {
  const [inventory, setInventory] = useState<FlourInventory>(DEFAULT_INVENTORY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load inventory from localStorage
  useEffect(() => {
    if (!bakeryId) return;

    const key = `bakery-inventory-${bakeryId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setInventory({ ...DEFAULT_INVENTORY, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults on error
    }
    setIsLoaded(true);
  }, [bakeryId]);

  // Save inventory to localStorage
  const updateInventory = useCallback((newInventory: Partial<FlourInventory>) => {
    if (!bakeryId) return;

    const updated = {
      ...inventory,
      ...newInventory,
      lastUpdated: new Date().toISOString(),
    };
    setInventory(updated);

    const key = `bakery-inventory-${bakeryId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }, [bakeryId, inventory]);

  // Calculate this week's flour usage from entries
  const weeklyUsage = useMemo(() => {
    if (!bakeryId) return 0;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    let totalFlourUsed = 0;
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const key = `biss-entry-${bakeryId}-${dateStr}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: DailyEntry = JSON.parse(stored);
          if (entry.production) {
            Object.values(entry.production).forEach(prod => {
              totalFlourUsed += prod.kgFlour || 0;
            });
          }
        }
      } catch {
        // Skip invalid entries
      }
    });

    return totalFlourUsed;
  }, [bakeryId]);

  // Add flour stock
  const addStock = useCallback((kgToAdd: number) => {
    updateInventory({
      currentStock: inventory.currentStock + kgToAdd,
    });
  }, [inventory.currentStock, updateInventory]);

  // Calculate estimated remaining
  const estimatedRemaining = useMemo(() => {
    // Current stock minus usage since last update
    // For simplicity, we show current stock as set, and weekly usage is calculated separately
    return inventory.currentStock;
  }, [inventory.currentStock]);

  // Check if stock is low
  const isLowStock = useMemo(() => {
    return inventory.currentStock <= inventory.lowStockThreshold;
  }, [inventory.currentStock, inventory.lowStockThreshold]);

  return {
    inventory,
    updateInventory,
    addStock,
    weeklyUsage,
    estimatedRemaining,
    isLowStock,
    isLoaded,
  };
}
