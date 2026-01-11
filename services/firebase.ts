/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// قراءة المتغيرات البيئية من Vercel (أو ملف .env محلياً)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string
};

// تهيئة المتغيرات
let app;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // التحقق من أن المفاتيح موجودة قبل التهيئة
  // نتحقق فقط من apiKey كدليل على وجود التكوين
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API keys are missing. Check Vercel Environment Variables or .env file.");
  }

  // محاولة تهيئة التطبيق
  app = initializeApp(firebaseConfig);
  
  // تهيئة خدمات المصادقة وقاعدة البيانات
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // في حالة وجود خطأ، التطبيق سيستمر بالعمل ولكن خدمات Firebase لن تكون متاحة
  // سيظهر خطأ في AuthContext إذا حاول المستخدم تسجيل الدخول
}

// تصدير الخدمات لاستخدامها في باقي الملفات
// نستخدم الـ assertion (!) هنا لأننا تأكدنا من التهيئة أو رمينا خطأ (أو سنعالج الخطأ في مكان الاستخدام)
export { auth, db, googleProvider };