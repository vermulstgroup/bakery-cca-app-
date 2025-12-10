
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

export type WeeklyExpense = {
    id: string;
    weekStartDate: string;
    expenses: { [categoryId: string]: number };
}

const getWeekId = (date: Date) => format(date, 'yyyy-MM-dd');

export const useWeeklyExpenses = (bakeryId: string | undefined, weekStartDate: Date) => {
    const db = useFirestore();
    const [expenses, setExpenses] = useState<WeeklyExpense | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !bakeryId) {
            if (!bakeryId) setLoading(false);
            return;
        }

        setLoading(true);
        const weekId = getWeekId(weekStartDate);
        const weeklyExpensesRef = collection(db, 'bakeries', bakeryId, 'weekly_expenses');
        const q = query(weeklyExpensesRef, where("weekStartDate", "==", weekId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setExpenses(null);
            } else {
                const doc = snapshot.docs[0];
                setExpenses({ id: doc.id, ...doc.data() } as WeeklyExpense);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching weekly expenses:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [db, bakeryId, weekStartDate]);

    return { expenses, loading };
};
