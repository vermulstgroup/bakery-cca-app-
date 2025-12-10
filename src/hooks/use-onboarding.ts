"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData } from '@/lib/types';

const ONBOARDING_STORAGE_KEY = 'onboardingData';
const USER_SETTINGS_KEY = 'userSettings';

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSettings = localStorage.getItem(USER_SETTINGS_KEY);
        if (storedSettings) {
          setData(JSON.parse(storedSettings));
        } else {
          const storedOnboardingData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
          if (storedOnboardingData) {
            setData(JSON.parse(storedOnboardingData));
          }
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

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
        // This function now correctly persists the data without deleting it.
        // It moves the final onboarding data to the permanent user settings location.
        const currentData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (currentData) {
          localStorage.setItem(USER_SETTINGS_KEY, currentData);
        }
        localStorage.setItem('onboardingComplete', 'true');
        // Clean up the temporary key now that data is persisted.
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  return { data, updateData, isLoaded, completeOnboarding };
}
