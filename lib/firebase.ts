import { initializeApp, getApps } from "firebase/app";

// ponytail: client SDK everywhere (reads+writes go through Firestore security rules while rules are in 30-day open mode).
// swap to firebase-admin + strict user-scoped rules when a service-account key is configured.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const clientApp = getApps()[0] ?? initializeApp(firebaseConfig);
