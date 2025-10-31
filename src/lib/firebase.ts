import { initializeApp, getApps, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Read config from Vite env vars (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase Config:", firebaseConfig);

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig as FirebaseOptions);
} else {
  app = getApps()[0] as FirebaseApp;
}

export const db = getFirestore(app);
export default app;
