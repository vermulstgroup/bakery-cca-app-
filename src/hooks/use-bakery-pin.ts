"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Simple hash function for PIN (not cryptographically secure, but adequate for local use)
const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export type BakeryPinConfig = {
  pinHash: string | null;
  enabled: boolean;
};

const DEFAULT_CONFIG: BakeryPinConfig = {
  pinHash: null,
  enabled: false,
};

export function useBakeryPin(bakeryId: string | undefined) {
  const [config, setConfig] = useState<BakeryPinConfig>(DEFAULT_CONFIG);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastBakeryId = useRef<string | undefined>(undefined);

  // Load config from localStorage
  useEffect(() => {
    // Reset loaded state when bakeryId changes
    if (bakeryId !== lastBakeryId.current) {
      setIsLoaded(false);
      setConfig(DEFAULT_CONFIG);
      lastBakeryId.current = bakeryId;
    }

    if (!bakeryId) return;

    const key = `bakery-pin-${bakeryId}`;
    const sessionKey = `bakery-session-${bakeryId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        setConfig(parsedConfig);

        // Check if already authenticated this session
        const sessionAuth = sessionStorage.getItem(sessionKey);
        if (sessionAuth === 'true' || !parsedConfig.enabled) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setConfig(DEFAULT_CONFIG);
        setIsAuthenticated(true); // No PIN set = authenticated
      }
    } catch {
      setConfig(DEFAULT_CONFIG);
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, [bakeryId]);

  // Set a new PIN
  const setPin = useCallback((pin: string) => {
    if (!bakeryId) return;

    const newConfig: BakeryPinConfig = {
      pinHash: hashPin(pin),
      enabled: true,
    };
    setConfig(newConfig);
    setIsAuthenticated(true);

    const key = `bakery-pin-${bakeryId}`;
    const sessionKey = `bakery-session-${bakeryId}`;
    try {
      localStorage.setItem(key, JSON.stringify(newConfig));
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Ignore storage errors
    }
  }, [bakeryId]);

  // Verify a PIN
  const verifyPin = useCallback((pin: string): boolean => {
    if (!config.enabled || !config.pinHash) {
      return true;
    }

    const inputHash = hashPin(pin);
    const isValid = inputHash === config.pinHash;

    if (isValid && bakeryId) {
      setIsAuthenticated(true);
      const sessionKey = `bakery-session-${bakeryId}`;
      try {
        sessionStorage.setItem(sessionKey, 'true');
      } catch {
        // Ignore
      }
    }

    return isValid;
  }, [bakeryId, config.enabled, config.pinHash]);

  // Remove PIN
  const removePin = useCallback(() => {
    if (!bakeryId) return;

    const newConfig: BakeryPinConfig = {
      pinHash: null,
      enabled: false,
    };
    setConfig(newConfig);
    setIsAuthenticated(true);

    const key = `bakery-pin-${bakeryId}`;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [bakeryId]);

  // Lock (require re-authentication)
  const lock = useCallback(() => {
    if (!bakeryId || !config.enabled) return;

    setIsAuthenticated(false);
    const sessionKey = `bakery-session-${bakeryId}`;
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      // Ignore
    }
  }, [bakeryId, config.enabled]);

  return {
    isPinEnabled: config.enabled,
    isAuthenticated,
    isLoaded,
    setPin,
    verifyPin,
    removePin,
    lock,
  };
}
