
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { OnboardingData } from '@/lib/types';
import { useBakeryConfig } from '@/lib/firebase/use-bakery-config';

const ONBOARDING_STORAGE_KEY = 'onboardingData_local';

export function useOnboarding() {
  const [localData, setLocalData] = useState<OnboardingData>({});
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Load local data for bakery/role selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (storedData) {
          setLocalData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to parse local onboarding data from localStorage", error);
      } finally {
        setIsLocalLoaded(true);
      }
    }
  }, []);

  const { config: firestoreConfig, loading: isFirestoreLoading, updateConfig: updateFirestoreConfig } = useBakeryConfig(localData.bakery);

  const updateLocalData = useCallback((newData: Partial<OnboardingData>) => {
    setLocalData(prevData => {
      const updatedData = { ...prevData, ...newData };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      }
      return updatedData;
    });
  }, []);
  
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
      // For bakery and role, we still use local storage as it's part of the initial device setup
      if (newData.bakery || newData.role) {
          updateLocalData({ bakery: newData.bakery, role: newData.role });
      }
      
      // For products and prices, we write to Firestore
      if (newData.products || newData.prices) {
        updateFirestoreConfig({ products: newData.products, prices: newData.prices });
      }
  }, [updateLocalData, updateFirestoreConfig]);


  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingComplete', 'true');
    }
  }, []);
  
  const data = useMemo(() => ({
    ...localData,
    ...firestoreConfig,
  }), [localData, firestoreConfig]);

  const isLoaded = isLocalLoaded && !isFirestoreLoading;

  return { data, updateData, isLoaded, completeOnboarding, loadData: () => {} };
}
