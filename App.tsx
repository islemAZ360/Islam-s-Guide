import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Zap, Clock, ShieldCheck, Check, ArrowRight, ArrowLeft } from 'lucide-react';
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
import { SupportView } from './views/SupportView';
import { ArticlesView } from './views/ArticlesView';

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
  const [speedModifier, setSpeedModifier] = useState<number>(1.0);
  
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

  // -- Load Local Data on Mount --
  useEffect(() => {
    const savedProfile = localStorage.getItem('taper_profile');
    const savedPlan = localStorage.getItem('taper_plan');
    const savedLogs = localStorage.getItem('taper_logs');
    const savedSpeed = localStorage.getItem('taper_speed');
    const savedInventory = localStorage.getItem('taper_inventory');
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedSpeed) setSpeedModifier(parseFloat(savedSpeed));
    
    setLoading(false); 
  }, []);

  // -- 1. FETCH DATA FROM FIREBASE ON LOGIN --
  useEffect(() => {
    if (authUser) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Load Cloud Data
            if (data.userProfile) setUserProfile(data.userProfile);
            if (data.plan) setPlan(data.plan);
            if (data.logs) setLogs(data.logs);
            if (data.inventory) setInventory(data.inventory);
            if (data.speedModifier) setSpeedModifier(data.speedModifier);
            
            if (data.isBanned) {
               alert(t('banned_msg'));
               handleLogout();
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [authUser]);

  // -- 2. SYNC DATA TO FIREBASE & LOCAL STORAGE --
  useEffect(() => {
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    if (logs.length > 0) localStorage.setItem('taper_logs', JSON.stringify(logs));
    if (inventory.totalPills > 0 || inventory.boxes > 0) localStorage.setItem('taper_inventory', JSON.stringify(inventory));
    localStorage.setItem('taper_speed', speedModifier.toString());

    if (authUser && userProfile) {
        const syncToCloud = async () => {
            const totalDays = plan.length;
            const daysCompleted = logs.length;
            const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
            
            try {
                await setDoc(doc(db, "users", authUser.uid), {
                    userProfile,
                    email: authUser.email || email,
                    plan, 
                    logs, 
                    inventory, 
                    speedModifier,
                    lastActive: new Date().toISOString(),
                    progress: progressPercentage,
                    uid: authUser.uid,
                    isAdmin: userProfile.isAdmin || false,
                    isBanned: userProfile.isBanned || false,
                    isFlagged: userProfile.isFlagged || false,
                    doctorNotes: userProfile.doctorNotes || ""
                }, { merge: true });
            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        };
        const timeoutId = setTimeout(syncToCloud, 2000);
        return () => clearTimeout(timeoutId);
    }
  }, [userProfile, plan, logs, speedModifier, authUser, inventory]);


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

    // ADMIN LOGIN
    if (email === 'admin@islamguide.com' && password === 'bombaAZ36') {
        if (!auth) { setLoginError("Firebase not initialized."); setLoading(false); return; }
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            setAuthUser(cred.user);
            await setDoc(doc(db, "users", cred.user.uid), {
                email: email, name: 'System Admin', isAdmin: true, setupComplete: true
            }, { merge: true });
            setUserProfile({ email: email, name: 'System Admin', medType: null, durationMonths: 0, setupComplete: true, isAdmin: true });
            setCurrentView(AppView.ADMIN);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                try {
                    const newCred = await createUserWithEmailAndPassword(auth, email, password);
                    setAuthUser(newCred.user);
                    await setDoc(doc(db, "users", newCred.user.uid), {
                        email: email, name: 'System Admin', isAdmin: true, setupComplete: true
                    }, { merge: true });
                    setUserProfile({ email: email, name: 'System Admin', medType: null, durationMonths: 0, setupComplete: true, isAdmin: true });
                    setCurrentView(AppView.ADMIN);
                } catch (createErr: any) { setLoginError('Admin Setup Failed: ' + createErr.message); }
            } else { setLoginError('Admin Login Error: ' + err.message); }
        }
        setLoading(false);
        return;
    }

    // Demo Mode
    if (email === 'islamaz@bomba.com' && password === 'bombaAZ360') {
        setTimeout(() => { setIsDemoMode(true); setLoading(false); }, 800);
        return;
    }

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setAuthUser(cred.user);
      } catch (err: any) { setLoginError('Login Error: ' + err.message); }
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
        } catch (err: any) { setLoginError('Google Login Error: ' + err.message); }
    }
    setLoading(false);
  };

  const setDemoCreds = () => { setEmail('islamaz@bomba.com'); setPassword('bombaAZ360'); }

  const handleLogout = () => {
    setAuthUser(null);
    setIsDemoMode(false);
    setUserProfile(null);
    setPlan([]);
    setLogs([]);
    setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
    localStorage.clear();
    if (auth) auth.signOut().catch(console.error);
    window.location.reload();
  };

  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    const newProfile: UserProfile = {
        uid: authUser?.uid,
        email: authUser?.email || email || 'demo@user.com',
        name: authUser?.displayName || 'User',
        medType: userProfile?.medType || 'normal', 
        medForm: userProfile?.medForm, // Preserve form
        medUnit: userProfile?.medUnit, // Preserve unit
        durationMonths: 0,
        setupComplete: true,
        planType: planType 
    };
    setUserProfile(newProfile);
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    // 1. Inventory Logic
    const currentTotal = calculateTotalInventory(inventory);
    // Use float calculation for liquid precision
    const newTotal = Math.max(0, Math.round((currentTotal - selectedDose) * 100) / 100);
    
    const newInventory: Inventory = { ...inventory, totalPills: newTotal };
    if (inventory.pillsPerBox > 0) {
        newInventory.boxes = Math.floor(newTotal / inventory.pillsPerBox);
        newInventory.loosePills = Math.round((newTotal % inventory.pillsPerBox) * 100) / 100;
    } else {
        newInventory.loosePills = newTotal;
    }
    setInventory(newInventory);

    // 2. Log Logic
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

    // 3. Plan Adjustment
    if (userProfile?.planType !== 'manual') {
        // We pass the "Pre-dose" inventory + what was taken to reconstruct Total Initial for the algorithm
        // Actually, better: calculate what total SHOULD be to feed the algorithm logic
        // The engine now expects (InitialTotal) to do (Initial - Used).
        // Since we know Current = Initial - Used -> Initial = Current + Used.
        const totalUsed = newLogs.reduce((acc, l) => acc + l.doseTaken, 0);
        const theoreticalInitial = newTotal + totalUsed;
        
        const newPlan = adjustPlan(plan, newLogs, theoreticalInitial, speedModifier);
        setPlan(newPlan);
    }
    
    setSelectedDose(null);
    setSelectedMood(null);
    showToast(t('toast_log_success'));
  };

  const handleFreezePlan = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayPlanItem = plan.find(p => p.date === today);
      if (!todayPlanItem) return;

      const freezeDose = todayPlanItem.plannedDose;
      const history = plan.filter(p => p.date <= today);
      const future = plan.filter(p => p.date > today);
      
      const newPlanDays: PlanDay[] = [];
      let currentDateObj = new Date(today);
      
      for (let i = 0; i < 3; i++) {
          currentDateObj.setDate(currentDateObj.getDate() + 1);
          newPlanDays.push({
              date: currentDateObj.toISOString().split('T')[0],
              plannedDose: freezeDose,
              isPast: false
          });
      }
      
      future.forEach(day => {
          currentDateObj.setDate(currentDateObj.getDate() + 1);
          newPlanDays.push({ ...day, date: currentDateObj.toISOString().split('T')[0] });
      });
      
      setPlan([...history, ...newPlanDays]);
      showToast(t('toast_freeze_success'));
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  }

  const updateSpeedSettings = (newSpeed: number) => {
      setSpeedModifier(newSpeed);
      if (userProfile?.planType !== 'manual') {
          const currentInv = calculateTotalInventory(inventory);
          const totalUsed = logs.reduce((a, b) => a + b.doseTaken, 0);
          const theoreticalInitial = currentInv + totalUsed;
          
          const newPlan = adjustPlan(plan, logs, theoreticalInitial, newSpeed);
          setPlan(newPlan);
          showToast(t('toast_speed_updated'));
      }
  };

  const resetAllData = async () => {
    if (confirm('Are you sure? This will wipe everything.')) {
      setLoading(true);
      localStorage.clear();
      setUserProfile(null);
      setPlan([]);
      setLogs([]);
      setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
      setAuthUser(null);
      setIsDemoMode(false);
      if (auth) try { await auth.signOut(); } catch (e) {}
      window.location.reload();
    }
  };

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

      {/* Mobile Back Button */}
      {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
          <button onClick={goBack} className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
      )}

      {/* Desktop Back Button */}
      {(viewHistory.length > 0 && currentView !== AppView.DASHBOARD) && (
          <button onClick={goBack} className="hidden md:flex fixed top-8 left-8 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors">
              {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </button>
      )}

      <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={handleLogout} userProfile={userProfile} />
      <MobileNav currentView={currentView} setCurrentView={navigateTo} />
      
      <div className="md:mr-80 p-4 md:p-12 pb-32 md:pb-12 transition-all duration-500">
        {currentView === AppView.DASHBOARD && (
            <DashboardView 
                userProfile={userProfile}
                plan={plan} logs={logs} todayPlan={todayPlan} todayLog={todayLog}
                progressPercentage={progressPercentage} totalDays={totalDays} daysCompleted={daysCompleted}
                showDoctorWarning={showDoctorWarning}
                selectedDose={selectedDose} setSelectedDose={setSelectedDose}
                selectedMood={selectedMood} setSelectedMood={setSelectedMood}
                submitDailyLog={submitDailyLog} handleFreezePlan={handleFreezePlan}
            />
        )}
        {currentView === AppView.CALENDAR && (
            <CalendarView plan={plan} logs={logs} todayDate={todayDate} userProfile={userProfile} />
        )}
        {currentView === AppView.STATS && (
            <StatsView logs={logs} plan={plan} userProfile={userProfile} />
        )} 
        {currentView === AppView.COMMUNITY && userProfile && (
            <CommunityView currentUser={{...userProfile, uid: authUser?.uid}} />
        )}
        {currentView === AppView.SUPPORT && userProfile && (
            <SupportView user={{...userProfile, uid: authUser?.uid}} />
        )}
        {currentView === AppView.ARTICLES && (
            <ArticlesView />
        )}
        {currentView === AppView.ADMIN && userProfile?.isAdmin && (
            <AdminView />
        )}
        {currentView === AppView.SETTINGS && (
            <LayoutContainer>
                <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
                <Card className="bg-slate-900 border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-indigo-400" /> {t('pace_control')}</h2>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl">{t('pace_desc')}</p>
                    {userProfile.planType === 'manual' ? (
                         <div className="p-8 bg-slate-950 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 text-center flex flex-col items-center gap-4"><ShieldCheck size={40} className="text-slate-700" /><p>Manual Plan Active</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button onClick={() => updateSpeedSettings(0.8)} className={`p-8 rounded-[2rem] border transition-all ${speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}><Clock size={32} className="mx-auto mb-4" /><span className="block font-bold">{t('pace_slow')}</span></button>
                            <button onClick={() => updateSpeedSettings(1.0)} className={`p-8 rounded-[2rem] border transition-all ${speedModifier >= 0.9 && speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}><ShieldCheck size={32} className="mx-auto mb-4" /><span className="block font-bold">{t('pace_balanced')}</span></button>
                            <button onClick={() => updateSpeedSettings(1.2)} className={`p-8 rounded-[2rem] border transition-all ${speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}><Zap size={32} className="mx-auto mb-4" /><span className="block font-bold">{t('pace_fast')}</span></button>
                        </div>
                    )}
                </Card>
                <Card className="border-rose-500/10 bg-rose-900/5 mt-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-rose-500"/> {t('danger_zone')}</h2>
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