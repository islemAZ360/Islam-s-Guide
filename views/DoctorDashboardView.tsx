import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser, Stethoscope, LineChart
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
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
    const { t } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    
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

    // -- Actions --
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        if (!isNaN(dose) && !isNaN(days) && days > 0) {
            setPhases([...phases, { dose, days }]);
            setNewDose(''); 
        }
    };

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
            alert("Failed to save plan.");
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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-400 animate-pulse font-bold tracking-widest">LOADING CLINIC DATA...</div>;

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || ''}`} 
            />

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-4">
                <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_total_patients')}</p>
                            <h3 className="text-4xl font-black text-white">{patients.length + pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20"><Users size={24}/></div>
                    </div>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-900/20 to-slate-900/80 border-amber-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-amber-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('pending_approvals')}</p>
                            <h3 className="text-4xl font-black text-amber-500">{pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/20 animate-pulse-glow"><Clock size={24}/></div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 border-emerald-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-emerald-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_recovered')}</p>
                            <h3 className="text-4xl font-black text-emerald-500">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500 border border-emerald-500/20"><CheckCircle size={24}/></div>
                    </div>
                </Card>

                <Card className="bg-slate-900/80 border-white/10 p-6 shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2"><LineChart size={14}/> {t('stat_overview')}</p>
                    <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} layout="vertical" margin={{top:0, right:0, left:0, bottom:0}}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155'}} itemStyle={{color: '#fff', fontSize: '12px'}} />
                                <Bar dataKey="value" barSize={16} radius={[0, 6, 6, 0]}>
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
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg"><AlertCircle className="text-amber-500" size={20} /></div>
                        Waiting for Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingPatients.map(patient => (
                            <div key={patient.uid} className="glass p-6 rounded-3xl relative group hover:border-amber-500/40 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-white/5 shadow-inner">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{patient.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono">{patient.email}</p>
                                    </div>
                                    <Badge color="amber" className="mr-auto absolute top-6 right-6">Action Needed</Badge>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl text-xs text-slate-400 mb-6 space-y-2 border border-white/5">
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Medication:</span> <span className="text-white font-bold">{patient.medType}</span></div>
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Form:</span> <span className="text-white font-bold">{patient.medForm}</span></div>
                                    <div className="flex justify-between"><span>Unit:</span> <span className="text-white font-bold">{patient.medUnit}</span></div>
                                </div>
                                <Button onClick={() => setSelectedPatient(patient)} className="w-full shadow-lg shadow-indigo-500/20" variant="primary">
                                    {t('create_plan_btn')} <ChevronRight size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE PATIENTS LIST */}
            <Card className="bg-slate-900/60 border-white/10 overflow-hidden backdrop-blur-xl" noPadding>
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Users className="text-indigo-400" size={20} /></div>
                        {t('stat_total_patients')}
                    </h2>
                    <Badge color="indigo">Total: {patients.length}</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-5">Patient</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Progress</th>
                                <th className="p-5">Last Active</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-600 italic flex flex-col items-center justify-center">
                                        <Users size={40} className="mb-4 opacity-20"/>
                                        No active patients with plans.
                                    </td>
                                </tr>
                            )}
                            {patients.map(patient => (
                                <tr key={patient.uid} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5 font-medium text-white flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold">{patient.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{patient.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {patient.patientData?.isRecovered ? (
                                            <Badge color="green" className="shadow-none bg-emerald-500/10 border-emerald-500/20">Recovered</Badge>
                                        ) : (
                                            <Badge color="indigo" className="shadow-none bg-indigo-500/10 border-indigo-500/20">On Plan</Badge>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width: `${patient.progress || 0}%`}}></div>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-300">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-mono text-xs">
                                        {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-5 text-right">
                                        {!patient.patientData?.isRecovered && (
                                            <button 
                                                onClick={() => markAsRecovered(patient)}
                                                className="text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <div className="w-full max-w-5xl bg-slate-900 border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                    <Stethoscope className="text-indigo-500" size={28}/> {t('create_plan_btn')}
                                </h2>
                                <p className="text-slate-400 flex items-center gap-2">Patient: <Badge color="blue">{selectedPatient.name}</Badge></p>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-900/30">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LEFT: Pattern Builder (Glass Style) */}
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl shadow-inner">
                                    <h3 className="text-indigo-300 font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Repeat size={18}/></div> 
                                        {t('pattern_builder')}
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('pattern_sequence')}</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-all placeholder-indigo-900/50"
                                                placeholder="0.5, 1, 0.5, 1"
                                                value={patternSeq}
                                                onChange={e => setPatternSeq(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('repeat_count')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                                                    value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('days_per_dose')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                                                    value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleApplyPattern} className="w-full !py-3 !bg-indigo-600 shadow-lg shadow-indigo-900/40">
                                            <Copy size={16} className="mr-2"/> {t('apply_pattern')}
                                        </Button>
                                    </div>
                                </div>

                                {/* RIGHT: Manual Entry (Glass Style) */}
                                <div className="bg-slate-950/60 border border-white/5 p-6 rounded-3xl">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-slate-800 rounded-lg"><Plus size={18}/></div>
                                        Manual Entry
                                    </h3>
                                    <div className="flex gap-4 mb-5">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('dose')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('duration_days')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddPhase} variant="secondary" className="w-full !py-3 !text-xs">Add Single Phase</Button>
                                </div>
                            </div>

                            {/* Phases List */}
                            <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold flex items-center gap-2 text-lg"><Activity size={20} className="text-emerald-400"/> {t('plan_phases')}</h3>
                                    {phases.length > 0 && (
                                        <button onClick={() => setPhases([])} className="text-rose-400 text-xs font-bold flex items-center gap-1 hover:text-rose-300 bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20">
                                            <Eraser size={14}/> {t('clear_phases')}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {phases.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                                            No phases added yet. Start building the plan above.
                                        </div>
                                    )}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-2 hover:border-indigo-500/30 transition-colors">
                                            <span className="text-white font-bold text-sm flex items-center gap-3">
                                                <span className="bg-slate-800 text-slate-400 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                                                <span className="text-indigo-400 text-xl font-black">{phase.dose} <span className="text-xs font-normal text-indigo-300/60">{selectedPatient.medUnit || 'mg'}</span></span> 
                                                <span className="w-px h-4 bg-slate-700 mx-2"></span>
                                                <span className="text-slate-400 text-xs font-mono">{phase.days} days</span>
                                            </span>
                                            <button type="button" onClick={() => handleRemovePhase(idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-sm font-bold text-slate-400">
                                    <span>Total Duration: <span className="text-white">{phases.reduce((a,b) => a + b.days, 0)} days</span></span>
                                    <span>Total Phases: <span className="text-white">{phases.length}</span></span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white h-24 outline-none focus:border-indigo-500 transition-all resize-none"
                                    placeholder="Add instructions or comments for the patient..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-end gap-4">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0} className="shadow-lg shadow-emerald-500/20">
                                <Save size={18} className="mr-2"/> {t('submit_plan')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};