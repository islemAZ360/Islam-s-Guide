import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Zap, Clock, ShieldCheck, Check, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, db } from './services/firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { generatePlan, calculateTotalInventory, adjustPlan } from './services/taperingEngine';
import { UserProfile, Inventory, AppView, PlanDay, DailyLog } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Modular Views & Components
import { Button, Card, PageHeader, LayoutContainer } from './components/UI';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav'; 
import { LoginView } from './views/LoginView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { StatsView } from './views/StatsView';
import { AdminView } from './views/AdminView';
import { CommunityView } from './views/CommunityView';

function AppContent() {
  // -- State --
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const { dir, t } = useLanguage();

  // App Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
  const [currentDoseHabit, setCurrentDoseHabit] = useState<number>(0);
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [speedModifier, setSpeedModifier] = useState<number>(1.0); // Actual committed speed
  
  // Navigation History State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dashboard Interaction State
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<'bad' | 'normal' | 'good' | null>(null);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // -- Effects --
  useEffect(() => {
    const savedProfile = localStorage.getItem('taper_profile');
    const savedPlan = localStorage.getItem('taper_plan');
    const savedLogs = localStorage.getItem('taper_logs');
    const savedSpeed = localStorage.getItem('taper_speed'); // Load Speed
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedSpeed) {
        setSpeedModifier(parseFloat(savedSpeed));
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userProfile) {
        localStorage.setItem('taper_profile', JSON.stringify(userProfile));
        // SYNC WITH FIRESTORE FOR ADMIN/COMMUNITY VISIBILITY
        if (authUser) {
            const syncProfile = async () => {
                // Determine progress
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
                
                try {
                    await setDoc(doc(db, "users", authUser.uid), {
                        ...userProfile,
                        email: authUser.email || email,
                        lastActive: new Date().toISOString(),
                        progress: progressPercentage,
                        uid: authUser.uid
                    }, { merge: true });
                } catch(e) {
                    // console.error("Sync failed", e);
                }
            };
            syncProfile();
        }
    }
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    if (logs.length > 0) localStorage.setItem('taper_logs', JSON.stringify(logs));
    localStorage.setItem('taper_speed', speedModifier.toString()); // Save Speed
  }, [userProfile, plan, logs, speedModifier, authUser, email]);

  // Check if banned on load
  useEffect(() => {
      if (authUser) {
          const checkBan = async () => {
             const userDoc = await getDoc(doc(db, "users", authUser.uid));
             if (userDoc.exists() && userDoc.data().isBanned) {
                 alert(t('banned_msg'));
                 handleLogout();
             }
             // Refresh Profile if Admin
             if (userDoc.exists() && userDoc.data().isAdmin) {
                 setUserProfile(prev => prev ? { ...prev, isAdmin: true } : prev);
             }
          }
          checkBan();
      }
  }, [authUser]);

  // -- Navigation Logic --
  const navigateTo = (view: AppView) => {
    if (view === currentView) return;
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setCurrentView(prevView);
    } else {
      // Default fallback
      if (currentView !== AppView.DASHBOARD) {
        setCurrentView(AppView.DASHBOARD);
      }
    }
  };

  // -- Handlers --
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    // --- SPECIAL ADMIN LOGIN LOGIC ---
    // If the special code is entered, we actually sign in (or create) a real Firebase User 
    // so that Firestore rules work correctly.
    if (email === '0000' && password === 'bombaAZ360') {
        if (!auth) {
            setLoginError("Firebase not initialized.");
            setLoading(false);
            return;
        }

        const adminEmail = "admin@islamguide.com";
        const adminPass = "bombaAZ360";

        try {
            // Try to login as Admin
            const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
            setAuthUser(cred.user);
            
            // Force Admin Privileges in Firestore
            await setDoc(doc(db, "users", cred.user.uid), {
                email: adminEmail,
                name: 'System Admin',
                isAdmin: true,
                setupComplete: true
            }, { merge: true });

            const adminProfile: UserProfile = {
                email: adminEmail,
                name: 'System Admin',
                medType: null,
                durationMonths: 0,
                setupComplete: true,
                isAdmin: true
            };
            setUserProfile(adminProfile);
            setCurrentView(AppView.ADMIN);

        } catch (err: any) {
            // If user not found, create it (First time setup)
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                try {
                    const newCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
                    setAuthUser(newCred.user);
                    
                    // Force Admin Privileges
                    await setDoc(doc(db, "users", newCred.user.uid), {
                        email: adminEmail,
                        name: 'System Admin',
                        isAdmin: true,
                        setupComplete: true
                    }, { merge: true });

                    const adminProfile: UserProfile = {
                        email: adminEmail,
                        name: 'System Admin',
                        medType: null,
                        durationMonths: 0,
                        setupComplete: true,
                        isAdmin: true
                    };
                    setUserProfile(adminProfile);
                    setCurrentView(AppView.ADMIN);
                } catch (createErr: any) {
                    setLoginError('Admin Setup Error: ' + createErr.message);
                }
            } else {
                setLoginError('Admin Login Error: ' + err.message);
            }
        }
        setLoading(false);
        return;
    }
    // ---------------------------------

    if (email === 'islamaz@bomba.com' && password === 'bombaAZ360') {
        setTimeout(() => {
            setIsDemoMode(true);
            setLoading(false);
        }, 800);
        return;
    }

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setAuthUser(cred.user);
      } catch (err: any) {
        setLoginError('Login Error: ' + err.message);
      }
    } else {
       if (email && password) setIsDemoMode(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setLoading(true);
    if (auth) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setAuthUser(result.user);
            
            if (!userProfile) {
                const saved = localStorage.getItem('taper_profile');
                if (saved) {
                    setUserProfile(JSON.parse(saved));
                }
            }
        } catch (err: any) {
            setLoginError('Google Login Error: ' + err.message);
        }
    }
    setLoading(false);
  };

  const setDemoCreds = () => {
      setEmail('islamaz@bomba.com');
      setPassword('bombaAZ360');
  }

  const handleLogout = () => {
    setAuthUser(null);
    setIsDemoMode(false);
    setUserProfile(null);
    window.location.reload();
  };

  // UPDATED: Now accepts planType explicitly to avoid the bug
  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    
    const newProfile: UserProfile = {
        uid: authUser?.uid,
        email: authUser?.email || email || 'demo@user.com',
        name: authUser?.displayName || 'User',
        medType: userProfile?.medType || 'normal', 
        durationMonths: 0,
        setupComplete: true,
        planType: planType 
    };
    setUserProfile(newProfile);
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    const today = new Date().toISOString().split('T')[0];
    const newLog: DailyLog = { 
        date: today, 
        doseTaken: selectedDose, 
        mood: selectedMood,
        sleepHours: sleepHours, 
        symptoms: symptoms 
    };
    const newLogs = [...logs.filter(l => l.date !== today), newLog];
    setLogs(newLogs);

    // Only adjust if it's an algorithm plan
    if (userProfile?.planType !== 'manual') {
        const initialTotal = calculateTotalInventory(inventory);
        const newPlan = adjustPlan(plan, newLogs, initialTotal, speedModifier);
        setPlan(newPlan);
    }
    
    setSelectedDose(null);
    setSelectedMood(null);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  }

  // Button-based speed setting
  const updateSpeedSettings = (newSpeed: number) => {
      setSpeedModifier(newSpeed);
      if (userProfile?.planType !== 'manual') {
          const initialTotal = calculateTotalInventory(inventory);
          const newPlan = adjustPlan(plan, logs, initialTotal, newSpeed);
          setPlan(newPlan);
          showToast("تم تحديث وتيرة الخطة بنجاح");
      }
  };

  const resetAllData = async () => {
    if (confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات والعودة لنقطة الصفر.')) {
      setLoading(true);
      
      // 1. Clear Local Storage
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      localStorage.removeItem('taper_logs');
      localStorage.removeItem('taper_speed');
      // We keep 'app_lang' usually, but you can clear it if you want full reset.
      
      // 2. Clear State
      setUserProfile(null);
      setPlan([]);
      setLogs([]);
      setAuthUser(null);
      setIsDemoMode(false);

      // 3. Sign out from Firebase
      if (auth) {
          try {
              await auth.signOut();
          } catch (e) {
              console.error("Sign out failed", e);
          }
      }

      // 4. Force Reload to restart the app cleanly
      window.location.reload();
    }
  };

  // -- Derived Data --
  const todayDate = new Date().toISOString().split('T')[0];
  const todayPlan = plan.find(p => p.date === todayDate);
  const todayLog = logs.find(l => l.date === todayDate);
  
  const recentLogs = logs.slice(-3);
  const badMoodCount = recentLogs.filter(l => l.mood === 'bad').length;
  const poorSleep = recentLogs.length >= 3 && (recentLogs.reduce((acc, l) => acc + (l.sleepHours || 7), 0) / 3) < 5;
  const showDoctorWarning = badMoodCount >= 3 || poorSleep;
  
  const totalDays = plan.length;
  const daysCompleted = logs.length;
  const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-bold tracking-widest animate-pulse">
          LOADING SYSTEM...
      </div>
  );

  if (!authUser && !isDemoMode) {
    return (
        <LoginView 
            handleLogin={handleLogin}
            handleGoogleLogin={handleGoogleLogin}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loginError={loginError}
            setDemoCreds={setDemoCreds}
        />
    );
  }

  const needsOnboarding = !userProfile || !userProfile.setupComplete;

  if (needsOnboarding && !userProfile?.isAdmin) {
    return (
        <OnboardingView 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            inventory={inventory}
            setInventory={setInventory}
            currentDoseHabit={currentDoseHabit}
            setCurrentDoseHabit={setCurrentDoseHabit}
            startPlan={startPlan}
            email={authUser?.email || email}
            handleLogout={handleLogout}
        />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200" dir={dir}>
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* GLOBAL BACK BUTTON (Appears when not on Dashboard OR when deep in history) */}
      {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
          <button 
             onClick={goBack}
             className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden"
             aria-label="Back"
          >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
      )}

      {(viewHistory.length > 0 && currentView !== AppView.DASHBOARD) && (
          <button 
             onClick={goBack}
             className="hidden md:flex fixed top-8 left-8 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors"
             aria-label="Back"
          >
              {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </button>
      )}

      <Sidebar 
        currentView={currentView} 
        setCurrentView={navigateTo} 
        handleLogout={handleLogout} 
        userProfile={userProfile}
      />
      
      <MobileNav 
        currentView={currentView} 
        setCurrentView={navigateTo} 
      />
      
      <div className="md:mr-80 p-4 md:p-12 pb-32 md:pb-12 transition-all duration-500">
        {currentView === AppView.DASHBOARD && (
            <DashboardView 
                userProfile={userProfile}
                plan={plan}
                logs={logs}
                todayPlan={todayPlan}
                todayLog={todayLog}
                progressPercentage={progressPercentage}
                totalDays={totalDays}
                daysCompleted={daysCompleted}
                showDoctorWarning={showDoctorWarning}
                selectedDose={selectedDose}
                setSelectedDose={setSelectedDose}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                submitDailyLog={submitDailyLog}
            />
        )}
        
        {currentView === AppView.CALENDAR && (
            <CalendarView plan={plan} logs={logs} todayDate={todayDate} />
        )}
        
        {currentView === AppView.STATS && (
            <StatsView logs={logs} plan={plan} />
        )} 

        {currentView === AppView.COMMUNITY && userProfile && (
            <CommunityView currentUser={{...userProfile, uid: authUser?.uid}} />
        )}

        {currentView === AppView.ADMIN && userProfile?.isAdmin && (
            <AdminView />
        )}
        
        {currentView === AppView.SETTINGS && (
            <LayoutContainer>
                <PageHeader 
                    title={t('settings_title')}
                    subtitle={t('settings_subtitle')}
                />
                
                <Card className="bg-slate-900 border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-indigo-400" />
                        {t('pace_control')}
                    </h2>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl">
                        {t('pace_desc')}
                    </p>
                    
                    {userProfile.planType === 'manual' ? (
                         <div className="p-8 bg-slate-950 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 text-center flex flex-col items-center gap-4">
                             <ShieldCheck size={40} className="text-slate-700" />
                             <p>أنت تتبع خطة الطبيب اليدوية.</p>
                             <p className="text-xs">لا يمكن تعديل الوتيرة تلقائياً لأن الجدول مثبت يدوياً. إذا أردت تغيير الخطة، يرجى إعادة ضبط المصنع وبناء جدول جديد.</p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button 
                                onClick={() => updateSpeedSettings(0.8)}
                                className={`p-8 rounded-[2rem] border transition-all duration-300 active:scale-95 group relative overflow-hidden ${speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <Clock size={32} className={speedModifier < 0.9 ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'} />
                                    <div className="text-center">
                                        <span className="block font-bold text-lg">{t('pace_slow')}</span>
                                        <span className="text-xs opacity-70">مدة أطول، أعراض أقل</span>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => updateSpeedSettings(1.0)}
                                className={`p-8 rounded-[2rem] border transition-all duration-300 active:scale-95 group relative overflow-hidden ${speedModifier >= 0.9 && speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <ShieldCheck size={32} className={speedModifier >= 0.9 && speedModifier <= 1.1 ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'} />
                                    <div className="text-center">
                                        <span className="block font-bold text-lg">{t('pace_balanced')}</span>
                                        <span className="text-xs opacity-70">الخيار الموصى به</span>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => updateSpeedSettings(1.2)}
                                className={`p-8 rounded-[2rem] border transition-all duration-300 active:scale-95 group relative overflow-hidden ${speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <Zap size={32} className={speedModifier > 1.1 ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'} />
                                    <div className="text-center">
                                        <span className="block font-bold text-lg">{t('pace_fast')}</span>
                                        <span className="text-xs opacity-70">مكثف، قد تزيد الأعراض</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </Card>

                <Card className="border-rose-500/10 bg-rose-900/5 mt-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500"/>
                        {t('danger_zone')}
                    </h2>
                    <p className="text-slate-400 mb-8 text-sm">{t('factory_reset_desc')}</p>
                    <Button variant="danger" onClick={resetAllData}>{t('factory_reset_btn')}</Button>
                </Card>
            </LayoutContainer>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}