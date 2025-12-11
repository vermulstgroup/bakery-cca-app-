import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from './config';
import type { DailyEntry, WeeklyExpense } from '../types';

// Collection paths - data is organized by bakery ID
const getBakeryCollection = (bakeryId: string) => `bakeries/${bakeryId}`;
const getDailyEntriesCollection = (bakeryId: string) => `${getBakeryCollection(bakeryId)}/daily_entries`;
const getWeeklyExpensesCollection = (bakeryId: string) => `${getBakeryCollection(bakeryId)}/weekly_expenses`;

// ============ Daily Entries ============

export async function saveDailyEntry(bakeryId: string, entry: DailyEntry): Promise<void> {
  const docRef = doc(firestore, getDailyEntriesCollection(bakeryId), entry.date);
  await setDoc(docRef, {
    ...entry,
    bakeryId,
    updatedAt: Timestamp.now(),
  });
}

export async function getDailyEntry(bakeryId: string, date: string): Promise<DailyEntry | null> {
  const docRef = doc(firestore, getDailyEntriesCollection(bakeryId), date);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      date: data.date,
      quantities: data.quantities,
      bakeryId: data.bakeryId,
    } as DailyEntry;
  }
  return null;
}

export async function getDailyEntriesForDateRange(
  bakeryId: string,
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  const entriesRef = collection(firestore, getDailyEntriesCollection(bakeryId));
  const q = query(
    entriesRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: data.date,
      quantities: data.quantities,
      bakeryId: data.bakeryId,
    } as DailyEntry;
  });
}

export async function getAllDailyEntries(bakeryId: string): Promise<DailyEntry[]> {
  const entriesRef = collection(firestore, getDailyEntriesCollection(bakeryId));
  const q = query(entriesRef, orderBy('date', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: data.date,
      quantities: data.quantities,
      bakeryId: data.bakeryId,
    } as DailyEntry;
  });
}

// ============ Weekly Expenses ============

export async function saveWeeklyExpenses(bakeryId: string, expense: WeeklyExpense): Promise<void> {
  const docRef = doc(firestore, getWeeklyExpensesCollection(bakeryId), expense.weekStartDate);
  await setDoc(docRef, {
    ...expense,
    bakeryId,
    updatedAt: Timestamp.now(),
  });
}

export async function getWeeklyExpenses(bakeryId: string, weekStartDate: string): Promise<WeeklyExpense | null> {
  const docRef = doc(firestore, getWeeklyExpensesCollection(bakeryId), weekStartDate);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      weekStartDate: data.weekStartDate,
      expenses: data.expenses,
    } as WeeklyExpense;
  }
  return null;
}

export async function getAllWeeklyExpenses(bakeryId: string): Promise<WeeklyExpense[]> {
  const expensesRef = collection(firestore, getWeeklyExpensesCollection(bakeryId));
  const q = query(expensesRef, orderBy('weekStartDate', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      weekStartDate: data.weekStartDate,
      expenses: data.expenses,
    } as WeeklyExpense;
  });
}

export async function getWeeklyExpensesForDateRange(
  bakeryId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyExpense[]> {
  const expensesRef = collection(firestore, getWeeklyExpensesCollection(bakeryId));
  const q = query(
    expensesRef,
    where('weekStartDate', '>=', startDate),
    where('weekStartDate', '<=', endDate),
    orderBy('weekStartDate', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      weekStartDate: data.weekStartDate,
      expenses: data.expenses,
    } as WeeklyExpense;
  });
}

// ============ Batch Operations ============

export async function saveDailyEntriesBatch(bakeryId: string, entries: DailyEntry[]): Promise<void> {
  const batch = writeBatch(firestore);
  
  for (const entry of entries) {
    const docRef = doc(firestore, getDailyEntriesCollection(bakeryId), entry.date);
    batch.set(docRef, {
      ...entry,
      bakeryId,
      updatedAt: Timestamp.now(),
    });
  }
  
  await batch.commit();
}

export async function saveWeeklyExpensesBatch(bakeryId: string, expenses: WeeklyExpense[]): Promise<void> {
  const batch = writeBatch(firestore);
  
  for (const expense of expenses) {
    const docRef = doc(firestore, getWeeklyExpensesCollection(bakeryId), expense.weekStartDate);
    batch.set(docRef, {
      ...expense,
      bakeryId,
      updatedAt: Timestamp.now(),
    });
  }
  
  await batch.commit();
}
