import React, { useMemo } from 'react';
import { Lock, Stethoscope, Eye, Ban, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminDoctorsProps {
    users: UserProfile[];
    setSelectedDoctor: (doc: UserProfile) => void;
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminDoctors = ({ users, setSelectedDoctor, toggleBan, deleteUser }: AdminDoctorsProps) => {
    const { t, language } = useLanguage();
    
    // Performance: Memoize filtering to prevent re-calculation on every render
    const { pendingDoctors, approvedDoctors } = useMemo(() => {
        const doctors = users.filter(u => u.role === 'doctor');
        return {
            pendingDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'pending'),
            approvedDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'approved')
        };
    }, [users]);

    return (
        <div className="space-y-10 animate-in fade-in">
             {/* 1. Pending Approvals Section */}
             <section aria-labelledby="pending-heading" className="space-y-6">
                 <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Lock className="text-amber-500" size={20} aria-hidden="true" />
                     </div>
                     <h2 id="pending-heading" className="text-xl font-bold text-white">
                         {t('pending_approvals')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5" aria-label={`${pendingDoctors.length} requests`}>{pendingDoctors.length}</span>
                     </h2>
                 </div>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                         <ShieldCheck className="mb-4 opacity-20" size={48} aria-hidden="true" />
                         <p>{language === 'ar' ? 'لا توجد طلبات معلقة.' : 'No pending requests. All clear.'}</p>
                     </div>
                 ) : (
                     <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                        {pendingDoctors.map(doc => (
                            <li key={doc.uid} className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10 list-none">
                                <div className="absolute top-0 right-0 p-6 opacity-50">
                                    <Badge color="amber" className="shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                </div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-4">
                                    <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-bold border border-white/5 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt={`Photo of Dr. ${doc.name}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span aria-hidden="true">{doc.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white text-xl mb-1">{doc.name}</h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-1">
                                        <Stethoscope size={12} aria-hidden="true"/> {doc.doctorData?.specialty}
                                    </p>
                                </div>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs text-slate-400 flex justify-between">
                                        <span>License:</span>
                                        <span className="text-white font-mono">{doc.doctorData?.licenseNumber}</span>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs text-slate-400 flex justify-between">
                                        <span>Location:</span>
                                        <span className="text-white truncate max-w-[120px]">{doc.doctorData?.clinicLocation}</span>
                                    </div>
                                </div>
                                
                                <Button 
                                    onClick={() => setSelectedDoctor(doc)} 
                                    variant="secondary" 
                                    className="w-full !py-3 border-white/5 hover:border-white/20 hover:bg-white/5"
                                    aria-label={`${t('view_details')} ${doc.name}`}
                                >
                                    <Eye size={16} className="mr-2" aria-hidden="true"/> {t('view_details')}
                                </Button>
                            </li>
                        ))}
                     </ul>
                 )}
             </section>

             {/* 2. Active Doctors List */}
             <section aria-labelledby="approved-heading" className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Stethoscope className="text-emerald-500" size={20} aria-hidden="true" />
                     </div>
                     <h2 id="approved-heading" className="text-xl font-bold text-white">
                         {t('approved_docs_list')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5" aria-label={`${approvedDoctors.length} doctors`}>{approvedDoctors.length}</span>
                     </h2>
                </div>

                <Card className="bg-slate-900/60 border-white/10 overflow-hidden !p-0 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <caption className="sr-only">Table of approved doctors</caption>
                            <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="p-5" scope="col">Doctor</th>
                                    <th className="p-5" scope="col">Specialty</th>
                                    <th className="p-5 text-center" scope="col">Patients</th>
                                    <th className="p-5 text-center" scope="col">Level</th>
                                    <th className="p-5 text-center" scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {approvedDoctors.length === 0 && (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-600">No approved doctors registered yet.</td></tr>
                                )}
                                {approvedDoctors.map(doc => {
                                    const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                    const level = Math.floor((doc.doctorData?.recoveredCount || 0) / 5) + 1;

                                    return (
                                        <tr key={doc.uid} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5 font-bold text-white flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform overflow-hidden">
                                                    {doc.doctorData?.photoUrl ? (
                                                        <img src={doc.doctorData.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span aria-hidden="true">{doc.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-base">{doc.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-normal flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} aria-hidden="true"/> {doc.doctorData?.clinicLocation || 'Online'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <Badge color="blue" className="bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-none">
                                                    {doc.doctorData?.specialty}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="font-mono font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-white/5" title="Active Patients">
                                                    {patientCount}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                                                    LVL {level}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setSelectedDoctor(doc)} 
                                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20 outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                                                        title={t('view_details')}
                                                        aria-label={`${t('view_details')} ${doc.name}`}
                                                    >
                                                        <Eye size={16} aria-hidden="true"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleBan(doc)} 
                                                        className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20 outline-none focus-visible:ring-2 focus-visible:ring-amber-500" 
                                                        title={doc.isBanned ? t('unban_user') : t('ban_user')}
                                                        aria-label={doc.isBanned ? `${t('unban_user')} ${doc.name}` : `${t('ban_user')} ${doc.name}`}
                                                    >
                                                        <Ban size={16} aria-hidden="true"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => doc.uid && deleteUser(doc.uid)} 
                                                        className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20 outline-none focus-visible:ring-2 focus-visible:ring-rose-500" 
                                                        title={t('delete_user')}
                                                        aria-label={`${t('delete_user')} ${doc.name}`}
                                                    >
                                                        <Trash2 size={16} aria-hidden="true"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </section>
        </div>
    );
};