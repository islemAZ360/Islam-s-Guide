import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, googleProvider, db } from '../services/firebase';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string, data: { age: number, weight: number, height: number }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage(); // Access language for error localization
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to translate Firebase errors
  const getLocalizedError = (errorCode: string) => {
    const isAr = language === 'ar';
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.";
      case 'auth/email-already-in-use':
        return isAr ? "البريد الإلكتروني مستخدم بالفعل." : "Email is already in use.";
      case 'auth/weak-password':
        return isAr ? "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)." : "Password is too weak (min 6 chars).";
      case 'auth/invalid-email':
        return isAr ? "صيغة البريد الإلكتروني غير صحيحة." : "Invalid email format.";
      case 'auth/too-many-requests':
        return isAr ? "محاولات كثيرة جداً. يرجى المحاولة لاحقاً." : "Too many attempts. Try again later.";
      case 'auth/network-request-failed':
        return isAr ? "خطأ في الاتصال. تحقق من الإنترنت." : "Network error. Check your connection.";
      default:
        return isAr ? "حدث خطأ غير متوقع. حاول مرة أخرى." : "An unexpected error occurred.";
    }
  };

  // Monitor Auth State
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

  // Login
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login Error:", err.code);
      setError(getLocalizedError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Signup with Profile Creation
  const signupWithEmail = async (email: string, password: string, name: string, data: { age: number, weight: number, height: number }) => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, { displayName: name });

        // 3. Create Firestore Profile
        // Note: If this fails, we have an orphaned auth user. 
        // In a production app, we might want to delete the user or use a Cloud Function.
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                name: name,
                role: 'normal_user',
                age: data.age,
                weight: data.weight,
                height: data.height,
                setupComplete: false,
                createdAt: new Date().toISOString(),
                plan: [],
                logs: [],
                inventory: { boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 }
            });
        } catch (firestoreErr) {
            console.error("Firestore Profile Error:", firestoreErr);
            // Attempt cleanup (optional, careful with this in production)
            // await user.delete(); 
            throw new Error(language === 'ar' ? 'فشل إنشاء الملف الشخصي. تحقق من الاتصال.' : 'Failed to create user profile. Check connection.');
        }

    } catch (err: any) {
        console.error("Signup Error:", err.code || err.message);
        setError(err.code ? getLocalizedError(err.code) : err.message);
    } finally {
        setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Profile check/creation should happen in a separate step or via Cloud Functions triggers
    } catch (err: any) {
      console.error("Google Login Error:", err.code);
      setError(getLocalizedError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
      if (!auth) return;
      if (!email) {
          setError(language === 'ar' ? "يرجى إدخال البريد الإلكتروني." : "Please enter your email.");
          return;
      }
      setLoading(true);
      setError(null);
      try {
          await sendPasswordResetEmail(auth, email);
          alert(language === 'ar' ? "تم إرسال رابط إعادة التعيين إلى بريدك." : "Password reset link sent to your email.");
      } catch (err: any) {
          console.error("Reset Password Error:", err.code);
          setError(getLocalizedError(err.code));
      } finally {
          setLoading(false);
      }
  };

  // Logout
  const logout = async () => {
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      }
      setIsDemoMode(false);
      setCurrentUser(null);
      // Clear sensitive data from local storage
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      // Force reload to clear memory states
      window.location.reload();
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  // Demo Mode
  const enableDemoMode = () => {
    setIsDemoMode(true);
    // Create a realistic-looking fake user object
    setCurrentUser({ 
      uid: 'demo-user', 
      email: 'demo@islamguide.com', 
      displayName: 'Demo User',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
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
      signupWithEmail, 
      loginWithGoogle, 
      resetPassword,
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