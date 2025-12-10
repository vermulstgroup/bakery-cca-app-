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
  bakeryId: string,
  date: Date,
  quantities: DailyEntryData
) => {
  if (!bakeryId) {
    throw new Error('Bakery not selected');
  }

  const dailyEntryRef = collection(db, 'bakeries', bakeryId, 'daily_entries');

  await addDoc(dailyEntryRef, {
    bakeryId,
    date,
    quantities,
    createdAt: serverTimestamp(),
  });
};
