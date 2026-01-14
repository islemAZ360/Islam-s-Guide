import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser, Stethoscope, LineChart, Info, Check, AlertTriangle, Eye, UserPlus
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorDashboardView = () => {
    const { t, language } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // -- Modal State --
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [phases, setPhases] = useState<ManualPhase[]>([]);
    
    // Manual Input
    const [newDose, setNewDose] = useState('');
    const [newDays, setNewDays] = useState('7');
    const [doctorNote, setDoctorNote] = useState('');

    // Pattern Builder State
    const [patternSeq, setPatternSeq] = useState('0.5, 1');
    const [patternRepeat, setPatternRepeat] = useState('4');
    const [patternDaysPerDose, setPatternDaysPerDose] = useState('1');

    // Accessibility Refs
    const modalTitleRef = useRef<HTMLHeadingElement>(null);

    // -- Fetch Data --
    useEffect(() => {
        const fetchDoctorData = async () => {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
            
            setLoading(true);
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorProfile(docSnap.data() as UserProfile);
                }

                const q = query(
                    collection(db, "users"), 
                    where("patientData.assignedDoctorId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const allPatients: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    allPatients.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });

                setPendingPatients(allPatients.filter(p => p.patientData?.requestStatus === 'approved' && !p.patientData?.isPlanAssigned));
                setPatients(allPatients.filter(p => p.patientData?.isPlanAssigned));

            } catch (error) {
                console.error("Error fetching doctor data:", error);
            }
            setLoading(false);
        };

        fetchDoctorData();
    }, []);

    // Focus management when modal opens
    useEffect(() => {
        if (selectedPatient && modalTitleRef.current) {
            modalTitleRef.current.focus();
        }
    }, [selectedPatient]);

    // -- Preview Data Generation --
    const previewData = useMemo(() => {
        if (phases.length === 0) return [];
        // Use a dummy start date to generate the sequence
        const dummyPlan = generateManualPlan(phases, new Date().toISOString());
        return dummyPlan.map((p, i) => ({
            day: i + 1,
            dose: p.plannedDose
        }));
    }, [phases]);

    // -- Helpers --
    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    // -- Actions --
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        
        if (isNaN(dose) || dose < 0) {
            showStatus('error', "Invalid dosage. Must be 0 or greater.");
            return;
        }
        if (isNaN(days) || days <= 0) {
            showStatus('error', "Duration must be at least 1 day.");
            return;
        }

        setPhases(prev => [...prev, { dose, days }]);
        setNewDose(''); 
    };

    const handleApplyPattern = () => {
        const sequence = patternSeq
            .split(',')
            .map(s => parseFloat(s.trim()))
            .filter(n => !isNaN(n) && n >= 0);
            
        const repeat = parseInt(patternRepeat);
        const days = parseInt(patternDaysPerDose);

        if (sequence.length === 0) {
            showStatus('error', "Pattern sequence is invalid.");
            return;
        }
        if (isNaN(repeat) || repeat <= 0) {
            showStatus('error', "Repeat count must be positive.");
            return;
        }
        if (isNaN(days) || days <= 0) {
            showStatus('error', "Days per dose must be positive.");
            return;
        }

        const newPhases: ManualPhase[] = [];
        for (let i = 0; i < repeat; i++) {
            sequence.forEach(dose => {
                newPhases.push({ dose, days });
            });
        }
        setPhases(prev => [...prev, ...newPhases]);
        showStatus('success', `Added ${newPhases.length} phases from pattern.`);
    };

    const handleRemovePhase = (index: number) => {
        setPhases(prev => prev.filter((_, i) => i !== index));
    };

    const saveTreatmentPlan = async () => {
        if (!selectedPatient?.uid || phases.length === 0) return;
        
        if (!window.confirm("Confirm: This will overwrite any existing plan and notify the patient immediately.")) return;

        const fullPlan = generateManualPlan(phases, new Date().toISOString());

        try {
            await updateDoc(doc(db, "users", selectedPatient.uid), {
                plan: fullPlan,
                "patientData.isPlanAssigned": true,
                "patientData.isRecovered": false,
                doctorNotes: doctorNote,
                planType: 'manual', 
                lastActive: new Date().toISOString()
            });

            setPendingPatients(prev => prev.filter(p => p.uid !== selectedPatient.uid));
            setPatients(prev => {
                const exists = prev.find(p => p.uid === selectedPatient.uid);
                if (exists) return prev;
                return [...prev, { 
                    ...selectedPatient, 
                    patientData: { ...selectedPatient.patientData!, isPlanAssigned: true } 
                }];
            });
            
            setSelectedPatient(null);
            setPhases([]);
            setDoctorNote('');
            alert("Plan assigned successfully.");

        } catch (e) {
            console.error("Error saving plan:", e);
            showStatus('error', "Failed to save plan to database.");
        }
    };

    const markAsRecovered = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Mark ${patient.name} as recovered? This stops the active plan.`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.isRecovered": true,
                "patientData.recoveryDate": new Date().toISOString()
            });

            setPatients(prev => prev.map(p => p.uid === patient.uid ? { 
                ...p, patientData: { ...p.patientData!, isRecovered: true } 
            } : p));
        } catch (e) { console.error(e); }
    };

    const statsData = [
        { name: t('stat_new_requests'), value: pendingPatients.length, color: '#f59e0b' },
        { name: 'Active', value: patients.filter(p => !p.patientData?.isRecovered).length, color: '#6366f1' },
        { name: t('stat_recovered'), value: patients.filter(p => p.patientData?.isRecovered).length, color: '#10b981' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-indigo-400 gap-4 animate-pulse" role="status">
            <div className="relative">
                <Activity className="animate-spin w-10 h-10" />
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
            </div>
            <span className="font-bold tracking-widest text-sm">LOADING CLINIC...</span>
        </div>
    );

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || 'General'}`} 
            />

            {/* 1. HERO STATS CARDS */}
            <section aria-label="Clinic Statistics" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-4">
                {/* Total Patients */}
                <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 group hover:border-indigo-500/30 transition-all">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <Badge color="indigo" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Total</Badge>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white tracking-tight">{patients.length + pendingPatients.length}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{t('stat_total_patients')}</p>
                        </div>
                    </div>
                </Card>
                
                {/* Pending Actions */}
                <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform animate-pulse-glow">
                                <Clock size={24} />
                            </div>
                            {pendingPatients.length > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white tracking-tight">{pendingPatients.length}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{t('pending_approvals')}</p>
                        </div>
                    </div>
                </Card>

                {/* Recovered */}
                <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white tracking-tight">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{t('stat_recovered')}</p>
                        </div>
                    </div>
                </Card>

                {/* Chart Widget */}
                <Card className="relative overflow-hidden border-white/5 bg-[#0f172a]/80 p-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none z-10"></div>
                    <div className="p-4 relative z-20">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <LineChart size={14} className="text-indigo-400"/> {t('stat_overview')}
                        </p>
                    </div>
                    <div className="h-28 w-full -mt-2 relative z-0 opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} margin={{top:10, right:0, left:0, bottom:0}} barSize={20}>
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {statsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </section>

            {/* 2. PENDING REQUESTS (Action Needed) */}
            {pendingPatients.length > 0 && (
                <section aria-labelledby="action-needed-title" className="mb-10 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 mb-6 px-1">
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                            <AlertCircle size={20} />
                        </div>
                        <h2 id="action-needed-title" className="text-xl font-bold text-white">Action Needed: Create Plans</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingPatients.map(patient => (
                            <div key={patient.uid} className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-6 rounded-[2rem] hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-amber-900/10 group">
                                <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-slate-300 font-bold text-xl border border-white/5 shadow-inner">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-amber-400 transition-colors">{patient.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color="slate" className="!text-[9px] !py-0.5">{patient.medType || 'General'}</Badge>
                                            <span className="text-[10px] text-slate-500 font-mono">{patient.medUnit}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
                                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Form</span>
                                        <span className="block text-white font-bold text-sm">{patient.medForm}</span>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center">
                                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Age</span>
                                        <span className="block text-white font-bold text-sm">{patient.age || '-'}</span>
                                    </div>
                                </div>

                                <Button onClick={() => setSelectedPatient(patient)} className="w-full shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40" variant="primary">
                                    {t('create_plan_btn')} <ChevronRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. ACTIVE PATIENTS LIST */}
            <section aria-labelledby="active-patients-title">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 id="active-patients-title" className="text-xl font-bold text-white flex items-center gap-3">
                        <Users className="text-indigo-400" size={24} /> 
                        {t('stat_total_patients')}
                    </h2>
                    <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-slate-400">
                        {patients.length} Active Cases
                    </div>
                </div>

                <Card className="bg-[#0f172a]/60 border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl" noPadding>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
                                <tr>
                                    <th className="p-6">Patient Details</th>
                                    <th className="p-6">Medication</th>
                                    <th className="p-6">Progress</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center text-slate-600 flex flex-col items-center justify-center">
                                            <Users size={48} className="mb-4 opacity-20" />
                                            <p>No active patients currently.</p>
                                        </td>
                                    </tr>
                                )}
                                {patients.map(patient => (
                                    <tr key={patient.uid} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/5 group-hover:scale-105 transition-transform">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base">{patient.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{patient.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-white">{patient.medType || 'Standard'}</span>
                                                <span className="text-xs text-slate-500">{patient.medForm} • {patient.medUnit}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{width: `${patient.progress || 0}%`}}></div>
                                                </div>
                                                <span className="text-xs font-bold text-white">{Math.round(patient.progress || 0)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {patient.patientData?.isRecovered ? (
                                                <Badge color="green" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Recovered</Badge>
                                            ) : (
                                                <Badge color="indigo" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex w-fit items-center gap-1">
                                                    <Activity size={10} className="animate-pulse" /> Active
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {!patient.patientData?.isRecovered && (
                                                <button 
                                                    onClick={() => markAsRecovered(patient)}
                                                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                                                    title="Mark as Recovered"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>

            {/* 4. PLAN CREATION MODAL (Improved Grid & Visuals) */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
                    <div className="w-full max-w-6xl bg-[#0f172a] border border-white/10 shadow-2xl relative max-h-[95vh] flex flex-col rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
                        
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 bg-[#0f172a] flex justify-between items-center shrink-0">
                            <div>
                                <h2 id="plan-modal-title" ref={modalTitleRef} tabIndex={-1} className="text-3xl font-black text-white mb-2 flex items-center gap-3 outline-none">
                                    <Stethoscope className="text-indigo-500" size={32} /> {t('create_plan_btn')}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <Badge color="blue" className="text-sm px-3 py-1">Patient: {selectedPatient.name}</Badge>
                                    <span className="text-slate-500 text-sm">{selectedPatient.medUnit} • {selectedPatient.medForm}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5 focus:ring-2 focus:ring-indigo-500 outline-none">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0b0f17]">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* LEFT: Inputs (4 Columns) */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Pattern Builder Card */}
                                    <div className="bg-[#1e293b]/50 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                        <h3 className="text-indigo-300 font-bold mb-6 flex items-center gap-2 text-lg relative z-10">
                                            <Repeat size={18} /> {t('pattern_builder')}
                                        </h3>
                                        
                                        <div className="space-y-5 relative z-10">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">{t('pattern_sequence')}</label>
                                                <input 
                                                    className="w-full bg-[#020617] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-all placeholder-slate-700 shadow-inner"
                                                    placeholder="e.g. 0.5, 1, 0.5, 1"
                                                    value={patternSeq}
                                                    onChange={e => setPatternSeq(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">{t('repeat_count')}</label>
                                                    <input 
                                                        type="number" min="1" 
                                                        className="w-full bg-[#020617] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none text-center shadow-inner"
                                                        value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">{t('days_per_dose')}</label>
                                                    <input 
                                                        type="number" min="1" 
                                                        className="w-full bg-[#020617] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none text-center shadow-inner"
                                                        value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleApplyPattern} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20">
                                                <Copy size={16} className="mr-2" /> {t('apply_pattern')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Manual Entry Card */}
                                    <div className="bg-[#1e293b]/50 border border-white/5 p-6 rounded-3xl">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Plus size={16} className="text-slate-400"/> Manual Entry
                                        </h3>
                                        <div className="flex gap-4 mb-4">
                                            <input type="number" placeholder="Dose" className="flex-1 bg-[#020617] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500 text-center" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                            <input type="number" placeholder="Days" className="flex-1 bg-[#020617] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500 text-center" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                        <Button onClick={handleAddPhase} variant="secondary" className="w-full py-3 text-xs bg-slate-800 border-white/5">Add Single Phase</Button>
                                    </div>
                                </div>

                                {/* RIGHT: Visualization & List (8 Columns) */}
                                <div className="lg:col-span-8 flex flex-col gap-6">
                                    
                                    {/* Chart */}
                                    <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-white/5 h-64 relative overflow-hidden">
                                        <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400"><Eye size={16}/></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projection</span>
                                        </div>
                                        
                                        <div className="w-full h-full pt-8">
                                            {previewData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={previewData}>
                                                        <defs>
                                                            <linearGradient id="colorDosePreview" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                                                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} itemStyle={{fontSize: '12px'}} />
                                                        <Area type="stepAfter" dataKey="dose" stroke="#6366f1" strokeWidth={3} fill="url(#colorDosePreview)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                                    <Activity size={32} className="mb-2 opacity-20" />
                                                    <p className="text-sm">Start adding phases to see the curve</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phases List */}
                                    <div className="flex-1 bg-[#1e293b]/30 rounded-3xl border border-white/5 flex flex-col overflow-hidden min-h-[250px]">
                                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <Activity size={16} className="text-emerald-400" /> {t('plan_phases')}
                                                <span className="ml-2 bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{phases.length} Steps</span>
                                            </h3>
                                            {phases.length > 0 && (
                                                <button onClick={() => setPhases([])} className="text-rose-400 text-xs font-bold hover:text-rose-300 flex items-center gap-1 transition-colors">
                                                    <Eraser size={14} /> Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                            {phases.map((phase, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#020617] border border-white/5 hover:border-indigo-500/30 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                                                        <div>
                                                            <span className="text-white font-bold text-lg mr-2">{phase.dose}</span>
                                                            <span className="text-xs text-slate-500">{selectedPatient.medUnit}</span>
                                                        </div>
                                                        <div className="h-4 w-px bg-slate-800 mx-2"></div>
                                                        <div className="text-slate-400 text-sm font-mono">{phase.days} days</div>
                                                    </div>
                                                    <button onClick={() => handleRemovePhase(idx)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 border-t border-white/5 bg-white/[0.02] text-right text-xs text-slate-500 font-mono">
                                            Total Duration: <span className="text-white font-bold">{phases.reduce((a,b) => a + b.days, 0)} Days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Notes */}
                            <div className="mt-8">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-2xl p-4 text-white h-20 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-700 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Instructions for the patient..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/5 bg-[#0f172a] flex justify-end gap-4 shrink-0">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0} className="shadow-xl shadow-emerald-500/20 px-8">
                                <Save size={18} className="mr-2" /> {t('submit_plan')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};