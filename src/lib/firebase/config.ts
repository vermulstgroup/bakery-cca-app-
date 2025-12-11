
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// This is a public configuration and is safe to expose.
// Security is enforced by Firebase Security Rules.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase only once
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initFirebase() {
  if (getApps().length === 0) {
    // Check if all config keys are present
    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
      console.error("Firebase config is missing. Make sure .env.local is set up correctly.");
      // Return dummy objects or handle error appropriately
      // For now, we'll let it fail during initialization to make it obvious.
    }
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
