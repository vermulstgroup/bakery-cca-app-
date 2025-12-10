'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import React,
{
  PropsWithChildren,
  createContext,
  useContext,
} from 'react';

export interface FirebaseContext {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
}

export const _FirebaseContext = createContext<FirebaseContext | undefined>(
  undefined
);

export const FirebaseProvider = (
  props: PropsWithChildren<FirebaseContext>
) => {
  const { firebaseApp, firestore, children } = props;

  return (
    <_FirebaseContext.Provider value={{ firebaseApp, firestore }}>
      {children}
    </_FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(_FirebaseContext);
};

export const useFirebaseApp = () => {
  const context = useFirebase();
  if (!context) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
};

export const useFirestore = () => {
  const context = useFirebase();
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};

// useAuth has been removed as Firebase Authentication is no longer used.
