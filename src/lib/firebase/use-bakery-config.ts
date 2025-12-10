'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, doc, setDoc, getDocs, addDoc } from 'firebase/firestore';

export type BakeryConfig = {
    products?: string[];
    prices?: { [productId: string]: number };
};

export const useBakeryConfig = (bakeryId: string | undefined) => {
    const db = useFirestore();
    const { user } = useUser();
    const [config, setConfig] = useState<BakeryConfig>({});
    const [loading, setLoading] = useState(true);
    const [docId, setDocId] = useState<string | null>(null);

    useEffect(() => {
        if (!db || !bakeryId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const configRef = collection(db, 'bakeries', bakeryId, 'config');
        const q = query(configRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setConfig({});
                setDocId(null);
            } else {
                const doc = snapshot.docs[0];
                setDocId(doc.id);
                setConfig(doc.data() as BakeryConfig);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bakery config:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, bakeryId]);

    const updateConfig = useCallback(async (newConfig: Partial<BakeryConfig>) => {
        if (!db || !bakeryId || !user) {
            console.error("Cannot update config: missing db, bakeryId, or user.");
            return;
        }

        const fullNewConfig = { ...config, ...newConfig };
        
        try {
            let idToUpdate = docId;
            if (!idToUpdate) {
                // If it's the first time, we might need to fetch the doc id again or create a doc
                const configRef = collection(db, 'bakeries', bakeryId, 'config');
                const snapshot = await getDocs(query(configRef));
                if (snapshot.empty) {
                    // Create new doc
                    const newDocRef = await addDoc(configRef, { ...fullNewConfig, bakeryId });
                    setDocId(newDocRef.id);
                    idToUpdate = newDocRef.id;

                } else {
                     idToUpdate = snapshot.docs[0].id;
                     setDocId(idToUpdate);
                }
            }
            
            if (idToUpdate) {
                const docRef = doc(db, 'bakeries', bakeryId, 'config', idToUpdate);
                await setDoc(docRef, fullNewConfig, { merge: true });
            }

            setConfig(fullNewConfig);

        } catch (error) {
            console.error("Error saving bakery config:", error);
        }

    }, [db, bakeryId, user, config, docId]);

    return { config, loading, updateConfig };
};
