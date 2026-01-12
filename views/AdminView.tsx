import React, { useEffect, useState } from 'react';
import { 
    collection, updateDoc, doc, addDoc, query, orderBy, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Article } from '../types';
import { Activity, Users, FileText, Stethoscope, MessageSquareWarning, X, Trash2, ShieldAlert } from 'lucide-react';

// المكونات الأساسية
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// المكونات الفرعية
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

import { useLanguage } from '../contexts/LanguageContext';

export const AdminView = () => {
    const { t, language } = useLanguage();

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Modals State --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // -- 1. REAL-TIME DATA FETCHING --
    useEffect(() => {
        setLoading(true);
        // جلب المستخدمين
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(d => fetchedUsers.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        // جلب المقالات
        const qArticles = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribeArticles = onSnapshot(qArticles, (snapshot) => {
            setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeArticles();
        };
    }, []);

    // -- ACTIONS --
    
    const approveDoctor = async (docUid: string) => {
        if (!confirm("Are you sure you want to approve this doctor?")) return;
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "approved",
                "doctorData.rejectionReason": null 
            });
            if (selectedDoctor?.uid === docUid) setSelectedDoctor(null);
        } catch (e) { console.error(e); }
    };

    const handleRejectClick = (doctor: UserProfile) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionReason("");
    };

    const confirmReject = async () => {
        if (!selectedDoctor?.uid || !rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            await updateDoc(doc(db, "users", selectedDoctor.uid), {
                "doctorData.accountStatus": "rejected",
                "doctorData.rejectionReason": rejectionReason
            });
            setShowRejectModal(false);
            setSelectedDoctor(null);
            setRejectionReason("");
        } catch (e) { console.error(e); }
    };

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "Ban this user?" : "Unban this user?")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!confirm("Warning: This will permanently delete the user and all their data. Continue?")) return;
        try {
            await deleteDoc(doc(db, "users", targetUid));
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Error deleting user:", e);
            alert("Failed to delete user.");
        }
    };

    const publishArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
        const currentUser = auth?.currentUser;
        if (!articleData.title || !articleData.content) return;
        
        try {
            await addDoc(collection(db, "articles"), {
                ...articleData,
                isPublished: true,
                createdAt: Date.now(),
                authorName: currentUser?.displayName || "System Admin",
                authorRole: "admin",
                authorId: currentUser?.uid || "ADMIN_CONSOLE"
            });
        } catch (e) { console.error(e); }
    };

    const deleteArticle = async (id: string) => {
        if(confirm("Delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
        }
    }

    const pendingDoctorsCount = users.filter(u => u.role === 'doctor' && u.doctorData?.accountStatus === 'pending').length;

    return (
        <LayoutContainer>
            <div className="relative">
                {/* خلفية جمالية خاصة بالأدمن */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />
            </div>

            {/* Navigation Tabs - Glass Floating Style */}
            <div className="flex p-1.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 w-full overflow-x-auto scrollbar-hide shadow-2xl relative z-10">
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap min-w-[120px] ${
                            activeTab === tab.id 
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-white text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area - with Fade In */}
            <div className="animate-in slide-in-from-bottom-4 relative z-10">
                {activeTab === 'overview' && (
                    <AdminOverview users={users} setActiveTab={setActiveTab} />
                )}

                {activeTab === 'doctors' && (
                    <AdminDoctors 
                        users={users} 
                        setSelectedDoctor={setSelectedDoctor} 
                        toggleBan={toggleBan} 
                        deleteUser={deleteUser} 
                    />
                )}

                {activeTab === 'users' && (
                    <AdminUsers 
                        users={users} 
                        toggleBan={toggleBan} 
                        deleteUser={deleteUser} 
                    />
                )}

                {activeTab === 'cms' && (
                    <AdminCMS 
                        articles={articles} 
                        publishArticle={publishArticle} 
                        deleteArticle={deleteArticle} 
                    />
                )}
            </div>

            {/* --- SHARED MODALS (GLASS STYLE) --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg !bg-slate-900 border-white/10 shadow-2xl relative rounded-[2.5rem] overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                        <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white z-20 backdrop-blur-md hover:bg-slate-700 transition-colors"><X size={20}/></button>
                        
                        <div className="text-center pt-8 pb-6 relative z-10">
                            <div className="w-28 h-28 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl">
                                {selectedDoctor.doctorData?.photoUrl ? (
                                    <img src={selectedDoctor.doctorData.photoUrl} alt="Dr" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-slate-900">Dr</div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                            <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedDoctor.doctorData?.specialty}</p>
                        </div>

                        <div className="px-8 pb-8 space-y-4">
                            <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-3 text-sm">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500 font-bold">License ID</span>
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
                                    <span className="text-slate-500 font-bold">Location</span>
                                    <span className="text-white">{selectedDoctor.doctorData?.clinicLocation}</span>
                                </div>
                            </div>

                            {selectedDoctor.doctorData?.accountStatus === 'pending' && (
                                <div className="flex gap-3 pt-2">
                                    <Button onClick={() => selectedDoctor.uid && approveDoctor(selectedDoctor.uid)} variant="success" className="flex-1 shadow-lg shadow-emerald-500/20">
                                        Approve
                                    </Button>
                                    <Button onClick={() => handleRejectClick(selectedDoctor)} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">
                                        Reject
                                    </Button>
                                </div>
                            )}
                            
                            {selectedDoctor.doctorData?.accountStatus === 'approved' && (
                                 <div className="pt-2">
                                     <Button 
                                         onClick={() => selectedDoctor.uid && deleteUser(selectedDoctor.uid)} 
                                         variant="danger" 
                                         className="w-full shadow-lg shadow-rose-900/20"
                                     >
                                         <Trash2 size={18} className="mr-2"/> Terminate Account
                                     </Button>
                                 </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <Card className="w-full max-w-md !bg-slate-900 border-rose-500/30 shadow-2xl relative rounded-[2rem] overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShieldAlert className="text-rose-500" /> سبب الرفض
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">يرجى توضيح سبب رفض طلب الطبيب ليتمكن من تصحيحه.</p>
                            
                            <textarea 
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none transition-all placeholder-slate-700"
                                placeholder="مثال: رقم الترخيص غير واضح، البيانات ناقصة..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            
                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">إلغاء</Button>
                                <Button onClick={confirmReject} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">تأكيد الرفض</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};