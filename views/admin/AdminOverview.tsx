import React, { useMemo } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
            { name: t('stat_total_patients'), value: normalUsers.length, color: '#6366f1' },
            { name: t('stat_approved_docs'), value: approvedDoctors.length, color: '#10b981' },
            { name: t('stat_recovered'), value: recoveredUsers.length, color: '#f59e0b' },
            { name: t('pending_approvals'), value: pendingDoctors.length, color: '#f43f5e' },
        ];
    }, [users, t]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-slate-900 border-white/5 p-6 flex flex-col justify-between">
                        <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">{stat.name}</h3>
                        <div className="text-4xl font-black" style={{color: stat.color}}>{stat.value}</div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-white/5 min-h-[300px]">
                    <h3 className="text-white font-bold mb-4">{t('stat_overview')}</h3>
                    <ResponsiveContainer width="100%" height="250px">
                        <BarChart data={stats}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px'}} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {stats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                <Card className="bg-slate-900 border-white/5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-amber-500"/> {t('pending_approvals')}
                    </h3>
                    {pendingDoctors.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                            <CheckCircle size={32} className="mb-2 opacity-20"/>
                            <p>No pending approvals.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingDoctors.slice(0, 3).map(doc => (
                                <div key={doc.uid} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-white/5">
                                    <div>
                                        <div className="font-bold text-white text-sm">{doc.name}</div>
                                        <div className="text-xs text-slate-500">{doc.doctorData?.specialty}</div>
                                    </div>
                                    <Button onClick={() => setActiveTab('doctors')} variant="secondary" className="!py-1 !px-3 !text-xs">{t('review_btn')}</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};