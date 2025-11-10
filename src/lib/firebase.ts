import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions"; // Importar getFunctions

// Suas credenciais do Firebase que já estavam aqui
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig as FirebaseOptions);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
} else {
  app = getApps()[0] as FirebaseApp;
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'southamerica-east1'); // Inicializar e exportar functions
export const googleProvider = new GoogleAuthProvider();
export default app;
