import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9_8yeOazYKhzHiHvyzBaIoDQiNduMnS0",
  authDomain: "islam-s-guide.firebaseapp.com",
  projectId: "islam-s-guide",
  storageBucket: "islam-s-guide.firebasestorage.app",
  messagingSenderId: "176137497336",
  appId: "1:176137497336:web:d763f34c2c632f1317e90d",
  measurementId: "G-VNVJGFXLN4"
};

// Initialize Firebase
let app;
let auth: Auth | undefined;
let db: any; // Firestore instance
const googleProvider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization failed.", error);
}

export { auth, db, googleProvider };