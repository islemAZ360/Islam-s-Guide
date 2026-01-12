import React, { useState } from 'react';
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope, Shield } from 'lucide-react';

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
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  return (
    <LayoutContainer>
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
            <div className="flex flex-wrap gap-3 items-center">
                <div className="hidden md:block"><LanguageSwitcher /></div>
                
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-lg hover:shadow-white/5 border-white/10">
                    <FileText size={16} className="mr-2" /> {t('export_report')}
                </Button>
                
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-rose-500/20">
                    <HeartPulse size={16} className="mr-2 animate-pulse" /> {t('sos_button')}
                </Button>
            </div>
        }
      />

      {/* 1. لافتة المريض (تظهر فقط للمرضى المرتبطين بأطباء) */}
      {isPatient && (
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 p-5 rounded-3xl flex items-center justify-between mb-8 backdrop-blur-xl shadow-lg animate-in slide-in-from-top-2 group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
              <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <Stethoscope size={28} />
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

      {/* 2. تحذير الأمان (Safety Guard) */}
      {showDoctorWarning && !isManualPlan && (
        <div className="relative overflow-hidden bg-rose-950/40 border border-rose-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-2xl shadow-rose-900/20 animate-in zoom-in duration-500 mb-8">
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30 shadow-inner">
                <AlertTriangle className="text-rose-500 w-8 h-8" />
            </div>
            <div>
                <h3 className="font-bold text-rose-200 text-xl mb-1 flex items-center gap-2">
                    {t('safety_active')} <Shield size={18} className="text-rose-400"/>
                </h3>
                <p className="text-rose-300/70 text-sm max-w-lg leading-relaxed">{t('safety_desc')}</p>
            </div>
          </div>
          <Button onClick={handleFreezePlan} variant="danger" className="w-full md:w-auto !py-3 !px-6 relative z-10 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40">
             <PauseCircle size={20} className="mr-2" /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

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
    </LayoutContainer>
  );
};