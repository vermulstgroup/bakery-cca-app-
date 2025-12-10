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
        // Prioritize permanent user settings, fall back to onboarding data
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
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    if (typeof window !== 'undefined') {
      // Save to the permanent key if onboarding is complete, otherwise use the temp key
      const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      const key = isOnboardingComplete ? USER_SETTINGS_KEY : ONBOARDING_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(updatedData));
    }
  }, [data]);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
        // Persist the final data to the permanent location
        localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(data));
        // Mark onboarding as complete
        localStorage.setItem('onboardingComplete', 'true');
        // Clean up temporary onboarding data
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, [data]);

  return { data, updateData, isLoaded, completeOnboarding };
}
