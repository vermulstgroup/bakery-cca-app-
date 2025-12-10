
import { FirebaseOptions, initializeApp } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-7015425522-94d4d",
  "appId": "1:545972834050:web:d6eff076c43514a559fc1b",
  "apiKey": "AIzaSyAuCqRysKSTmzD7HBlQugDsjToF8c7vWPc",
  "authDomain": "studio-7015425522-94d4d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "545972834050"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
