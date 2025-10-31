// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7Qr5E3sW9Rr2dcQlp54b2E1ANSN0mWgs",
  authDomain: "market-match-d7254.firebaseapp.com",
  projectId: "market-match-d7254",
  storageBucket: "market-match-d7254.firebasestorage.app",
  messagingSenderId: "632541157749",
  appId: "1:632541157749:web:65a3952faa1c6bbcd95b3c",
  measurementId: "G-PJKQ2RR09V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);