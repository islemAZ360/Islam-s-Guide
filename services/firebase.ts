/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  Firestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Helper to safely read env variables with fallback
const getEnv = (key: string): string => {
  // @ts-ignore - Vite specific env access
  return import.meta.env[key] || "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID")
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // Validate critical configuration to provide helpful dev feedback
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase Configuration is missing. Please check your .env file.");
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Initialize Firestore with Offline Persistence (Multi-tab support)
  // This allows the app to work seamlessly when network is flaky or offline
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  
  console.log("✅ Firebase initialized with offline persistence enabled.");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  // In a real scenario, you might want to initialize a mock DB or redirect to an error page
}

export { auth, db, googleProvider };