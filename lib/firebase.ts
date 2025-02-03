import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const isProduction = process.env.NODE_ENV === 'production';

// ✅ Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: isProduction ? process.env.FIREBASE_API_KEY : process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: isProduction ? process.env.FIREBASE_AUTH_DOMAIN : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: isProduction ? process.env.FIREBASE_PROJECT_ID : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: isProduction ? process.env.FIREBASE_STORAGE_BUCKET : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: isProduction ? process.env.FIREBASE_MESSAGING_SENDER_ID : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: isProduction ? process.env.FIREBASE_APP_ID : process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
