import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

// 👇 تحديث المسارات للمكونات الجديدة
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorDashboardView = () => {
    const { t } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    
    // -- Modal State (For Plan Creation) --
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [phases, setPhases] = useState<ManualPhase[]>([]);
    
    // Manual Input
    const [newDose, setNewDose] = useState('');
    const [newDays, setNewDays] = useState('7');
    const [doctorNote, setDoctorNote] = useState('');

    // Pattern Builder State
    const [patternSeq, setPatternSeq] = useState('0.5, 1'); // Default example
    const [patternRepeat, setPatternRepeat] = useState('4');
    const [patternDaysPerDose, setPatternDaysPerDose] = useState('1');

    // -- Fetch Data --
    useEffect(() => {
        const fetchDoctorData = async () => {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
            
            setLoading(true);
            try {
                // 1. Get Doctor Profile
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorProfile(docSnap.data() as UserProfile);
                }

                // 2. Get Assigned Patients
                // Note: We fetch ALL assigned patients here to categorize them
                const q = query(
                    collection(db, "users"), 
                    where("patientData.assignedDoctorId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const allPatients: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    allPatients.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });

                // Filter Logic:
                // Pending Plan: Request approved BUT no plan assigned yet
                // Active: Plan assigned AND not recovered
                setPendingPatients(allPatients.filter(p => p.patientData?.requestStatus === 'approved' && !p.patientData?.isPlanAssigned));
                setPatients(allPatients.filter(p => p.patientData?.isPlanAssigned));

            } catch (error) {
                console.error("Error fetching doctor data:", error);
            }
            setLoading(false);
        };

        fetchDoctorData();
    }, []);

    // -- Actions --

    // A. Add Single Phase
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        if (!isNaN(dose) && !isNaN(days) && days > 0) {
            setPhases([...phases, { dose, days }]);
            setNewDose(''); 
        }
    };

    // B. Apply Pattern (The Fix for Complex Plans)
    const handleApplyPattern = () => {
        const sequence = patternSeq.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const repeat = parseInt(patternRepeat);
        const days = parseInt(patternDaysPerDose);

        if (sequence.length === 0 || isNaN(repeat) || repeat <= 0 || isNaN(days) || days <= 0) {
            alert("Please check your pattern inputs.");
            return;
        }

        const newPhases: ManualPhase[] = [];
        for (let i = 0; i < repeat; i++) {
            sequence.forEach(dose => {
                newPhases.push({ dose, days });
            });
        }

        setPhases([...phases, ...newPhases]);
    };

    const handleRemovePhase = (index: number) => {
        setPhases(phases.filter((_, i) => i !== index));
    };

    const saveTreatmentPlan = async () => {
        if (!selectedPatient?.uid || phases.length === 0) return;

        if (!confirm("Are you sure you want to activate this plan for the patient?")) return;

        // Generate full calendar plan from phases
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

            // Update UI Locally
            setPendingPatients(prev => prev.filter(p => p.uid !== selectedPatient.uid));
            setPatients(prev => [...prev, { 
                ...selectedPatient, 
                patientData: { ...selectedPatient.patientData!, isPlanAssigned: true } 
            }]);
            
            setSelectedPatient(null);
            setPhases([]);
            setDoctorNote('');
            alert("Plan saved successfully!");

        } catch (e) {
            console.error("Error saving plan:", e);
            alert("Failed to save plan. Check console.");
        }
    };

    const markAsRecovered = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm("Mark this patient as recovered?")) return;

        await updateDoc(doc(db, "users", patient.uid), {
            "patientData.isRecovered": true,
            "patientData.recoveryDate": new Date().toISOString()
        });

        setPatients(prev => prev.map(p => p.uid === patient.uid ? { 
            ...p, patientData: { ...p.patientData!, isRecovered: true } 
        } : p));
    };

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
                            <p className="text-amber-500/70 text-xs font-bold uppercase mb-1">{t('pending_approvals')}</p>
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

            {/* PENDING PATIENTS (Waiting for Plan) */}
            {pendingPatients.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" /> Patients Waiting for Plan
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
                                    <Badge color="amber" className="mr-auto">Needs Plan</Badge>
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
                        Total: {patients.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Progress</th>
                                <th className="p-4">Last Active</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-600 italic">No active patients with plans.</td>
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
                                            <Badge color="indigo">On Plan</Badge>
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
                    <Card className="w-full max-w-4xl bg-slate-900 border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button type="button" onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-20">
                            <X size={20} />
                        </button>

                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-2xl font-bold text-white mb-1">{t('create_plan_btn')}</h2>
                            <p className="text-slate-500">Patient: <span className="text-indigo-400 font-bold">{selectedPatient.name}</span></p>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* LEFT: Pattern Builder (NEW) */}
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                                    <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                                        <Repeat size={16}/> {t('pattern_builder')}
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-1">{t('pattern_sequence')}</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                placeholder="0.5, 1, 0.5, 1"
                                                value={patternSeq}
                                                onChange={e => setPatternSeq(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block mb-1">{t('repeat_count')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                    value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block mb-1">{t('days_per_dose')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                    value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleApplyPattern} className="w-full !py-2 !bg-indigo-600 !text-xs">
                                            <Copy size={14} className="mr-2"/> {t('apply_pattern')}
                                        </Button>
                                    </div>
                                </div>

                                {/* RIGHT: Manual Entry */}
                                <div className="bg-slate-950 border border-white/5 p-4 rounded-xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <Plus size={16}/> Manual Entry
                                    </h3>
                                    <div className="flex gap-2 mb-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">{t('dose')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">{t('duration_days')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddPhase} variant="secondary" className="w-full !py-2 !text-xs">Add Phase</Button>
                                </div>
                            </div>

                            {/* Phases List */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Activity size={16}/> {t('plan_phases')}</h3>
                                    {phases.length > 0 && (
                                        <button onClick={() => setPhases([])} className="text-rose-500 text-xs flex items-center gap-1 hover:text-rose-400">
                                            <Eraser size={12}/> {t('clear_phases')}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {phases.length === 0 && <p className="text-center text-slate-600 text-sm py-4">No phases added yet.</p>}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-white/5 animate-in slide-in-from-right-2">
                                            <span className="text-white font-bold text-sm flex items-center gap-2">
                                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{idx + 1}</span>
                                                <span className="text-indigo-400 text-lg">{phase.dose}{selectedPatient.medUnit || 'mg'}</span> 
                                                <span className="text-slate-500 text-xs">x {phase.days} days</span>
                                            </span>
                                            <button type="button" onClick={() => handleRemovePhase(idx)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-sm font-bold text-slate-400">
                                    <span>Total Duration: <span className="text-white">{phases.reduce((a,b) => a + b.days, 0)} days</span></span>
                                    <span>Total Phases: <span className="text-white">{phases.length}</span></span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-20 outline-none focus:border-indigo-500"
                                    placeholder="..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
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