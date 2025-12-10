
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData } from '@/lib/types';

const ONBOARDING_STORAGE_KEY = 'onboardingData';
const USER_SETTINGS_KEY = 'userSettings';

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        const storageKey = onboardingComplete ? USER_SETTINGS_KEY : ONBOARDING_STORAGE_KEY;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => {
      const updatedData = { ...prevData, ...newData };
      if (typeof window !== 'undefined') {
        const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        const key = isOnboardingComplete ? USER_SETTINGS_KEY : ONBOARDING_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(updatedData));
      }
      return updatedData;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentDataString = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (currentDataString) {
          const currentData = JSON.parse(currentDataString);
          localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(currentData));
          localStorage.setItem('onboardingComplete', 'true');
          setData(currentData);
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    }
  }, []);

  return { data, updateData, isLoaded, completeOnboarding, loadData };
}
