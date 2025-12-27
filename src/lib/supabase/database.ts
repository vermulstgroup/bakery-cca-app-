import { supabase, isSupabaseConfigured } from './client';
import type { DailyEntry, WeeklyExpense } from '../types';

// ============ Daily Entries ============

export async function saveDailyEntry(bakeryId: string, entry: DailyEntry): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('daily_entries')
    .upsert({
      bakery_id: bakeryId,
      date: entry.date,
      production: entry.production,
      sales: entry.sales,
      others: entry.others,
      totals: entry.totals,
      closing_stock: entry.closingStock || {},
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'bakery_id,date'
    });

  if (error) throw error;
}

export async function getDailyEntry(bakeryId: string, date: string): Promise<DailyEntry | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('bakery_id', bakeryId)
    .eq('date', date)
    .single();

  if (error || !data) return null;

  return {
    date: data.date,
    bakeryId: data.bakery_id,
    production: data.production,
    sales: data.sales,
    others: data.others,
    totals: data.totals,
    closingStock: data.closing_stock,
  } as DailyEntry;
}

export async function getDailyEntriesForDateRange(
  bakeryId: string,
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('bakery_id', bakeryId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    date: row.date,
    bakeryId: row.bakery_id,
    production: row.production,
    sales: row.sales,
    others: row.others,
    totals: row.totals,
    closingStock: row.closing_stock,
  } as DailyEntry));
}

export async function getAllDailyEntries(bakeryId: string): Promise<DailyEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('bakery_id', bakeryId)
    .order('date', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    date: row.date,
    bakeryId: row.bakery_id,
    production: row.production,
    sales: row.sales,
    others: row.others,
    totals: row.totals,
    closingStock: row.closing_stock,
  } as DailyEntry));
}

// ============ Weekly Expenses ============

export async function saveWeeklyExpenses(bakeryId: string, expense: WeeklyExpense): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('weekly_expenses')
    .upsert({
      bakery_id: bakeryId,
      week_start_date: expense.weekStartDate,
      expenses: expense.expenses,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'bakery_id,week_start_date'
    });

  if (error) throw error;
}

export async function getWeeklyExpenses(bakeryId: string, weekStartDate: string): Promise<WeeklyExpense | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('weekly_expenses')
    .select('*')
    .eq('bakery_id', bakeryId)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error || !data) return null;

  return {
    weekStartDate: data.week_start_date,
    expenses: data.expenses,
  } as WeeklyExpense;
}

export async function getAllWeeklyExpenses(bakeryId: string): Promise<WeeklyExpense[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('weekly_expenses')
    .select('*')
    .eq('bakery_id', bakeryId)
    .order('week_start_date', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    weekStartDate: row.week_start_date,
    expenses: row.expenses,
  } as WeeklyExpense));
}

export async function getWeeklyExpensesForDateRange(
  bakeryId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyExpense[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('weekly_expenses')
    .select('*')
    .eq('bakery_id', bakeryId)
    .gte('week_start_date', startDate)
    .lte('week_start_date', endDate)
    .order('week_start_date', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    weekStartDate: row.week_start_date,
    expenses: row.expenses,
  } as WeeklyExpense));
}

// ============ Batch Operations ============

export async function saveDailyEntriesBatch(bakeryId: string, entries: DailyEntry[]): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const records = entries.map(entry => ({
    bakery_id: bakeryId,
    date: entry.date,
    production: entry.production,
    sales: entry.sales,
    others: entry.others,
    totals: entry.totals,
    closing_stock: entry.closingStock || {},
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('daily_entries')
    .upsert(records, { onConflict: 'bakery_id,date' });

  if (error) throw error;
}

export async function saveWeeklyExpensesBatch(bakeryId: string, expenses: WeeklyExpense[]): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const records = expenses.map(expense => ({
    bakery_id: bakeryId,
    week_start_date: expense.weekStartDate,
    expenses: expense.expenses,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('weekly_expenses')
    .upsert(records, { onConflict: 'bakery_id,week_start_date' });

  if (error) throw error;
}
