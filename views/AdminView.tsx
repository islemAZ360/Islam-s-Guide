import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    ShieldAlert, Ban, UserCheck, MessageSquare, Activity, Search, 
    AlertOctagon, Users, Megaphone, CheckCircle, TrendingUp 
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// --- Interfaces for Stats ---
interface DashboardStats {
    totalUsers: number;
    activeToday: number;
    bannedUsers: number;
    atRisk: number;
    medTypeDistribution: { name: string; value: number; color: string }[];
    progressDistribution: { name: string; value: number }[];
}

export const AdminView = () => {
    const { t } = useLanguage();
    
    // -- State --
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'broadcast'>('overview');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // User Management State
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messageText, setMessageText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'risk' | 'banned' | 'admin'>('all');

    // Broadcast State
    const [broadcastMsg, setBroadcastMsg] = useState("");

    // -- Fetch Data --
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: UserProfile[] = [];
            
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // CRITICAL FIX: Flatten the data structure
                // App.tsx saves profile data inside 'userProfile' object, but AdminView expects flat UserProfile interface
                const profileData = data.userProfile || {};
                
                fetchedUsers.push({ 
                    uid: docSnap.id, 
                    email: data.email || profileData.email, // Ensure email is captured
                    progress: data.progress || 0,
                    lastActive: data.lastActive,
                    isBanned: data.isBanned || false,
                    isAdmin: data.isAdmin || false,
                    ...profileData // Spread name, medType, etc. to root
                } as UserProfile);
            });
            
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // -- Logic & Calculations --

    const stats: DashboardStats = useMemo(() => {
        const medTypes = { narcotic: 0, psychiatric: 0, normal: 0, unknown: 0 };
        const progress = { start: 0, mid: 0, end: 0 };
        let active = 0;
        let risk = 0;
        let banned = 0;

        const oneDayMs = 24 * 60 * 60 * 1000;
        const now = Date.now();

        users.forEach(u => {
            if (u.isBanned) banned++;
            
            // Med Type Count
            if (u.medType === 'narcotic') medTypes.narcotic++;
            else if (u.medType === 'psychiatric') medTypes.psychiatric++;
            else if (u.medType === 'normal') medTypes.normal++;
            else medTypes.unknown++;

            // Progress Buckets
            const p = u.progress || 0;
            if (p < 30) progress.start++;
            else if (p < 80) progress.mid++;
            else progress.end++;

            // Active Today Logic
            if (u.lastActive) {
                const last = new Date(u.lastActive).getTime();
                if (now - last < oneDayMs) active++;
                // Risk: Inactive for > 7 days AND progress < 50%
                if (now - last > (oneDayMs * 7) && p < 50) risk++;
            } else {
                risk++;
            }
        });

        return {
            totalUsers: users.length,
            activeToday: active,
            bannedUsers: banned,
            atRisk: risk,
            medTypeDistribution: [
                { name: t('med_narcotic'), value: medTypes.narcotic, color: '#f43f5e' }, // Rose
                { name: t('med_psych'), value: medTypes.psychiatric, color: '#8b5cf6' }, // Violet
                { name: t('med_normal'), value: medTypes.normal, color: '#10b981' }, // Emerald
            ].filter(x => x.value > 0),
            progressDistribution: [
                { name: '0-30%', value: progress.start },
                { name: '30-80%', value: progress.mid },
                { name: '80-100%', value: progress.end },
            ]
        };
    }, [users, t]);

    // Filter Users Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (filterType === 'banned') matchesFilter = !!u.isBanned;
        if (filterType === 'admin') matchesFilter = !!u.isAdmin;
        if (filterType === 'risk') {
            const oneDayMs = 24 * 60 * 60 * 1000;
            const now = Date.now();
            const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
            matchesFilter = (now - last > (oneDayMs * 7) && (u.progress || 0) < 50);
        }

        return matchesSearch && matchesFilter;
    });

    // -- Actions --
    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newStatus = !user.isBanned;
        if(confirm(`Are you sure you want to ${newStatus ? 'BAN' : 'UNBAN'} ${user.name}?`)) {
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    isBanned: newStatus
                });
                setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isBanned: newStatus } : u));
            } catch (e) {
                console.error("Error banning user", e);
            }
        }
    };

    const sendMessage = async () => {
        if (!selectedUser?.uid || !messageText) return;
        try {
            await addDoc(collection(db, "users", selectedUser.uid, "admin_messages"), {
                text: messageText,
                fromAdmin: true,
                timestamp: Date.now(),
                read: false
            });
            setMessageText("");
            setSelectedUser(null);
            alert(t('msg_sent'));
        } catch (e) {
            console.error("Error sending message", e);
        }
    };

    const handleBroadcast = () => {
        if (!broadcastMsg) return;
        alert(t('broadcast_simulated'));
        setBroadcastMsg("");
    };

    // --- Render ---
    return (
        <LayoutContainer>
            <PageHeader title={t('admin_title')} subtitle="مركز القيادة والتحكم الذكي" />

            {/* Top Navigation Tabs */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 mb-8 w-full md:w-fit overflow-x-auto">
                {[
                    { id: 'overview', icon: Activity, label: t('admin_overview') },
                    { id: 'users', icon: Users, label: t('admin_users') },
                    { id: 'broadcast', icon: Megaphone, label: t('admin_broadcast') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-900 border-white/5 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <Users className="text-slate-400" />
                                <Badge color="blue">+12%</Badge>
                            </div>
                            <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase mt-1">{t('total_users')}</div>
                        </Card>
                        <Card className="bg-indigo-900/10 border-indigo-500/20 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <Activity className="text-indigo-400" />
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            </div>
                            <div className="text-3xl font-black text-indigo-100">{stats.activeToday}</div>
                            <div className="text-xs text-indigo-300 font-bold uppercase mt-1">{t('active_today')}</div>
                        </Card>
                        <Card className="bg-rose-900/10 border-rose-500/20 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <AlertOctagon className="text-rose-400" />
                                <Badge color="red">Attention</Badge>
                            </div>
                            <div className="text-3xl font-black text-rose-100">{stats.atRisk}</div>
                            <div className="text-xs text-rose-300 font-bold uppercase mt-1">{t('at_risk')}</div>
                        </Card>
                        <Card className="bg-emerald-900/10 border-emerald-500/20 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <CheckCircle className="text-emerald-400" />
                            </div>
                            <div className="text-3xl font-black text-emerald-100">{stats.progressDistribution[2]?.value || 0}</div>
                            <div className="text-xs text-emerald-300 font-bold uppercase mt-1">{t('near_recovery')}</div>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="min-h-[350px] flex flex-col">
                             <h3 className="text-lg font-bold text-white mb-6">{t('protocol_dist')}</h3>
                             <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.medTypeDistribution}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.medTypeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px'}} itemStyle={{color: '#fff'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="flex justify-center gap-4 flex-wrap">
                                 {stats.medTypeDistribution.map((d, i) => (
                                     <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                         <span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>
                                         {d.name}
                                     </div>
                                 ))}
                             </div>
                         </Card>

                         <Card className="min-h-[350px] flex flex-col">
                             <h3 className="text-lg font-bold text-white mb-6">{t('user_progress_dist')}</h3>
                             <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.progressDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px'}} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                         </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: USERS */}
            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 md:right-4 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="بحث بالاسم أو البريد..." 
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-12 text-white outline-none focus:border-indigo-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'risk', label: 'متعثرين' },
                                { id: 'banned', label: 'محظورين' },
                                { id: 'admin', label: 'مشرفين' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterType(f.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                                        filterType === f.id 
                                        ? 'bg-white text-slate-900 border-white' 
                                        : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="space-y-4">
                        {loading ? <div className="text-center text-slate-500 py-10">جاري تحميل البيانات...</div> : filteredUsers.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                                لا يوجد مستخدمين مطابقين للبحث
                            </div>
                        ) : filteredUsers.map(user => (
                            <div key={user.uid} className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl relative ${user.isBanned ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                                        {(user.name || '?').charAt(0).toUpperCase()}
                                        {/* Status Dot */}
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                                            user.lastActive && (Date.now() - new Date(user.lastActive).getTime() < 24*60*60*1000) 
                                            ? 'bg-emerald-500' : 'bg-slate-600'
                                        }`}></span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {user.name}
                                            {user.isAdmin && <ShieldAlert size={14} className="text-indigo-400" />}
                                            {user.isBanned && <Ban size={14} className="text-rose-400" />}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge color="blue">{user.medType || 'N/A'}</Badge>
                                            <Badge color={user.progress && user.progress > 80 ? 'green' : 'amber'}>
                                                {user.progress ? Math.round(user.progress) : 0}%
                                            </Badge>
                                            {user.lastActive && (
                                                <span className="text-[10px] text-slate-600 self-center">
                                                    {new Date(user.lastActive).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="secondary" 
                                        className="!py-2 !text-xs flex-1 md:flex-none"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <MessageSquare size={16} /> {t('send_msg')}
                                    </Button>
                                    {!user.isAdmin && (
                                        <Button 
                                            variant={user.isBanned ? 'success' : 'danger'}
                                            className="!py-2 !text-xs flex-1 md:flex-none"
                                            onClick={() => toggleBan(user)}
                                        >
                                            {user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                                            {user.isBanned ? t('user_unban') : t('user_ban')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: BROADCAST */}
            {activeTab === 'broadcast' && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                    <Card className="bg-slate-900 border-indigo-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Megaphone size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{t('admin_broadcast')}</h3>
                                <p className="text-slate-500 text-sm">سيظهر هذا الإشعار لجميع المستخدمين في لوحة التحكم.</p>
                            </div>
                        </div>
                        
                        <textarea 
                            className="w-full h-40 bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-6 outline-none focus:border-indigo-500 font-medium"
                            placeholder={t('broadcast_placeholder')}
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                        />
                        
                        <div className="flex justify-end gap-4">
                            <Button variant="secondary" onClick={() => setBroadcastMsg("")}>مسح</Button>
                            <Button variant="primary" onClick={handleBroadcast} disabled={!broadcastMsg}>
                                {t('send_broadcast')} <TrendingUp size={16} />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Message Modal (Overlay) */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-1">{t('send_msg')}</h3>
                        <p className="text-indigo-400 text-sm mb-4 font-bold">To: {selectedUser.name}</p>
                        <textarea 
                            className="w-full h-32 bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
                            placeholder={t('admin_note_placeholder')}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setSelectedUser(null)}>إلغاء</Button>
                            <Button variant="primary" onClick={sendMessage}>إرسال</Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};