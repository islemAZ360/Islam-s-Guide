import React from 'react';
import { Card, PageHeader, LayoutContainer } from '../components/UI';
import { DailyLog, PlanDay } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Smile, Activity, Award, Zap, Moon, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
}

export const StatsView = ({ logs, plan }: StatsViewProps) => {
    const { t } = useLanguage();

    const moodData = [
        { name: 'ممتاز', value: logs.filter(l => l.mood === 'good').length, color: '#10b981' },
        { name: 'مستقر', value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' },
        { name: 'سيء', value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    // Badge Calculation Logic
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
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2)
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            achieved: logs.length > 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            achieved: logs.length > 3 && logs.slice(-3).every(l => l.mood === 'good')
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle="مراقبة الأداء والمزاج والالتزام بالخطة عبر رسوم بيانية تفاعلية."
          />

          {/* Dopamine Badges Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30` : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'}`}>
                      {badge.achieved && <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 group-hover:to-${badge.color}-500/20`}></div>}
                      <div className="relative z-10 flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-500 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-300">{badge.title}</span>
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mood Distribution */}
              <Card className="min-h-[450px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
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
                                      innerRadius={90}
                                      outerRadius={150}
                                      paddingAngle={8}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={12}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                      itemStyle={{color: '#fff', fontWeight: 'bold'}}
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

              {/* Adherence Chart */}
              <Card className="min-h-[450px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Activity className="w-5 h-5"/>
                      </div>
                       سجل الجرعات
                  </h3>
                  <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={logs.slice(-14)}> {/* Last 14 logs */}
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#475569" tick={{fill: '#475569', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                              <YAxis stroke="#475569" tick={{fill: '#475569', fontSize: 10}} axisLine={false} tickLine={false} dx={-10} />
                              <Tooltip 
                                  cursor={{fill: '#1e293b', opacity: 0.5}}
                                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}}
                              />
                              <Bar dataKey="doseTaken" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={28}>
                                {logs.slice(-14).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorGradientBar)" />
                                ))}
                              </Bar>
                              <defs>
                                <linearGradient id="colorGradientBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#818cf8" />
                                </linearGradient>
                              </defs>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
      </LayoutContainer>
    );
};