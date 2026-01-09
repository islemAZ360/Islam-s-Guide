import React from 'react';
import { Card } from '../components/UI';
import { PlanDay, DailyLog } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Smile, Activity } from 'lucide-react';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
}

export const CalendarView = ({ plan, logs, todayDate }: CalendarViewProps) => {
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7;
    const blanks = Array.from({ length: startDayIndex });

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-4xl font-black text-white tracking-tight">الجدول الزمني الشامل</h1>
        <Card className="overflow-hidden p-0 border-0 bg-transparent shadow-none !p-0">
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(d => (
              <div key={d} className="bg-slate-900/60 p-4 text-center text-xs font-black text-slate-500 uppercase rounded-2xl">{d}</div>
            ))}
            
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              
              let bgClass = "bg-slate-900/40 border-white/5";
              if (isToday) bgClass = "bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transform scale-105 z-10";
              else if (day.isPast) bgClass = "bg-slate-950/80 border-slate-900 opacity-40 grayscale";

              return (
                <div key={idx} className={`${bgClass} border rounded-3xl p-4 min-h-[120px] flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/30 relative overflow-hidden group hover:bg-slate-900`}>
                   {isToday && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-3 animate-ping"></div>}
                   {log && <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${log.mood === 'good' ? 'bg-emerald-500' : log.mood === 'bad' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>}
                  
                  <div className="flex justify-between items-start z-10">
                    <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {day.date.slice(8)}
                    </span>
                    {log && (
                      <span className="text-xl animate-in zoom-in">{log.mood === 'good' ? '🤩' : log.mood === 'bad' ? '😖' : '😐'}</span>
                    )}
                  </div>
                  <div className="text-center z-10 mt-2">
                    <span className={`text-3xl font-black ${isToday ? 'text-white' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className={`text-[9px] block uppercase tracking-wider font-bold ${isToday ? 'text-indigo-200' : 'text-slate-600'}`}>mg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
};

interface StatsViewProps {
    logs: DailyLog[];
}

export const StatsView = ({ logs }: StatsViewProps) => {
    const moodData = [
        { name: 'ممتاز', value: logs.filter(l => l.mood === 'good').length, color: '#10b981' },
        { name: 'مستقر', value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' },
        { name: 'سيء', value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
          <h1 className="text-4xl font-black text-white tracking-tight">التحليل البياني</h1>
          
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
                                      innerRadius={80}
                                      outerRadius={140}
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
                  <div className="flex justify-center gap-8 mt-6">
                      {moodData.map((d, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                              <div className="w-4 h-4 rounded-full shadow-lg" style={{backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}40`}}></div>
                              {d.name}
                          </div>
                      ))}
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
      </div>
    );
};