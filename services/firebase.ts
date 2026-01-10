import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9_8yeOazYKhzHiHvyzBaIoDQiNduMnS0",
  authDomain: "islam-s-guide.firebaseapp.com",
  projectId: "islam-s-guide",
  storageBucket: "islam-s-guide.firebasestorage.app",
  messagingSenderId: "176137497336",
  appId: "1:176137497336:web:d763f34c2c632f1317e90d",
  measurementId: "G-VNVJGFXLN4"
};

// تهيئة Firebase (مع معالجة الأخطاء في حال عدم وجود الإنترنت)
let app;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization failed or pending network connection.", error);
  // يمكن إضافة منطق هنا للعمل بوضع عدم الاتصال (Offline Mode)
}

export { auth, db, googleProvider };