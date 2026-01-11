import React from 'react';
import { Lock, AlertCircle, Stethoscope, Eye, Ban, Trash2 } from 'lucide-react';
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
    const { t } = useLanguage();
    
    // فلترة القوائم
    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');

    return (
        <div className="animate-in fade-in space-y-8">
             {/* 1. Pending Approvals */}
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-2 border-b border-white/5">
                     <Lock className="text-amber-500" /> {t('pending_approvals')}
                     <Badge color="amber">{pendingDoctors.length}</Badge>
                 </h2>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">
                         <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                         <p>لا توجد طلبات انضمام معلقة حالياً.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDoctors.map(doc => (
                            <div key={doc.uid} className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <Badge color="amber" className="absolute top-4 left-4">Pending Request</Badge>
                                
                                <div className="flex items-center gap-4 mb-4">
                                    {doc.doctorData?.photoUrl ? (
                                        <img src={doc.doctorData.photoUrl} alt="Dr" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                                    ) : (
                                        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold">Dr</div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                        <p className="text-sm text-slate-400">{doc.doctorData?.specialty}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-6">
                                    <Button onClick={() => setSelectedDoctor(doc)} variant="secondary" className="flex-1 !py-2">
                                        <Eye size={16} className="mr-2"/> {t('view_details')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>

             {/* 2. Active Doctors List */}
             <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <Stethoscope className="text-emerald-500" /> {t('approved_docs_list')}
                </h2>
                <Card className="bg-slate-900 border-white/5 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4">Specialty</th>
                                    <th className="p-4 text-center">Patients</th>
                                    <th className="p-4 text-center">Level</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {approvedDoctors.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center">No approved doctors yet.</td></tr>
                                )}
                                {approvedDoctors.map(doc => {
                                    // حساب عدد المرضى غير المتعافين لهذا الطبيب
                                    const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                    const level = Math.floor((doc.doctorData?.recoveredCount || 0) / 5) + 1;

                                    return (
                                        <tr key={doc.uid} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                                {doc.doctorData?.photoUrl ? (
                                                    <img src={doc.doctorData.photoUrl} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">Dr</div>
                                                )}
                                                {doc.name}
                                            </td>
                                            <td className="p-4">{doc.doctorData?.specialty}</td>
                                            <td className="p-4 text-center text-indigo-400 font-bold">{patientCount}</td>
                                            <td className="p-4 text-center"><Badge color="amber">LVL {level}</Badge></td>
                                            <td className="p-4 text-center flex justify-center gap-2">
                                                <button onClick={() => setSelectedDoctor(doc)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20" title={t('view_details')}><Eye size={16}/></button>
                                                <button onClick={() => toggleBan(doc)} className="p-2 bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20" title={doc.isBanned ? t('unban_user') : t('ban_user')}><Ban size={16}/></button>
                                                <button onClick={() => doc.uid && deleteUser(doc.uid)} className="p-2 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20" title={t('delete_user')}><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </div>
        </div>
    );
};