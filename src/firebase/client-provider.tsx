'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import {
  FirebaseProvider,
  useFirebase,
} from './provider';
import { initializeFirebase } from '.';
import React, { PropsWithChildren, useEffect, useState } from 'react';

export const FirebaseClientProvider = (props: PropsWithChildren) => {
  const parentContext = useFirebase();
  const [context, setContext] = useState<
    | {
        firebaseApp: FirebaseApp;
        auth: Auth;
        firestore: Firestore;
      }
    | undefined
  >();

  useEffect(() => {
    if (!context) {
      setContext(initializeFirebase());
    }
  }, [context]);

  // if we're already in a parent context, just pass children
  if (parentContext) {
    return props.children;
  }

  if (!context) {
    // We can return a loader here
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={context.firebaseApp}
      auth={context.auth}
      firestore={context.firestore}
    >
      {props.children}
    </FirebaseProvider>
  );
};