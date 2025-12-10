'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import React, { type PropsWithChildren } from 'react';

// Initialize Firebase ONCE at the module level.
// This is the key change to prevent race conditions.
const { firebaseApp, auth, firestore } = initializeFirebase();

export const FirebaseClientProvider = (props: PropsWithChildren) => {
  // The context is now stable and available on first render.
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {props.children}
    </FirebaseProvider>
  );
};
