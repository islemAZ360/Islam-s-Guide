import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, updateDoc, doc, addDoc, query, orderBy, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Article, ArticleCategory } from '../types';
import { LayoutContainer, PageHeader, Card, Badge, Button } from '../components/UI';
import { 
    Ban, Activity, Search, Users, Lock, FileText, Stethoscope, CheckCircle, XCircle, Trash2, Plus, AlertCircle, Eye, X, MessageSquareWarning
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

export const AdminView = () => {
    const { t } = useLanguage();

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- CMS State --
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Doctor View/Reject State --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // -- Search --
    const [searchTerm, setSearchTerm] = useState("");

    // -- 1. REAL-TIME DATA FETCHING --
    useEffect(() => {
        setLoading(true);
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
                "doctorData.rejectionReason": null // Clear any previous rejection
            });
            if (selectedDoctor?.uid === docUid) setSelectedDoctor(null);
        } catch (e) { console.error(e); }
    };

    // New: Handle Rejection with Reason
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
        if (!confirm(t('delete_confirm_msg'))) return;
        try {
            await deleteDoc(doc(db, "users", targetUid));
        } catch (e) {
            console.error("Error deleting user:", e);
            alert("Failed to delete user.");
        }
    };

    // -- CMS ACTIONS --

    const publishArticle = async () => {
        const currentUser = auth?.currentUser;
        if (!newArticle.title || !newArticle.content) return;
        
        try {
            await addDoc(collection(db, "articles"), {
                ...newArticle,
                isPublished: true,
                createdAt: Date.now(),
                authorName: currentUser?.displayName || "System Admin",
                authorRole: "admin",
                authorId: currentUser?.uid || "ADMIN_CONSOLE"
            });
            setShowArticleModal(false);
            setNewArticle({ title: '', content: '', category: 'tip' });
        } catch (e) { console.error(e); }
    };

    const deleteArticle = async (id: string) => {
        if(confirm("Delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
        }
    }

    // -- DERIVED DATA --
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
        <LayoutContainer>
            <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />

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
                        {tab.id === 'doctors' && pendingDoctors.length > 0 && (
                             <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{pendingDoctors.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* --- TAB: OVERVIEW --- */}
            {activeTab === 'overview' && (
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
            )}

            {/* --- TAB: DOCTORS MANAGEMENT --- */}
            {activeTab === 'doctors' && (
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
                                            <tr><td colSpan={6} className="p-6 text-center">No approved doctors yet.</td></tr>
                                        )}
                                        {approvedDoctors.map(doc => {
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
            )}

            {/* --- TAB: USERS MANAGEMENT --- */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex bg-slate-900 p-4 rounded-2xl border border-white/5 mb-4">
                        <Search className="text-slate-500 ml-4" size={20} />
                        <input 
                            className="bg-transparent w-full text-white outline-none"
                            placeholder={t('search_user_placeholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {normalUsers
                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(user => (
                            <div key={user.uid} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.isBanned && <Ban size={12} className="text-rose-500"/>}
                                        </h4>
                                        <div className="flex gap-2 mt-1">
                                            <Badge color="blue" className="!text-[9px] !px-1.5 !py-0.5">{user.role === 'patient' ? t('role_patient') : 'User'}</Badge>
                                            {user.patientData?.assignedDoctorName && (
                                                <span className="text-[9px] text-slate-500 flex items-center">Dr: {user.patientData.assignedDoctorName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleBan(user)} className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"><Ban size={16} /></button>
                                    <button onClick={() => user.uid && deleteUser(user.uid)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB: CONTENT MANAGEMENT (CMS) --- */}
            {activeTab === 'cms' && (
                <div className="animate-in fade-in space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{t('tab_cms')}</h2>
                        <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2 !px-4 !text-sm"><Plus size={16}/> {t('new_article_btn')}</Button>
                    </div>

                    {showArticleModal && (
                         <Card className="bg-slate-900 border-indigo-500/30 mb-6">
                             <div className="space-y-4">
                                 <input 
                                     className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 outline-none focus:border-indigo-500" 
                                     placeholder={t('article_title_label')}
                                     value={newArticle.title} 
                                     onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                 />
                                 
                                 <div>
                                     <label className="text-xs text-slate-500 mb-2 block font-bold uppercase">{t('article_cat_label')}</label>
                                     <div className="flex gap-2">
                                         {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                             <button 
                                                key={cat}
                                                onClick={() => setNewArticle({...newArticle, category: cat})}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newArticle.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                             >
                                                 {cat.toUpperCase()}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <textarea 
                                     className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 h-32 outline-none focus:border-indigo-500" 
                                     placeholder={t('article_content_label')}
                                     value={newArticle.content} 
                                     onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                 />
                                 
                                 <div className="flex justify-end gap-2">
                                     <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                                     <Button variant="success" onClick={publishArticle}>{t('publish_now')}</Button>
                                 </div>
                             </div>
                         </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {articles.map(art => (
                            <div key={art.id} className="bg-slate-900 p-5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
                                <button 
                                    onClick={() => art.id && deleteArticle(art.id)}
                                    className="absolute top-4 left-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16}/>
                                </button>

                                <Badge color="blue" className="mb-3">{art.category}</Badge>
                                <h3 className="font-bold text-white mb-2 line-clamp-1">{art.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4">{art.content}</p>
                                <div className="text-[10px] text-slate-600 font-mono">
                                    {new Date(art.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                    <CheckCircle size={18} className="mr-2"/> {t('approve_btn')}
                                </Button>
                                <Button onClick={() => handleRejectClick(selectedDoctor)} variant="danger" className="flex-1">
                                    <XCircle size={18} className="mr-2"/> {t('reject_btn')}
                                </Button>
                            </div>
                        )}
                        
                        {selectedDoctor.doctorData?.accountStatus === 'approved' && (
                             <div className="mt-6 flex justify-center">
                                 <Button onClick={() => selectedDoctor.uid && deleteUser(selectedDoctor.uid)} variant="danger" className="w-full">
                                     <Trash2 size={18} className="mr-2"/> {t('delete_user')}
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