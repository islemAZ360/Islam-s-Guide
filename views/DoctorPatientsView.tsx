import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X, UserCheck, UserX, Clock, BarChart2
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
    const { t } = useLanguage();

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

    const filteredAvailable = availableUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMyPatients = myPatients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle="Track progress and manage your clinic."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                            <UserPlus size={18} /> {t('add_patient_btn')}
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary" className="!rounded-xl">
                            <ChevronLeft size={18} /> {t('back_list_btn')}
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900/80 border-white/10 mb-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Find Users</h3>
                        <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 mb-6 group focus-within:border-indigo-500/50 transition-colors">
                            <Search className="text-slate-500 group-focus-within:text-indigo-400" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{user.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleManualAdd(user)} variant="success" className="!py-2 !px-4 !text-xs !rounded-xl shadow-emerald-500/10">
                                        <UserPlus size={16} className="mr-2"/> {t('add_btn')}
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
                    {/* TABS */}
                    <div className="flex p-1.5 bg-slate-900/50 rounded-2xl border border-white/10 mb-8 w-fit backdrop-blur-md">
                        <button 
                            onClick={() => setActiveTab('MY_PATIENTS')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'MY_PATIENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {t('stat_total_patients')}
                            <Badge color="blue" className="!py-0 !px-1.5 bg-white/20 text-white border-transparent">{myPatients.length}</Badge>
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('REQUESTS')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'REQUESTS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {t('patient_requests_title')}
                            {pendingRequests.length > 0 && <Badge color="red" className="!py-0 !px-1.5 bg-white/20 text-white border-transparent animate-pulse">{pendingRequests.length}</Badge>}
                        </button>
                    </div>

                    {/* TAB: REQUESTS */}
                    {activeTab === 'REQUESTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
                            {pendingRequests.length === 0 && (
                                <div className="col-span-full text-center py-16 bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500">
                                    <Clock size={48} className="mx-auto mb-4 opacity-20"/> {t('no_requests')}
                                </div>
                            )}
                            {pendingRequests.map(patient => (
                                <div key={patient.uid} className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-6 rounded-[2rem] relative shadow-lg hover:shadow-amber-900/10 transition-all">
                                    <Badge color="amber" className="absolute top-6 right-6 !py-1 !px-3 shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl border border-white/5">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{patient.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono">{patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-xl mb-6 border border-white/5">
                                        <div className="flex-1 text-center border-r border-white/10">
                                            <span className="block font-bold text-white text-base mb-1">{patient.medType}</span>Type
                                        </div>
                                        <div className="flex-1 text-center">
                                            <span className="block font-bold text-white text-base mb-1">{patient.medForm}</span>Form
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={() => handleAcceptRequest(patient)} variant="success" className="flex-1 !py-3 !text-xs shadow-emerald-500/10">
                                            <UserCheck size={16} className="mr-2"/> {t('accept_patient')}
                                        </Button>
                                        <Button onClick={() => handleRejectRequest(patient)} variant="danger" className="flex-1 !py-3 !text-xs shadow-rose-500/10">
                                            <UserX size={16} className="mr-2"/> {t('reject_patient')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: MY PATIENTS */}
                    {activeTab === 'MY_PATIENTS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
                            {filteredMyPatients.map(patient => (
                                <div 
                                    key={patient.uid} 
                                    onClick={() => openPatientDetails(patient)}
                                    className="bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/80 cursor-pointer transition-all group relative overflow-hidden backdrop-blur-md shadow-lg"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-2xl border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{patient.name}</h3>
                                                <p className="text-sm text-slate-500 font-mono">{patient.email}</p>
                                            </div>
                                        </div>
                                        <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'} className="shadow-none">
                                            {patient.patientData?.isRecovered ? 'Recovered' : patient.patientData?.isPlanAssigned ? 'Active' : 'Needs Plan'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3 relative z-10">
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Progress</span>
                                            <span className="block font-black text-indigo-400 text-lg">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Status</span>
                                            <span className={`block font-bold text-sm mt-1 ${patient.patientData?.isPlanAssigned ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {patient.patientData?.isPlanAssigned ? 'On Track' : 'Waiting'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Last Active</span>
                                            <span className="block font-bold text-slate-300 text-xs mt-1.5 font-mono">
                                                {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 bg-slate-950/80 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-1">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <FileText size={16} className="text-indigo-400"/> 
                                        <span className="text-white font-bold">{selectedPatient.medType || 'General'}</span> 
                                        <span>•</span>
                                        <span>{selectedPatient.medForm}</span>
                                        <span>•</span>
                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{selectedPatient.medUnit}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar bg-slate-900/30">
                            
                            {/* Charts Area */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="bg-slate-900/60 border-white/5 p-6 h-[400px] flex flex-col shadow-inner">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Activity size={20} className="text-indigo-400"/></div>
                                        Adherence & Dosage
                                    </h3>
                                    <div className="flex-1 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={patientLogs.slice(-30)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                                    <defs>
                                                        <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip 
                                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                                        itemStyle={{color: '#fff'}}
                                                    />
                                                    <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" strokeWidth={3} fill="url(#colorDoseP)" animationDuration={1500} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                                <BarChart2 size={40} className="mb-2 opacity-20"/> No data available
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Stats & Logs */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 text-center shadow-lg">
                                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">{t('sleep_label')}</span>
                                         <span className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                             <Moon size={20} className="text-blue-400"/> 
                                             {patientLogs.length > 0 ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) : '-'} <span className="text-sm text-slate-600">h</span>
                                         </span>
                                     </div>
                                     <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 text-center shadow-lg">
                                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">{t('mood')}</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-2 mt-1">
                                             <Smile size={24} className="text-emerald-400"/> Good
                                         </span>
                                     </div>
                                </div>
                                
                                <Card className="bg-slate-900/60 border-white/5 flex-1 max-h-[500px] overflow-hidden flex flex-col !p-0 shadow-lg">
                                    <div className="p-6 border-b border-white/5 bg-slate-900/40">
                                        <h3 className="text-white font-bold flex items-center gap-3">
                                            <Calendar size={20} className="text-amber-400"/> Recent Logs
                                        </h3>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-2">
                                        {patientLogs.slice().reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-950/50 border border-white/5 text-sm hover:bg-slate-800/50 transition-colors">
                                                <span className="text-slate-400 font-mono">{log.date}</span>
                                                <span className="font-bold text-white text-base">{log.doseTaken} <span className="text-xs text-slate-500 font-normal">{selectedPatient.medUnit}</span></span>
                                                <span>
                                                    {log.mood === 'good' ? <Smile size={18} className="text-emerald-500"/> : 
                                                     log.mood === 'bad' ? <Frown size={18} className="text-rose-500"/> : 
                                                     <Meh size={18} className="text-amber-500"/>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};