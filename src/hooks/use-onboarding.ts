
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingData } from '@/lib/types';

// This hook now primarily relies on localStorage.
// This is not a secure long-term solution but is used for the initial prototype.
const ONBOARDING_STORAGE_KEY = 'onboardingData_local';

// Function to generate a simple random user ID
const generateUserId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        if (parsedData.userId) {
          setUserId(parsedData.userId);
        } else {
            // If no user ID, generate and save one
            const newUserId = generateUserId();
            setUserId(newUserId);
            updateData({ ...parsedData, userId: newUserId });
        }
      } else {
        // No data, this is a new user
        const newUserId = generateUserId();
        setUserId(newUserId);
        updateData({ userId: newUserId });
      }
    } catch (error) {
      console.error("Failed to parse onboarding data from localStorage", error);
       const newUserId = generateUserId();
       setUserId(newUserId);
       updateData({ userId: newUserId });
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

  return { data, updateData, isLoaded, completeOnboarding, userId };
}
