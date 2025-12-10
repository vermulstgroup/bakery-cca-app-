'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // No-op. This hook no longer performs authentication.
  // It returns a null user to satisfy components that use it,
  // but prevents any actual Firebase Auth calls.
  // This resolves the auth/configuration-not-found error.

  return { user, loading };
}
