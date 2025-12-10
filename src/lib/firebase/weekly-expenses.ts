
'use client';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { format } from 'date-fns';

export type WeeklyExpenseData = {
  [categoryId: string]: number;
};

// Use YYYY-MM-DD format for a consistent, queryable week identifier
const getWeekId = (date: Date) => format(date, 'yyyy-MM-dd');

export const saveWeeklyExpense = async (
  db: Firestore,
  userId: string,
  bakeryId: string,
  weekStartDate: Date,
  expenses: WeeklyExpenseData
) => {
  if (!userId || !bakeryId) {
    throw new Error('User or Bakery not selected');
  }

  const weekId = getWeekId(weekStartDate);
  const weeklyExpensesRef = collection(db, 'bakeries', bakeryId, 'weekly_expenses');
  
  // Check if an entry for this week already exists
  const q = query(weeklyExpensesRef, where("weekStartDate", "==", weekId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // No existing entry, create a new one
    await addDoc(weeklyExpensesRef, {
      bakeryId,
      userId,
      weekStartDate: weekId,
      expenses,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Existing entry found, update it
    const docToUpdate = querySnapshot.docs[0];
    const docRef = doc(db, 'bakeries', bakeryId, 'weekly_expenses', docToUpdate.id);
    await updateDoc(docRef, {
        expenses,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
    });
  }
};
