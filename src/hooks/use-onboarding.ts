"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData } from '@/lib/types';

const ONBOARDING_STORAGE_KEY = 'onboardingData';

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to parse onboarding data from localStorage", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
    }
  }, [data]);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  return { data, updateData, isLoaded, completeOnboarding };
}
