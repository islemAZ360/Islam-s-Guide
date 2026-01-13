import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
    Lock, Stethoscope, Eye, Ban, Trash2, ShieldCheck, MapPin, Loader2, X, Check, AlertTriangle 
} from 'lucide-react';
import { 
    collection, query, where, onSnapshot, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminDoctors = () => {
    const { t, language } = useLanguage();
    
    // -- Data State --
    const [doctors, setDoctors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- Modal State --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const rejectInputRef = useRef<HTMLTextAreaElement>(null);

    // -- Fetch Data (Real-time, Optimized for Doctors only) --
    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docsData: UserProfile[] = [];
            snapshot.forEach(doc => {
                docsData.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            setDoctors(docsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching doctors:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // -- Memoized Categorization --
    const { pendingDoctors, approvedDoctors } = useMemo(() => {
        return {
            pendingDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'pending'),
            approvedDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'approved')
        };
    }, [doctors]);

    // -- Actions --
    const handleApprove = async (doctor: UserProfile) => {
        if (!doctor.uid) return;
        if (!window.confirm(language === 'ar' ? 'اعتماد هذا الطبيب؟' : 'Approve this doctor?')) return;
        
        try {
            await updateDoc(doc(db, "users", doctor.uid), {
                "doctorData.accountStatus": "approved",
                "doctorData.rejectionReason": null
            });
            if (selectedDoctor?.uid === doctor.uid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Approval failed", e);
            alert("Failed to approve");
        }
    };

    const handleReject = async () => {
        if (!selectedDoctor?.uid || !rejectionReason.trim()) return;
        try {
            await updateDoc(doc(db, "users", selectedDoctor.uid), {
                "doctorData.accountStatus": "rejected",
                "doctorData.rejectionReason": rejectionReason
            });
            setShowRejectModal(false);
            setSelectedDoctor(null);
            setRejectionReason("");
        } catch (e) {
            console.error("Rejection failed", e);
            alert("Failed to reject");
        }
    };

    const handleToggleBan = async (doctor: UserProfile) => {
        if (!doctor.uid) return;
        try {
            await updateDoc(doc(db, "users", doctor.uid), {
                isBanned: !doctor.isBanned
            });
        } catch (e) {
            console.error("Ban toggle failed", e);
        }
    };

    const handleDelete = async (uid: string) => {
        if (!window.confirm(language === 'ar' ? 'حذف هذا الطبيب نهائياً؟' : 'Permanently delete this doctor?')) return;
        try {
            await deleteDoc(doc(db, "users", uid));
            if (selectedDoctor?.uid === uid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const openRejectModal = (doc: UserProfile) => {
        setSelectedDoctor(doc);
        setShowRejectModal(true);
        setTimeout(() => rejectInputRef.current?.focus(), 100);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-indigo-400">
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

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
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">{pendingDoctors.length}</span>
                     </h2>
                 </div>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                         <ShieldCheck className="mb-4 opacity-20" size={48} aria-hidden="true" />
                         <p>{language === 'ar' ? 'لا توجد طلبات معلقة.' : 'No pending requests. All clear.'}</p>
                     </div>
                 ) : (
                     <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDoctors.map(doc => (
                            <li key={doc.uid} className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10">
                                <div className="absolute top-0 right-0 p-6 opacity-50">
                                    <Badge color="amber" className="shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                </div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-4">
                                    <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-bold border border-white/5 shadow-inner overflow-hidden">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{doc.name.charAt(0)}</span>
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
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">{approvedDoctors.length}</span>
                     </h2>
                </div>

                <Card className="bg-slate-900/60 border-white/10 overflow-hidden !p-0 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="p-5">Doctor</th>
                                    <th className="p-5">Specialty</th>
                                    <th className="p-5 text-center">Level</th>
                                    <th className="p-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {approvedDoctors.map(doc => (
                                    <tr key={doc.uid} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5 font-bold text-white flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 overflow-hidden">
                                                {doc.doctorData?.photoUrl ? (
                                                    <img src={doc.doctorData.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{doc.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-base">{doc.name}</div>
                                                <div className="text-xs text-slate-500 font-mono font-normal flex items-center gap-1 mt-0.5">
                                                    <MapPin size={10}/> {doc.doctorData?.clinicLocation || 'Online'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <Badge color="blue">{doc.doctorData?.specialty}</Badge>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                                                LVL {doc.doctorData?.doctorLevel || 1}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => setSelectedDoctor(doc)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleToggleBan(doc)} className={`p-2 rounded-lg transition-colors ${doc.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white'}`}>
                                                    <Ban size={16} />
                                                </button>
                                                <button onClick={() => doc.uid && handleDelete(doc.uid)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </section>

             {/* Doctor Details Modal */}
             {selectedDoctor && !showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-900/40 to-transparent pointer-events-none"></div>
                        <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-white z-20"><X size={20}/></button>
                        
                        <div className="text-center pt-8 pb-6 relative z-10">
                            <div className="w-28 h-28 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl">
                                {selectedDoctor.doctorData?.photoUrl ? (
                                    <img src={selectedDoctor.doctorData.photoUrl} alt="" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-slate-900">Dr</div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                            <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedDoctor.doctorData?.specialty}</p>
                        </div>

                        <div className="px-8 pb-8 space-y-4">
                            <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-3 text-sm">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500 font-bold">License</span>
                                    <span className="text-white font-mono">{selectedDoctor.doctorData?.licenseNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500 font-bold">Email</span>
                                    <span className="text-white">{selectedDoctor.email}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500 font-bold">Phone</span>
                                    <span className="text-white font-mono">{selectedDoctor.doctorData?.phoneNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold">Bio</span>
                                    <span className="text-white truncate w-40 text-right">{selectedDoctor.doctorData?.bio}</span>
                                </div>
                            </div>

                            {selectedDoctor.doctorData?.accountStatus === 'pending' && (
                                <div className="flex gap-3 pt-2">
                                    <Button onClick={() => handleApprove(selectedDoctor)} variant="success" className="flex-1">Approve</Button>
                                    <Button onClick={() => openRejectModal(selectedDoctor)} variant="danger" className="flex-1">Reject</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             )}

             {/* Reject Modal */}
             {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
                    <Card className="w-full max-w-md !bg-slate-900 border-rose-500/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-rose-500"/> Rejection Reason
                        </h3>
                        <textarea 
                            ref={rejectInputRef}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none mb-4"
                            placeholder="Reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                            <Button onClick={handleReject} variant="danger" className="flex-1">Confirm Reject</Button>
                        </div>
                    </Card>
                </div>
             )}
        </div>
    );
};