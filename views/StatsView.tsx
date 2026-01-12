import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, ComposedChart, Line, Legend
} from 'recharts';
import { Smile, Activity, Zap, Moon, Shield, Award, TrendingUp } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';

import { DailyLog, PlanDay, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t, language } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    // 1. بيانات الحالة المزاجية (Pie Chart)
    const moodData = useMemo(() => [
        { name: t('excellent'), value: logs.filter(l => l.mood === 'good').length, color: '#10b981' }, 
        { name: t('stable'), value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' }, 
        { name: t('bad'), value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },    
    ].filter(d => d.value > 0), [logs, t]);

    // 2. المخطط الذكي: الربط بين الجرعة وجودة النوم (Smart Correlation)
    const correlationData = useMemo(() => {
        return logs.slice(-14).map(log => ({ // آخر 14 يوم فقط للوضوح
            date: log.date.slice(5),
            dose: log.doseTaken,
            sleep: log.sleepHours || 0,
            moodScore: log.mood === 'good' ? 10 : log.mood === 'normal' ? 5 : 2
        }));
    }, [logs]);

    // 3. منطق الأوسمة (Gamification)
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7,
            desc: "7 أيام متواصلة"
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2),
            desc: "نصف الكمية"
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            achieved: logs.length >= 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7,
            desc: "نوم مستقر"
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            achieved: logs.length >= 3 && logs.slice(-3).every(l => l.mood === 'good'),
            desc: "مزاج ممتاز"
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle={language === 'ar' ? "تحليل عميق لأدائك الحيوي ومسار التعافي." : "Deep analysis of your vitals and recovery path."}
          />

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30 shadow-lg shadow-${badge.color}-900/20` : 'bg-slate-900/40 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                      {/* الخلفية المضيئة للوسام */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10 flex flex-col items-center text-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-600 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={28} strokeWidth={1.5} />
                          </div>
                          <div>
                              <span className={`text-sm font-bold block mb-1 ${badge.achieved ? 'text-white' : 'text-slate-400'}`}>{badge.title}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider bg-slate-950/50 px-2 py-1 rounded-lg">
                                  {badge.achieved ? badge.desc : "مغلق"}
                              </span>
                          </div>
                      </div>
                      
                      {badge.achieved && (
                          <div className="absolute top-3 right-3 text-yellow-400 animate-pulse">
                              <Award size={16} />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Smart Correlation Chart (Dose vs Sleep) */}
              <Card className="min-h-[400px] flex flex-col lg:col-span-2 border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                              <Activity className="w-5 h-5"/>
                          </div>
                           تأثير الجرعة على النوم
                      </h3>
                      <div className="flex gap-4 text-xs font-bold mt-4 md:mt-0 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                          <span className="flex items-center gap-2 text-indigo-300"><span className="w-3 h-3 rounded bg-indigo-500"></span> الجرعة ({unitLabel})</span>
                          <span className="flex items-center gap-2 text-emerald-300"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> ساعات النوم</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 h-[300px] w-full">
                      {correlationData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={correlationData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                  <defs>
                                    <linearGradient id="colorDoseBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'الجرعة', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 10 }} />
                                  <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} label={{ value: 'ساعات', angle: 90, position: 'insideRight', fill: '#34d399', fontSize: 10 }} />
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                      itemStyle={{color: '#fff', fontSize: '12px'}}
                                      labelStyle={{color: '#94a3b8', marginBottom: '8px', fontSize: '10px'}}
                                  />
                                  <Bar yAxisId="left" dataKey="dose" barSize={20} fill="url(#colorDoseBar)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                  <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6}} animationDuration={2000} />
                              </ComposedChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                              <TrendingUp size={48} className="opacity-20 mb-4"/>
                              <p>سجل بياناتك لمدة 3 أيام لتبدأ التحليلات الذكية بالعمل.</p>
                          </div>
                      )}
                  </div>
              </Card>

              {/* 2. Mood Distribution (Donut Chart Style) */}
              <Card className="min-h-[350px] flex flex-col border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية العامة
                  </h3>
                  <div className="flex-1 relative">
                       {moodData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={moodData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={100}
                                      paddingAngle={5}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={6}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{fontWeight: 'bold', color: '#fff'}}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-400 text-xs font-bold mx-2">{value}</span>}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                       ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               لا توجد بيانات كافية
                           </div>
                       )}
                  </div>
              </Card>

              {/* 3. Sleep Quality Histogram */}
              <Card className="min-h-[350px] flex flex-col border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Moon className="w-5 h-5"/>
                      </div>
                       استقرار النوم (آخر 7 أيام)
                  </h3>
                  <div className="flex-1 mt-4">
                      {logs.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={logs.slice(-7)}> 
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                  <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                  <Tooltip 
                                      cursor={{fill: '#1e293b', opacity: 0.5}}
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val) => [`${val} ساعة`, 'النوم']}
                                  />
                                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'الهدف (7h)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                                  <Bar dataKey="sleepHours" radius={[6, 6, 0, 0]} barSize={24}>
                                    {logs.slice(-7).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.sleepHours && entry.sleepHours >= 7 ? '#10b981' : '#6366f1'} />
                                    ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-500">
                              <p>لا توجد سجلات للنوم.</p>
                          </div>
                      )}
                  </div>
              </Card>
          </div>
      </LayoutContainer>
    );
};