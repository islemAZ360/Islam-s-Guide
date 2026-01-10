import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Zap, Clock, ShieldCheck, Check, ArrowRight, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { auth, googleProvider, db } from './services/firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore'; 
import { calculateTotalInventory, adjustPlan } from './services/taperingEngine';
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
import { DoctorDashboardView } from './views/DoctorDashboardView'; 
import { DoctorPatientsView } from './views/DoctorPatientsView';
import { SettingsView } from './views/SettingsView';

// Helper to add days safely
const addDaysSafe = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

function AppContent() {
  // -- State --
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New State for Resubmission Flow (Doctors & Patients)
  const [isResubmitting, setIsResubmitting] = useState(false);

  const { dir, t } = useLanguage();

  // App Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
  const [currentDoseHabit, setCurrentDoseHabit] = useState<number>(0);
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  
  // Speed Modifier
  const [speedModifier, setSpeedModifier] = useState<number>(1.0);
  
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dashboard Interaction
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<'bad' | 'normal' | 'good' | null>(null);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // -- 0. Auth State Listener --
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        if (!user && !isDemoMode) {
            setLoading(false);
            setUserProfile(null);
        }
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  // -- 1. FETCH CLOUD DATA (REAL-TIME LISTENER) --
  useEffect(() => {
    if (authUser) {
      setLoading(true);
      const docRef = doc(db, "users", authUser.uid);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const fetchedProfile = { ...data, uid: authUser.uid } as UserProfile;
            
            if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

            // Auto-redirect logic
            if (fetchedProfile.role === 'admin' && currentView !== AppView.ADMIN) {
                setCurrentView(AppView.ADMIN);
            } else if (fetchedProfile.role === 'doctor' && fetchedProfile.doctorData?.accountStatus === 'approved') {
                const allowedDoctorViews = [
                    AppView.DOCTOR_DASHBOARD, 
                    AppView.DOCTOR_PATIENTS, 
                    AppView.COMMUNITY,
                    AppView.ARTICLES,
                    AppView.SUPPORT,
                    AppView.SETTINGS
                ];
                if (!allowedDoctorViews.includes(currentView)) {
                     setCurrentView(AppView.DOCTOR_DASHBOARD);
                }
            }
            
            // Reset resubmitting state if status changes to pending (for doctors) or approved (for patients)
            if (fetchedProfile.role === 'doctor' && fetchedProfile.doctorData?.accountStatus === 'pending') {
                setIsResubmitting(false);
            }
            if (fetchedProfile.role === 'patient' && fetchedProfile.patientData?.requestStatus === 'pending') {
                setIsResubmitting(false);
            }

            setUserProfile(fetchedProfile);

            if (data.plan) setPlan(data.plan);
            if (data.logs) setLogs(data.logs);
            if (data.inventory) setInventory(data.inventory);
            if (data.speedModifier) setSpeedModifier(data.speedModifier);
            
            if (data.isBanned) {
               alert(t('banned_msg'));
               handleLogout();
            }
        } else {
            // New User - Skeleton
            const skeletonProfile: UserProfile = {
                uid: authUser.uid,
                email: authUser.email || '',
                name: authUser.displayName || 'New User',
                role: 'normal_user',
                setupComplete: false,
                durationMonths: 0
            };
            setUserProfile(skeletonProfile);
        }
        setLoading(false);
      }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [authUser]);

  // -- 2. SYNC TO LOCAL & CLOUD --
  useEffect(() => {
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    if (logs.length > 0) localStorage.setItem('taper_logs', JSON.stringify(logs));
    if (inventory.totalPills > 0 || inventory.boxes > 0) localStorage.setItem('taper_inventory', JSON.stringify(inventory));
    localStorage.setItem('taper_speed', speedModifier.toString());

    if (authUser && userProfile && userProfile.setupComplete) {
        const currentUser = authUser;
        const currentProfileData = { ...userProfile };
        
        // Safety Guard
        if (currentProfileData.role === 'doctor' && !currentProfileData.doctorData) {
            return;
        }

        const syncToCloud = async () => {
            try {
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

                const updateData: any = {
                    email: currentUser.email || email,   
                    uid: currentUser.uid,       
                    lastActive: new Date().toISOString(),
                    ...(currentProfileData.name ? { name: currentProfileData.name } : {})
                };

                if (currentProfileData.role === 'patient' || currentProfileData.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }

                await setDoc(doc(db, "users", currentUser.uid), updateData, { merge: true });
            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        };
        const timeoutId = setTimeout(syncToCloud, 5000); 
        return () => clearTimeout(timeoutId);
    }
  }, [userProfile, plan, logs, inventory, speedModifier, authUser]); 

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
      if (userProfile?.role === 'doctor') {
          setCurrentView(AppView.DOCTOR_DASHBOARD);
      } else if (userProfile?.role === 'admin') {
          setCurrentView(AppView.ADMIN);
      } else {
          setCurrentView(AppView.DASHBOARD);
      }
    }
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    if (email === 'admin@islamguide.com' && password === 'bombaAZ36') {
        if (!auth) { setLoginError("Firebase not initialized."); setLoading(false); return; }
        try {
            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                setAuthUser(cred.user);
            } catch (err: any) {
                 if (err.code === 'auth/user-not-found') {
                    const newCred = await createUserWithEmailAndPassword(auth, email, password);
                    setAuthUser(newCred.user);
                 } else {
                    throw err;
                 }
            }
            
            if (auth.currentUser) {
                const adminProfile: UserProfile = { 
                    uid: auth.currentUser.uid,
                    email: email, 
                    name: 'System Admin', 
                    role: 'admin', 
                    setupComplete: true, 
                    durationMonths: 0 
                };
                await setDoc(doc(db, "users", auth.currentUser.uid), adminProfile, { merge: true });
                setUserProfile(adminProfile);
                setCurrentView(AppView.ADMIN);
            }
        } catch (err: any) {
            setLoginError(err.message);
        }
        setLoading(false);
        return;
    }

    if (auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) { setLoginError('Login Error: ' + err.message); setLoading(false); }
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setLoading(true);
    if (auth) {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) { setLoginError('Google Login Error: ' + err.message); setLoading(false); }
    }
  };

  const setDemoCreds = () => { setEmail('islamaz@bomba.com'); setPassword('bombaAZ360'); }

  const handleLogout = () => {
    setAuthUser(null);
    setIsDemoMode(false);
    setUserProfile(null);
    setIsResubmitting(false); 
    setPlan([]);
    setLogs([]);
    setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
    setSpeedModifier(1.0);
    localStorage.clear();
    if (auth) auth.signOut().catch(console.error);
    window.location.reload();
  };

  // --- PLAN MANAGEMENT ---
  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    
    if (userProfile) {
        const newProfile: UserProfile = {
            ...userProfile,
            setupComplete: true,
            planType: planType,
            patientData: userProfile.role === 'patient' && userProfile.patientData ? {
                ...userProfile.patientData,
                isPlanAssigned: true 
            } : undefined
        };
        setUserProfile(newProfile);
    }
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    const currentTotal = calculateTotalInventory(inventory);
    const newTotal = Math.max(0, Math.round((currentTotal - selectedDose) * 100) / 100);
    
    const newInventory: Inventory = { ...inventory, totalPills: newTotal };
    if (inventory.pillsPerBox > 0) {
        newInventory.boxes = Math.floor(newTotal / inventory.pillsPerBox);
        newInventory.loosePills = Math.round((newTotal % inventory.pillsPerBox) * 100) / 100;
    } else {
        newInventory.loosePills = newTotal;
    }
    setInventory(newInventory);

    const today = new Date().toISOString().split('T')[0];
    const newLog: DailyLog = { 
        date: today, doseTaken: selectedDose, mood: selectedMood, sleepHours, symptoms 
    };
    const newLogs = [...logs.filter(l => l.date !== today), newLog];
    setLogs(newLogs);

    if (userProfile?.planType === 'algorithm') {
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
      let currentDateStr = today;
      
      for (let i = 0; i < 3; i++) {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({
              date: currentDateStr,
              plannedDose: freezeDose,
              isPast: false
          });
      }
      
      future.forEach(day => {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({ ...day, date: currentDateStr });
      });
      
      setPlan([...history, ...newPlanDays]);
      showToast(t('toast_freeze_success'));
  };

  const updateSpeedSettings = (newSpeed: number) => {
      setSpeedModifier(newSpeed);
      if (userProfile?.planType === 'algorithm') {
          const currentInv = calculateTotalInventory(inventory);
          const totalUsed = logs.reduce((a, b) => a + b.doseTaken, 0);
          const theoreticalInitial = currentInv + totalUsed;
          
          const newPlan = adjustPlan(plan, logs, theoreticalInitial, newSpeed);
          setPlan(newPlan);
          showToast(t('toast_speed_updated'));
      }
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }

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
  const daysCompleted = logs.length;
  const totalDays = plan.length;
  const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
  
  const recentLogs = logs.slice(-3);
  const badMoodCount = recentLogs.filter(l => l.mood === 'bad').length;
  const poorSleep = recentLogs.length >= 3 && (recentLogs.reduce((acc, l) => acc + (l.sleepHours || 7), 0) / 3) < 5;
  const showDoctorWarning = badMoodCount >= 3 || poorSleep;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-bold tracking-widest animate-pulse">LOADING SYSTEM...</div>;

  // 1. LOGIN SCREEN
  if (!authUser && !isDemoMode) {
    return <LoginView handleLogin={handleLogin} handleGoogleLogin={handleGoogleLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loginError={loginError} setDemoCreds={setDemoCreds} />;
  }

  // 2. ONBOARDING & RESUBMISSION
  if ((userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) || isResubmitting) {
    return <OnboardingView 
        userProfile={userProfile!} 
        setUserProfile={setUserProfile} 
        inventory={inventory} 
        setInventory={setInventory} 
        currentDoseHabit={currentDoseHabit} 
        setCurrentDoseHabit={setCurrentDoseHabit} 
        startPlan={startPlan} 
        email={authUser?.email || email} 
        handleLogout={handleLogout} 
    />;
  }

  // 3. MAIN APP ROUTING
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200" dir={dir}>
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* DOCTOR REJECTION SCREEN */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' ? (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">نأسف، تم رفض طلبك</h1>
              <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl max-w-lg w-full mb-8">
                  <h3 className="text-rose-400 font-bold mb-2 flex items-center justify-center gap-2">
                      <AlertTriangle size={18}/> سبب الرفض من الإدارة
                  </h3>
                  <p className="text-rose-200 leading-relaxed">
                      {userProfile.doctorData.rejectionReason || "لم يتم تحديد سبب. يرجى مراجعة البيانات."}
                  </p>
              </div>
              
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={handleLogout}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>
                      تعديل الطلب وإعادة الإرسال
                  </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                  محاولات هذا الشهر: {userProfile.doctorData.submissionCount || 1} / 10
              </p>
          </div>
      ) : userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'rejected' ? (
          /* PATIENT REJECTION SCREEN */
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">عذراً، تم رفض الطلب</h1>
              <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                  لم يتم قبول طلب انضمامك من قبل الطبيب <strong>{userProfile.patientData?.assignedDoctorName}</strong>. 
                  يمكنك المحاولة مع طبيب آخر.
              </p>
              
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={handleLogout}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>
                      اختيار طبيب آخر
                  </Button>
              </div>
          </div>
      ) : (
          /* Normal App Layout */
          <>
              {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
                  <button onClick={goBack} className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
                      {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  </button>
              )}

              <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={handleLogout} userProfile={userProfile} />
              <MobileNav currentView={currentView} setCurrentView={navigateTo} />
              
              <div className="md:mr-80 p-4 md:p-12 pb-32 md:pb-12 transition-all duration-500">
                
                {/* DOCTOR PENDING SCREEN */}
                {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-amber-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">الحساب قيد المراجعة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed">
                            شكراً لتسجيلك يا دكتور {userProfile.name}. طلبك الآن قيد المراجعة من قبل إدارة النظام للتحقق من بيانات الترخيص.
                            <br/><br/>
                            <span className="text-xs text-slate-500">سيتم توجيهك تلقائياً فور الاعتماد.</span>
                        </p>
                        <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-white/5 text-xs text-slate-500 font-mono">
                            Doctor ID: {authUser?.uid} <br/> License: {userProfile.doctorData?.licenseNumber}
                        </div>
                        <Button variant="secondary" onClick={handleLogout} className="mt-6 !px-6">تسجيل خروج</Button>
                    </div>
                ) : 

                /* PATIENT PENDING SCREEN (Waiting for Doctor Approval) */
                userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-blue-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('req_sent_msg')}</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            طلبك للانضمام إلى قائمة مرضى <strong>{userProfile.patientData?.assignedDoctorName}</strong> قيد المراجعة. 
                            يرجى الانتظار حتى يقوم الطبيب بقبول الطلب.
                        </p>
                        <Button variant="secondary" onClick={handleLogout} className="!px-6">تسجيل خروج</Button>
                    </div>
                ) :

                /* PATIENT WAITING FOR PLAN (Doctor Approved but No Plan Yet) */
                userProfile?.role === 'patient' && !userProfile.patientData?.isPlanAssigned ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                            <Loader2 size={48} className="text-indigo-500 animate-spin" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">تم القبول، بانتظار الخطة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            وافق الطبيب <strong>{userProfile.patientData?.assignedDoctorName}</strong> على انضمامك. 
                            يرجى الانتظار حتى يقوم بوضع الجدول العلاجي المناسب.
                        </p>
                        <Button onClick={() => setCurrentView(AppView.COMMUNITY)} variant="secondary">
                            دخول المجتمع مؤقتاً
                        </Button>
                    </div>
                ) : 

                /* MAIN DASHBOARDS */
                (
                    <>
                        {userProfile && (userProfile.role === 'normal_user' || (userProfile.role === 'patient' && userProfile.patientData?.isPlanAssigned)) && (
                            <>
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
                            </>
                        )}

                        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                            <>
                                {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                                {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                            </>
                        )}

                        {currentView === AppView.COMMUNITY && userProfile && (
                            <CommunityView currentUser={{...userProfile, uid: authUser?.uid}} />
                        )}
                        
                        {currentView === AppView.SUPPORT && userProfile && (
                            <SupportView user={{...userProfile, uid: authUser?.uid || ''}} />
                        )}
                        
                        {currentView === AppView.ARTICLES && (
                            <ArticlesView userProfile={userProfile ? { ...userProfile, uid: authUser?.uid } : null} />
                        )}
                        
                        {currentView === AppView.ADMIN && userProfile?.role === 'admin' && <AdminView />}
                        
                        {currentView === AppView.SETTINGS && userProfile && (
                            <SettingsView 
                                userProfile={userProfile}
                                resetAllData={resetAllData}
                                updateSpeedSettings={updateSpeedSettings}
                            />
                        )}
                    </>
                )}
              </div>
          </>
      )}
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