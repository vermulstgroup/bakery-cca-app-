
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// This is a public configuration and is safe to expose.
// Security is enforced by Firebase Security Rules.
const firebaseConfig = {
  apiKey: "p_JGF8954uA6Ak85fF_Hdfd54dfHJH8G",
  authDomain: "studio-feb-21-a-1191.firebaseapp.com",
  projectId: "studio-feb-21-a-1191",
  storageBucket: "studio-feb-21-a-1191.appspot.com",
  messagingSenderId: "594747738221",
  appId: "1:594747738221:web:7f6d2f3b9e4a3d8b1c4e7f"
};


// Initialize Firebase only once
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initFirebase() {
  if (getApps().length === 0) {
    // Check if all config keys are present
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID" || !firebaseConfig.apiKey) {
      console.error("Firebase config is missing. Please replace placeholder values in src/lib/firebase/config.ts.");
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
