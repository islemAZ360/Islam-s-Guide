import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, ComposedChart, Line, Legend
} from 'recharts';
import { 
    Activity, Zap, Moon, Shield, BrainCircuit, 
    TrendingUp, TrendingDown, Dna, Microscope, Sparkles
} from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { DailyLog, PlanDay, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateSmartAnalytics } from '../services/analyticsEngine';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

// مكون فرعي لبطاقة القياس (Metric Card)
const MetricCard = ({ title, value, unit, icon: Icon, trend, color, subtext }: any) => {
    // Dynamic color mapping
    const colorClasses: Record<string, string> = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20 group-hover:border-rose-500/40',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40',
    };

    const activeColor = colorClasses[color] || colorClasses.indigo;
    const barColor = color === 'rose' ? 'bg-rose-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500';

    return (
        <div className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 group hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-2xl">
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors ${barColor}`}></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl border transition-colors ${activeColor}`}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend === 'up' ? 'Pos' : 'Neg'}
                        </div>
                    )}
                </div>
                
                <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white tracking-tight">{value}</span>
                        <span className="text-sm text-slate-500 font-bold">{unit}</span>
                    </div>
                    {subtext && <p className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-1 opacity-70">{subtext}</p>}
                </div>
            </div>

            {/* Progress Bar at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20">
                <div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, typeof value === 'number' ? value : 0)}%` }}></div>
            </div>
        </div>
    );
};

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t, language } = useLanguage();
    
    // --- استدعاء المحرك الذكي ---
    const analytics = useMemo(() => {
        return generateSmartAnalytics(userProfile || null, logs, plan);
    }, [logs, plan, userProfile]);

    const hasData = logs.length >= 2;

    // دمج البيانات للرسم البياني المركب
    const comboChartData = analytics.chartData.dates.map((date, i) => ({
        date: date.slice(5), // MM-DD
        wellness: analytics.chartData.wellness[i],
        dose: analytics.chartData.dose[i],
        sleep: analytics.chartData.sleep[i]
    }));

    return (
      <LayoutContainer>
          <PageHeader 
            title={language === 'ar' ? "غرفة التحليل العصبي" : "Neuro-Analytics Cockpit"}
            subtitle={language === 'ar' ? "نظام تحليل البيانات الحيوية المتقدم." : "Advanced biometric data processing unit."}
            action={
                <Badge color="emerald" className="py-2 px-4 text-xs shadow-lg shadow-emerald-500/20 bg-emerald-500/10 border-emerald-500/20">
                    <Microscope size={14} className="mr-2 animate-pulse"/> 
                    {language === 'ar' ? "المحرك الذكي: نشط" : "NEURO-ENGINE: ACTIVE"}
                </Badge>
            }
          />

          {!hasData ? (
              <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-[3rem] bg-gradient-to-b from-[#0f172a] to-[#020617] animate-in fade-in relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                  <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/30 relative z-10">
                      <Activity size={40} className="text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
                      {language === 'ar' ? "بانتظار تدفق البيانات..." : "Awaiting Data Stream..."}
                  </h3>
                  <p className="text-slate-400 max-w-md relative z-10">
                      {language === 'ar' 
                        ? "نحتاج لبيانات يومين على الأقل لتفعيل الخوارزميات وبدء التحليل العصبي." 
                        : "Requires at least 2 days of logs to initialize the neural analysis algorithms."}
                  </p>
              </div>
          ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                  
                  {/* 1. Top Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard 
                          title={language === 'ar' ? "مؤشر العافية" : "Wellness Score"}
                          value={analytics.recoveryScore}
                          unit="/100"
                          icon={BrainCircuit}
                          color="indigo"
                          trend={analytics.trend === 'improving' ? 'up' : analytics.trend === 'declining' ? 'down' : null}
                          subtext={language === 'ar' ? "حالة التعافي العصبية" : "Neuro-Recovery Status"}
                      />
                      <MetricCard 
                          title={language === 'ar' ? "المرونة البيولوجية" : "Bio-Resilience"}
                          value={analytics.bioScore}
                          unit="/100"
                          icon={Dna}
                          color="blue"
                          subtext={language === 'ar' ? "قدرة الجسم الأيضية" : "Metabolic Capacity"}
                      />
                      <MetricCard 
                          title={language === 'ar' ? "جودة النوم" : "Sleep Quality"}
                          value={analytics.sleepAnalysis.average}
                          unit="hrs"
                          icon={Moon}
                          color={analytics.sleepAnalysis.average >= 7 ? 'emerald' : 'rose'}
                          subtext={analytics.sleepAnalysis.quality}
                      />
                      <MetricCard 
                          title={language === 'ar' ? "الاستقرار المتوقع" : "Stability Index"}
                          value={analytics.predictedStability}
                          unit="%"
                          icon={Shield}
                          color="amber"
                          subtext={language === 'ar' ? "مخاطر الانتكاس: منخفضة" : "Relapse Risk: Calculated"}
                      />
                  </div>

                  {/* 2. Main Analytics Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Changed section to div to avoid potential namespace collision */}
                      <div className="lg:col-span-2 h-full">
                          <Card className="h-full bg-[#0f172a] border-white/5 relative overflow-hidden flex flex-col min-h-[500px] rounded-[2.5rem] shadow-2xl">
                              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                  <TrendingUp size={150} className="text-white" />
                              </div>
                              
                              <div className="relative z-10 mb-8 p-2">
                                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                      <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Activity size={20} /></div>
                                      {language === 'ar' ? "تحليل الارتباط الحيوي" : "Bio-Correlation Analysis"}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 ml-12">
                                      Dose vs. Sleep vs. Wellness
                                  </p>
                              </div>

                              <div className="flex-1 w-full min-h-[350px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <ComposedChart data={comboChartData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                                          <defs>
                                              <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                                          <XAxis dataKey="date" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={15} />
                                          <YAxis yAxisId="left" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                          <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} domain={[0, 100]} />
                                          
                                          <Tooltip 
                                              contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                              itemStyle={{fontSize: '12px', fontWeight: 'bold', padding: '2px 0'}}
                                              labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px'}}
                                              cursor={{stroke: '#ffffff10', strokeWidth: 2}}
                                          />
                                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />

                                          <Area yAxisId="right" type="monotone" dataKey="wellness" name={language === 'ar' ? "مؤشر العافية" : "Wellness Score"} stroke="#10b981" fill="url(#colorWellness)" strokeWidth={3} />
                                          <Bar yAxisId="left" dataKey="dose" name={language === 'ar' ? "الجرعة" : "Dose"} barSize={20} fill="#6366f1" radius={[6, 6, 0, 0]} />
                                          <Line yAxisId="left" type="monotone" dataKey="sleep" name={language === 'ar' ? "النوم" : "Sleep"} stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#0f172a'}} />
                                      </ComposedChart>
                                  </ResponsiveContainer>
                              </div>
                          </Card>
                      </div>

                      {/* 3. AI Insights Panel (Feed Style) */}
                      {/* Changed section to div to avoid potential namespace collision */}
                      <div className="h-full">
                          <Card className="h-full bg-gradient-to-b from-[#0f172a] to-[#020617] border-white/5 p-0 overflow-hidden flex flex-col rounded-[2.5rem] shadow-2xl">
                              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                  <h3 className="text-white font-bold flex items-center gap-3 text-lg">
                                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400"><Zap size={20} /></div>
                                      {language === 'ar' ? "تحليلات الذكاء" : "AI Insights"}
                                  </h3>
                                  <Sparkles size={16} className="text-amber-400 animate-pulse" />
                              </div>
                              
                              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                                  {analytics.insights.length > 0 ? (
                                      analytics.insights.map((insight, idx) => (
                                          <div key={idx} className="flex gap-4 p-5 rounded-[1.5rem] bg-[#1e293b]/30 border border-white/5 hover:border-indigo-500/30 transition-all group hover:bg-[#1e293b]/50">
                                              <div className="shrink-0 mt-1">
                                                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] group-hover:animate-pulse"></div>
                                                  <div className="w-0.5 h-full bg-gradient-to-b from-indigo-500/50 to-transparent mx-auto mt-2"></div>
                                              </div>
                                              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                  {insight}
                                              </p>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center">
                                          <BrainCircuit size={32} className="mb-4 opacity-20" />
                                          {language === 'ar' ? "جاري معالجة البيانات..." : "Processing neural data..."}
                                      </div>
                                  )}

                                  {/* Symptom Burden Widget */}
                                  <div className="mt-8 pt-6 border-t border-white/5 px-2">
                                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                          <span>{language === 'ar' ? "عبء الأعراض" : "Symptom Load"}</span>
                                          <span className={analytics.symptomBurden > 50 ? "text-rose-400" : "text-emerald-400"}>
                                              {analytics.symptomBurden > 50 ? (language === 'ar' ? "مرتفع" : "HIGH") : (language === 'ar' ? "طبيعي" : "NORMAL")}
                                          </span>
                                      </div>
                                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                          <div 
                                              className={`h-full transition-all duration-1000 ${analytics.symptomBurden > 50 ? 'bg-gradient-to-r from-rose-600 to-pink-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'}`} 
                                              style={{ width: `${analytics.symptomBurden}%` }}
                                          ></div>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      </div>
                  </div>
              </div>
          )}
      </LayoutContainer>
    );
};