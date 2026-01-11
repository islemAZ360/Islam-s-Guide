import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, XCircle, Clock, AlertTriangle } from 'lucide-react';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Logic & Types
import { calculateTotalInventory, adjustPlan } from './services/taperingEngine';
import { AppView, Inventory, DailyLog, PlanDay, UserProfile } from './types';

// Components & Views
import { Button } from './components/ui/Button';
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
        // 1. منطق الأدمن
        if (userProfile.role === 'admin' && currentView === AppView.DASHBOARD) {
            setCurrentView(AppView.ADMIN);
        } 
        
        // 2. منطق الطبيب
        else if (userProfile.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved') {
            const allowedDoctorViews = [
                AppView.DOCTOR_DASHBOARD, AppView.DOCTOR_PATIENTS, 
                AppView.COMMUNITY, AppView.ARTICLES, AppView.SUPPORT, AppView.SETTINGS
            ];
            if (!allowedDoctorViews.includes(currentView)) {
                 setCurrentView(AppView.DOCTOR_DASHBOARD);
            }
        }
        
        // 3. إعادة تعيين حالة إعادة الإرسال
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
            setupComplete: true, // هذا المهم لتفعيل الانتقال للوحة التحكم
            planType: planType,
            patientData: baseProfile.role === 'patient' && baseProfile.patientData ? {
                ...baseProfile.patientData,
                isPlanAssigned: true 
            } : undefined
        };
        setUserProfile(newProfile);
        // إعادة التوجيه للوحة التحكم مباشرة
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-indigo-400 gap-4" dir={dir}>
            <Loader2 size={48} className="animate-spin" />
            <span className="font-bold tracking-widest animate-pulse">LOADING SYSTEM...</span>
        </div>
      );
  }

  // 1. LOGIN SCREEN
  if (!currentUser && !isDemoMode) {
    return (
        <LoginView 
            handleLogin={handleLoginSubmit} 
            handleGoogleLogin={loginWithGoogle} 
            email={email} setEmail={setEmail} 
            password={password} setPassword={setPassword} 
            loginError={loginError || ''} 
            setDemoCreds={enableDemoMode} 
        />
    );
  }

  // 2. ONBOARDING & RESUBMISSION
  if ((userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) || isResubmitting) {
    return (
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
    );
  }

  // 3. MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200" dir={dir}>
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* REJECTION SCREEN - DOCTOR */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' && (
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
                  <Button variant="secondary" onClick={() => logout()}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>تعديل الطلب وإعادة الإرسال</Button>
              </div>
          </div>
      )}

      {/* REJECTION SCREEN - PATIENT */}
      {userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'rejected' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
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
          <>
              {/* Mobile Back Nav - Moved Top */}
              {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
                  <button onClick={goBack} className="fixed top-6 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
                      {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  </button>
              )}

              <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={logout} userProfile={userProfile} />
              <MobileNav currentView={currentView} setCurrentView={navigateTo} userProfile={userProfile} />
              
              {/* التعديل هنا: تم تقليل pb-32 إلى pb-24 ليتناسب مع شريط التنقل الأصغر */}
              <div className="md:mr-80 p-4 md:p-12 pb-24 md:pb-12 transition-all duration-500">
                
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
                    /* ACTIVE VIEWS - Main Routing */
                    <>
                        {/* 1. Normal Users & Active Patients */}
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

                        {/* 2. Doctors */}
                        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                            <>
                                {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                                {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                            </>
                        )}

                        {/* 3. Shared Views (Accessible by Admin and others) */}
                        {currentView === AppView.COMMUNITY && (
                            <CommunityView currentUser={{...userProfile!, uid: currentUser?.uid}} />
                        )}

                        {currentView === AppView.SUPPORT && (
                            <SupportView user={{...userProfile!, uid: currentUser?.uid || ''}} />
                        )}

                        {currentView === AppView.ARTICLES && (
                            <ArticlesView userProfile={userProfile ? { ...userProfile, uid: currentUser?.uid } : null} />
                        )}
                        
                        {/* 4. Admin Only */}
                        {currentView === AppView.ADMIN && userProfile?.role === 'admin' && (
                            <AdminView />
                        )}
                        
                        {/* 5. Settings */}
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
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}