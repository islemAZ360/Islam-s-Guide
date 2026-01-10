import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle, Pill, Calendar, AlertCircle, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, Plus, Trash2, Zap, Ban, FlaskConical, Clock, ShieldCheck, 
  MousePointerClick
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Button, Card, Badge, LanguageSwitcher } from '../components/UI';
import { UserProfile, Inventory, PlanDay, ManualPhase, MedForm, MedUnit } from '../types';
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
  const [selectedPath, setSelectedPath] = useState<'algorithm' | 'manual' | null>(null);
  const [blockedState, setBlockedState] = useState(false);
  const [psychWarning, setPsychWarning] = useState(false);
  const [tempMedType, setTempMedType] = useState<any>(null);

  // Med Form & Unit State
  const [medForm, setMedForm] = useState<MedForm | null>(null);
  const [medUnit, setMedUnit] = useState<MedUnit | null>(null);

  // Manual Phase Builder
  const [manualPhases, setManualPhases] = useState<ManualPhase[]>([]);
  const [newPhaseDoseStr, setNewPhaseDoseStr] = useState<string>('');
  const [newPhaseDaysStr, setNewPhaseDaysStr] = useState<string>('7');

  // Preview & Pace Control
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<PlanDay[]>([]);
  // 0.8 = Slow (Extended), 1.0 = Normal, 1.2 = Fast (Compressed)
  const [speedModifier, setSpeedModifier] = useState(1.0); 

  const totalInventory = calculateTotalInventory(inventory);
  const unitLabel = userProfile?.medUnit || 'mg';

  // --- Helpers ---
  const NavBackBtn = ({ onClick }: { onClick: () => void }) => (
      <button 
        onClick={onClick}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
      >
        {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
      </button>
  );

  const handleMedTypeSelect = (type: 'narcotic' | 'psychiatric' | 'normal') => {
      if (type === 'narcotic') { setBlockedState(true); } 
      else if (type === 'psychiatric') { setTempMedType(type); setPsychWarning(true); } 
      else { initializeProfile(type); }
  };
  
  const confirmPsych = () => { if (tempMedType) initializeProfile(tempMedType); setPsychWarning(false); };
  const initializeProfile = (type: any) => { setUserProfile({ email: email, name: t('guest'), medType: type, durationMonths: 0, setupComplete: false }); };
  const confirmMedForm = () => { if (userProfile && medForm && medUnit) { setUserProfile({ ...userProfile, medForm: medForm, medUnit: medUnit }); } };

  const addManualPhase = () => {
      const dose = parseFloat(newPhaseDoseStr);
      const days = parseInt(newPhaseDaysStr);
      if (!isNaN(dose) && !isNaN(days) && days > 0) { setManualPhases([...manualPhases, { dose, days }]); }
  };

  // --- LIVE RE-CALCULATION ---
  // This is the "Smart" part. When user changes speed, we regenerate immediately.
  useEffect(() => {
      if (showPreview && selectedPath === 'algorithm') {
          const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), speedModifier);
          setPreviewPlan(plan);
      }
  }, [speedModifier, showPreview, selectedPath, totalInventory, currentDoseHabit]);

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

  // --- RENDER: PREVIEW SCREEN (With Interactive Pace Control) ---
  if (showPreview) {
      const pillsNeeded = previewPlan.reduce((acc, day) => acc + day.plannedDose, 0);
      // We round to avoid floating point issues like 10.000000001
      const isShortage = Math.round(pillsNeeded * 100) / 100 > Math.round(totalInventory * 100) / 100;
      
      return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 text-slate-200" dir={dir}>
            <NavBackBtn onClick={() => setShowPreview(false)} />
            <div className="max-w-6xl mx-auto pt-4 md:pt-10">
                <header className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2">معاينة الخطة الذكية</h1>
                    <p className="text-slate-400">نظرة شاملة على مسار التعافي المقترح بناءً على مخزونك الحالي.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    {/* CHART SECTION */}
                    <Card className="md:col-span-8 !p-0 bg-slate-900 border-indigo-500/20 overflow-hidden relative min-h-[400px] shadow-2xl flex flex-col">
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                             <Badge color="indigo">{previewPlan.length} يوم</Badge>
                        </div>
                        <div className="h-[400px] w-full pt-16 pr-2 flex-1 relative">
                            {/* Overlay info if shortage */}
                            {isShortage && selectedPath === 'algorithm' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-900/90 backdrop-blur-sm border border-rose-500/50 p-6 rounded-2xl text-center z-20 max-w-sm">
                                    <AlertTriangle className="text-rose-500 w-10 h-10 mx-auto mb-2" />
                                    <p className="text-white font-bold mb-1">المخزون غير كافٍ لهذه الوتيرة</p>
                                    <p className="text-rose-200 text-xs">حاول اختيار "سريع" أو قم بزيادة المخزون لضمان تغطية كاملة.</p>
                                </div>
                            )}

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
                                        formatter={(value: any) => [`${value}${unitLabel}`, 'الجرعة']}
                                    />
                                    <Area 
                                        type="step" 
                                        dataKey="plannedDose" 
                                        stroke={isShortage ? "#f43f5e" : "#818cf8"} 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorDosePreview)" 
                                        animationDuration={500} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* SIDEBAR STATS & CONTROLS */}
                    <div className="md:col-span-4 space-y-4">
                        
                        {/* Interactive Pace Control */}
                        {selectedPath === 'algorithm' && (
                            <Card className="bg-slate-900 border-white/5 !p-5 relative overflow-hidden">
                                {/* Glow Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-indigo-400"/> {t('pace_control')}
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setSpeedModifier(0.8)} 
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative ${
                                            speedModifier === 0.8 
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50 scale-105 z-10' 
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <Clock size={20} className="mb-2" />
                                        <span className="text-[10px] font-bold">مريح</span>
                                        <span className="text-[8px] opacity-70 mt-1">تمديد</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setSpeedModifier(1.0)} 
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative ${
                                            speedModifier === 1.0 
                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50 scale-105 z-10' 
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <ShieldCheck size={20} className="mb-2" />
                                        <span className="text-[10px] font-bold">متوازن</span>
                                        <span className="text-[8px] opacity-70 mt-1">قياسي</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setSpeedModifier(1.2)} 
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative ${
                                            speedModifier === 1.2 
                                            ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/50 scale-105 z-10' 
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <Zap size={20} className="mb-2" />
                                        <span className="text-[10px] font-bold">سريع</span>
                                        <span className="text-[8px] opacity-70 mt-1">مكثف</span>
                                    </button>
                                </div>
                                <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-white/5 text-[10px] text-slate-400 text-center leading-relaxed">
                                    {speedModifier === 0.8 && "يتم تمديد فترات الثبات وإطالة مرحلة الانسحاب النهائية (يوم بيوم) لراحة قصوى."}
                                    {speedModifier === 1.0 && "الجدول القياسي الذي يوازن بين سرعة التعافي وتجنب الأعراض الانسحابية."}
                                    {speedModifier === 1.2 && "تقليص الفترات الزمنية. خيار مناسب فقط إذا كان المخزون قليلاً جداً."}
                                </div>
                            </Card>
                        )}

                        {/* Duration Card */}
                        <Card className="text-center py-6 bg-slate-900 border-white/5 flex flex-col items-center justify-center">
                            <Calendar className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">المدة الكلية</div>
                            <div className="text-3xl font-black text-white mt-1 animate-in zoom-in key={previewPlan.length}">
                                {previewPlan.length} <span className="text-sm text-slate-500">يوم</span>
                            </div>
                        </Card>

                        {/* Inventory Status Card */}
                        {selectedPath === 'algorithm' && (
                            <Card className={`text-center py-6 border bg-slate-900 transition-colors duration-500 ${isShortage ? 'border-rose-500/30 bg-rose-900/5' : 'border-emerald-500/30 bg-emerald-900/5'}`}>
                                {isShortage ? <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" /> : <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />}
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">تغطية المخزون</div>
                                <div className={`text-3xl font-black mt-1 ${isShortage ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {isShortage ? 'عجز' : 'كافٍ'}
                                </div>
                                {isShortage && (
                                    <div className="text-xs text-rose-300 mt-2 font-bold bg-rose-500/10 py-1 px-2 rounded-full inline-block">
                                        تحتاج {Math.ceil(pillsNeeded - totalInventory)} {unitLabel} إضافية
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setShowPreview(false)} className="flex-1">تعديل البيانات</Button>
                    <Button 
                        variant={isShortage && selectedPath === 'algorithm' ? "danger" : "primary"} 
                        onClick={() => startPlan(previewPlan, speedModifier, selectedPath || 'algorithm')} 
                        className="flex-[2]"
                    >
                        {isShortage && selectedPath === 'algorithm' ? (
                            <>تأكيد البدء رغم العجز <ArrowRight size={20} /></>
                        ) : (
                            <>اعتماد وبدء الرحلة <ArrowRight size={20} /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: SCREEN 0 - PATH SELECTION ---
  if (userProfile && !selectedPath) {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center text-center relative">
             <div className="absolute top-6 right-6 z-50">
                <LanguageSwitcher />
             </div>
             {handleLogout && <NavBackBtn onClick={handleLogout} />}

             <header className="mb-12 animate-in fade-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">{t('choose_path')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto">اختر الطريقة التي تفضلها لبناء رحلة التعافي الخاصة بك.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 <button 
                    onClick={() => setSelectedPath('algorithm')}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <BrainCircuit size={32} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('path_algo_desc')}</p>
                 </button>

                 <button 
                    onClick={() => {
                        setSelectedPath('manual');
                        // Reset to manual defaults
                        setUserProfile({ email: email, name: t('guest'), medType: 'normal', durationMonths: 0, setupComplete: false, medForm: 'tablet', medUnit: 'mg' });
                    }}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Stethoscope size={32} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('path_doctor_desc')}</p>
                 </button>
             </div>
        </div>
      );
  }

  // --- RENDER: MANUAL BUILDER (Existing Code) ---
  if (userProfile && selectedPath === 'manual') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center pt-10 relative">
            <NavBackBtn onClick={() => { setSelectedPath(null); setUserProfile(null); }} />
            <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">{t('manual_builder_title')}</h1>
                </header>
                <Card className="bg-slate-900 border-white/5 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('phase_dose')} ({unitLabel})</label>
                            <input type="text" inputMode="decimal" value={newPhaseDoseStr} onChange={e => setNewPhaseDoseStr(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="0.5" />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('phase_duration')}</label>
                            <input type="number" value={newPhaseDaysStr} onChange={e => setNewPhaseDaysStr(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="7" />
                        </div>
                        <Button onClick={addManualPhase} className="h-[58px] !p-0 rounded-xl bg-indigo-600 w-16 flex items-center justify-center"><Plus /></Button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {manualPhases.length === 0 && (
                            <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                                <MousePointerClick className="mx-auto mb-2 opacity-50"/>
                                أضف مراحل الجدول العلاجي بالأعلى
                            </div>
                        )}
                        {manualPhases.map((phase, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5 animate-in slide-in-from-right-4">
                                <div className="text-white font-bold flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">{idx + 1}</span>
                                    {phase.dose}{unitLabel} <span className="text-slate-600">x</span> {phase.days} Days
                                </div>
                                <button onClick={() => setManualPhases(prev => prev.filter((_, i) => i !== idx))} className="text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>
                    <Button variant="success" className="w-full" disabled={manualPhases.length === 0} onClick={generatePreview}>{t('start_doctor_plan')}</Button>
                </Card>
            </div>
        </div>
      );
  }

  // --- RENDER: BLOCKED & WARNING ---
  if (blockedState) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-red-950 p-6 text-center animate-in zoom-in">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><Ban size={48} className="text-white" /></div>
              <h1 className="text-4xl font-black text-white mb-4">الدخول محظور</h1>
              <p className="text-red-200 text-xl max-w-lg mb-8">{t('narcotic_block_msg')}</p>
              <Button onClick={() => setBlockedState(false)} variant="secondary">عودة</Button>
          </div>
      );
  }

  if (psychWarning) {
      return (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
              <Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse"><AlertTriangle size={32} className="text-amber-500" /></div>
                  <h2 className="text-2xl font-bold text-white text-center mb-4">تنبيه طبي هام</h2>
                  <p className="text-slate-300 text-center mb-6 leading-relaxed">{t('psych_warning_msg')}</p>
                  <div className="flex gap-4">
                      <Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">تراجع</Button>
                      <Button variant="primary" onClick={confirmPsych} className="flex-1">أوافق على المسؤولية</Button>
                  </div>
              </Card>
          </div>
      );
  }

  // --- RENDER: MED TYPE SELECTOR ---
  if (!userProfile) {
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20">
            <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
            <NavBackBtn onClick={() => setSelectedPath(null)} />
            <header className="text-center mb-12 animate-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">{t('build_protocol')}</h1>
                <p className="text-slate-400">{t('algo_desc')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { type: 'narcotic', label: t('med_narcotic'), icon: Ban, color: 'rose', desc: t('med_desc_doc') },
                  { type: 'psychiatric', label: t('med_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_desc_std') },
                  { type: 'normal', label: t('med_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_desc_safe') }
                ].map((item: any) => (
                  <button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-10 rounded-[2.5rem] border border-white/5 bg-slate-900 hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/30`}>
                    <div className={`w-20 h-20 rounded-3xl bg-${item.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}><item.icon className={`w-10 h-10 text-${item.color}-500`} /></div>
                    <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                    <p className="text-sm text-slate-500 font-bold">{item.desc}</p>
                  </button>
                ))}
            </div>
        </div>
      );
  }

  // --- RENDER: FORM & UNIT ---
  if (userProfile && !userProfile.medForm) {
      return (
          <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center">
              <NavBackBtn onClick={() => setUserProfile(null)} />
              <div className="max-w-2xl w-full animate-in zoom-in">
                  <h1 className="text-3xl font-black text-white text-center mb-8">{t('med_form_label')}</h1>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                          <Pill className="mx-auto mb-4" size={40} />
                          <span className="block text-center font-bold text-lg">{t('med_form_tablet')}</span>
                      </button>
                      <button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                          <FlaskConical className="mx-auto mb-4" size={40} />
                          <span className="block text-center font-bold text-lg">{t('med_form_liquid')}</span>
                      </button>
                  </div>
                  {medForm && (
                      <div className="animate-in fade-in slide-in-from-bottom-4">
                          <h2 className="text-xl font-bold text-white text-center mb-4">{t('med_unit_label')}</h2>
                          <div className="flex justify-center gap-4 mb-8">
                              {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                  <button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-6 py-3 rounded-xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'}`}>{u}</button>
                              ))}
                          </div>
                      </div>
                  )}
                  <Button variant="success" className="w-full py-5 text-xl" disabled={!medForm || !medUnit} onClick={confirmMedForm}>متابعة <ArrowRight /></Button>
              </div>
          </div>
      );
  }

  // --- RENDER: INVENTORY SETUP ---
  if (userProfile && !userProfile.setupComplete) {
      const formLabel = userProfile.medForm === 'liquid' ? 'Bottles' : 'Boxes';
      const subUnitLabel = userProfile.medForm === 'liquid' ? `ml per Bottle` : `Pills per Box`;

      return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 pt-20">
            <NavBackBtn onClick={() => setUserProfile({...userProfile, medForm: undefined})} />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <Card className="border-white/5 bg-slate-900">
                    <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Pill size={24} /></span>
                        {t('inventory_title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('boxes')} ({formLabel})</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('pills_per_box')} ({subUnitLabel})</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('loose_pills')} ({userProfile.medForm === 'liquid' ? 'ml' : 'Pills'})</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span>
                        <span className="text-5xl font-mono font-black text-emerald-400">{totalInventory} <span className="text-sm text-emerald-600">{unitLabel}</span></span>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-8">{t('current_habit')} ({unitLabel})</h2>
                    <div className="flex flex-wrap gap-4">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-16 w-24 rounded-2xl font-mono font-bold border transition-all ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800'}`}>{dose}</button>
                        ))}
                        <input type="number" placeholder="Custom" className="h-16 w-32 bg-slate-950 rounded-2xl border border-white/10 px-4 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all" onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} />
                    </div>
                </Card>

                <Button className="w-full text-2xl py-8 rounded-3xl shadow-2xl shadow-indigo-900/20" variant="success" disabled={currentDoseHabit === 0 || totalInventory === 0} onClick={generatePreview}>
                    {t('analyze_plan')}
                </Button>
            </div>
        </div>
      );
  }

  return null;
};