import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { LayoutContainer, PageHeader, Card, Button, Badge } from '../components/UI';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext'; // استيراد هوك اللغة

export const DoctorDashboardView = () => {
    const { t } = useLanguage(); // تفعيل الترجمة
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    
    // -- Modal State (For Plan Creation) --
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [phases, setPhases] = useState<ManualPhase[]>([]);
    const [newDose, setNewDose] = useState('');
    const [newDays, setNewDays] = useState('7'); // Default to 1 week
    const [doctorNote, setDoctorNote] = useState('');

    // -- Fetch Data --
    useEffect(() => {
        const fetchDoctorData = async () => {
            const currentUser = auth?.currentUser;
            
            if (!currentUser) return;
            
            setLoading(true);

            try {
                // 1. Get Doctor Profile using local currentUser variable
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorProfile(docSnap.data() as UserProfile);
                }

                // 2. Get Assigned Patients using local currentUser variable
                const q = query(
                    collection(db, "users"), 
                    where("patientData.assignedDoctorId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const allPatients: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    allPatients.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });

                // Separate into Pending (No Plan) and Active (Has Plan)
                setPendingPatients(allPatients.filter(p => !p.patientData?.isPlanAssigned));
                setPatients(allPatients.filter(p => p.patientData?.isPlanAssigned));

            } catch (error) {
                console.error("Error fetching doctor data:", error);
            }
            setLoading(false);
        };

        fetchDoctorData();
    }, []);

    // -- Actions --

    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        if (!isNaN(dose) && !isNaN(days) && days > 0) {
            setPhases([...phases, { dose, days }]);
            setNewDose(''); 
        }
    };

    const handleRemovePhase = (index: number) => {
        setPhases(phases.filter((_, i) => i !== index));
    };

    const saveTreatmentPlan = async () => {
        if (!selectedPatient?.uid || phases.length === 0) return;

        if (!confirm("Confirm sending this plan?")) return;

        // Generate full calendar plan
        const fullPlan = generateManualPlan(phases, new Date().toISOString());

        try {
            await updateDoc(doc(db, "users", selectedPatient.uid), {
                plan: fullPlan,
                "patientData.isPlanAssigned": true,
                "patientData.isRecovered": false,
                doctorNotes: doctorNote,
                planType: 'manual', // Enforce manual type so algorithm doesn't override
                lastActive: new Date().toISOString()
            });

            // Update Local State
            setPendingPatients(prev => prev.filter(p => p.uid !== selectedPatient.uid));
            setPatients(prev => [...prev, { 
                ...selectedPatient, 
                patientData: { ...selectedPatient.patientData!, isPlanAssigned: true } 
            }]);
            
            // Close Modal
            setSelectedPatient(null);
            setPhases([]);
            setDoctorNote('');
            alert("Plan sent successfully.");

        } catch (e) {
            console.error("Error saving plan:", e);
            alert("Error saving plan.");
        }
    };

    const markAsRecovered = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm("Mark this patient as recovered?")) return;

        await updateDoc(doc(db, "users", patient.uid), {
            "patientData.isRecovered": true,
            "patientData.recoveryDate": new Date().toISOString()
        });

        // Update UI locally
        setPatients(prev => prev.map(p => p.uid === patient.uid ? { 
            ...p, patientData: { ...p.patientData!, isRecovered: true } 
        } : p));
    };

    // -- Stats Data for Chart --
    const statsData = [
        { name: t('stat_new_requests'), value: pendingPatients.length, color: '#f59e0b' },
        { name: 'Active', value: patients.filter(p => !p.patientData?.isRecovered).length, color: '#6366f1' },
        { name: t('stat_recovered'), value: patients.filter(p => p.patientData?.isRecovered).length, color: '#10b981' },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">Loading clinic data...</div>;

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || ''}`} 
            />

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-slate-900 border-white/5 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{t('stat_total_patients')}</p>
                            <h3 className="text-3xl font-black text-white">{patients.length + pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Users size={20}/></div>
                    </div>
                </Card>
                
                <Card className="bg-amber-900/10 border-amber-500/20 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-500/70 text-xs font-bold uppercase mb-1">{t('stat_new_requests')}</p>
                            <h3 className="text-3xl font-black text-amber-500">{pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 animate-pulse"><Clock size={20}/></div>
                    </div>
                </Card>

                <Card className="bg-emerald-900/10 border-emerald-500/20 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-500/70 text-xs font-bold uppercase mb-1">{t('stat_recovered')}</p>
                            <h3 className="text-3xl font-black text-emerald-500">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle size={20}/></div>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5 p-5">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-4">{t('stat_overview')}</p>
                    <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}} itemStyle={{color: '#fff'}} />
                                <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                    {statsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* PENDING REQUESTS SECTION (Waiting for Plan) */}
            {pendingPatients.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" /> {t('stat_new_requests')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingPatients.map(patient => (
                            <div key={patient.uid} className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{patient.name}</h3>
                                        <p className="text-xs text-slate-500">{patient.email}</p>
                                    </div>
                                    <Badge color="amber" className="mr-auto">New</Badge>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 mb-4 space-y-1">
                                    <div className="flex justify-between"><span>Type:</span> <span className="text-white">{patient.medType}</span></div>
                                    <div className="flex justify-between"><span>Form:</span> <span className="text-white">{patient.medForm}</span></div>
                                    <div className="flex justify-between"><span>Unit:</span> <span className="text-white">{patient.medUnit}</span></div>
                                </div>
                                <Button onClick={() => setSelectedPatient(patient)} className="w-full" variant="primary">
                                    {t('create_plan_btn')} <ChevronRight size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE PATIENTS LIST */}
            <Card className="bg-slate-900 border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-indigo-400" /> {t('stat_total_patients')}
                    </h2>
                    <div className="text-sm text-slate-500">
                        Count: {patients.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4 rounded-tr-xl">Patient</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Progress</th>
                                <th className="p-4">Last Active</th>
                                <th className="p-4 rounded-tl-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-600 italic">No active patients.</td>
                                </tr>
                            )}
                            {patients.map(patient => (
                                <tr key={patient.uid} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                            {patient.name.charAt(0)}
                                        </div>
                                        {patient.name}
                                    </td>
                                    <td className="p-4">
                                        {patient.patientData?.isRecovered ? (
                                            <Badge color="green">Recovered</Badge>
                                        ) : (
                                            <Badge color="indigo">Active</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{width: `${patient.progress || 0}%`}}></div>
                                            </div>
                                            <span className="text-xs">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4">
                                        {!patient.patientData?.isRecovered && (
                                            <button 
                                                onClick={() => markAsRecovered(patient)}
                                                className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                                            >
                                                Mark Recovered
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* PLAN CREATION MODAL */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button type="button" onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-20">
                            <X size={20} />
                        </button>

                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-2xl font-bold text-white mb-1">{t('create_plan_btn')}</h2>
                            <p className="text-slate-500">Patient: <span className="text-indigo-400 font-bold">{selectedPatient.name}</span></p>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            
                            {/* Doctor Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-20 outline-none focus:border-indigo-500"
                                    placeholder="..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>

                            {/* Phases Builder */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={16}/> {t('plan_phases')}</h3>
                                
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">{t('dose')} ({selectedPatient.medUnit})</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white outline-none focus:border-indigo-500"
                                            placeholder="Dose"
                                            value={newDose}
                                            onChange={e => setNewDose(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">{t('duration_days')}</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white outline-none focus:border-indigo-500"
                                            placeholder="Days"
                                            value={newDays}
                                            onChange={e => setNewDays(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddPhase} className="!p-3"><Plus size={20}/></Button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {phases.length === 0 && <p className="text-center text-slate-600 text-sm py-4">No phases added yet.</p>}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-white/5 animate-in slide-in-from-right-2">
                                            <span className="text-white font-bold text-sm">
                                                Phase {idx + 1}: <span className="text-indigo-400">{phase.dose}{selectedPatient.medUnit || 'mg'}</span> for {phase.days} days
                                            </span>
                                            <button type="button" onClick={() => handleRemovePhase(idx)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400 bg-slate-950 p-3 rounded-lg">
                                <span>Total Duration: {phases.reduce((a,b) => a + b.days, 0)} days</span>
                                <span>Phases: {phases.length}</span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-slate-900 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0}>
                                <Save size={18} className="mr-2"/> {t('submit_plan')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};