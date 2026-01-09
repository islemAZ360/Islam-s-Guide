import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle, Pill, Calendar, BarChart as ChartIcon, 
  AlertCircle, AlertTriangle, ArrowRight, ArrowLeft, Stethoscope, BrainCircuit, Plus, Trash2, Clock, Copy, Layers, Zap, LogOut
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Button, Card, Badge, LanguageSwitcher } from '../components/UI';
import { UserProfile, Inventory, PlanDay, ManualPhase } from '../types';
import { calculateTotalInventory, generatePlan, generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingViewProps {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  currentDoseHabit: number;
  setCurrentDoseHabit: (n: number) => void;
  startPlan: (customPlan: PlanDay[], speed: number, type: 'algorithm' | 'manual') => void;
  email: string;
  handleLogout?: () => void;
}

export const OnboardingView = ({ 
  userProfile, setUserProfile, inventory, setInventory, 
  currentDoseHabit, setCurrentDoseHabit, startPlan, email, handleLogout
}: OnboardingViewProps) => {
  const { t, dir } = useLanguage();
  
  // -- State --
  // Step 1: Protocol Choice
  const [selectedPath, setSelectedPath] = useState<'algorithm' | 'manual' | null>(null);
  
  // Step 3 (Doctor): Manual Phase Builder
  const [manualPhases, setManualPhases] = useState<ManualPhase[]>([]);
  // Store as strings to allow "0." typing
  const [newPhaseDoseStr, setNewPhaseDoseStr] = useState<string>('');
  const [newPhaseDaysStr, setNewPhaseDaysStr] = useState<string>('7');

  // Templates State
  const [templateDoseStr, setTemplateDoseStr] = useState<string>('');
  const [templateDaysOff, setTemplateDaysOff] = useState<number>(1);
  const [templateCycles, setTemplateCycles] = useState<number>(3);
  
  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<PlanDay[]>([]);
  const [speedModifier, setSpeedModifier] = useState(1.0); 

  const totalInventory = calculateTotalInventory(inventory);

  // --- Logic ---

  const addManualPhase = () => {
      const dose = parseFloat(newPhaseDoseStr);
      const days = parseInt(newPhaseDaysStr);

      if (!isNaN(dose) && !isNaN(days) && days > 0) {
          setManualPhases([...manualPhases, { dose: dose, days: days }]);
      }
  };

  const repeatLastPhase = () => {
      if (manualPhases.length > 0) {
          const last = manualPhases[manualPhases.length - 1];
          setManualPhases([...manualPhases, { ...last }]);
      }
  };

  const applyTemplate = () => {
      const dose = parseFloat(templateDoseStr);
      if (isNaN(dose) || templateCycles < 1) return;

      const newPhases: ManualPhase[] = [];
      for (let i = 0; i < templateCycles; i++) {
          // 1 Day On
          newPhases.push({ dose: dose, days: 1 });
          // N Days Off
          newPhases.push({ dose: 0, days: templateDaysOff });
      }
      setManualPhases([...manualPhases, ...newPhases]);
  };

  const removeManualPhase = (idx: number) => {
      setManualPhases(manualPhases.filter((_, i) => i !== idx));
  };

  const generatePreview = () => {
      if (selectedPath === 'algorithm') {
        const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), speedModifier);
        setPreviewPlan(plan);
      } else {
        const plan = generateManualPlan(manualPhases, new Date().toISOString());
        setPreviewPlan(plan);
      }
      setShowPreview(true);
  };

  // -- Navigation Handlers --
  const goBackFromPreview = () => setShowPreview(false);
  
  const goBackFromBuilder = () => {
      // Back to Path Selection
      setSelectedPath(null);
      // Reset profile to ensure clean state if switching back from manual
      setUserProfile(null);
  };
  
  const goBackFromInventory = () => {
      // Back to Path Selection (Keep UserProfile)
      setSelectedPath(null);
  };

  // Re-generate Algo preview on speed change
  useEffect(() => {
    if (showPreview && selectedPath === 'algorithm') {
        const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), speedModifier);
        setPreviewPlan(plan);
    }
  }, [speedModifier, showPreview, selectedPath]);

  const calculatePillsNeeded = (plan: PlanDay[]) => {
      return plan.reduce((acc, day) => acc + day.plannedDose, 0);
  };

  const pillsNeeded = calculatePillsNeeded(previewPlan);
  const isShortage = pillsNeeded > totalInventory;

  // Reusable Back Button Component
  const NavBackBtn = ({ onClick }: { onClick: () => void }) => (
      <button 
        onClick={onClick}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
      >
        {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
      </button>
  );

  // --- RENDER: PREVIEW SCREEN ---
  if (showPreview) {
      return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 text-slate-200" dir={dir}>
            <NavBackBtn onClick={goBackFromPreview} />
            <div className="max-w-4xl mx-auto pt-4 md:pt-10">
                <header className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2">معاينة الخطة العلاجية</h1>
                    <p className="text-slate-400">نظرة شاملة على مسار التعافي المقترح قبل البدء.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    {/* Main Chart Card */}
                    <Card className="md:col-span-8 !p-0 bg-slate-900 border-indigo-500/20 overflow-hidden relative min-h-[300px] shadow-2xl">
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                             <Badge color="indigo">{previewPlan.length} يوم</Badge>
                             {selectedPath === 'algorithm' && (
                                isShortage ? <Badge color="red">نقص في المخزون</Badge> : <Badge color="green">المخزون كافي</Badge>
                             )}
                        </div>
                        <div className="h-[350px] w-full pt-16 pr-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={previewPlan}>
                                    <defs>
                                        <linearGradient id="colorDosePreview" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                                        itemStyle={{color: '#fff'}}
                                        labelStyle={{display: 'none'}}
                                        formatter={(value: any) => [`${value}mg`, 'الجرعة']}
                                    />
                                    <Area 
                                        type="step" 
                                        dataKey="plannedDose" 
                                        stroke="#818cf8" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorDosePreview)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Stats Side */}
                    <div className="md:col-span-4 space-y-4">
                        <Card className="text-center py-6 bg-slate-900 border-white/5">
                            <Calendar className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">المدة الكلية</div>
                            <div className="text-3xl font-black text-white mt-1">
                                {Math.round(previewPlan.length / 30 * 10) / 10} <span className="text-sm text-slate-600 font-bold">شهر</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{previewPlan.length} يوم</div>
                        </Card>

                        {selectedPath === 'algorithm' && (
                            <Card className={`text-center py-6 border bg-slate-900 ${isShortage ? 'border-rose-500/30' : 'border-emerald-500/30'}`}>
                                {isShortage ? <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" /> : <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />}
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">حالة المخزون</div>
                                <div className={`text-3xl font-black mt-1 ${isShortage ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {isShortage ? 'نقص' : 'متوفر'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    تحتاج {Math.ceil(pillsNeeded)} حبة (لديك {totalInventory})
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setShowPreview(false)} className="flex-1">
                        تعديل البيانات
                    </Button>
                    <Button variant="primary" onClick={() => startPlan(previewPlan, speedModifier, selectedPath || 'algorithm')} className="flex-[2]">
                        اعتماد وبدء التعافي <ArrowRight size={20} />
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: PATH SELECTION (Step 0) ---
  if (userProfile && !selectedPath) {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center text-center relative">
             <div className="absolute top-6 right-6">
                <LanguageSwitcher />
             </div>
             
             {/* Back Arrow to Login (Logout) */}
             {handleLogout && (
                 <NavBackBtn onClick={handleLogout} />
             )}

             <header className="mb-12 animate-in fade-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">{t('choose_path')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto">اختر الطريقة التي تفضلها لبناء رحلة التعافي الخاصة بك.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 <button 
                    onClick={() => {
                        setSelectedPath('algorithm');
                        // Fixed: Removed incorrect setUserProfile(null) causing loop
                    }}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300 text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                         <BrainCircuit size={32} />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('path_algo_desc')}</p>
                 </button>

                 <button 
                    onClick={() => {
                        setSelectedPath('manual');
                        // Manual plan skips algo questions, goes straight to builder
                        // But we need to set a dummy profile first
                        setUserProfile({ 
                            email: email, 
                            name: t('guest'), 
                            medType: 'normal', 
                            durationMonths: 0, 
                            setupComplete: false 
                        });
                    }}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                         <Stethoscope size={32} />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('path_doctor_desc')}</p>
                 </button>
             </div>
        </div>
      );
  }

  // --- RENDER: MANUAL BUILDER (Step 2 - Doctor) ---
  if (userProfile && selectedPath === 'manual') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center pt-10 relative">
            <NavBackBtn onClick={goBackFromBuilder} />
            
            <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">{t('manual_builder_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>

                {/* Builder Form */}
                <Card className="bg-slate-900 border-white/5 space-y-6">
                    {/* Standard Input */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('phase_dose')}</label>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                value={newPhaseDoseStr}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                        setNewPhaseDoseStr(val);
                                    }
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500"
                                placeholder="0.5"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('phase_duration')}</label>
                            <input 
                                type="number" 
                                value={newPhaseDaysStr}
                                onChange={e => setNewPhaseDaysStr(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500"
                                placeholder="7"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button onClick={addManualPhase} className="flex-1 h-[58px] !p-0 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500" disabled={!newPhaseDoseStr || !newPhaseDaysStr}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Template Builder Section */}
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 border-dashed">
                         <div className="flex items-center gap-2 mb-4 text-indigo-400">
                             <Layers size={18} />
                             <h3 className="font-bold text-sm">{t('templates_title')}</h3>
                             <span className="text-xs text-slate-500 ml-2 hidden md:inline">({t('templates_subtitle')})</span>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t('template_dose_label')}</label>
                                 <input 
                                     type="text"
                                     inputMode="decimal"
                                     value={templateDoseStr}
                                     onChange={e => {
                                         const val = e.target.value;
                                         if (val === '' || /^\d*\.?\d*$/.test(val)) setTemplateDoseStr(val);
                                     }}
                                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                                     placeholder="0.5"
                                 />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t('template_off_label')}</label>
                                 <select 
                                     value={templateDaysOff}
                                     onChange={e => setTemplateDaysOff(parseInt(e.target.value))}
                                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                                 >
                                     {Array.from({length: 14}, (_, i) => i + 1).map(num => (
                                         <option key={num} value={num}>{num} {num === 1 ? t('day_off_1') : t('day_off_n')}</option>
                                     ))}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t('template_cycles_label')}</label>
                                 <input 
                                     type="number"
                                     min="1"
                                     value={templateCycles}
                                     onChange={e => setTemplateCycles(parseInt(e.target.value))}
                                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                                 />
                             </div>
                         </div>
                         <Button onClick={applyTemplate} variant="secondary" className="w-full !py-3 !text-sm" disabled={!templateDoseStr}>
                            <Zap size={16} /> {t('template_add_btn')}
                         </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {manualPhases.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                                أضف مراحل الخطة أعلاه. يمكنك إضافة جرعة 0 لتمثيل أيام الراحة.
                            </div>
                        )}
                        {manualPhases.map((phase, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5 animate-in slide-in-from-left-4">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{idx + 1}</span>
                                    <div>
                                        <p className="text-white font-bold">{phase.dose} mg</p>
                                        <p className="text-xs text-slate-500">لمدة {phase.days} يوم</p>
                                    </div>
                                </div>
                                <button onClick={() => removeManualPhase(idx)} className="text-rose-400 hover:text-rose-300 p-2"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>
                    
                    {/* Quick Actions */}
                    {manualPhases.length > 0 && (
                        <div className="flex justify-center mt-4">
                            <button onClick={repeatLastPhase} className="text-xs font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-lg">
                                <Copy size={12} /> تكرار آخر مرحلة
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="text-sm text-slate-500">
                            {t('total_duration')}: <span className="text-white font-bold">{manualPhases.reduce((acc, p) => acc + p.days, 0)} يوم</span>
                        </div>
                        <Button 
                            variant="success" 
                            disabled={manualPhases.length === 0}
                            onClick={generatePreview}
                        >
                            {t('start_doctor_plan')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
      );
  }

  // --- ORIGINAL INVENTORY & SETUP (Step 1 - ALGORITHM ONLY) ---
  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-10 text-slate-200" dir={dir}>
      <NavBackBtn onClick={goBackFromInventory} />
      
      <div className="max-w-5xl mx-auto pt-10">
        <header className="mb-16 text-center animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">{t('build_protocol')}</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('algo_desc')}
          </p>
        </header>
        
        {!userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {[
              { type: 'narcotic', label: t('med_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_desc_doc') },
              { type: 'psychiatric', label: t('med_psych'), icon: Activity, color: 'indigo', desc: t('med_desc_std') },
              { type: 'normal', label: t('med_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_desc_safe') }
            ].map((item: any) => (
              <button 
                key={item.type}
                onClick={() => {
                   if (item.type === 'narcotic') {
                      alert("Warning: Please consult a doctor immediately.");
                   } else {
                      setUserProfile({ email: email, name: t('guest'), medType: item.type, durationMonths: 0, setupComplete: false });
                   }
                }}
                className={`group relative p-10 rounded-[2.5rem] border border-white/5 bg-slate-900 hover:bg-slate-900/80 transition-all duration-500 text-right overflow-hidden hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-${item.color}-500/30 hover:-translate-y-2`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/0 to-${item.color}-500/0 group-hover:to-${item.color}-500/5 transition-all duration-500`}></div>
                <div className={`w-20 h-20 rounded-3xl bg-${item.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ring-1 ring-${item.color}-500/20`}>
                   <item.icon className={`w-10 h-10 text-${item.color}-500`} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{item.label}</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">{item.desc}</p>
              </button>
            ))}
          </div>
        )}

        {userProfile && !userProfile.setupComplete && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <Card className="border-white/5 bg-slate-900">
              <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                 <span className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/30"><Pill size={24} /></span>
                 {t('inventory_title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: t('boxes'), key: 'boxes' }, 
                    { label: t('pills_per_box'), key: 'pillsPerBox' }, 
                    { label: t('loose_pills'), key: 'loosePills' }
                ].map((field, i) => (
                  <div key={i} className="bg-slate-950 p-8 rounded-[2rem] border border-white/5 focus-within:border-indigo-500/50 transition-all duration-300 relative group">
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-4 tracking-widest">{field.label}</label>
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-white outline-none text-5xl font-mono font-bold placeholder-slate-800 transition-colors"
                      placeholder="0"
                      value={(inventory as any)[field.key] || ''}
                      onChange={(e) => setInventory({...inventory, [field.key]: parseInt(e.target.value) || 0})}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span>
                <span className="text-5xl font-mono font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{totalInventory}</span>
              </div>
            </Card>

            <Card className="bg-slate-900 border-white/5">
                <h2 className="text-2xl font-bold text-white mb-8">{t('current_habit')}</h2>
                <div className="flex flex-wrap gap-4">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(dose => (
                    <button
                        key={dose}
                        onClick={() => setCurrentDoseHabit(dose)}
                        className={`h-20 w-28 rounded-3xl font-mono text-2xl font-bold transition-all duration-300 border-2 relative overflow-hidden ${
                            currentDoseHabit === dose 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-110 z-10' 
                            : 'bg-slate-950/50 border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-white hover:bg-slate-950'
                        }`}
                    >
                        {dose}
                        {currentDoseHabit === dose && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                    </button>
                    ))}
                </div>
            </Card>

            <Button 
              className="w-full text-2xl py-8 rounded-3xl shadow-2xl tracking-tight" 
              variant="success"
              disabled={currentDoseHabit === 0 || totalInventory === 0}
              onClick={generatePreview}
            >
              {t('analyze_plan')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};