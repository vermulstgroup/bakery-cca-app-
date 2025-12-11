
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData } from '@/lib/types';

// This hook now primarily relies on localStorage.
// This is not a secure long-term solution but is used for the initial prototype.
const ONBOARDING_STORAGE_KEY = 'onboardingData_local';

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to parse onboarding data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => {
      const updatedData = { ...prevData, ...newData };
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      } catch (error) {
        console.error("Failed to save onboarding data to localStorage", error);
      }
      return updatedData;
    });
  }, []);
  
  const completeOnboarding = useCallback(() => {
    try {
        localStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
        console.error("Failed to set onboarding complete flag in localStorage", error);
    }
  }, []);

  return { data, updateData, isLoaded, completeOnboarding };
}
