import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle, Users, Activity, Loader2, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { collection, query, where, getCountFromServer, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminOverviewProps {
    setActiveTab: (tab: any) => void;
}

export const AdminOverview = ({ setActiveTab }: AdminOverviewProps) => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        approvedDocs: 0,
        recovered: 0,
        pendingDocs: 0
    });
    const [pendingDocsList, setPendingDocsList] = useState<UserProfile[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Parallel Count Fetching (Very Fast)
                const usersColl = collection(db, 'users');
                
                const [usersSnap, doctorsSnap, recoveredSnap, pendingSnap] = await Promise.all([
                    // Total Patients
                    getCountFromServer(query(usersColl, where('role', 'in', ['normal_user', 'patient']))),
                    // Approved Doctors
                    getCountFromServer(query(usersColl, where('role', '==', 'doctor'), where('doctorData.accountStatus', '==', 'approved'))),
                    // Recovered Patients
                    getCountFromServer(query(usersColl, where('patientData.isRecovered', '==', true))),
                    // Pending Doctors (Count)
                    getCountFromServer(query(usersColl, where('role', '==', 'doctor'), where('doctorData.accountStatus', '==', 'pending')))
                ]);

                // 2. Fetch small list of pending doctors for UI (Limit 5)
                const pendingDocsQuery = query(
                    usersColl, 
                    where('role', '==', 'doctor'), 
                    where('doctorData.accountStatus', '==', 'pending'),
                    limit(5)
                );
                const pendingDocsSnapshot = await getDocs(pendingDocsQuery);
                const pendingDocsData = pendingDocsSnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));

                setStats({
                    totalUsers: usersSnap.data().count,
                    approvedDocs: doctorsSnap.data().count,
                    recovered: recoveredSnap.data().count,
                    pendingDocs: pendingSnap.data().count
                });
                setPendingDocsList(pendingDocsData);

            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statItems = [
        { name: t('stat_total_patients'), value: stats.totalUsers, color: '#6366f1', icon: Users },
        { name: t('stat_approved_docs'), value: stats.approvedDocs, color: '#10b981', icon: CheckCircle },
        { name: t('stat_recovered'), value: stats.recovered, color: '#f59e0b', icon: Activity },
        { name: t('pending_approvals'), value: stats.pendingDocs, color: '#f43f5e', icon: Lock },
    ];

    const pieData = [
        { name: 'Active', value: Math.max(0, stats.totalUsers - stats.recovered), color: '#6366f1' },
        { name: 'Recovered', value: stats.recovered, color: '#10b981' },
    ];

    const recoveryRate = stats.totalUsers > 0 ? Math.round((stats.recovered / stats.totalUsers) * 100) : 0;

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Stats Grid */}
            <section aria-label={language === 'ar' ? 'الإحصائيات العامة' : 'General Statistics'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statItems.map((stat, idx) => (
                        <div key={idx} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <Card className="relative bg-slate-900/80 border-white/5 p-6 flex flex-col justify-between h-32 overflow-hidden group-hover:border-white/10 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
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
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <section className="lg:col-span-2" aria-labelledby="overview-chart-title">
                    <Card className="bg-slate-900/80 border-white/5 min-h-[350px] flex flex-col relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 id="overview-chart-title" className="text-white font-bold mb-6 flex items-center gap-2 z-10">
                            <Activity size={20} className="text-indigo-400" aria-hidden="true"/> {t('stat_overview')}
                        </h3>
                        
                        <div className="flex-1 w-full min-h-[250px] z-10" aria-hidden="true">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statItems} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        {statItems.map((entry, index) => (
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
                                        {statItems.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#color-${index})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </section>
                
                {/* Pending Requests & Ratio */}
                <div className="flex flex-col gap-6">
                    <section aria-labelledby="pending-title" className="flex-1">
                        <Card className="bg-slate-900/80 border-white/5 h-full relative overflow-hidden flex flex-col">
                            <h3 id="pending-title" className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-amber-500" aria-hidden="true"/> {t('pending_approvals')}
                            </h3>
                            {pendingDocsList.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center h-full flex-1">
                                    <CheckCircle size={40} className="mb-3 text-emerald-500/20" aria-hidden="true"/>
                                    <p className="text-sm">All clear! No pending requests.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3 flex-1">
                                    {pendingDocsList.map(doc => (
                                        <li key={doc.uid} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group">
                                            <div>
                                                <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{doc.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{doc.doctorData?.specialty}</div>
                                            </div>
                                            <Button 
                                                onClick={() => setActiveTab('doctors')} 
                                                variant="secondary" 
                                                className="!py-1.5 !px-3 !text-xs !rounded-lg"
                                                aria-label={`${t('review_btn')} ${doc.name}`}
                                            >
                                                {t('review_btn')}
                                            </Button>
                                        </li>
                                    ))}
                                    {stats.pendingDocs > 5 && (
                                        <li className="text-center pt-2">
                                            <button 
                                                onClick={() => setActiveTab('doctors')} 
                                                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                                            >
                                                + {stats.pendingDocs - 5} more <ArrowRight size={12} />
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </Card>
                    </section>

                    <section aria-labelledby="recovery-rate-title" className="h-48">
                        <Card className="bg-slate-900/80 border-white/5 h-full relative overflow-hidden flex items-center justify-center">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
                             <h3 id="recovery-rate-title" className="sr-only">Recovery Rate</h3>
                             
                             <div className="w-full h-full" aria-hidden="true">
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
                             </div>
                             
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-white">{recoveryRate}%</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Recovery Rate</span>
                             </div>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
};