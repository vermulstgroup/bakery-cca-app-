
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { DailyEntryData } from './daily-entries';

export type DailyEntry = {
    id: string;
    date: Date;
    quantities: DailyEntryData;
}

export const useDailyEntries = (bakeryId: string | undefined, startDate: Date, endDate: Date) => {
    const db = useFirestore();
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !bakeryId) {
            if (!bakeryId) setLoading(false);
            return;
        };

        setLoading(true);

        const dailyEntriesRef = collection(db, 'bakeries', bakeryId, 'daily_entries');
        
        const q = query(
            dailyEntriesRef,
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEntries: DailyEntry[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fetchedEntries.push({
                    id: doc.id,
                    date: (data.date as Timestamp).toDate(),
                    quantities: data.quantities,
                });
            });
            setEntries(fetchedEntries);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching daily entries:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [db, bakeryId, startDate, endDate]);

    return { entries, loading };
};
