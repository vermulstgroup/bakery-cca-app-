'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import React,
{
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { initializeFirebase } from '.';

export interface FirebaseContext {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export const _FirebaseContext = createContext<FirebaseContext | undefined>(
  undefined
);

export const FirebaseProvider = (
  props: PropsWithChildren<FirebaseContext>
) => {
  const { firebaseApp, auth, firestore, children } = props;

  return (
    <_FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
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

export const useAuth = () => {
  const context = useFirebase();
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};

export const PrefirebaseProvider = (props: PropsWithChildren) => {
  const [firebaseContext, setFirebaseContext] = useState<
    FirebaseContext | undefined
  >(undefined);

  useEffect(() => {
    setFirebaseContext(initializeFirebase());
  }, []);

  if (!firebaseContext) {
    return null;
  }

  return <FirebaseProvider {...firebaseContext} {...props} />;
};