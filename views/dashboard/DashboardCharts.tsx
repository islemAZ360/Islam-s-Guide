import React, { useMemo } from 'react';
import { FlaskConical, Clock, Info, ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, PlanDay } from '../../types';

interface DashboardChartsProps {
    userProfile: UserProfile | null;
    plan: PlanDay[];
}

export const DashboardCharts = ({ userProfile, plan }: DashboardChartsProps) => {
    const { t, language } = useLanguage();
    
    const isLiquid = userProfile?.medForm === 'liquid';
    const isPatient = userProfile?.role === 'patient';
    const doctorName = userProfile?.patientData?.assignedDoctorName;
    const unitLabel = userProfile?.medUnit || 'mg';

    // Prepare chart data (First 30 days)
    // FIX: Sort plan by date to prevent "zigzag" lines if plan array is unsorted
    const chartData = useMemo(() => {
        return [...plan]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 30)
            .map(p => ({
                fullDate: p.date,
                displayDate: p.date.slice(5), // MM-DD
                dose: p.plannedDose
            }));
    }, [plan]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* Status Card */}
            <Card className="flex flex-col items-center justify-center text-center py-10 border-white/10 relative overflow-hidden group">
                 {/* Decorative Background */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500" aria-hidden="true"></div>
                 
                 <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-white/5 flex items-center justify-center mb-6 relative shadow-2xl shadow-black/50 group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400 relative z-10" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400 relative z-10" />
                     )}
                 </div>
                 
                 <section aria-label={language === 'ar' ? 'حالة الخطة' : 'Plan Status'}>
                     {isPatient ? (
                         <div className="relative z-10 px-6">
                            <h2 className="text-white font-bold text-lg mb-2">
                                {language === 'ar' ? 'خطة طبية معتمدة' : 'Verified Medical Plan'}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4 bg-slate-900/50 py-2 px-4 rounded-xl border border-white/5">
                                <ShieldCheck size={16} className="text-emerald-500" aria-hidden="true"/>
                                <span>{language === 'ar' ? `إشراف د. ${doctorName}` : `Dr. ${doctorName}`}</span>
                            </div>
                            <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                         </div>
                     ) : (
                         <div className="relative z-10 px-6">
                            <h2 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                {t('algo_active')} <BrainCircuit size={18} className="text-amber-400" aria-hidden="true"/>
                            </h2>
                            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto mb-4">
                              {t('algo_desc')}
                            </p>
                            <Badge color="emerald">Smart Engine v2.0</Badge>
                         </div>
                     )}
                 </section>
            </Card>

            {/* Projection Chart */}
            <Card className="min-h-[280px] relative overflow-hidden border-white/10" noPadding>
                <section aria-labelledby="chart-title" className="h-full flex flex-col">
                    <header className="p-6 pb-0 relative z-10 flex justify-between items-start">
                       <div>
                           <h2 id="chart-title" className="text-base font-bold text-white mb-1 flex items-center gap-2">
                               {t('recovery_path')} 
                               <div className="group/tooltip relative">
                                   <Info size={14} className="text-slate-500 hover:text-white transition-colors cursor-help" aria-hidden="true"/>
                                   <span className="sr-only">{language === 'ar' ? 'معلومات التوقع' : 'Projection Info'}</span>
                               </div>
                           </h2>
                           <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">
                               {language === 'ar' ? 'توقعات 30 يوم' : '30 Days Projection'}
                           </p>
                       </div>
                    </header>
                    
                    <div className="absolute inset-x-0 bottom-0 top-16" aria-hidden="true">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                        itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                                        labelStyle={{display: 'none'}}
                                        formatter={(val) => [`${val} ${unitLabel}`, t('dose')]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="dose" 
                                        stroke="#818cf8" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorDose)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                <Activity className="mr-2 opacity-50" /> 
                                {language === 'ar' ? 'لا توجد بيانات للعرض' : 'No data to display'}
                            </div>
                        )}
                    </div>

                    {/* Hidden Table for Screen Readers */}
                    <div className="sr-only">
                        <table>
                            <caption>{language === 'ar' ? 'جدول توقعات الجرعة لمدة 30 يوم' : '30-day Dose Projection Table'}</caption>
                            <thead>
                                <tr>
                                    <th scope="col">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                    <th scope="col">{t('dose')} ({unitLabel})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.fullDate}</td>
                                        <td>{row.dose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Card>
        </div>
    );
};