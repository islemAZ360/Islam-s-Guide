import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../services/firebase';
import { UserProfile, Inventory, PlanDay, DailyLog } from '../types';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface DataContextType {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  plan: PlanDay[];
  setPlan: (p: PlanDay[]) => void;
  logs: DailyLog[];
  setLogs: (l: DailyLog[]) => void;
  speedModifier: number;
  setSpeedModifier: (s: number) => void;
  dataLoading: boolean;
  resyncData: () => void;
  resetAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Dummy Data for Demo Mode
const DEMO_PROFILE: UserProfile = {
    uid: 'demo-user',
    email: 'demo@islamguide.com',
    name: 'Demo User',
    role: 'normal_user',
    setupComplete: true,
    planType: 'algorithm',
    medType: 'normal',
    medForm: 'tablet',
    medUnit: 'mg',
    durationMonths: 1,
    speedModifier: 1.0,
    progress: 45
};

const DEMO_INVENTORY: Inventory = { boxes: 2, pillsPerBox: 30, loosePills: 15, totalPills: 75 };
const DEMO_PLAN: PlanDay[] = Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() + (i - 5) * 86400000).toISOString().split('T')[0],
    plannedDose: Math.max(0, 10 - i * 0.5),
    isPast: i < 5
}));
const DEMO_LOGS: DailyLog[] = Array.from({ length: 5 }).map((_, i) => ({
    date: new Date(Date.now() + (i - 5) * 86400000).toISOString().split('T')[0],
    doseTaken: 10 - i * 0.5,
    mood: i % 2 === 0 ? 'good' : 'normal',
    sleepHours: 7 + (i % 2),
    symptoms: []
}));

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isDemoMode, logout } = useAuth();
  const { t, language } = useLanguage();

  // -- Data State --
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [speedModifier, setSpeedModifier] = useState<number>(1.0);
  const [dataLoading, setDataLoading] = useState(true);

  // Ref to track unsaved changes
  const isDirty = useRef(false);

  // 1. Fetch Data Listener
  useEffect(() => {
    // A. Handle Logout State
    if (!currentUser && !isDemoMode) {
        setUserProfile(null);
        setPlan([]);
        setLogs([]);
        setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
        setDataLoading(false);
        return;
    }

    // B. Handle Demo Mode (Local Data Only)
    if (isDemoMode) {
        setDataLoading(true);
        setTimeout(() => {
            setUserProfile(DEMO_PROFILE);
            setInventory(DEMO_INVENTORY);
            setPlan(DEMO_PLAN);
            setLogs(DEMO_LOGS);
            setSpeedModifier(1.0);
            setDataLoading(false);
        }, 800);
        return;
    }

    // C. Handle Authenticated User (Firestore Sync)
    if (currentUser) {
        const savedLogs = localStorage.getItem('pending_sync_logs');
        if (savedLogs) {
            try {
                const parsedLogs = JSON.parse(savedLogs);
                if (parsedLogs.length > 0) setLogs(parsedLogs);
                localStorage.removeItem('pending_sync_logs'); 
            } catch (e) { console.error("Error loading pending logs", e); }
        }

        setDataLoading(true);
        const docRef = doc(db, "users", currentUser.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const fetchedProfile = { ...data, uid: currentUser.uid } as UserProfile;
                if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

                setUserProfile(fetchedProfile);

                if (!isDirty.current) {
                    if (data.plan) setPlan(data.plan);
                    if (data.logs) setLogs(data.logs);
                    if (data.inventory) setInventory(data.inventory);
                    if (data.speedModifier) setSpeedModifier(data.speedModifier);
                }

                if (data.isBanned) {
                   alert(t('banned_msg'));
                   logout();
                }
            } else {
                setUserProfile({
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    name: currentUser.displayName || 'New User',
                    role: 'normal_user',
                    setupComplete: false,
                    durationMonths: 0
                });
            }
            setDataLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setDataLoading(false);
        });

        return () => unsubscribe();
    }
  }, [currentUser, isDemoMode]);

  // 2. Sync Logic (Debounced Write)
  useEffect(() => {
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
        if (userProfile.role === 'doctor' && !userProfile.doctorData) return;

        const timeoutId = setTimeout(async () => {
            try {
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

                const updateData: any = {
                    lastActive: new Date().toISOString(),
                    ...(userProfile.name ? { name: userProfile.name } : {})
                };

                if (userProfile.role === 'patient' || userProfile.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }
                
                if (userProfile.role === 'doctor' && userProfile.doctorData) {
                    updateData.doctorData = userProfile.doctorData;
                }

                await setDoc(doc(db, "users", currentUser.uid), updateData, { merge: true });
                isDirty.current = false;

            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        }, 3000);

        const handleBeforeUnload = () => {
            if (isDirty.current) {
                localStorage.setItem('pending_sync_logs', JSON.stringify(logs));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }
  }, [userProfile, plan, logs, inventory, speedModifier, currentUser, isDemoMode]);

  const resyncData = () => {
      setDataLoading(true);
      setTimeout(() => setDataLoading(false), 800);
  };

  const resetAllData = async () => {
      try {
          setDataLoading(true);
          
          if (currentUser && !isDemoMode) {
              // 1. Delete from Firestore (Data Removal)
              // This is critical: Removing this doc removes them from Leaderboard/Search instantly.
              await deleteDoc(doc(db, "users", currentUser.uid));
              
              // 2. Delete Authentication Account (Login Removal)
              // This removes them from the Firebase Auth list.
              try {
                  await currentUser.delete();
              } catch (authError: any) {
                  console.error("Auth deletion error:", authError);
                  // If 'requires-recent-login' error occurs, we must force re-login.
                  // We still log them out so they can't access the app with deleted data.
                  if (authError.code === 'auth/requires-recent-login') {
                      alert(language === 'ar' 
                          ? "تم حذف بياناتك بنجاح. لحذف الحساب نهائياً من القائمة، يرجى تسجيل الدخول مرة أخرى ثم المحاولة فوراً (إجراء أمني من جوجل)." 
                          : "Data deleted. To permanently remove account from Auth list, please login again and retry immediately (Security Requirement).");
                  }
              }
          }
          
          // Clear Local Storage & Context
          localStorage.clear();
          setUserProfile(null);
          setPlan([]);
          setLogs([]);
          setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
          
          // Force Logout
          await logout();
          
      } catch (e) {
          console.error("Error resetting data:", e);
          alert("Error deleting data. Check connection.");
          setDataLoading(false);
      }
  };

  return (
    <DataContext.Provider value={{ 
      userProfile, setUserProfile,
      inventory, setInventory,
      plan, setPlan,
      logs, setLogs,
      speedModifier, setSpeedModifier,
      dataLoading,
      resyncData,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};