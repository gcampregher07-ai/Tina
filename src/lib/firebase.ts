
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This is the correct way to initialize Firebase in Next.js
// It prevents a race condition where the app tries to initialize
// before the environment variables are loaded.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length) {
    return getApp();
  }

  if (!firebaseConfig.apiKey) {
      throw new Error("Missing Firebase API Key. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.");
  }

  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
