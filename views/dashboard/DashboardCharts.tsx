import React from 'react';
import { FlaskConical, Clock, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, PlanDay } from '../../types';

interface DashboardChartsProps {
    userProfile: UserProfile | null;
    plan: PlanDay[];
}

export const DashboardCharts = ({ userProfile, plan }: DashboardChartsProps) => {
    const { t } = useLanguage();
    
    const isLiquid = userProfile?.medForm === 'liquid';
    const isPatient = userProfile?.role === 'patient';
    const doctorName = userProfile?.patientData?.assignedDoctorName;

    return (
        <div className="space-y-6">
            {/* Plan Info Card */}
            <Card className="flex flex-col items-center justify-center text-center py-10 bg-slate-900/40">
                 <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-4 relative border border-white/5">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-[3000ms]"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400" />
                     )}
                 </div>
                 
                 {isPatient ? (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">الخطة العلاجية الحالية</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed mb-3">
                            هذه الخطة تم وضعها بواسطة <strong>د. {doctorName}</strong>. أي تغيير في الجرعات يجب أن يتم بعد استشارته.
                        </p>
                        <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                     </>
                 ) : (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">{t('algo_active')}</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed">
                          {t('algo_desc')}
                        </p>
                     </>
                 )}
            </Card>

            {/* Projection Chart Card */}
            <Card className="min-h-[250px] relative overflow-hidden bg-indigo-950/10" noPadding>
                <div className="p-6 pb-0 relative z-10">
                   <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                       {t('recovery_path')} <Info size={12} className="text-slate-500"/>
                   </h2>
                   <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">Projection</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 top-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={plan.slice(0, 14)}>
                        <defs>
                        <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="plannedDose" 
                            stroke="#818cf8" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorDose)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};