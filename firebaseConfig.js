// Import necessary Firebase modules
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAXIcSTAXa0WX_V2gXow_-JdePYrjgdtUw",
  authDomain: "shortrest-8972a.firebaseapp.com",
  projectId: "shortrest-8972a",
  storageBucket: "shortrest-8972a.firebasestorage.app",
  messagingSenderId: "797702782138",
  appId: "1:797702782138:web:ea8084f5c75a9b05b3d683",
  measurementId: "G-D9WGCE8TC4"
};

// Initialize Firebase App (check if it's already initialized to avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase Auth and Firestore instances for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
