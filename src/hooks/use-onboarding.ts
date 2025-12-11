
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData, UserProfile } from '@/lib/types';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, firebaseAuth } from '@/lib/firebase/config';


const ONBOARDING_STORAGE_KEY = 'onboardingData_local';

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setData({
            userId: profile.userId,
            bakery: profile.bakeryId,
            role: profile.role,
            products: profile.products,
            prices: profile.prices,
          });
          localStorage.setItem('onboardingComplete', 'true');
        } else {
           const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
           if (storedData) {
             setData(JSON.parse(storedData));
           }
        }
      } else {
        setUserId(null);
        setData({});
        localStorage.removeItem('onboardingComplete');
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => {
      const updatedData = { ...prevData, ...newData };
      // Keep local storage for onboarding process before profile creation
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      return updatedData;
    });
  }, []);
  
  const completeOnboarding = useCallback(async () => {
    if (!userId || !data.bakery || !data.role || !data.products || !data.prices) {
        console.error("Cannot complete onboarding: Missing data or user ID.");
        return;
    }
    const userProfile: UserProfile = {
        userId: userId,
        bakeryId: data.bakery,
        role: data.role,
        products: data.products,
        prices: data.prices
    };

    try {
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, userProfile);
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch(error) {
        console.error("Failed to save user profile to Firestore:", error);
    }
  }, [data, userId]);
  
  return { data, updateData, isLoaded, completeOnboarding, userId };
}
