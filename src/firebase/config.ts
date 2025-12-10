// It appears you have requested a function that requires a Firebase project but
// you have not created one yet. Please create a Firebase project and return to this
// step.
//
// https://firebase.google.com/docs/web/setup
import { FirebaseOptions, initializeApp } from 'firebase/app';

const firebaseConfig: FirebaseOptions = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}'
);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
