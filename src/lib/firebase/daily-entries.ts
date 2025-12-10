'use client';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import type { OnboardingData } from '@/lib/types';

export type DailyEntryData = {
  production: { [productId: string]: number };
  sales: { [productId: string]: number };
  damages: { [productId: string]: number };
};

export const saveDailyEntry = async (
  db: Firestore,
  userId: string,
  bakeryId: string,
  date: Date,
  quantities: DailyEntryData
) => {
  if (!userId || !bakeryId) {
    throw new Error('User or Bakery not selected');
  }

  const dailyEntryRef = collection(db, 'bakeries', bakeryId, 'daily_entries');

  await addDoc(dailyEntryRef, {
    bakeryId,
    userId,
    date,
    quantities,
    createdAt: serverTimestamp(),
  });
};
