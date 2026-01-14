import React, { useMemo } from 'react';
import { FlaskConical, Clock, Info, ShieldCheck, BrainCircuit, Activity, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
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

    // 1. معالجة البيانات وتحسينها (Data Processing)
    const chartData = useMemo(() => {
        // حماية من البيانات الفارغة
        if (!plan || plan.length === 0) return [];

        // الخطوة الأهم: ترتيب التواريخ زمنياً لمنع تداخل الخطوط (مشكلة الدودة)
        const sortedPlan = [...plan].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // نأخذ عينة ذكية إذا كانت البيانات كثيرة جداً لتجنب الازدحام
        // لكن نحافظ على أول وآخر يوم دائماً
        return sortedPlan.map(p => ({
            fullDate: p.date,
            // تنسيق التاريخ للعرض (DD/MM)
            displayDate: new Date(p.date).toLocaleDateString(language, { day: '2-digit', month: '2-digit' }), 
            dose: p.plannedDose,
            // إضافة خاصية لمعرفة ما إذا كان هذا اليوم هو اليوم
            isToday: p.date === new Date().toISOString().split('T')[0]
        }));
    }, [plan, language]);

    // حساب نسبة التخفيض المتوقعة
    const startDose = chartData.length > 0 ? chartData[0].dose : 0;
    const endDose = chartData.length > 0 ? chartData[chartData.length - 1].dose : 0;
    const totalReduction = startDose > 0 ? Math.round(((startDose - endDose) / startDose) * 100) : 0;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
            
            {/* Status Card */}
            <Card className="flex flex-col items-center justify-center text-center py-8 border-white/10 relative overflow-hidden group bg-gradient-to-b from-[#0f172a] to-[#0b0f19]">
                 {/* خلفية تفاعلية */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                 
                 <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center mb-4 relative shadow-2xl group-hover:scale-110 transition-transform duration-500">
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
                            <h2 className="text-white font-bold text-base mb-2">
                                {language === 'ar' ? 'خطة طبية معتمدة' : 'Verified Medical Plan'}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-3 bg-slate-950/50 py-1.5 px-3 rounded-lg border border-white/5">
                                <ShieldCheck size={14} className="text-emerald-500" aria-hidden="true"/>
                                <span>{language === 'ar' ? `إشراف د. ${doctorName}` : `Dr. ${doctorName}`}</span>
                            </div>
                            <Badge color="indigo" className="mx-auto shadow-none bg-indigo-500/10 border-indigo-500/20">Fixed Protocol</Badge>
                         </div>
                     ) : (
                         <div className="relative z-10 px-6">
                            <h2 className="text-white font-bold text-base mb-2 flex items-center justify-center gap-2">
                                {t('algo_active')} <BrainCircuit size={16} className="text-amber-400" aria-hidden="true"/>
                            </h2>
                            <p className="text-slate-400 text-[10px] leading-relaxed max-w-[200px] mx-auto mb-3 opacity-70">
                              {t('algo_desc')}
                            </p>
                            <Badge color="emerald" className="shadow-none bg-emerald-500/10 border-emerald-500/20">Smart Engine v2.0</Badge>
                         </div>
                     )}
                 </section>
            </Card>

            {/* Projection Chart - الإصلاح الجذري */}
            <Card className="min-h-[320px] relative overflow-hidden border-white/10 bg-[#0b0f19] flex flex-col" noPadding>
                <header className="p-6 pb-2 relative z-10 flex justify-between items-start">
                   <div>
                       <h2 id="chart-title" className="text-base font-bold text-white mb-1 flex items-center gap-2">
                           <TrendingDown size={18} className="text-emerald-400" />
                           {t('recovery_path')} 
                       </h2>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                           {language === 'ar' ? `تخفيض متوقع: ${totalReduction}%` : `Projected Reduction: ${totalReduction}%`}
                       </p>
                   </div>
                   <div className="p-2 bg-white/5 rounded-lg">
                       <Activity size={16} className="text-slate-400"/>
                   </div>
                </header>
                
                <div className="flex-1 w-full min-h-[220px] relative z-10 px-2 pb-2">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDoseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                                <XAxis 
                                    dataKey="displayDate" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                    minTickGap={30} // منع تداخل التواريخ
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}}
                                    itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                                    labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '4px'}}
                                    formatter={(val) => [`${val} ${unitLabel}`, t('dose')]}
                                />
                                <Area 
                                    type="stepAfter" // استخدام stepAfter لتمثيل التغيير التدريجي في الجرعات بشكل أدق طبياً
                                    dataKey="dose" 
                                    stroke="#818cf8" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorDoseGradient)" 
                                    animationDuration={2000}
                                />
                                {/* خط مرجعي لليوم الحالي */}
                                <ReferenceLine x={chartData.find(d => d.isToday)?.displayDate} stroke="#10b981" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                            <Activity className="mb-2 opacity-20" size={32} /> 
                            {language === 'ar' ? 'لا توجد خطة مفعلة حالياً' : 'No active plan'}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};