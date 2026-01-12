import React, { useMemo } from 'react';
import { Lock, CheckCircle, Users, Activity, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminOverviewProps {
    users: UserProfile[];
    setActiveTab: (tab: any) => void;
}

export const AdminOverview = ({ users, setActiveTab }: AdminOverviewProps) => {
    const { t } = useLanguage();

    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');
    const recoveredUsers = users.filter(u => u.patientData?.isRecovered);

    const stats = useMemo(() => {
        return [
            { name: t('stat_total_patients'), value: normalUsers.length, color: '#6366f1', icon: Users },
            { name: t('stat_approved_docs'), value: approvedDoctors.length, color: '#10b981', icon: CheckCircle },
            { name: t('stat_recovered'), value: recoveredUsers.length, color: '#f59e0b', icon: Activity },
            { name: t('pending_approvals'), value: pendingDoctors.length, color: '#f43f5e', icon: Lock },
        ];
    }, [users, t]);

    const pieData = [
        { name: 'Active', value: normalUsers.length - recoveredUsers.length, color: '#6366f1' },
        { name: 'Recovered', value: recoveredUsers.length, color: '#10b981' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Card className="relative bg-slate-900/80 border-white/5 p-6 flex flex-col justify-between h-32 overflow-hidden group-hover:border-white/10 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <stat.icon size={64} color={stat.color} />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.name}</h3>
                                <div className="text-4xl font-black text-white" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '70%', backgroundColor: stat.color }}></div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 bg-slate-900/80 border-white/5 min-h-[350px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 z-10">
                        <Activity size={20} className="text-indigo-400"/> {t('stat_overview')}
                    </h3>
                    
                    <div className="flex-1 w-full min-h-[250px] z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    {stats.map((entry, index) => (
                                        <linearGradient key={`grad-${index}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} tick={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}} 
                                    cursor={{fill: 'rgba(255,255,255,0.05)', radius: 8}}
                                    itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#color-${index})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                {/* Pending Requests & Ratio */}
                <div className="flex flex-col gap-6">
                    <Card className="bg-slate-900/80 border-white/5 flex-1 relative overflow-hidden">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Lock size={18} className="text-amber-500"/> {t('pending_approvals')}
                        </h3>
                        {pendingDoctors.length === 0 ? (
                            <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center h-full">
                                <CheckCircle size={40} className="mb-3 text-emerald-500/20"/>
                                <p className="text-sm">All clear! No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingDoctors.slice(0, 3).map(doc => (
                                    <div key={doc.uid} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group">
                                        <div>
                                            <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{doc.name}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{doc.doctorData?.specialty}</div>
                                        </div>
                                        <Button onClick={() => setActiveTab('doctors')} variant="secondary" className="!py-1.5 !px-3 !text-xs !rounded-lg">
                                            {t('review_btn')}
                                        </Button>
                                    </div>
                                ))}
                                {pendingDoctors.length > 3 && (
                                    <div className="text-center pt-2">
                                        <button onClick={() => setActiveTab('doctors')} className="text-xs text-slate-400 hover:text-white transition-colors">
                                            + {pendingDoctors.length - 3} more
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <Card className="bg-slate-900/80 border-white/5 h-48 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">{Math.round((recoveredUsers.length / (normalUsers.length || 1)) * 100)}%</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Recovery Rate</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};