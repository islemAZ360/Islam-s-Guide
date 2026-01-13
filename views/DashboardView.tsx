import React, { useState } from 'react';
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope, Shield, Package, Info } from 'lucide-react';

// المكونات الأساسية
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// النوافذ المنبثقة
import { BreathingModal } from '../components/modals/BreathingModal';
import { DoctorReportModal } from '../components/modals/DoctorReportModal';

// المكونات الفرعية للوحة التحكم
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DailyCheckIn } from './dashboard/DailyCheckIn';
import { DashboardCharts } from './dashboard/DashboardCharts';

import { UserProfile, PlanDay, DailyLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { calculateTotalInventory } from '../services/taperingEngine';

interface DashboardViewProps {
  userProfile: UserProfile | null;
  plan: PlanDay[];
  logs: DailyLog[];
  todayPlan: PlanDay | undefined;
  todayLog: DailyLog | undefined;
  progressPercentage: number;
  totalDays: number;
  daysCompleted: number;
  showDoctorWarning: boolean;
  selectedDose: number | null;
  setSelectedDose: (n: number | null) => void;
  selectedMood: 'bad' | 'normal' | 'good' | null;
  setSelectedMood: (m: 'bad' | 'normal' | 'good' | null) => void;
  submitDailyLog: (sleep: number, symptoms: string[]) => void;
  handleFreezePlan: () => void;
}

export const DashboardView = ({
  userProfile, plan, logs, todayPlan, todayLog, progressPercentage, 
  totalDays, daysCompleted, showDoctorWarning, 
  selectedDose, setSelectedDose, selectedMood, setSelectedMood, submitDailyLog,
  handleFreezePlan
}: DashboardViewProps) => {
  const { t, language } = useLanguage();
  const { inventory } = useData(); // Get inventory directly from context
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  // Inventory Calculation
  const totalStock = calculateTotalInventory(inventory);
  const currentDailyDose = todayPlan?.plannedDose || 0;
  // Estimate days left (safeguard against divide by zero)
  const daysSupply = currentDailyDose > 0 ? totalStock / currentDailyDose : 999;
  const isLowStock = daysSupply < 7 && totalStock > 0;

  return (
    <LayoutContainer>
      <main id="dashboard-content" className="relative space-y-8">
        {/* النوافذ المنبثقة */}
        <BreathingModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
        <DoctorReportModal 
          isOpen={isReportOpen} 
          onClose={() => setIsReportOpen(false)} 
          userProfile={userProfile} 
          logs={logs} 
          plan={plan} 
        />
        
        {/* ترويسة الصفحة مع الأزرار العلوية */}
        <PageHeader 
          title={t('daily_report')}
          subtitle={`${t('welcome')}, ${userProfile?.name || ''}`}
          action={
              <div className="flex flex-wrap gap-3 items-center" role="toolbar" aria-label="Dashboard Actions">
                  <div className="hidden md:block"><LanguageSwitcher /></div>
                  
                  <Button 
                    onClick={() => setIsReportOpen(true)} 
                    variant="secondary" 
                    className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-lg hover:shadow-white/5 border-white/10 focus:ring-slate-500"
                    aria-label={t('export_report')}
                  >
                      <FileText size={16} className="mr-2" aria-hidden="true" /> {t('export_report')}
                  </Button>
                  
                  <Button 
                    variant="panic" 
                    onClick={() => setIsSosOpen(true)} 
                    className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-rose-500/20 focus:ring-rose-500"
                    aria-label={t('sos_button')}
                  >
                      <HeartPulse size={16} className="mr-2 animate-pulse" aria-hidden="true" /> {t('sos_button')}
                  </Button>
              </div>
          }
        />

        {/* 1. لافتة المريض (تظهر فقط للمرضى المرتبطين بأطباء) */}
        {isPatient && (
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl shadow-lg animate-in slide-in-from-top-2 group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                        <Stethoscope size={28} aria-hidden="true" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">تحت إشراف طبي</p>
                            <Badge color="blue" className="!py-0 !px-1.5 !text-[9px] border-blue-400/30 bg-blue-500/10">VERIFIED</Badge>
                        </div>
                        <p className="text-white font-bold text-lg">د. {doctorName}</p>
                    </div>
                </div>
                <div className="hidden md:block text-right relative z-10 opacity-70">
                    <span className="text-[10px] text-slate-300 block font-mono mb-1">PLAN ID</span>
                    <span className="text-xs font-bold text-white tracking-widest">#{userProfile?.uid?.slice(0,8).toUpperCase()}</span>
                </div>
            </div>
        )}

        {/* 2. تحذيرات النظام (Doctor Notes & Safety Guard & Inventory) */}
        <div className="space-y-4">
            
            {/* أ. ملاحظات الطبيب */}
            {userProfile?.doctorNotes && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-3xl animate-in slide-in-from-top-2 flex gap-4 items-start">
                    <div className="p-2 bg-indigo-500/20 rounded-xl shrink-0 text-indigo-400 mt-1">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-indigo-300 font-bold text-sm mb-1">{language === 'ar' ? 'ملاحظات الطبيب' : 'Doctor\'s Instructions'}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{userProfile.doctorNotes}</p>
                    </div>
                </div>
            )}

            {/* ب. تحذير الأمان (Safety Guard) */}
            {showDoctorWarning && !isManualPlan && (
              <div 
                className="relative overflow-hidden bg-rose-950/60 border border-rose-500/50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-2xl shadow-rose-900/20 animate-in zoom-in duration-500 ring-1 ring-rose-500/50"
                role="alert"
                aria-live="assertive"
              >
                <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30 shadow-inner">
                      <AlertTriangle className="text-rose-400 w-8 h-8" aria-hidden="true" />
                  </div>
                  <div>
                      <h3 className="font-bold text-white text-xl mb-1 flex items-center gap-2">
                          {t('safety_active')} <Shield size={18} className="text-rose-400" aria-hidden="true"/>
                      </h3>
                      <p className="text-rose-100 text-sm max-w-lg leading-relaxed font-medium">{t('safety_desc')}</p>
                  </div>
                </div>
                <Button 
                    onClick={handleFreezePlan} 
                    variant="danger" 
                    className="w-full md:w-auto !py-3 !px-6 relative z-10 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 focus:ring-rose-400"
                    aria-label={t('freeze_plan_btn')}
                >
                   <PauseCircle size={20} className="mr-2" aria-hidden="true" /> {t('freeze_plan_btn')}
                </Button>
              </div>
            )}

            {/* ج. تحذير انخفاض المخزون */}
            {isLowStock && (
                <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl animate-in slide-in-from-bottom-2 flex items-center gap-3 text-sm">
                    <Package size={20} className="text-amber-500 shrink-0 animate-bounce" />
                    <span className="text-amber-200">
                        {language === 'ar' 
                            ? `تنبيه: المخزون المتبقي يكفي لـ ${Math.round(daysSupply)} أيام فقط. يرجى توفير الدواء لضمان استمرار الخطة.`
                            : `Warning: Remaining stock lasts for ~${Math.round(daysSupply)} days. Please restock to maintain the plan.`}
                    </span>
                </div>
            )}
        </div>

        {/* 3. الشبكة الرئيسية (Main Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* العمود الرئيسي: الرأس + تسجيل الدخول */}
          <DashboardHeader
              todayPlan={todayPlan}
              todayLog={todayLog}
              progressPercentage={progressPercentage}
              totalDays={totalDays}
              daysCompleted={daysCompleted}
              userProfile={userProfile}
          >
              {/* نموذج التسجيل اليومي (يظهر داخل الهيدر) */}
              <DailyCheckIn 
                  userProfile={userProfile}
                  todayPlan={todayPlan}
                  selectedDose={selectedDose}
                  setSelectedDose={setSelectedDose}
                  selectedMood={selectedMood}
                  setSelectedMood={setSelectedMood}
                  submitDailyLog={submitDailyLog}
              />
          </DashboardHeader>

          {/* العمود الجانبي: الرسوم البيانية والمعلومات */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              <DashboardCharts userProfile={userProfile} plan={plan} />
          </div>

        </div>
      </main>
    </LayoutContainer>
  );
};