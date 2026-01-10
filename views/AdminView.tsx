import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, getDocs, updateDoc, doc, addDoc, query, orderBy, limit 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, DailyLog, Article, Ticket, AuditLog } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Ban, Activity, Search, Users, Lock, Eye, Save, Plus, X, Flag, FileText, LifeBuoy, Zap, ShieldAlert, Pill, FlaskConical
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

interface DashboardStats {
    totalUsers: number;
    activeToday: number;
    bannedUsers: number;
    atRisk: number;
    medTypeDistribution: { name: string; value: number; color: string }[];
    progressDistribution: { name: string; value: number }[];
}

export const AdminView = () => {
    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cms' | 'tickets' | 'audit'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // -- User Inspection State --
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [inspectLogs, setInspectLogs] = useState<DailyLog[]>([]);
    const [doctorNote, setDoctorNote] = useState("");

    // -- CMS State --
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as const });

    // -- Search & Filter --
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'risk' | 'flagged' | 'banned'>('all');

    // -- 1. FETCH DATA --
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "users"));
            const fetched: UserProfile[] = [];
            snap.forEach(d => fetched.push({ uid: d.id, ...d.data().userProfile, ...d.data() } as UserProfile));
            setUsers(fetched);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchArticles = async () => {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
    };

    const fetchTickets = async () => {
        const q = query(collection(db, "tickets"), orderBy("lastUpdate", "desc"));
        const snap = await getDocs(q);
        setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket)));
    };

    const fetchAuditLogs = async () => {
        const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(50));
        const snap = await getDocs(q);
        setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
    };

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'overview') fetchUsers();
        if (activeTab === 'cms') fetchArticles();
        if (activeTab === 'tickets') fetchTickets();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    // -- 2. INSPECT USER --
    const openInspector = async (user: UserProfile) => {
        if (!user.uid) return;
        setInspectLogs([]);
        setDoctorNote(user.doctorNotes || "");
        setSelectedUser(user);

        try {
             // Fetch logs specific to user
             const d = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, "users", user.uid!)));
             if (d.exists()) {
                 const data = d.data();
                 setInspectLogs(data.logs || []);
             }
        } catch (e) { console.error("Inspect error", e); }
    };

    // -- 3. ACTIONS --
    const saveDoctorNote = async () => {
        if (!selectedUser?.uid) return;
        await updateDoc(doc(db, "users", selectedUser.uid), { doctorNotes: doctorNote });
        // Log action
        await addDoc(collection(db, "audit_logs"), {
            adminName: "Admin", action: "UPDATE_NOTES", details: `Updated notes for ${selectedUser.name}`, timestamp: Date.now()
        });
        alert("تم حفظ الملاحظات الطبية");
    };

    const toggleFlag = async () => {
        if (!selectedUser?.uid) return;
        const newVal = !selectedUser.isFlagged;
        await updateDoc(doc(db, "users", selectedUser.uid), { isFlagged: newVal });
        setSelectedUser({...selectedUser, isFlagged: newVal});
        setUsers(users.map(u => u.uid === selectedUser.uid ? {...u, isFlagged: newVal} : u));
    };

    const toggleBan = async () => {
        if (!selectedUser?.uid) return;
        const newVal = !selectedUser.isBanned;
        await updateDoc(doc(db, "users", selectedUser.uid), { isBanned: newVal });
        setSelectedUser({...selectedUser, isBanned: newVal});
        setUsers(users.map(u => u.uid === selectedUser.uid ? {...u, isBanned: newVal} : u));
    }

    const publishArticle = async () => {
        if (!newArticle.title) return;
        await addDoc(collection(db, "articles"), {
            ...newArticle,
            isPublished: true,
            createdAt: Date.now(),
            authorName: "System Admin"
        });
        setShowArticleModal(false);
        setNewArticle({ title: '', content: '', category: 'tip' });
        fetchArticles();
    };

    // -- 4. STATS ENGINE --
    const stats: DashboardStats = useMemo(() => {
        const medTypes = { narcotic: 0, psychiatric: 0, normal: 0 };
        const progress = { start: 0, mid: 0, end: 0 };
        let active = 0, risk = 0, banned = 0;
        const now = Date.now();

        users.forEach(u => {
            if (u.email?.includes('admin')) return;
            if (u.isBanned) banned++;
            if (u.medType === 'narcotic') medTypes.narcotic++;
            else if (u.medType === 'psychiatric') medTypes.psychiatric++;
            else medTypes.normal++;

            const p = u.progress || 0;
            if (p < 30) progress.start++; else if (p < 80) progress.mid++; else progress.end++;

            // Active in last 24h
            if (u.lastActive && (now - new Date(u.lastActive).getTime() < 86400000)) active++;
            
            // Risk Logic: Flagged OR (Inactive for 7 days AND progress < 50%)
            if (u.isFlagged || (u.lastActive && (now - new Date(u.lastActive).getTime() > 86400000 * 7) && p < 50)) risk++;
        });

        return {
            totalUsers: users.length > 1 ? users.length - 1 : 0, 
            activeToday: active,
            bannedUsers: banned,
            atRisk: risk,
            medTypeDistribution: [
                { name: 'مخدرات', value: medTypes.narcotic, color: '#f43f5e' },
                { name: 'نفسية', value: medTypes.psychiatric, color: '#f59e0b' },
                { name: 'عامة', value: medTypes.normal, color: '#10b981' },
            ].filter(x => x.value > 0),
            progressDistribution: [
                { name: '0-30%', value: progress.start },
                { name: '30-80%', value: progress.mid },
                { name: '80-100%', value: progress.end },
            ]
        };
    }, [users]);

    const filteredUsers = users.filter(u => {
        if (u.email?.includes('admin')) return false;
        const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        let matchFilter = true;
        if (filterType === 'banned') matchFilter = !!u.isBanned;
        if (filterType === 'flagged') matchFilter = !!u.isFlagged;
        if (filterType === 'risk') {
             const now = Date.now();
             const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
             matchFilter = (now - last > 86400000 * 7) || !!u.isFlagged;
        }
        return matchSearch && matchFilter;
    });

    // Helper for Pace Label
    const getPaceLabel = (speed?: number) => {
        if (!speed || speed === 1.0) return "Normal";
        if (speed < 1.0) return "Slow (Extended)";
        return "Fast (Intense)";
    };

    return (
        <LayoutContainer>
            <PageHeader title="غرفة التحكم المركزية" subtitle="نظام الإدارة المتكامل (Admin ERP)" />

            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                {[
                    { id: 'overview', icon: Activity, label: 'نظرة عامة' },
                    { id: 'users', icon: Users, label: 'المستخدمين' },
                    { id: 'cms', icon: FileText, label: 'المحتوى' },
                    { id: 'tickets', icon: LifeBuoy, label: 'الدعم' },
                    { id: 'audit', icon: Lock, label: 'السجلات' },
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
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-900 border-white/5 p-6">
                            <h3 className="text-slate-500 text-xs font-bold uppercase">إجمالي المستخدمين</h3>
                            <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
                        </Card>
                        <Card className="bg-emerald-900/10 border-emerald-500/20 p-6">
                            <h3 className="text-emerald-400 text-xs font-bold uppercase">نشط اليوم</h3>
                            <div className="text-3xl font-black text-emerald-100 mt-1">{stats.activeToday}</div>
                        </Card>
                        <Card className="bg-rose-900/10 border-rose-500/20 p-6">
                            <h3 className="text-rose-400 text-xs font-bold uppercase">في خطر / Flagged</h3>
                            <div className="text-3xl font-black text-rose-100 mt-1">{stats.atRisk}</div>
                        </Card>
                        <Card className="bg-indigo-900/10 border-indigo-500/20 p-6">
                            <h3 className="text-indigo-400 text-xs font-bold uppercase">متعافين (80%+)</h3>
                            <div className="text-3xl font-black text-indigo-100 mt-1">{stats.progressDistribution[2]?.value}</div>
                        </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="min-h-[300px]">
                            <h3 className="text-white font-bold mb-4">توزيع البروتوكولات</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={stats.medTypeDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {stats.medTypeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: 8}} itemStyle={{color: '#fff'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card className="min-h-[300px]">
                             <h3 className="text-white font-bold mb-4">تقدم المستخدمين</h3>
                             <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.progressDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 text-slate-500 -translate-y-1/2" size={18} />
                            <input 
                                className="w-full bg-slate-950 rounded-xl py-2 px-10 text-white border border-white/10 focus:border-indigo-500 outline-none"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                             {(['all', 'risk', 'flagged', 'banned'] as const).map(f => (
                                 <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${filterType === f ? 'bg-white text-black' : 'text-slate-500 border-slate-700'}`}>
                                     {f.toUpperCase()}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredUsers.map(user => (
                            <div key={user.uid} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 relative">
                                        {user.name.charAt(0)}
                                        {user.isFlagged && <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-1"><Flag size={8} className="text-white"/></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.isBanned && <Ban size={12} className="text-rose-500"/>}
                                        </h4>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge color="blue" className="!text-[9px] !px-1.5 !py-0.5">{user.medType || 'Normal'}</Badge>
                                            {user.planType === 'algorithm' && <Badge color="indigo" className="!text-[9px] !px-1.5 !py-0.5">Smart</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="!p-2" onClick={() => openInspector(user)}>
                                        <Eye size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CMS */}
            {activeTab === 'cms' && (
                <div className="animate-in fade-in space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">إدارة المحتوى</h2>
                        <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2 !px-4 !text-sm"><Plus size={16}/> مقال جديد</Button>
                    </div>

                    {showArticleModal && (
                         <Card className="bg-slate-900 border-indigo-500/30 mb-6">
                             <div className="space-y-4">
                                 <input className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10" placeholder="العنوان" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                                 <textarea className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 h-32" placeholder="المحتوى..." value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
                                 <div className="flex justify-end gap-2">
                                     <Button variant="secondary" onClick={() => setShowArticleModal(false)}>إلغاء</Button>
                                     <Button variant="success" onClick={publishArticle}>نشر</Button>
                                 </div>
                             </div>
                         </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {articles.map(art => (
                            <div key={art.id} className="bg-slate-900 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                <Badge color="blue" className="mb-2">{art.category}</Badge>
                                <h3 className="font-bold text-white mb-2">{art.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3">{art.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TICKETS */}
            {activeTab === 'tickets' && (
                <div className="animate-in fade-in">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">الموضوع</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">آخر تحديث</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {tickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-900/50">
                                    <td className="p-4 font-bold text-white">{ticket.userEmail}</td>
                                    <td className="p-4">{ticket.subject}</td>
                                    <td className="p-4">
                                        <Badge color={ticket.status === 'open' ? 'red' : ticket.status === 'resolved' ? 'green' : 'amber'}>
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">{new Date(ticket.lastUpdate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AUDIT */}
            {activeTab === 'audit' && (
                <div className="animate-in fade-in bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50">
                        <h3 className="font-bold text-white flex items-center gap-2"><Lock size={16} className="text-indigo-400"/> سجل العمليات</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {auditLogs.map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-xs">
                                <div><span className="text-indigo-400 font-bold mr-2">[{log.action}]</span><span className="text-slate-300">{log.details}</span></div>
                                <div className="text-slate-600">{new Date(log.timestamp).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === USER INSPECTOR MODAL === */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-20">
                            <X size={20} />
                        </button>
                        
                        <div className="p-6 border-b border-white/5 flex items-center gap-6 bg-slate-950">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {selectedUser.name}
                                    {selectedUser.isFlagged && <Badge color="red">MAPPED FOR REVIEW</Badge>}
                                </h2>
                                <div className="flex gap-2 text-slate-500 font-mono text-sm mt-1 items-center">
                                    <span>{selectedUser.email}</span>
                                    <span>•</span>
                                    {/* Smart System Data */}
                                    <span className="flex items-center gap-1 text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                                        {selectedUser.medForm === 'liquid' ? <FlaskConical size={12}/> : <Pill size={12}/>}
                                        {selectedUser.medUnit}
                                    </span>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold border border-slate-700 px-1 rounded">
                                        {getPaceLabel(selectedUser.speedModifier)}
                                    </span>
                                </div>
                            </div>
                            <div className="mr-auto flex gap-2">
                                <Button onClick={toggleBan} variant={selectedUser.isBanned ? "success" : "danger"} className="!py-2 !px-4 !text-xs">
                                     <Ban size={14} className="mr-2"/> {selectedUser.isBanned ? "Unban" : "Ban User"}
                                </Button>
                                <Button onClick={toggleFlag} variant={selectedUser.isFlagged ? "success" : "secondary"} className="!py-2 !px-4 !text-xs">
                                    <Flag size={14} className="mr-2" /> {selectedUser.isFlagged ? "Unflag" : "Flag"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Plan Type Alert */}
                                <div className="flex gap-4">
                                     <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-white/5">
                                         <span className="block text-xs text-slate-500 uppercase">Plan Type</span>
                                         <span className="text-lg font-bold text-white capitalize">{selectedUser.planType || 'Algorithm'}</span>
                                     </div>
                                     <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-white/5">
                                         <span className="block text-xs text-slate-500 uppercase">Progress</span>
                                         <span className="text-lg font-bold text-emerald-400">{Math.round(selectedUser.progress || 0)}%</span>
                                     </div>
                                     <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-white/5">
                                         <span className="block text-xs text-slate-500 uppercase">Last Active</span>
                                         <span className="text-sm font-bold text-white">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'N/A'}</span>
                                     </div>
                                </div>

                                <Card className="bg-slate-950 border-white/5 min-h-[300px]">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Dose Reduction History ({selectedUser.medUnit || 'mg'})</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={inspectLogs.slice(-30)}>
                                            <defs>
                                                <linearGradient id="colorDoseInsp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis stroke="#475569" fontSize={10} />
                                            <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                                            <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" fill="url(#colorDoseInsp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-amber-900/5 border-amber-500/20">
                                    <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2"><Save size={16}/> Doctor Notes</h3>
                                    <textarea 
                                        className="w-full bg-slate-950/50 border border-amber-500/10 rounded-xl p-3 text-sm text-white h-32 focus:border-amber-500 outline-none resize-none"
                                        placeholder="ملاحظات سرية..."
                                        value={doctorNote}
                                        onChange={e => setDoctorNote(e.target.value)}
                                    />
                                    <Button onClick={saveDoctorNote} variant="secondary" className="w-full mt-2 !py-2 !text-xs">Save</Button>
                                </Card>

                                <div className="bg-slate-950 rounded-2xl border border-white/5 p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 sticky top-0 bg-slate-950 py-2">Last 7 Days Symptoms</h3>
                                    {inspectLogs.length === 0 && <p className="text-slate-600 text-xs italic">No logs available.</p>}
                                    {inspectLogs.slice(-7).reverse().map((log, i) => (
                                        <div key={i} className="mb-3 pb-3 border-b border-white/5 last:border-0">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">{log.date}</span>
                                                <span className={`${log.mood === 'bad' ? 'text-rose-400' : 'text-emerald-400'}`}>{log.mood}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {log.symptoms?.map((s, si) => (
                                                    <span key={si} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{s}</span>
                                                )) || <span className="text-[10px] text-slate-600">No symptoms</span>}
                                            </div>
                                            <div className="text-[10px] text-indigo-400 mt-1">Dose: {log.doseTaken}{selectedUser.medUnit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};