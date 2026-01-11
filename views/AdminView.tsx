import React, { useEffect, useState } from 'react';
import { 
    collection, updateDoc, doc, addDoc, query, orderBy, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Article, ArticleCategory } from '../types';
// تم إضافة Trash2 هنا
import { Activity, Users, FileText, Stethoscope, MessageSquareWarning, X, Trash2 } from 'lucide-react';

// المكونات الأساسية
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// المكونات الفرعية الجديدة للإدارة
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

import { useLanguage } from '../contexts/LanguageContext';

export const AdminView = () => {
    const { t } = useLanguage();

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Doctor View/Reject State (Shared Modals) --
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

    // -- DOCTOR MANAGEMENT ACTIONS --
    
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

    // -- USER MANAGEMENT ACTIONS --

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "Ban this user?" : "Unban this user?")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await deleteDoc(doc(db, "users", targetUid));
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Error deleting user:", e);
            alert("Failed to delete user.");
        }
    };

    // -- CMS ACTIONS --

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
            <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
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

            {/* --- SHARED MODALS --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg bg-slate-900 border-white/10 shadow-2xl relative">
                        <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <div className="text-center mb-6">
                            {selectedDoctor.doctorData?.photoUrl ? (
                                <img src={selectedDoctor.doctorData.photoUrl} alt="Dr" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-800 object-cover" />
                            ) : (
                                <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-slate-500">Dr</div>
                            )}
                            <h2 className="text-2xl font-bold text-white">{selectedDoctor.name}</h2>
                            <p className="text-indigo-400 font-medium">{selectedDoctor.doctorData?.specialty}</p>
                        </div>

                        <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-sm">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">License</span>
                                <span className="text-white font-mono">{selectedDoctor.doctorData?.licenseNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">Email</span>
                                <span className="text-white">{selectedDoctor.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">Phone</span>
                                <span className="text-white font-mono">{selectedDoctor.doctorData?.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Location</span>
                                <span className="text-white">{selectedDoctor.doctorData?.clinicLocation}</span>
                            </div>
                        </div>

                        {selectedDoctor.doctorData?.accountStatus === 'pending' && (
                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => selectedDoctor.uid && approveDoctor(selectedDoctor.uid)} variant="success" className="flex-1">
                                    Approve
                                </Button>
                                <Button onClick={() => handleRejectClick(selectedDoctor)} variant="danger" className="flex-1">
                                    Reject
                                </Button>
                            </div>
                        )}
                        
                        {selectedDoctor.doctorData?.accountStatus === 'approved' && (
                             <div className="mt-6 flex justify-center">
                                 {/* التصحيح هنا: استخدام دالة سهمية للتحقق من uid قبل الحذف */}
                                 <Button 
                                     onClick={() => {
                                         if (selectedDoctor.uid) {
                                             deleteUser(selectedDoctor.uid);
                                         }
                                     }} 
                                     variant="danger" 
                                     className="w-full"
                                 >
                                     <Trash2 size={18} className="mr-2"/> Delete User
                                 </Button>
                             </div>
                        )}
                    </Card>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquareWarning className="text-rose-500" /> سبب الرفض
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">يرجى توضيح سبب رفض طلب الطبيب ليتمكن من تصحيحه.</p>
                        
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-rose-500 outline-none h-32 resize-none"
                            placeholder="مثال: رقم الترخيص غير واضح، البيانات ناقصة..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        
                        <div className="flex gap-3 mt-6">
                            <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">إلغاء</Button>
                            <Button onClick={confirmReject} variant="danger" className="flex-1">تأكيد الرفض</Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};