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
  const { t } = useLanguage();

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
        // Simulate network delay for realism
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
        // Load pending syncs from local storage in case of previous crash
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
                
                // Merge nested profile data if structured that way
                if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

                setUserProfile(fetchedProfile);

                // Only update local state from cloud if we are not currently "dirty" (editing)
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
                // D. Profile Initialization (The Fix)
                // Ensure boolean value using null coalescing operator
                const isAdminEmail = currentUser.email?.toLowerCase().endsWith('@islamguide.com') ?? false;
                
                const newProfile: UserProfile = {
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    name: currentUser.displayName || (isAdminEmail ? 'Administrator' : 'New User'),
                    role: isAdminEmail ? 'admin' : 'normal_user',
                    setupComplete: isAdminEmail, // Admins skip onboarding
                    durationMonths: 0
                };

                setUserProfile(newProfile);

                // Persist the new profile immediately so next load finds it
                setDoc(docRef, newProfile).catch(e => 
                    console.error("Failed to auto-create profile:", e)
                );
            }
            setDataLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            // Don't block UI on error, just stop loading
            setDataLoading(false);
        });

        return () => unsubscribe();
    }
  }, [currentUser, isDemoMode]);

  // 2. Sync Logic (Debounced Write)
  useEffect(() => {
    // Mark as dirty when data changes locally
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    // Local Storage Backup (Always active)
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    // Cloud Sync (Only for real users)
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
        
        // Skip sync for doctors who don't have doctor data set up yet
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
                console.error("Cloud sync failed (offline or permission)", e);
            }
        }, 3000); // 3 seconds debounce

        // Safety net for closing tab
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
      if (!window.confirm(t('delete_confirm_msg'))) {
          return;
      }

      try {
          setDataLoading(true);
          
          if (currentUser && !isDemoMode) {
              // Delete from Firestore
              await deleteDoc(doc(db, "users", currentUser.uid));
          }
          
          // Clear Local Storage
          localStorage.clear();
          setUserProfile(null);
          setPlan([]);
          setLogs([]);
          setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
          
          // Logout
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