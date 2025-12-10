'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This guard clause prevents auth operations until the auth object is ready.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // If no user, sign in anonymously
        signInAnonymously(auth)
          .then((userCredential) => {
             setUser(userCredential.user);
          })
          .catch((error) => {
            console.error("Anonymous sign-in failed:", error);
          })
          .finally(() => {
             setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
