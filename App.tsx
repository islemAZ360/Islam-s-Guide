import React, { useState, useEffect, Suspense } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, XCircle, Clock, AlertTriangle, Phone, Activity } from 'lucide-react';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Logic & Types
import { calculateTotalInventory, adjustPlan } from './services/taperingEngine';
import { AppView, Inventory, DailyLog, PlanDay, UserProfile } from './types';

// Components (Eager Load Core UI)
import { Button } from './components/ui/Button';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav'; 
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy Load Views (Performance Optimization)
// This splits the code into smaller chunks, so Admin code isn't loaded for normal users, etc.
const LoginView = React.lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));
const OnboardingView = React.lazy(() => import('./views/OnboardingView').then(m => ({ default: m.OnboardingView })));
const DashboardView = React.lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const CalendarView = React.lazy(() => import('./views/CalendarView').then(m => ({ default: m.CalendarView })));
const StatsView = React.lazy(() => import('./views/StatsView').then(m => ({ default: m.StatsView })));
const AdminView = React.lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));
const CommunityView = React.lazy(() => import('./views/CommunityView').then(m => ({ default: m.CommunityView })));
const SupportView = React.lazy(() => import('./views/SupportView').then(m => ({ default: m.SupportView })));
const ArticlesView = React.lazy(() => import('./views/ArticlesView').then(m => ({ default: m.ArticlesView })));
const DoctorDashboardView = React.lazy(() => import('./views/DoctorDashboardView').then(m => ({ default: m.DoctorDashboardView })));
const DoctorPatientsView = React.lazy(() => import('./views/DoctorPatientsView').then(m => ({ default: m.DoctorPatientsView })));
const SettingsView = React.lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));

// Helper to add days safely
const addDaysSafe = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

// --- Loading Fallback Component ---
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-indigo-400 animate-in fade-in duration-300">
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
      <Loader2 size={40} className="animate-spin relative z-10" />
    </div>
    <span className="mt-4 text-sm font-bold tracking-widest opacity-70">LOADING...</span>
  </div>
);

// --- Medical Disclaimer Component ---
const MedicalSafetyBanner = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="w-full bg-amber-950/40 border-b border-amber-500/20 backdrop-blur-md relative z-[100] print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-start">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs md:text-sm">
          <AlertTriangle size={16} className="shrink-0 animate-pulse" />
          <span>
            {isAr 
              ? "تنبيه هام: هذا الموقع يوفر أدوات مساعدة فقط ولا يُعد بديلاً عن الاستشارة الطبية المتخصصة."
              : "Medical Disclaimer: This site provides support tools only and is NOT a substitute for professional medical advice."}
          </span>
        </div>
        <div className="hidden md:block w-px h-4 bg-amber-500/20 mx-2"></div>
        <a href="tel:112" className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          <Phone size={12} />
          {isAr ? "للطوارئ: اتصل بالإسعاف فوراً" : "Emergency? Call Local Services"}
        </a>
      </div>
    </div>
  );
};

function AppContent() {
  // -- Context Hooks --
  const { 
    currentUser, loading: authLoading, 
    loginWithEmail, loginWithGoogle, logout, error: loginError, 
    enableDemoMode, clearError, isDemoMode 
  } = useAuth();

  const { 
    userProfile, setUserProfile, 
    inventory, setInventory, 
    plan, setPlan, 
    logs, setLogs, 
    speedModifier, setSpeedModifier,
    dataLoading, resetAllData 
  } = useData();

  const { dir, t } = useLanguage();

  // -- Local UI State --
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Onboarding specific state
  const [currentDoseHabit, setCurrentDoseHabit] = useState<number>(0);

  // Dashboard Interaction
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<'bad' | 'normal' | 'good' | null>(null);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // -- Routing Logic --
  useEffect(() => {
    if (userProfile) {
        // 1. Admin Logic
        if (userProfile.role === 'admin' && currentView === AppView.DASHBOARD) {
            setCurrentView(AppView.ADMIN);
        } 
        
        // 2. Doctor Logic
        else if (userProfile.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved') {
            const allowedDoctorViews = [
                AppView.DOCTOR_DASHBOARD, AppView.DOCTOR_PATIENTS, 
                AppView.COMMUNITY, AppView.ARTICLES, AppView.SUPPORT, AppView.SETTINGS
            ];
            if (!allowedDoctorViews.includes(currentView)) {
                 setCurrentView(AppView.DOCTOR_DASHBOARD);
            }
        }
        
        // 3. Reset Resubmit State
        if (userProfile.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending') {
            setIsResubmitting(false);
        }
        if (userProfile.role === 'patient' && userProfile.patientData?.requestStatus === 'pending') {
            setIsResubmitting(false);
        }
    }
  }, [userProfile, currentView]);

  // -- Navigation Handlers --
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
      const defaultView = userProfile?.role === 'doctor' ? AppView.DOCTOR_DASHBOARD : 
                          userProfile?.role === 'admin' ? AppView.ADMIN : AppView.DASHBOARD;
      setCurrentView(defaultView);
    }
  };

  // -- Logic Handlers --
  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      await loginWithEmail(email, password);
  };

  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    
    if (userProfile) {
        const baseProfile = userProfile as UserProfile;
        const newProfile: UserProfile = {
            ...baseProfile,
            setupComplete: true,
            planType: planType,
            patientData: baseProfile.role === 'patient' && baseProfile.patientData ? {
                ...baseProfile.patientData,
                isPlanAssigned: true 
            } : undefined
        };
        setUserProfile(newProfile);
        setCurrentView(AppView.DASHBOARD);
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
        const newPlan = adjustPlan(plan, newLogs, theoreticalInitial, speedModifier, userProfile.medForm || 'tablet');
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
          
          const newPlan = adjustPlan(plan, logs, theoreticalInitial, newSpeed, userProfile.medForm || 'tablet');
          setPlan(newPlan);
          showToast(t('toast_speed_updated'));
      }
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }

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

  if (authLoading || dataLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-indigo-400 gap-4" dir={dir}>
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
            <Loader2 size={48} className="animate-spin relative z-10" />
            <span className="font-bold tracking-widest animate-pulse relative z-10">LOADING SYSTEM...</span>
        </div>
      );
  }

  // 1. LOGIN SCREEN
  if (!currentUser && !isDemoMode) {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <MedicalSafetyBanner />
            <div className="flex-1 flex items-center justify-center">
                <Suspense fallback={<PageLoader />}>
                    <LoginView 
                        handleLogin={handleLoginSubmit} 
                        handleGoogleLogin={loginWithGoogle} 
                        email={email} setEmail={setEmail} 
                        password={password} setPassword={setPassword} 
                        loginError={loginError || ''} 
                        setDemoCreds={enableDemoMode} 
                    />
                </Suspense>
            </div>
        </div>
    );
  }

  // 2. ONBOARDING & RESUBMISSION
  if ((userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) || isResubmitting) {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <MedicalSafetyBanner />
            <div className="flex-1">
                <Suspense fallback={<PageLoader />}>
                    <OnboardingView 
                        userProfile={userProfile!} 
                        setUserProfile={setUserProfile} 
                        inventory={inventory} 
                        setInventory={setInventory} 
                        currentDoseHabit={currentDoseHabit} 
                        setCurrentDoseHabit={setCurrentDoseHabit} 
                        startPlan={startPlan} 
                        email={currentUser?.email || email} 
                        handleLogout={logout} 
                    />
                </Suspense>
            </div>
        </div>
    );
  }

  // 3. MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-x-hidden selection:bg-indigo-500/30 flex flex-col" dir={dir}>
      
      <MedicalSafetyBanner />

      {/* --- Ambient Background Effects --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-40 delay-1000"></div>
      </div>

      {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2 border border-white/10">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* REJECTION SCREEN - DOCTOR */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">نأسف، تم رفض طلبك</h1>
              <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl max-w-lg w-full mb-8 backdrop-blur-sm">
                  <h3 className="text-rose-400 font-bold mb-2 flex items-center justify-center gap-2">
                      <AlertTriangle size={18}/> سبب الرفض من الإدارة
                  </h3>
                  <p className="text-rose-200 leading-relaxed">
                      {userProfile.doctorData.rejectionReason || "لم يتم تحديد سبب. يرجى مراجعة البيانات."}
                  </p>
              </div>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => logout()}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>تعديل الطلب وإعادة الإرسال</Button>
              </div>
          </div>
      )}

      {/* REJECTION SCREEN - PATIENT */}
      {userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'rejected' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">عذراً، تم رفض الطلب</h1>
              <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                  لم يتم قبول طلب انضمامك من قبل الطبيب. يمكنك المحاولة مع طبيب آخر.
              </p>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => logout()}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>اختيار طبيب آخر</Button>
              </div>
          </div>
      )}

      {/* NORMAL APP FLOW */}
      {!(userProfile?.doctorData?.accountStatus === 'rejected' || userProfile?.patientData?.requestStatus === 'rejected') && (
          <div className="flex-1 flex flex-col md:flex-row h-full">
              {/* Mobile Back Nav */}
              {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
                  <button onClick={goBack} className="fixed top-24 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
                      {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  </button>
              )}

              <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={logout} userProfile={userProfile} />
              <MobileNav currentView={currentView} setCurrentView={navigateTo} userProfile={userProfile} />
              
              <div className="flex-1 md:mr-80 p-4 md:p-12 pb-24 md:pb-12 transition-all duration-500 relative z-10">
                
                {/* PENDING SCREENS */}
                {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-amber-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">الحساب قيد المراجعة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            طلبك قيد المراجعة من الإدارة. سيتم توجيهك تلقائياً فور الاعتماد.
                        </p>
                        <Button variant="secondary" onClick={() => logout()} className="!px-6">تسجيل خروج</Button>
                    </div>
                ) : userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-blue-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('req_sent_msg')}</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            طلبك للانضمام قيد المراجعة من قبل الطبيب.
                        </p>
                        <Button variant="secondary" onClick={() => logout()} className="!px-6">تسجيل خروج</Button>
                    </div>
                ) : userProfile?.role === 'patient' && !userProfile.patientData?.isPlanAssigned ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                            <Loader2 size={48} className="text-indigo-500 animate-spin" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">تم القبول، بانتظار الخطة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            وافق الطبيب على انضمامك. يرجى الانتظار حتى يقوم بوضع الجدول العلاجي.
                        </p>
                        <Button onClick={() => setCurrentView(AppView.COMMUNITY)} variant="secondary">
                            دخول المجتمع مؤقتاً
                        </Button>
                    </div>
                ) : (
                    /* ACTIVE VIEWS - Main Routing with Suspense */
                    <Suspense fallback={<PageLoader />}>
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
                                {currentView === AppView.CALENDAR && <CalendarView plan={plan} logs={logs} todayDate={todayDate} userProfile={userProfile} />}
                                {currentView === AppView.STATS && <StatsView logs={logs} plan={plan} userProfile={userProfile} />} 
                            </>
                        )}

                        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                            <>
                                {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                                {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                            </>
                        )}

                        {currentView === AppView.COMMUNITY && (
                            <CommunityView currentUser={{...userProfile!, uid: currentUser?.uid}} />
                        )}

                        {currentView === AppView.SUPPORT && (
                            <SupportView user={{...userProfile!, uid: currentUser?.uid || ''}} />
                        )}

                        {currentView === AppView.ARTICLES && (
                            <ArticlesView userProfile={userProfile ? { ...userProfile, uid: currentUser?.uid } : null} />
                        )}
                        
                        {currentView === AppView.ADMIN && userProfile?.role === 'admin' && (
                            <AdminView />
                        )}
                        
                        {currentView === AppView.SETTINGS && userProfile && (
                            <SettingsView 
                                userProfile={userProfile} 
                                resetAllData={resetAllData} 
                                updateSpeedSettings={updateSpeedSettings} 
                            />
                        )}
                    </Suspense>
                )}
              </div>
          </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}