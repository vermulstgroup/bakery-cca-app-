'use client';

import type { User } from 'firebase/auth';

// This hook is now a no-op after removing Firebase Authentication.
// It returns a null user and a non-loading state to ensure that
// components that use it do not break, while completely preventing
// any Firebase Auth calls.
export function useUser() {
  const user: User | null = null;
  const loading = false;

  return { user, loading };
}
