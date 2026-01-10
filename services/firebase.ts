import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// --- إعدادات الاتصال ---
// يجب استبدال هذه القيم بالقيم الخاصة بمشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB9_8yeOazYKhzHiHvyzBaIoDQiNduMnS0", // Placeholder Key
  authDomain: "islam-s-guide.firebaseapp.com",
  projectId: "islam-s-guide",
  storageBucket: "islam-s-guide.firebasestorage.app",
  messagingSenderId: "176137497336",
  appId: "1:176137497336:web:d763f34c2c632f1317e90d",
  measurementId: "G-VNVJGFXLN4"
};

// تهيئة المتغيرات
let app;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // محاولة تهيئة التطبيق
  app = initializeApp(firebaseConfig);
  
  // تهيئة خدمات المصادقة وقاعدة البيانات
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // في حالة فشل الاتصال، يمكن هنا تفعيل "وضع عدم الاتصال" أو إظهار رسالة خطأ
  // لكن بما أن التطبيق يعتمد كلياً على البيانات السحابية الآن، سنكتفي بتسجيل الخطأ
}

// تصدير الخدمات لاستخدامها في باقي الملفات
export { auth, db, googleProvider };