import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X, UserCheck, UserX, Clock, BarChart2, TrendingUp
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorPatientsView = () => {
    const { t, language } = useLanguage();

    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- UI State --
    const [activeTab, setActiveTab] = useState<'MY_PATIENTS' | 'REQUESTS'>('MY_PATIENTS');
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [patientLogs, setPatientLogs] = useState<DailyLog[]>([]);
    
    // -- Fetch Data --
    const fetchData = async () => {
        const currentUser = auth?.currentUser;
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"), 
                where("patientData.assignedDoctorId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const allAssigned: UserProfile[] = [];
            snapshot.forEach(d => allAssigned.push({ uid: d.id, ...d.data() } as UserProfile));

            setMyPatients(allAssigned.filter(p => p.patientData?.requestStatus === 'approved'));
            setPendingRequests(allAssigned.filter(p => p.patientData?.requestStatus === 'pending'));

        } catch (e) { console.error("Error fetching data:", e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // -- Memoized Filters --
    const filteredAvailable = useMemo(() => {
        return availableUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availableUsers, searchTerm]);

    const filteredMyPatients = useMemo(() => {
        return myPatients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [myPatients, searchTerm]);

    // -- Memoized & Sorted Logs for Chart --
    const sortedPatientLogs = useMemo(() => {
        return [...patientLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [patientLogs]);

    // -- Actions --
    const handleAcceptRequest = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Accept ${patient.name} as your patient?`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.requestStatus": "approved",
                "patientData.isPlanAssigned": false 
            });
            
            setPendingRequests(prev => prev.filter(p => p.uid !== patient.uid));
            setMyPatients(prev => [...prev, { 
                ...patient, 
                patientData: { ...patient.patientData!, requestStatus: 'approved' } 
            }]);
        } catch (e) { console.error(e); }
    };

    const handleRejectRequest = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Reject request from ${patient.name}?`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.requestStatus": "rejected"
            });
            setPendingRequests(prev => prev.filter(p => p.uid !== patient.uid));
        } catch (e) { console.error(e); }
    };

    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const q1 = query(collection(db, "users"), where("role", "==", "normal_user"));
            const snap1 = await getDocs(q1);
            const q2 = query(collection(db, "users"), where("role", "==", "patient"));
            const snap2 = await getDocs(q2);

            const list: UserProfile[] = [];
            const seenIds = new Set();

            const processDoc = (d: any) => {
                const data = d.data() as UserProfile;
                if (!data.patientData?.assignedDoctorId && !seenIds.has(d.id)) {
                    list.push({ uid: d.id, ...data });
                    seenIds.add(d.id);
                }
            };
            snap1.forEach(processDoc);
            snap2.forEach(processDoc);
            setAvailableUsers(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleManualAdd = async (user: UserProfile) => {
        const currentUser = auth?.currentUser;
        if (!currentUser || !user.uid) return;
        
        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: 'patient',
                patientData: {
                    assignedDoctorId: currentUser.uid,
                    assignedDoctorName: currentUser.displayName || 'Doctor',
                    requestStatus: 'approved',
                    isPlanAssigned: false, 
                    isRecovered: false
                },
            });
            setAvailableUsers(prev => prev.filter(u => u.uid !== user.uid));
            setMyPatients(prev => [...prev, { ...user, role: 'patient', patientData: { ...user.patientData!, requestStatus: 'approved' } }]);
            setViewMode('LIST');
        } catch (e) { console.error(e); }
    };

    const openPatientDetails = async (patient: UserProfile) => {
        if (!patient.uid) return;
        setSelectedPatient(patient);
        setPatientLogs([]); 
        try {
            const d = await getDoc(doc(db, "users", patient.uid));
            if (d.exists()) {
                const data = d.data();
                setPatientLogs(data.logs || []);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle={language === 'ar' ? "متابعة التقدم وإدارة الملفات الطبية" : "Track progress and manage clinical files"}
                action={
                    viewMode === 'LIST' ? (
                        <div className="flex gap-3">
                            <div className="relative group hidden md:block">
                                <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={16} />
                                <input 
                                    className="bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64 placeholder-slate-600"
                                    placeholder={language === 'ar' ? "بحث عن مريض..." : "Search patients..."}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary" className="!rounded-xl shadow-lg shadow-indigo-500/20 !py-2.5 !text-xs">
                                <UserPlus size={16} aria-hidden="true" /> {t('add_patient_btn')}
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary" className="!rounded-xl">
                            <ChevronLeft size={18} aria-hidden="true" /> {t('back_list_btn')}
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-[#0f172a]/80 border-white/10 mb-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Find & Add Users</h3>
                        <div className="flex items-center gap-4 bg-[#020617] p-4 rounded-2xl border border-white/5 mb-6 group focus-within:border-indigo-500/50 transition-colors">
                            <label htmlFor="user-search" className="sr-only">Search Users</label>
                            <Search className="text-slate-500 group-focus-within:text-indigo-400" aria-hidden="true" />
                            <input 
                                id="user-search"
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600 font-medium"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar" role="list">
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex flex-col justify-between p-5 rounded-3xl border border-white/5 bg-[#1e293b]/30 hover:border-indigo-500/30 hover:bg-[#1e293b]/50 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                                    <div className="flex items-center gap-4 mb-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base">{user.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleManualAdd(user)} variant="success" className="w-full !py-2.5 !text-xs !rounded-xl shadow-none border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white">
                                        <UserPlus size={14} className="mr-2" aria-hidden="true"/> {t('add_btn')}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- LIST MODE --- */}
            {viewMode === 'LIST' && (
                <div className="animate-in fade-in">
                    {/* TABS (Floating Island) */}
                    <div className="flex justify-center mb-8">
                        <div className="flex p-1.5 bg-[#0f172a] rounded-full border border-white/10 shadow-xl" role="tablist">
                            <button 
                                onClick={() => setActiveTab('MY_PATIENTS')}
                                role="tab"
                                aria-selected={activeTab === 'MY_PATIENTS'}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none ${activeTab === 'MY_PATIENTS' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {t('stat_total_patients')}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'MY_PATIENTS' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{myPatients.length}</span>
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('REQUESTS')}
                                role="tab"
                                aria-selected={activeTab === 'REQUESTS'}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none ${activeTab === 'REQUESTS' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {t('patient_requests_title')}
                                {pendingRequests.length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500 text-white animate-pulse">{pendingRequests.length}</span>}
                            </button>
                        </div>
                    </div>

                    {/* TAB: REQUESTS */}
                    {activeTab === 'REQUESTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
                            {pendingRequests.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-[3rem]">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                        <Clock size={24} className="opacity-50"/>
                                    </div>
                                    <p className="font-medium">{t('no_requests')}</p>
                                </div>
                            )}
                            {pendingRequests.map(patient => (
                                <div key={patient.uid} className="bg-[#0f172a] border border-amber-500/20 p-6 rounded-[2.5rem] relative shadow-lg hover:shadow-amber-900/10 transition-all group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#1e293b] rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl border border-white/5 shadow-inner">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{patient.name}</h3>
                                                <p className="text-xs text-slate-500 font-mono">{patient.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                                        <div className="bg-[#020617]/50 p-3 rounded-2xl border border-white/5 text-center">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Med Type</span>
                                            <span className="block font-bold text-amber-200 text-sm">{patient.medType}</span>
                                        </div>
                                        <div className="bg-[#020617]/50 p-3 rounded-2xl border border-white/5 text-center">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Form</span>
                                            <span className="block font-bold text-white text-sm">{patient.medForm}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 relative z-10">
                                        <Button onClick={() => handleAcceptRequest(patient)} variant="success" className="flex-1 !py-3 !text-xs !rounded-xl shadow-lg shadow-emerald-500/10">
                                            <UserCheck size={16} className="mr-2" /> {t('accept_patient')}
                                        </Button>
                                        <Button onClick={() => handleRejectRequest(patient)} variant="danger" className="flex-1 !py-3 !text-xs !rounded-xl shadow-none bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white">
                                            <UserX size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: MY PATIENTS */}
                    {activeTab === 'MY_PATIENTS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-right-4">
                            {filteredMyPatients.map(patient => (
                                <div 
                                    key={patient.uid} 
                                    onClick={() => openPatientDetails(patient)}
                                    className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-6 rounded-[2.5rem] hover:border-indigo-500/30 cursor-pointer transition-all group relative overflow-hidden shadow-2xl hover:shadow-indigo-900/20 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for ${patient.name}`}
                                >
                                    {/* Background Glow */}
                                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-[#020617] rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-2xl border border-white/5 shadow-inner group-hover:scale-105 transition-transform group-hover:border-indigo-500/30">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{patient.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {patient.patientData?.isRecovered ? (
                                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Recovered</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Active</span>
                                                    )}
                                                    {patient.patientData?.isPlanAssigned && !patient.patientData?.isRecovered && (
                                                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Plan Set</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="relative z-10 mb-6">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                            <span>Progress</span>
                                            <span className="text-white">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#020617] rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-1000" style={{ width: `${patient.progress || 0}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex justify-between items-center text-xs relative z-10 pt-4 border-t border-white/5">
                                        <div className="text-slate-500 font-mono">
                                            Last: {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors font-bold uppercase tracking-wider">
                                            View Profile <ChevronLeft size={12} className="rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL (Full Screen Panel) --- */}
            {selectedPatient && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-0 md:p-6 animate-in zoom-in duration-300"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full h-full max-w-7xl bg-[#0f172a] border border-white/10 shadow-2xl relative rounded-none md:rounded-[3rem] overflow-hidden flex flex-col">
                        
                        {/* Header */}
                        <div className="p-6 md:p-8 bg-[#0f172a] border-b border-white/5 flex justify-between items-center shrink-0 relative z-20">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-500/30">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <span className="flex items-center gap-1 text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded"><FileText size={12}/> {selectedPatient.medType || 'General'}</span> 
                                        <span className="hidden md:inline">•</span>
                                        <span className="font-mono">{selectedPatient.medForm}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="bg-slate-900 px-2 py-0.5 rounded text-xs border border-white/10 font-bold text-slate-300">{selectedPatient.medUnit}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPatient(null)} 
                                className="p-4 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform"/>
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617]">
                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* LEFT: Charts & Key Metrics */}
                                <div className="lg:col-span-2 space-y-8">
                                    
                                    {/* Main Chart Card */}
                                    <div className="bg-[#0f172a]/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                            <Activity size={120} />
                                        </div>
                                        <div className="flex justify-between items-end mb-8 relative z-10">
                                            <div>
                                                <h3 className="text-white font-bold text-xl flex items-center gap-3 mb-2">
                                                    <TrendingUp className="text-emerald-400" /> Adherence History
                                                </h3>
                                                <p className="text-slate-500 text-sm">Dosage intake over time</p>
                                            </div>
                                            <Badge color="indigo" className="animate-pulse">Live Data</Badge>
                                        </div>
                                        
                                        <div className="h-80 w-full" role="img" aria-label="Adherence Chart">
                                            {sortedPatientLogs.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={sortedPatientLogs.slice(-30)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                                        <defs>
                                                            <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                                                        <XAxis dataKey="date" hide />
                                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip 
                                                            contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px'}}
                                                            itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                                            labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '5px'}}
                                                        />
                                                        <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" strokeWidth={4} fill="url(#colorDoseP)" animationDuration={1500} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                                                    <BarChart2 size={48} className="mb-4 opacity-20"/> 
                                                    <span>No log data available yet</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mini Metrics */}
                                    <div className="grid grid-cols-2 gap-6">
                                         <div className="bg-[#0f172a] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 shadow-lg">
                                             <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                                 <Moon size={28} />
                                             </div>
                                             <div>
                                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sleep_label')}</p>
                                                 <p className="text-3xl font-black text-white">
                                                     {patientLogs.length > 0 ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) : '-'} <span className="text-sm text-slate-600 font-medium">avg</span>
                                                 </p>
                                             </div>
                                         </div>
                                         <div className="bg-[#0f172a] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 shadow-lg">
                                             <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                                                 <Smile size={28} />
                                             </div>
                                             <div>
                                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('mood')}</p>
                                                 <p className="text-xl font-bold text-white">Mostly Good</p>
                                             </div>
                                         </div>
                                    </div>
                                </div>

                                {/* RIGHT: Scrollable Logs */}
                                <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl h-[600px] lg:h-auto">
                                    <div className="p-6 border-b border-white/5 bg-[#1e293b]/30">
                                        <h3 className="text-white font-bold flex items-center gap-3 text-lg">
                                            <Calendar size={20} className="text-amber-400" /> Recent Logs
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                                        {sortedPatientLogs.length === 0 && (
                                            <div className="text-center py-10 text-slate-500">No logs recorded.</div>
                                        )}
                                        {[...sortedPatientLogs].reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-[#020617] border border-white/5 text-sm hover:border-indigo-500/30 transition-colors group">
                                                <div>
                                                    <p className="text-slate-400 font-mono text-xs mb-1">{new Date(log.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                                                    <p className="font-black text-white text-lg">{log.doseTaken} <span className="text-xs text-slate-500 font-normal">{selectedPatient.medUnit}</span></p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {log.sleepHours && (
                                                        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{log.sleepHours}h</span>
                                                    )}
                                                    <div className={`p-2 rounded-xl ${
                                                        log.mood === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 
                                                        log.mood === 'bad' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                        {log.mood === 'good' ? <Smile size={20} /> : log.mood === 'bad' ? <Frown size={20} /> : <Meh size={20} />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};