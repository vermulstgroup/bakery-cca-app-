'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  saveWeeklyExpenses,
  getWeeklyExpenses,
  saveDailyEntry,
  getDailyEntry,
  getAllDailyEntries,
  getAllWeeklyExpenses,
} from '@/lib/firebase/firestore';
import type { DailyEntry, WeeklyExpense } from '@/lib/types';

export function useWeeklyExpenses(bakeryId: string, weekStartDate: string) {
  const [expenses, setExpenses] = useState<{ [categoryId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bakeryId || !weekStartDate) {
      setLoading(false);
      return;
    }
    const loadExpenses = async () => {
      setLoading(true);
      try {
        const data = await getWeeklyExpenses(bakeryId, weekStartDate);
        if (data) setExpenses(data.expenses);
        else {
          const storageKey = `expenses-${bakeryId}-${weekStartDate}`;
          const savedData = localStorage.getItem(storageKey);
          if (savedData) setExpenses(JSON.parse(savedData).expenses || {});
        }
      } catch (err) {
        console.error('Error loading expenses:', err);
        const storageKey = `expenses-${bakeryId}-${weekStartDate}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) setExpenses(JSON.parse(savedData).expenses || {});
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, [bakeryId, weekStartDate]);

  const saveExpensesData = useCallback(async (newExpenses: { [categoryId: string]: number }) => {
    setSaving(true);
    try {
      await saveWeeklyExpenses(bakeryId, { weekStartDate, expenses: newExpenses });
      setExpenses(newExpenses);
      const storageKey = `expenses-${bakeryId}-${weekStartDate}`;
      localStorage.setItem(storageKey, JSON.stringify({ weekStartDate, expenses: newExpenses }));
      return true;
    } catch (err) {
      console.error('Error saving expenses:', err);
      const storageKey = `expenses-${bakeryId}-${weekStartDate}`;
      localStorage.setItem(storageKey, JSON.stringify({ weekStartDate, expenses: newExpenses }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [bakeryId, weekStartDate]);

  return { expenses, setExpenses, loading, saving, error, saveExpenses: saveExpensesData };
}

export function useDailyEntry(bakeryId: string, date: string) {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!bakeryId || !date) {
      setLoading(false);
      return;
    }
    const loadEntry = async () => {
      setLoading(true);
      try {
        const data = await getDailyEntry(bakeryId, date);
        if (data) setEntry(data);
        else {
          const storageKey = `daily-entry-${bakeryId}-${date}`;
          const savedData = localStorage.getItem(storageKey);
          if (savedData) setEntry(JSON.parse(savedData));
        }
      } catch (err) {
        console.error('Error loading daily entry:', err);
        const storageKey = `daily-entry-${bakeryId}-${date}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) setEntry(JSON.parse(savedData));
      } finally {
        setLoading(false);
      }
    };
    loadEntry();
  }, [bakeryId, date]);

  const saveEntryData = useCallback(async (newEntry: DailyEntry) => {
    setSaving(true);
    try {
      await saveDailyEntry(bakeryId, newEntry);
      setEntry(newEntry);
      const storageKey = `daily-entry-${bakeryId}-${newEntry.date}`;
      localStorage.setItem(storageKey, JSON.stringify(newEntry));
      return true;
    } catch (err) {
      console.error('Error saving daily entry:', err);
      const storageKey = `daily-entry-${bakeryId}-${newEntry.date}`;
      localStorage.setItem(storageKey, JSON.stringify(newEntry));
      return false;
    } finally {
      setSaving(false);
    }
  }, [bakeryId]);

  return { entry, setEntry, loading, saving, saveEntry: saveEntryData };
}

export function useHistoricalData(bakeryId: string) {
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [weeklyExpenses, setWeeklyExpenses] = useState<WeeklyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bakeryId) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        const [entries, expenses] = await Promise.all([
          getAllDailyEntries(bakeryId),
          getAllWeeklyExpenses(bakeryId),
        ]);
        setDailyEntries(entries);
        setWeeklyExpenses(expenses);
      } catch (err) {
        console.error('Error loading historical data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bakeryId]);

  return { dailyEntries, weeklyExpenses, loading };
}
