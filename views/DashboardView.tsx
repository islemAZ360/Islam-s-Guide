import React, { useState } from 'react';
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope } from 'lucide-react';

// المكونات الأساسية
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// النوافذ المنبثقة
import { BreathingModal } from '../components/modals/BreathingModal';
import { DoctorReportModal } from '../components/modals/DoctorReportModal';

// المكونات الفرعية الجديدة للوحة التحكم
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
  const { t } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  return (
    <LayoutContainer>
      <BreathingModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <DoctorReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        userProfile={userProfile} 
        logs={logs} 
        plan={plan} 
      />
      
      <PageHeader 
        title={t('daily_report')}
        subtitle={`${t('welcome')} ${userProfile?.name || ''}`}
        action={
            <div className="flex flex-wrap gap-4 items-center">
                <div className="hidden md:block"><LanguageSwitcher /></div>
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2 !px-4 !text-sm !rounded-full">
                    <FileText size={16} /> {t('export_report')}
                </Button>
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2 !px-4 !text-sm !rounded-full">
                    <HeartPulse size={16} /> {t('sos_button')}
                </Button>
            </div>
        }
      />

      {/* Patient Specific Banner - يظهر فقط للمرضى التابعين لطبيب */}
      {isPatient && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between mb-6 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/40">
                      <Stethoscope size={24} />
                  </div>
                  <div>
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">تحت إشراف طبي</p>
                      <p className="text-white font-bold text-lg flex items-center gap-2">
                          د. {doctorName}
                          <Badge color="blue" className="!text-[10px] !py-0">معتمد</Badge>
                      </p>
                  </div>
              </div>
              <div className="text-left hidden md:block">
                  <span className="text-[10px] text-slate-400 block">نوع الخطة</span>
                  <span className="text-xs font-bold text-white">جدول طبي مخصص</span>
              </div>
          </div>
      )}

      {/* Safety Warning & Freeze Option */}
      {showDoctorWarning && !isManualPlan && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md animate-in zoom-in duration-500 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-4 rounded-full ring-1 ring-rose-500/30"><AlertTriangle className="text-rose-500 w-6 h-6" /></div>
            <div>
                <h3 className="font-bold text-rose-400 text-lg mb-1">{t('safety_active')}</h3>
                <p className="text-rose-200/70 text-sm max-w-lg">{t('safety_desc')}</p>
            </div>
          </div>
          <Button onClick={handleFreezePlan} className="!bg-rose-500 hover:!bg-rose-600 !border-rose-400 w-full md:w-auto">
             <PauseCircle size={18} /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Header & Interaction Area */}
        <DashboardHeader
            todayPlan={todayPlan}
            todayLog={todayLog}
            progressPercentage={progressPercentage}
            totalDays={totalDays}
            daysCompleted={daysCompleted}
            userProfile={userProfile}
        >
            {/* هذا المكون سيظهر فقط إذا لم يتم التسجيل اليوم (children) */}
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

        {/* Side Info Cards */}
        <div className="lg:col-span-4">
            <DashboardCharts userProfile={userProfile} plan={plan} />
        </div>

      </div>
    </LayoutContainer>
  );
};