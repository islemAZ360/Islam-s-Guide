import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
    if (!currentUser) {
      if (!isDemoMode) {
        // Reset state on logout
        setUserProfile(null);
        setPlan([]);
        setLogs([]);
        setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
        setDataLoading(false);
      } else {
        // Demo Mode - Assume setup handled elsewhere or mock data
        setDataLoading(false);
      }
      return;
    }

    // Check if we have pending data from a crash/close
    const savedLogs = localStorage.getItem('pending_sync_logs');
    if (savedLogs) {
        try {
            const parsedLogs = JSON.parse(savedLogs);
            if (parsedLogs.length > 0) setLogs(parsedLogs);
            localStorage.removeItem('pending_sync_logs'); // Clear after load
        } catch (e) { console.error("Error loading pending logs", e); }
    }

    setDataLoading(true);
    const docRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedProfile = { ...data, uid: currentUser.uid } as UserProfile;
        
        // Merge nested object if exists (legacy support)
        if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

        setUserProfile(fetchedProfile);

        // Only update local state from cloud if we are not currently "dirty" (editing)
        // This prevents overwriting local changes with old cloud data during rapid edits
        if (!isDirty.current) {
            if (data.plan) setPlan(data.plan);
            if (data.logs) setLogs(data.logs);
            if (data.inventory) setInventory(data.inventory);
            if (data.speedModifier) setSpeedModifier(data.speedModifier);
        }

        // Security Check
        if (data.isBanned) {
           alert(t('banned_msg'));
           logout();
        }
      } else {
        // New User Skeleton
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
  }, [currentUser, isDemoMode]);

  // 2. Sync Logic (Debounced Save + Persistence)
  useEffect(() => {
    // Flag that we have changes
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    // A. Local Storage Backup (Immediate)
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    // B. Cloud Sync (Debounced)
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
        // Skip sync for doctors who don't have profile data yet
        if (userProfile.role === 'doctor' && !userProfile.doctorData) return;

        const timeoutId = setTimeout(async () => {
            try {
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

                const updateData: any = {
                    email: currentUser.email,   
                    uid: currentUser.uid,       
                    lastActive: new Date().toISOString(),
                    ...(userProfile.name ? { name: userProfile.name } : {})
                };

                // Only sync large data arrays for patients/users
                if (userProfile.role === 'patient' || userProfile.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }
                
                // Sync Doctor Data structure if needed
                if (userProfile.role === 'doctor' && userProfile.doctorData) {
                    updateData.doctorData = userProfile.doctorData;
                }

                await setDoc(doc(db, "users", currentUser.uid), updateData, { merge: true });
                
                // Reset dirty flag after successful sync
                isDirty.current = false;

            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        }, 5000); // 5 seconds debounce

        // C. Safety Net: Save to localStorage on tab close
        const handleBeforeUnload = () => {
            if (isDirty.current) {
                localStorage.setItem('pending_sync_logs', JSON.stringify(logs));
                localStorage.setItem('pending_sync_plan', JSON.stringify(plan));
                localStorage.setItem('pending_sync_inv', JSON.stringify(inventory));
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
      setTimeout(() => setDataLoading(false), 1000);
  };

  const resetAllData = async () => {
      localStorage.clear();
      setUserProfile(null);
      setPlan([]);
      setLogs([]);
      setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
      await logout();
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