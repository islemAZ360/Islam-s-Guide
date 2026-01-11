import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Smile, Activity, Zap, Moon, Shield, Award } from 'lucide-react';

// 👇 تحديث المسارات للمكونات الجديدة
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { DailyLog, PlanDay, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    // 1. حساب بيانات الحالة المزاجية (Pie Chart)
    const moodData = useMemo(() => [
        { name: t('excellent'), value: logs.filter(l => l.mood === 'good').length, color: '#10b981' }, // Emerald
        { name: t('stable'), value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' }, // Amber
        { name: t('bad'), value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },    // Rose
    ].filter(d => d.value > 0), [logs, t]);

    // 2. حساب بيانات الالتزام (مخطط vs فعلي)
    const adherenceData = useMemo(() => {
        // ندمج السجلات مع التواريخ لرسم الخط
        return logs.map(log => {
            const planned = plan.find(p => p.date === log.date)?.plannedDose || 0;
            return {
                date: log.date.slice(5), // MM-DD
                fullDate: log.date,
                planned: planned,
                actual: log.doseTaken,
                diff: log.doseTaken - planned // الفرق (للتلوين إذا لزم الأمر)
            };
        });
    }, [plan, logs]);

    // 3. منطق الأوسمة (Gamification Logic)
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            // تم تحقيق الوسام إذا كانت الجرعة الحالية أقل من نصف جرعة البداية
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2)
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            // معدل النوم آخر 3 أيام جيد (>= 7 ساعات)
            achieved: logs.length >= 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            // آخر 3 أيام مزاج جيد متواصل
            achieved: logs.length >= 3 && logs.slice(-3).every(l => l.mood === 'good')
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle="لوحة المعلومات الحيوية وتحليل الأداء."
          />

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30` : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'}`}>
                      {badge.achieved && <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 group-hover:to-${badge.color}-500/20`}></div>}
                      
                      <div className="relative z-10 flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-500 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={24} />
                          </div>
                          <div>
                              <span className={`text-xs font-bold block ${badge.achieved ? 'text-white' : 'text-slate-500'}`}>{badge.title}</span>
                              {!badge.achieved && <span className="text-[9px] text-slate-600">لم يتم القفل بعد</span>}
                          </div>
                      </div>
                      
                      {badge.achieved && (
                          <div className="absolute top-2 right-2 text-yellow-500 animate-pulse">
                              <Award size={14} />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Adherence Chart (Planned vs Actual) */}
              <Card className="min-h-[400px] flex flex-col md:col-span-2 bg-slate-900/50">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Activity className="w-5 h-5"/>
                          </div>
                           الالتزام بالخطة العلاجية
                      </h3>
                      <div className="flex gap-4 text-xs font-bold">
                          <span className="flex items-center gap-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> المخطط</span>
                          <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> الفعلي</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 h-[300px]">
                      {adherenceData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={adherenceData.slice(-30)}> {/* Last 30 entries */}
                                  <defs>
                                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                                  <YAxis stroke="#475569" fontSize={10} />
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val: number) => [`${val} ${unitLabel}`, '']}
                                      labelFormatter={(label) => `التاريخ: ${label}`}
                                  />
                                  <Area type="monotone" dataKey="planned" stroke="#6366f1" fillOpacity={1} fill="url(#colorPlanned)" name="المخطط" strokeWidth={2} />
                                  <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="الفعلي" strokeWidth={2} connectNulls />
                              </AreaChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <Activity size={48} className="opacity-20 mb-4"/>
                              <p>لا توجد بيانات كافية للرسم البياني بعد.</p>
                          </div>
                      )}
                  </div>
              </Card>

              {/* 2. Mood Distribution */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية
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
                                      paddingAngle={8}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={8}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{fontWeight: 'bold', color: '#fff'}}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                       ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               سجل مزاجك اليومي لتظهر البيانات
                           </div>
                       )}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {moodData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                              {d.name} ({d.value})
                          </div>
                      ))}
                  </div>
              </Card>

              {/* 3. Sleep Quality Chart */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Moon className="w-5 h-5"/>
                      </div>
                       جودة النوم (آخر 7 أيام)
                  </h3>
                  <div className="flex-1">
                      {logs.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={logs.slice(-7)}> 
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                  <Tooltip 
                                      cursor={{fill: '#1e293b', opacity: 0.5}}
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val) => [`${val} ساعة`, 'النوم']}
                                  />
                                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'الهدف (7h)', fill: '#10b981', fontSize: 10 }} />
                                  <Bar dataKey="sleepHours" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20}>
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