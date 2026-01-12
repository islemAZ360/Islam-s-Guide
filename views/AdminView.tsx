import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, deleteDoc, onSnapshot, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Article } from '../types';
import { Activity, Users, FileText, Stethoscope, X, Trash2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

// Services
import { 
    approveDoctorService, 
    rejectDoctorService, 
    toggleBanService, 
    deleteUserService, 
    publishArticleService 
} from '../services/adminServices';

// Contexts
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

// Components
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Sub-views
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

export const AdminView = () => {
    const { t, language } = useLanguage();
    const { userProfile } = useData(); // Get current admin profile for logging

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Modals State --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Refs
    const modalRef = useRef<HTMLDivElement>(null);
    const rejectInputRef = useRef<HTMLTextAreaElement>(null);

    // -- 1. REAL-TIME DATA FETCHING (Keep direct listeners for live UI) --
    useEffect(() => {
        setLoading(true);
        // Listen to Users
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(d => fetchedUsers.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            showStatus('error', "Failed to sync users data");
            setLoading(false);
        });

        // Listen to Articles
        const qArticles = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribeArticles = onSnapshot(qArticles, (snapshot) => {
            setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeArticles();
        };
    }, []);

    // Focus management
    useEffect(() => {
        if (selectedDoctor || showRejectModal) {
            setTimeout(() => {
                if (showRejectModal) rejectInputRef.current?.focus();
                else modalRef.current?.focus();
            }, 100);
        }
    }, [selectedDoctor, showRejectModal]);

    // -- HELPERS --
    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    // -- ACTIONS (Using Atomic Services) --
    
    const approveDoctor = async (docUid: string) => {
        if (!userProfile) return;
        if (!window.confirm(language === 'ar' ? "هل تؤكد اعتماد هذا الطبيب؟" : "Confirm doctor approval?")) return;
        
        const doctorName = users.find(u => u.uid === docUid)?.name || "Unknown";
        const result = await approveDoctorService(userProfile, docUid, doctorName);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم اعتماد الطبيب بنجاح." : "Doctor approved successfully.");
            if (selectedDoctor?.uid === docUid) setSelectedDoctor(null);
        } else {
            showStatus('error', result.error || "Failed to approve doctor.");
        }
    };

    const handleRejectClick = (doctor: UserProfile) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionReason("");
    };

    const confirmReject = async () => {
        if (!userProfile || !selectedDoctor?.uid) return;
        if (!rejectionReason.trim()) {
            showStatus('error', language === 'ar' ? "يرجى ذكر سبب الرفض." : "Rejection reason is required.");
            return;
        }

        const result = await rejectDoctorService(userProfile, selectedDoctor.uid, selectedDoctor.name, rejectionReason);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم رفض الطلب." : "Doctor request rejected.");
            setShowRejectModal(false);
            setSelectedDoctor(null);
            setRejectionReason("");
        } else {
            showStatus('error', result.error || "Failed to reject request.");
        }
    };

    const toggleBan = async (targetUser: UserProfile) => {
        if (!userProfile || !targetUser.uid) return;
        const newVal = !targetUser.isBanned;
        
        if(window.confirm(newVal ? 
            (language === 'ar' ? "حظر هذا المستخدم؟" : "Ban this user?") : 
            (language === 'ar' ? "فك الحظر عن المستخدم؟" : "Unban this user?")
        )) {
            const result = await toggleBanService(userProfile, targetUser.uid, targetUser.name, newVal);
            
            if (result.success) {
                showStatus('success', language === 'ar' ? `تم ${newVal ? 'حظر' : 'فك حظر'} المستخدم.` : `User ${newVal ? 'banned' : 'unbanned'}.`);
            } else {
                showStatus('error', result.error || "Action failed.");
            }
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!userProfile) return;
        if (!window.confirm(language === 'ar' ? "تحذير: هذا الإجراء سيحذف المستخدم نهائياً. هل أنت متأكد؟" : "Warning: This will permanently delete the user. Continue?")) return;
        
        const result = await deleteUserService(userProfile, targetUid);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم حذف المستخدم." : "User deleted.");
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } else {
            showStatus('error', result.error || "Failed to delete user.");
        }
    };

    const publishArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
        if (!userProfile) return;
        if (!articleData.title || !articleData.content) {
            showStatus('error', language === 'ar' ? "العنوان والمحتوى مطلوبان." : "Title and content are required.");
            return;
        }
        
        const result = await publishArticleService(userProfile, articleData);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم نشر المقال." : "Article published.");
        } else {
            showStatus('error', result.error || "Failed to publish article.");
        }
    };

    // Direct delete for articles (less critical, can be moved to service later if needed)
    const deleteArticle = async (id: string) => {
        if(window.confirm(language === 'ar' ? "حذف هذا المقال؟" : "Delete this article?")) {
            try {
                await deleteDoc(doc(db, "articles", id));
                showStatus('success', language === 'ar' ? "تم الحذف." : "Article deleted.");
            } catch (e) {
                showStatus('error', "Failed to delete article.");
            }
        }
    }

    const pendingDoctorsCount = users.filter(u => u.role === 'doctor' && u.doctorData?.accountStatus === 'pending').length;

    return (
        <LayoutContainer>
            <div className="relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />
            </div>

            {/* Status Toast */}
            {statusMsg && (
                <div 
                    className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-3 border ${
                        statusMsg.type === 'success' 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
                        : 'bg-rose-500/90 text-white border-rose-400/50'
                    }`}
                    role="alert"
                >
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {statusMsg.text}
                </div>
            )}

            {/* Navigation Tabs */}
            <div 
                className="flex p-1.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 w-full overflow-x-auto scrollbar-hide shadow-2xl relative z-10"
                role="tablist"
                aria-label="Admin Sections"
            >
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap min-w-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                            activeTab === tab.id 
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} aria-hidden="true" />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-white text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse" aria-label={`${pendingDoctorsCount} pending`}>{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <main 
                id={`panel-${activeTab}`} 
                role="tabpanel" 
                aria-labelledby={`tab-${activeTab}`}
                className="animate-in slide-in-from-bottom-4 relative z-10 focus:outline-none"
                tabIndex={-1}
            >
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
            </main>

            {/* --- SHARED MODALS --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-doc-name"
                >
                    <div 
                        ref={modalRef} 
                        tabIndex={-1}
                        className="w-full max-w-lg relative outline-none"
                    >
                        <Card className="!bg-slate-900 border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                            {/* Modal Header */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                            <button 
                                onClick={() => setSelectedDoctor(null)} 
                                className="absolute top-4 right-4 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white z-20 backdrop-blur-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label={t('close')}
                            >
                                <X size={20}/>
                            </button>
                            
                            <div className="text-center pt-8 pb-6 relative z-10">
                                <div className="w-28 h-28 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl">
                                    {selectedDoctor.doctorData?.photoUrl ? (
                                        <img src={selectedDoctor.doctorData.photoUrl} alt="" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-slate-900" aria-hidden="true">Dr</div>
                                    )}
                                </div>
                                <h2 id="modal-doc-name" className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
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
                                             <Trash2 size={18} className="mr-2" aria-hidden="true"/> Terminate Account
                                         </Button>
                                     </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div 
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reject-title"
                >
                    <div className="w-full max-w-md outline-none">
                        <Card className="!bg-slate-900 border-rose-500/30 shadow-2xl rounded-[2rem] overflow-hidden">
                            <div className="p-6">
                                <h3 id="reject-title" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <ShieldAlert className="text-rose-500" aria-hidden="true" /> {language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}
                                </h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    {language === 'ar' ? 'يرجى توضيح سبب رفض طلب الطبيب.' : 'Please provide a reason for rejection.'}
                                </p>
                                
                                <label htmlFor="reason-text" className="sr-only">Reason</label>
                                <textarea 
                                    id="reason-text"
                                    ref={rejectInputRef}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-rose-500"
                                    placeholder={language === 'ar' ? "مثال: نقص في البيانات..." : "E.g. Missing info..."}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                
                                <div className="flex gap-3 mt-6">
                                    <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">{t('cancel_btn')}</Button>
                                    <Button onClick={confirmReject} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">{t('reject_btn')}</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};