import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, // دالة إنشاء الحساب
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile // لتحديث اسم المستخدم فوراً
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // للكتابة في قاعدة البيانات
import { auth, googleProvider, db } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  // الدالة الجديدة لإنشاء الحساب
  signupWithEmail: (e: string, p: string, name: string, data: { age: number, weight: number, height: number }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // مراقبة حالة المستخدم (Firebase Listener)
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isDemoMode) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // تسجيل الدخول
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
        setError("Authentication service is not initialized.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let errorMessage = 'Login Error';
      if (err.code === 'auth/user-not-found') errorMessage = 'User not found.';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email format.';
      else errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- دالة إنشاء الحساب الجديدة ---
  const signupWithEmail = async (email: string, password: string, name: string, data: { age: number, weight: number, height: number }) => {
    if (!auth) return;
    
    setLoading(true);
    setError(null);

    try {
        // 1. إنشاء الحساب في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. تحديث الاسم في ملف Auth الشخصي
        await updateProfile(user, { displayName: name });

        // 3. إنشاء ملف المستخدم في قاعدة البيانات (Firestore) مع البيانات الفيزيائية
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            name: name,
            role: 'normal_user', // افتراضياً مستخدم عادي
            age: data.age,
            weight: data.weight,
            height: data.height,
            setupComplete: false, // لا يزال يحتاج لإعداد الدواء
            createdAt: new Date().toISOString(),
            // تهيئة القيم الفارغة لتجنب الأخطاء لاحقاً
            plan: [],
            logs: [],
            inventory: { boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 }
        });

    } catch (err: any) {
        let errorMessage = 'Signup Error';
        if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already registered.';
        else if (err.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
        else errorMessage = err.message;
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // ملاحظة: مع جوجل قد نحتاج خطوة إضافية لطلب العمر والوزن إذا كان مستخدماً جديداً، 
      // لكن سنكتفي بالدخول المباشر حالياً للتبسيط.
    } catch (err: any) {
      setError('Google Login Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      }
      setIsDemoMode(false);
      setCurrentUser(null);
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      window.location.reload();
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setCurrentUser({ 
      uid: 'demo-user', 
      email: 'demo@example.com', 
      displayName: 'Demo User',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
    } as unknown as User);
    setLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      isDemoMode,
      loginWithEmail, 
      signupWithEmail, // تصدير الدالة الجديدة
      loginWithGoogle, 
      logout,
      enableDemoMode,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};