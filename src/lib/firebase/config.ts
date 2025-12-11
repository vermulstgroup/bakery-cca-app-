import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration for Firebase Studio environment
// The app is automatically configured in Firebase Studio
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-7015425522-94d4d',
  // In Firebase Studio, additional config is automatically provided
};

// Initialize Firebase only once
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Sign in anonymously and log user status
  onAuthStateChanged(auth, user => {
    if (user) {
      // User is signed in.
    } else {
      // User is signed out.
      signInAnonymously(auth).catch(error => {
        console.error("Anonymous sign-in failed:", error);
      });
    }
  });

  return { app, db, auth };
}

// Initialize on module load
const { db: firestore, auth: firebaseAuth } = initFirebase();

export { firestore, firebaseAuth };
export const getDb = () => firestore;
