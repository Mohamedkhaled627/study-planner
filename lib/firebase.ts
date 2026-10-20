import { initializeApp, getApps } from "firebase/app";

// ponytail: client SDK everywhere (reads+writes go through Firestore security rules while rules are in 30-day open mode).
// swap to firebase-admin + strict user-scoped rules when a service-account key is configured.
export const firebaseConfig = {
  // Firebase web config is public by design (ships in the client bundle; only
  // Firestore security rules protect data). Env vars override local testing.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyC0lcz-Zfv_272PlYsOzIYBF-V3eOlvVjg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "study-planner-fyunk3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "study-planner-fyunk3",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:281662719942:web:e5fec2f304f2a796d654c7",
};

export const clientApp = getApps()[0] ?? initializeApp(firebaseConfig);
