import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { LayoutContainer, PageHeader, Card, Button, Badge } from '../components/UI';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext'; // استيراد هوك اللغة

export const DoctorPatientsView = () => {
    const { t } = useLanguage(); // تفعيل الترجمة

    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- UI State --
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [patientLogs, setPatientLogs] = useState<DailyLog[]>([]);
    
    // -- Fetch Doctor's Patients --
    const fetchMyPatients = async () => {
        const currentUser = auth?.currentUser;
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"), 
                where("patientData.assignedDoctorId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            snapshot.forEach(d => list.push({ uid: d.id, ...d.data() } as UserProfile));
            setMyPatients(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyPatients();
    }, []);

    // -- Fetch Available Users (For Adding) --
    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users")); 
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            
            snapshot.forEach(d => {
                const data = d.data() as UserProfile;
                const hasDoctor = data.patientData?.assignedDoctorId;
                const isStaff = data.role === 'doctor' || data.role === 'admin';
                
                if (!hasDoctor && !isStaff) {
                    list.push({ uid: d.id, ...data });
                }
            });
            setAvailableUsers(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAddPatient = async (user: UserProfile) => {
        const currentUser = auth?.currentUser;
        if (!currentUser || !user.uid) return;
        
        if (!confirm(`Add ${user.name} to your patients?`)) return;

        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: 'patient',
                patientData: {
                    assignedDoctorId: currentUser.uid,
                    assignedDoctorName: currentUser.displayName || 'Doctor',
                    isPlanAssigned: false, 
                    isRecovered: false
                },
            });
            
            setAvailableUsers(prev => prev.filter(u => u.uid !== user.uid));
            setMyPatients(prev => [...prev, { 
                ...user, 
                role: 'patient', 
                patientData: { 
                    assignedDoctorId: currentUser.uid, 
                    assignedDoctorName: currentUser.displayName || 'Doctor', 
                    isPlanAssigned: false, 
                    isRecovered: false 
                } 
            }]);
            
            alert("Patient added successfully.");
            setViewMode('LIST');
        } catch (e) {
            console.error("Error adding patient:", e);
        }
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

    const filteredAvailable = availableUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMyPatients = myPatients.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle="Track progress and manage your clinic."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary">
                            <UserPlus size={18} /> {t('add_patient_btn')}
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary">
                            <ChevronLeft size={18} /> {t('back_list_btn')}
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900 border-white/5 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">Find Users</h3>
                        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                            <Search className="text-slate-500" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.length === 0 && (
                                <p className="text-slate-500 text-center col-span-2 py-8">No users found.</p>
                            )}
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{user.name}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge color="blue" className="!text-[9px] !py-0">{user.medType || 'General'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleAddPatient(user)} variant="success" className="!py-2 !px-3 !text-xs">
                                        <UserPlus size={14} className="mr-1"/> {t('add_btn')}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- MY PATIENTS LIST MODE --- */}
            {viewMode === 'LIST' && (
                <div className="animate-in fade-in">
                    <div className="mb-6 relative">
                         <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-12 text-white outline-none focus:border-indigo-500 transition-all"
                            placeholder={t('search_user_placeholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMyPatients.map(patient => (
                            <div 
                                key={patient.uid} 
                                onClick={() => openPatientDetails(patient)}
                                className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xl">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                                            <p className="text-sm text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'}>
                                        {patient.patientData?.isRecovered ? 'Recovered' : patient.patientData?.isPlanAssigned ? 'Active' : 'Pending Plan'}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">Progress</span>
                                        <span className="block font-bold text-indigo-400">{Math.round(patient.progress || 0)}%</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">Plan</span>
                                        <span className="block font-bold text-white">{patient.patientData?.isPlanAssigned ? 'Active' : '-'}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">Last Active</span>
                                        <span className="block font-bold text-slate-300 text-[10px] mt-1">
                                            {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL (FULL STATS) --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative !p-0 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 bg-slate-950 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FileText size={12}/> {selectedPatient.medType || 'General'} • {selectedPatient.medForm} • {selectedPatient.medUnit}
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                            {/* LEFT COLUMN: CHARTS */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-slate-950 border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> Adherence</h3>
                                    <div className="h-64 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={patientLogs.slice(-30)}>
                                                    <defs>
                                                        <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis stroke="#475569" fontSize={10} />
                                                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                                                    <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" fill="url(#colorDoseP)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-600">No data available</div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: STATS & LOGS */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">{t('sleep_label')}</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Moon size={16} className="text-blue-400"/> 
                                             {patientLogs.length > 0 
                                                ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) 
                                                : '-'}h
                                         </span>
                                     </div>
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">{t('mood')}</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Smile size={16} className="text-emerald-400"/>
                                             Good
                                         </span>
                                     </div>
                                </div>

                                <Card className="bg-slate-900 border-white/5 flex-1 max-h-[400px] overflow-hidden flex flex-col">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 sticky top-0 bg-slate-950 pb-2"><Calendar size={16} className="text-indigo-400"/> Daily Logs</h3>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                                        {patientLogs.slice().reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-white/5 text-xs">
                                                <span className="text-slate-400">{log.date}</span>
                                                <span className="font-bold text-white">{log.doseTaken} {selectedPatient.medUnit}</span>
                                                <span>
                                                    {log.mood === 'good' ? <Smile size={14} className="text-emerald-500"/> : 
                                                     log.mood === 'bad' ? <Frown size={14} className="text-rose-500"/> : 
                                                     <Meh size={14} className="text-amber-500"/>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};