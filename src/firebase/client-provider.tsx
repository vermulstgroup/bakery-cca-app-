'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import React, { type PropsWithChildren } from 'react';

// Initialize Firebase ONCE at the module level.
// This is the key change to prevent race conditions.
const { firebaseApp, firestore } = initializeFirebase();

export const FirebaseClientProvider = (props: PropsWithChildren) => {
  // The context is now stable and available on first render.
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
    >
      {props.children}
    </FirebaseProvider>
  );
};
