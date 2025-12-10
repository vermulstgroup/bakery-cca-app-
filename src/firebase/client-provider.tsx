'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import {
  FirebaseProvider,
  _FirebaseContext,
  useFirebase,
} from './provider';
import { initializeFirebase } from '.';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const FirebaseClientProvider = (
  props: PropsWithChildren<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  }>
) => {
  const { firebaseApp, auth, firestore } = props;

  const parentContext = useFirebase();

  // if we're already in a parent context, just pass children
  if (parentContext) {
    return props.children;
  }
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
