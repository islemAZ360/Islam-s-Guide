import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, getDocs, updateDoc, doc, addDoc, query, orderBy, deleteDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Article, ArticleCategory } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { 
    Ban, Activity, Search, Users, Lock, FileText, Stethoscope, CheckCircle, XCircle, Trash2, Plus
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext'; // استيراد هوك اللغة

export const AdminView = () => {
    const { t } = useLanguage(); // تفعيل الترجمة

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- CMS State --
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Search --
    const [searchTerm, setSearchTerm] = useState("");

    // -- 1. FETCH DATA --
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "users"));
            const fetched: UserProfile[] = [];
            snap.forEach(d => fetched.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetched);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchArticles = async () => {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
    };

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'doctors' || activeTab === 'overview') fetchUsers();
        if (activeTab === 'cms') fetchArticles();
    }, [activeTab]);

    // -- DOCTOR MANAGEMENT ACTIONS --
    
    const approveDoctor = async (docUid: string) => {
        if (!confirm("Are you sure you want to approve this doctor?")) return;
        
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "approved"
            });
            setUsers(prev => prev.map(u => u.uid === docUid ? {
                ...u, doctorData: { ...u.doctorData!, accountStatus: 'approved' }
            } : u));
        } catch (e) { console.error(e); }
    };

    const rejectDoctor = async (docUid: string) => {
        if (!confirm("Rejecting will prevent login. Continue?")) return;
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "rejected"
            });
            setUsers(prev => prev.map(u => u.uid === docUid ? {
                ...u, doctorData: { ...u.doctorData!, accountStatus: 'rejected' }
            } : u));
        } catch (e) { console.error(e); }
    };

    // -- USER MANAGEMENT ACTIONS --

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "Ban this user?" : "Unban this user?")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
            setUsers(users.map(u => u.uid === user.uid ? {...u, isBanned: newVal} : u));
        }
    }

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
            fetchArticles();
        } catch (e) { console.error(e); }
    };

    const deleteArticle = async (id: string) => {
        if(confirm("Delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
            setArticles(prev => prev.filter(a => a.id !== id));
        }
    }

    // -- DERIVED DATA --
    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');
    const recoveredUsers = users.filter(u => u.patientData?.isRecovered);

    // Stats for Overview
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
                        
                        {/* Pending Approvals Quick View */}
                        <Card className="bg-slate-900 border-white/5">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock size={16} className="text-amber-500"/> {t('pending_approvals')}
                            </h3>
                            {pendingDoctors.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">No pending approvals.</div>
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
                     {pendingDoctors.length > 0 && (
                         <div className="space-y-4">
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                 <Lock className="text-amber-500" /> {t('pending_approvals')}
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingDoctors.map(doc => (
                                    <div key={doc.uid} className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                        <Badge color="amber" className="absolute top-4 left-4">Pending</Badge>
                                        
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold">Dr</div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                                <p className="text-sm text-slate-400">{doc.doctorData?.specialty}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 space-y-2 mb-6">
                                            <div className="flex justify-between border-b border-white/5 pb-1"><span>License:</span> <span className="text-white font-mono">{doc.doctorData?.licenseNumber}</span></div>
                                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Phone:</span> <span className="text-white font-mono">{doc.doctorData?.phoneNumber}</span></div>
                                            <div className="flex justify-between"><span>Loc:</span> <span className="text-white">{doc.doctorData?.clinicLocation}</span></div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button onClick={() => doc.uid && approveDoctor(doc.uid)} variant="success" className="flex-1 !py-2">
                                                <CheckCircle size={16} className="mr-2"/> {t('approve_btn')}
                                            </Button>
                                            <Button onClick={() => doc.uid && rejectDoctor(doc.uid)} variant="danger" className="flex-1 !py-2">
                                                <XCircle size={16} className="mr-2"/> {t('reject_btn')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                     )}

                     {/* 2. Active Doctors List & Stats */}
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
                                            <th className="p-4 text-center">Recovered</th>
                                            <th className="p-4 text-center">Level</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {approvedDoctors.map(doc => {
                                            const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                            const recoveredCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && u.patientData?.isRecovered).length;
                                            const level = Math.floor(recoveredCount / 5) + 1;

                                            return (
                                                <tr key={doc.uid} className="hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-4 font-bold text-white">{doc.name}</td>
                                                    <td className="p-4">{doc.doctorData?.specialty}</td>
                                                    <td className="p-4 text-center text-indigo-400 font-bold">{patientCount}</td>
                                                    <td className="p-4 text-center text-emerald-400 font-bold">{recoveredCount}</td>
                                                    <td className="p-4 text-center">
                                                        <Badge color="amber">LVL {level}</Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => toggleBan(doc)}>
                                                            {doc.isBanned ? t('unban_user') : t('ban_user')}
                                                        </Button>
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
                                <Button variant="secondary" className="!p-2 text-rose-500 hover:text-white hover:bg-rose-500" onClick={() => toggleBan(user)}>
                                    <Ban size={16} />
                                </Button>
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
        </LayoutContainer>
    );
};