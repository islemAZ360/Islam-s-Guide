import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User, ChevronRight, Activity, Info, Ruler, Weight, Calendar, Sparkles
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

// Components
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Badge } from '../components/ui/Badge';
import { ScientificPlanModal } from '../components/modals/ScientificPlanModal';

import { UserProfile, Inventory, PlanDay, MedForm, MedUnit, DoctorProfileData } from '../types';
import { calculateTotalInventory, generatePlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingViewProps {
  userProfile: UserProfile; 
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  currentDoseHabit: number;
  setCurrentDoseHabit: (n: number) => void;
  startPlan: (customPlan: PlanDay[], speed: number, type: 'algorithm' | 'manual') => void;
  email: string;
  handleLogout?: () => void;
}

type OnboardingStep = 
  | 'MISSING_DATA' 
  | 'ROLE_SELECT' 
  | 'DOCTOR_FORM' 
  | 'USER_PATH_SELECT' 
  | 'DOCTOR_SELECT' 
  | 'ALGO_SETUP_MED' 
  | 'ALGO_SETUP_FORM' 
  | 'ALGO_SETUP_INV' 
  | 'ALGO_PREVIEW';

// --- Extracted Components ---

const OnboardingWrapper = ({ children, dir }: { children: React.ReactNode, dir: 'rtl' | 'ltr' }) => (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden" dir={dir}>
        {/* Dynamic Background */}
        <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-b from-indigo-950/20 via-[#020617] to-[#020617]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-float opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-30 delay-1000 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>
        
        <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl px-4 py-8 flex flex-col items-center min-h-[80vh] justify-center">
            {children}
        </div>
    </div>
);

const NavBackBtn = ({ onClick, dir, disabled }: { onClick: () => void, dir: 'rtl' | 'ltr', disabled?: boolean }) => (
    <button 
      onClick={onClick}
      className="absolute top-6 left-6 z-50 p-3 rounded-full bg-[#0f172a]/50 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
      disabled={disabled}
      aria-label={dir === 'rtl' ? "رجوع" : "Go Back"}
    >
      {dir === 'rtl' ? <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />}
    </button>
);

// --- Main Component ---

export const OnboardingView = ({ 
  userProfile, setUserProfile, inventory, setInventory, 
  currentDoseHabit, setCurrentDoseHabit, startPlan, email, handleLogout
}: OnboardingViewProps) => {
  const { t, dir, language } = useLanguage();
  
  const [step, setStep] = useState<OnboardingStep>('ROLE_SELECT');
  const [loading, setLoading] = useState(false);
  
  // Data Completion State
  const [missingData, setMissingData] = useState({
      age: userProfile.age?.toString() || '',
      weight: userProfile.weight?.toString() || '',
      height: userProfile.height?.toString() || ''
  });

  // Doctor States
  const [doctorName, setDoctorName] = useState(userProfile.name || '');
  const [doctorForm, setDoctorForm] = useState<Partial<DoctorProfileData>>({
      specialty: '', licenseNumber: '', clinicLocation: '', phoneNumber: '', bio: ''
  });

  const [availableDoctors, setAvailableDoctors] = useState<UserProfile[]>([]);
  const [searchDoctor, setSearchDoctor] = useState('');

  // Algorithm States
  const [medForm, setMedForm] = useState<MedForm | null>(null);
  const [medUnit, setMedUnit] = useState<MedUnit | null>(null);
  const [medType, setMedType] = useState<'narcotic' | 'psychiatric' | 'normal' | null>(null);
  const [blockedState, setBlockedState] = useState(false);
  const [psychWarning, setPsychWarning] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<PlanDay[]>([]);
  
  // Scientific Modal State
  const [showSciModal, setShowSciModal] = useState(false);
  
  // -- Local Buffers for Numeric Inputs --
  const [localInv, setLocalInv] = useState({ boxes: '0', pills: '0', loose: '0' });
  const [localDose, setLocalDose] = useState('0');

  // ** HOISTED VARIABLES **
  const unitLabel = medUnit || 'mg';
  const formLabel = medForm === 'liquid' ? (language === 'ar' ? 'عبوات' : 'Bottles') : (language === 'ar' ? 'علب' : 'Boxes');

  // Helper to calculate total from local strings
  const localTotalInventory = useMemo(() => {
      const b = parseInt(localInv.boxes) || 0;
      const p = parseInt(localInv.pills) || 0;
      const l = parseFloat(localInv.loose) || 0;
      return (b * p) + l;
  }, [localInv]);

  // Check for missing data on initial load
  useEffect(() => {
      if (!userProfile.age || !userProfile.weight || !userProfile.height) {
          setStep('MISSING_DATA');
      } else if (userProfile.role === 'doctor' && userProfile.doctorData) {
          setDoctorName(userProfile.name);
          setDoctorForm({
              specialty: userProfile.doctorData.specialty,
              licenseNumber: userProfile.doctorData.licenseNumber,
              clinicLocation: userProfile.doctorData.clinicLocation,
              phoneNumber: userProfile.doctorData.phoneNumber,
              bio: userProfile.doctorData.bio
          });
          setStep('DOCTOR_FORM');
      }
  }, []);

  // Sync Inventory to Local State ONLY when entering the step
  useEffect(() => {
      if (step === 'ALGO_SETUP_INV') {
          setLocalInv({
              boxes: inventory.boxes.toString(),
              pills: inventory.pillsPerBox.toString(),
              loose: inventory.loosePills.toString()
          });
          setLocalDose(currentDoseHabit > 0 ? currentDoseHabit.toString() : '');
      }
  }, [step]); 

  // --- Actions ---

  const handleSaveMissingData = async () => {
      const age = parseInt(missingData.age);
      const weight = parseFloat(missingData.weight);
      const height = parseFloat(missingData.height);

      if (!age || !weight || !height) {
          alert(language === 'ar' ? "يرجى تعبئة جميع البيانات الصحية" : "Please fill all health data");
          return;
      }

      setLoading(true);
      try {
          const updatedProfile = { ...userProfile, age, weight, height };
          if (auth && auth.currentUser) {
              await setDoc(doc(db, "users", auth.currentUser.uid), updatedProfile, { merge: true });
          }
          setUserProfile(updatedProfile);
          setStep('ROLE_SELECT');
      } catch (e) {
          console.error("Error saving missing data:", e);
          alert("Error saving data. Check connection.");
      }
      setLoading(false);
  };

  const handleDoctorSubmit = async () => {
      if (!auth || !auth.currentUser) return;
      
      if (!doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || !doctorName) {
          alert("يرجى ملء جميع الحقول المطلوبة.");
          return;
      }

      setLoading(true);
      const currentUser = auth.currentUser;
      
      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid, 
          name: doctorName,
          role: 'doctor',
          setupComplete: true, 
          doctorData: {
              specialty: doctorForm.specialty!,
              licenseNumber: doctorForm.licenseNumber!,
              clinicLocation: doctorForm.clinicLocation || '',
              phoneNumber: doctorForm.phoneNumber!,
              bio: doctorForm.bio || '',
              accountStatus: 'pending', 
              totalPatients: 0,
              activePatients: 0,
              recoveredCount: 0,
              doctorLevel: 1,
              photoUrl: null
          },
          durationMonths: 0,
          medType: null
      };

      try {
          await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
          alert("تم إرسال طلبك بنجاح!");
      } catch (e: any) {
          console.error(e);
          alert("حدث خطأ أثناء الحفظ.");
      }
      setLoading(false);
  };

  const handleAssignDoctor = async (docProfile: UserProfile) => {
      if (!auth || !auth.currentUser || !docProfile.uid) return;
      
      setLoading(true);
      const currentUser = auth.currentUser;
      
      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid,
          role: 'patient',
          setupComplete: true,
          patientData: {
              assignedDoctorId: docProfile.uid,
              assignedDoctorName: docProfile.name,
              requestStatus: 'pending',
              isPlanAssigned: false, 
              isRecovered: false
          },
          medType: 'normal', 
          durationMonths: 0
      };

      try {
           await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
           alert(t('req_sent_msg'));
      } catch(e: any) {
           console.error(e);
           alert("حدث خطأ.");
      }
      setLoading(false);
  };

  useEffect(() => {
      if (step === 'DOCTOR_SELECT') {
          const fetchDocs = async () => {
              try {
                  const q = query(
                      collection(db, "users"), 
                      where("role", "==", "doctor"),
                      where("doctorData.accountStatus", "==", "approved")
                  );
                  const snapshot = await getDocs(q);
                  setAvailableDoctors(snapshot.docs.map(d => ({...d.data(), uid: d.id} as UserProfile)));
              } catch (e) { console.error(e); }
          };
          fetchDocs();
      }
  }, [step]);

  const handleMedTypeSelect = (type: 'narcotic' | 'psychiatric' | 'normal') => {
      if (type === 'narcotic') setBlockedState(true);
      else if (type === 'psychiatric') { setMedType(type); setPsychWarning(true); } 
      else { setMedType(type); setStep('ALGO_SETUP_FORM'); }
  };

  const generatePreview = () => {
      const boxes = Math.max(0, parseInt(localInv.boxes) || 0);
      const pills = Math.max(0, parseInt(localInv.pills) || 0);
      const loose = Math.max(0, parseFloat(localInv.loose) || 0);
      const dose = Math.max(0, parseFloat(localDose) || 0);
      
      const totalPills = (boxes * pills) + loose;

      if (totalPills <= 0 || dose <= 0) {
          alert(language === 'ar' ? "يرجى إدخال كميات صحيحة (أكبر من صفر)." : "Please enter valid quantities (>0).");
          return;
      }

      setInventory({ boxes, pillsPerBox: pills, loosePills: loose, totalPills });
      setCurrentDoseHabit(dose);

      const plan = generatePlan(totalPills, dose, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      
      if (plan.length === 0) {
           alert(language === 'ar' ? "تعذر إنشاء خطة بهذه البيانات. تأكد أن الجرعة ليست أكبر من المخزون الكلي." : "Cannot generate plan. Ensure dose isn't larger than total inventory.");
           return;
      }

      setPreviewPlan(plan);
      setStep('ALGO_PREVIEW');
      setShowSciModal(true);
  };

  const confirmAlgorithmPlan = async () => {
      if (!auth || !auth.currentUser) return;
      setLoading(true);
      const currentUser = auth.currentUser;

      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid,
          role: 'normal_user',
          planType: 'algorithm',
          medType: medType,
          medForm: medForm!,
          medUnit: medUnit!,
          setupComplete: true
      };

      if (previewPlan.length === 0) {
          alert(language === 'ar' ? "لم يتم توليد خطة صالحة. يرجى التحقق من المدخلات." : "Invalid plan generated. Check inputs.");
          setLoading(false);
          return;
      }

      startPlan(previewPlan, 1.0, 'algorithm');
      
      try {
          await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
      } catch(e: any) {
          console.error(e);
          alert("حدث خطأ في حفظ البيانات.");
      }
      setLoading(false);
  };

  // --- RENDERS ---

  if (step === 'MISSING_DATA') {
      return (
          <OnboardingWrapper dir={dir}>
              {handleLogout && <NavBackBtn onClick={handleLogout} dir={dir} />}
              <div className="max-w-lg w-full animate-in zoom-in duration-500">
                  <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
                          <Activity className="w-10 h-10 text-indigo-400" />
                      </div>
                      <h1 className="text-3xl font-black text-white mb-3">
                          {language === 'ar' ? 'إكمال البيانات' : 'Complete Profile'}
                      </h1>
                      <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">
                          {language === 'ar' 
                              ? 'يرجى إدخال بياناتك الصحية لنتمكن من تخصيص خطة التعافي بدقة وضمان سلامتك.'
                              : 'Please enter your health metrics to personalize your recovery plan safely.'}
                      </p>
                  </div>

                  <Card className="!bg-[#0f172a]/60 border-white/10 shadow-2xl backdrop-blur-2xl space-y-6 !p-8 !rounded-[2.5rem]">
                      <div className="space-y-6">
                          <div className="relative group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{language === 'ar' ? 'العمر' : 'Age'}</label>
                              <div className="relative">
                                  <div className="absolute top-3.5 right-4 text-slate-500 pointer-events-none"><Calendar size={18} /></div>
                                  <input 
                                      type="number" min="18" max="99"
                                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50"
                                      placeholder="30"
                                      value={missingData.age}
                                      onChange={e => setMissingData({...missingData, age: e.target.value})}
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="relative group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{language === 'ar' ? 'الوزن (kg)' : 'Weight'}</label>
                                  <div className="relative">
                                      <div className="absolute top-3.5 right-4 text-slate-500 pointer-events-none"><Weight size={18} /></div>
                                      <input 
                                          type="number" min="30"
                                          className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50"
                                          placeholder="70"
                                          value={missingData.weight}
                                          onChange={e => setMissingData({...missingData, weight: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <div className="relative group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{language === 'ar' ? 'الطول (cm)' : 'Height'}</label>
                                  <div className="relative">
                                      <div className="absolute top-3.5 right-4 text-slate-500 pointer-events-none"><Ruler size={18} /></div>
                                      <input 
                                          type="number" min="100"
                                          className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50"
                                          placeholder="170"
                                          value={missingData.height}
                                          onChange={e => setMissingData({...missingData, height: e.target.value})}
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                      <Button onClick={handleSaveMissingData} variant="primary" className="w-full py-4 text-lg !rounded-xl shadow-lg shadow-indigo-500/20" disabled={loading}>
                          {loading ? '...' : (language === 'ar' ? 'حفظ ومتابعة' : 'Save & Continue')}
                      </Button>
                  </Card>
              </div>
          </OnboardingWrapper>
      );
  }

  if (step === 'ROLE_SELECT') {
      return (
        <OnboardingWrapper dir={dir}>
             {handleLogout && <NavBackBtn onClick={handleLogout} dir={dir} />}
             
             <div className="text-center mb-16 animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-4 tracking-tight drop-shadow-2xl">{t('onboard_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed font-medium">{t('onboard_desc')}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full" role="group" aria-label="Role Selection">
                 
                 {/* PATIENT CARD */}
                 <button 
                    onClick={() => setStep('USER_PATH_SELECT')} 
                    className="group relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-10 rounded-[3rem] hover:border-indigo-500/50 transition-all duration-500 text-right shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-colors"></div>
                     
                     <div className="relative z-10 flex flex-col items-end h-full">
                         <div className="w-20 h-20 bg-[#0f172a] rounded-[2rem] flex items-center justify-center mb-8 shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:border-indigo-500/30">
                            <UserPlus size={36} className="text-indigo-400 group-hover:text-indigo-300 transition-colors"/>
                         </div>
                         <h3 className="text-3xl font-black text-white mb-4">{t('role_patient')}</h3>
                         <p className="text-slate-400 leading-relaxed text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity">{t('role_patient_desc')}</p>
                     </div>
                 </button>
                 
                 {/* DOCTOR CARD */}
                 <button 
                    onClick={() => setStep('DOCTOR_FORM')} 
                    className="group relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-10 rounded-[3rem] hover:border-emerald-500/50 transition-all duration-500 text-right shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors"></div>

                     <div className="relative z-10 flex flex-col items-end h-full">
                         <div className="w-20 h-20 bg-[#0f172a] rounded-[2rem] flex items-center justify-center mb-8 shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:border-emerald-500/30">
                            <Stethoscope size={36} className="text-emerald-400 group-hover:text-emerald-300 transition-colors"/>
                         </div>
                         <h3 className="text-3xl font-black text-white mb-4">{t('role_doctor')}</h3>
                         <p className="text-slate-400 leading-relaxed text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity">{t('role_doctor_desc')}</p>
                     </div>
                 </button>
             </div>
        </OnboardingWrapper>
      );
  }

  // ... (Other steps keep similar logic but upgraded UI components - I will implement one more key step to show the pattern, and then standard forms)

  if (step === 'DOCTOR_FORM') {
      return (
          <OnboardingWrapper dir={dir}>
              <NavBackBtn onClick={() => setStep('ROLE_SELECT')} dir={dir} />
              <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <header className="text-center mb-10">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                          <Stethoscope className="text-emerald-400" size={32} />
                      </div>
                      <h1 className="text-4xl font-black text-white mb-2">{t('doc_req_title')}</h1>
                      <p className="text-slate-400">{t('doc_req_desc')}</p>
                  </header>
                  
                  <Card className="!bg-[#0f172a]/60 border-white/10 shadow-2xl backdrop-blur-xl !p-10 !rounded-[2.5rem]">
                      <div className="space-y-6">
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_fullname')}</label>
                              <div className="relative">
                                  <div className="absolute top-4 right-4 text-slate-500 pointer-events-none"><User size={20} /></div>
                                  <input className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-emerald-500 outline-none transition-all placeholder-slate-700" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_specialty')}</label>
                                  <div className="relative">
                                      <div className="absolute top-4 right-4 text-slate-500 pointer-events-none"><Award size={20} /></div>
                                      <input className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-emerald-500 outline-none transition-all placeholder-slate-700" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/>
                                  </div>
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_license')}</label>
                                  <div className="relative">
                                      <div className="absolute top-4 right-4 text-slate-500 pointer-events-none"><FileText size={20} /></div>
                                      <input className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-emerald-500 outline-none transition-all placeholder-slate-700" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_location')}</label>
                                  <div className="relative">
                                      <div className="absolute top-4 right-4 text-slate-500 pointer-events-none"><MapPin size={20} /></div>
                                      <input className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-emerald-500 outline-none transition-all placeholder-slate-700" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/>
                                  </div>
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_phone')}</label>
                                  <div className="relative">
                                      <div className="absolute top-4 right-4 text-slate-500 pointer-events-none"><Phone size={20} /></div>
                                      <input className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-emerald-500 outline-none transition-all placeholder-slate-700" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/>
                                  </div>
                              </div>
                          </div>

                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-emerald-400 transition-colors">{t('doc_bio')}</label>
                              <textarea className="w-full bg-[#020617]/50 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none h-32 resize-none transition-all placeholder-slate-700" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/>
                          </div>
                          
                          <Button variant="success" className="w-full py-5 text-lg font-bold !rounded-xl shadow-xl shadow-emerald-500/20" onClick={handleDoctorSubmit} disabled={!doctorName || !doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || loading}>
                              {loading ? 'جاري الإرسال...' : t('doc_submit')}
                          </Button>
                      </div>
                  </Card>
              </div>
          </OnboardingWrapper>
      );
  }

  if (step === 'USER_PATH_SELECT') { 
      return (
        <OnboardingWrapper dir={dir}>
            <NavBackBtn onClick={() => setStep('ROLE_SELECT')} dir={dir} />
            <header className="mb-16 text-center animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl font-black text-white mb-3 drop-shadow-xl">{t('path_select_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">{t('onboard_desc')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
                
                {/* ALGORITHM CARD */}
                <button onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} className="group relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] hover:border-indigo-500/50 transition-all duration-500 text-right shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                            <BrainCircuit size={32} className="text-indigo-400"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t('path_algo')}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{t('path_algo_desc')}</p>
                    </div>
                </button>

                {/* DOCTOR CARD */}
                <button onClick={() => setStep('DOCTOR_SELECT')} className="group relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-500 text-right shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                            <Stethoscope size={32} className="text-blue-400"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t('path_doctor')}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{t('path_doctor_desc')}</p>
                    </div>
                </button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  // ... (Other steps)

  if (step === 'DOCTOR_SELECT') { 
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())); 
      return (
        <OnboardingWrapper dir={dir}>
            <NavBackBtn onClick={() => setStep('USER_PATH_SELECT')} dir={dir} />
            <div className="max-w-4xl w-full animate-in fade-in duration-500">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{t('doc_select_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>
                
                <div className="relative mb-8 group">
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors"><Search size={20}/></div>
                    <input className="w-full bg-[#0f172a]/60 border border-white/10 rounded-2xl py-5 px-14 text-white outline-none focus:border-indigo-500 focus:bg-[#020617] transition-all shadow-xl placeholder-slate-600 font-medium" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    {filteredDocs.map(doc => (
                        <div key={doc.uid} className="bg-[#0f172a]/60 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between hover:border-indigo-500/30 transition-all hover:bg-[#0f172a] shadow-lg group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl flex items-center justify-center text-indigo-400 font-bold border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                    {doc.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                    <Badge color="blue" className="mt-1">{doc.doctorData?.specialty}</Badge>
                                </div>
                            </div>
                            <Button onClick={() => handleAssignDoctor(doc)} className="w-full py-3 mt-auto !rounded-xl" variant="secondary" disabled={loading}>
                                {loading ? '...' : t('doc_select_btn')}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </OnboardingWrapper>
      ); 
  }

  if (step === 'ALGO_SETUP_MED') { 
      if (blockedState) return (
        <OnboardingWrapper dir={dir}>
            <div className="text-center animate-in zoom-in max-w-lg bg-rose-950/40 p-10 rounded-[3rem] border border-rose-500/20 backdrop-blur-xl">
                <div className="w-24 h-24 bg-rose-600/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-rose-500/30 animate-bounce">
                    <AlertTriangle size={48} className="text-rose-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">{t('blocked_title')}</h1>
                <p className="text-rose-200/80 text-lg mb-8 leading-relaxed">{t('med_type_narcotic_desc')}</p>
                <Button onClick={() => setBlockedState(false)} variant="secondary" className="px-10 py-4 text-lg">{t('close')}</Button>
            </div>
        </OnboardingWrapper>
      ); 
      
      if (psychWarning) return (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-6" dir={dir}>
            <Card className="max-w-md border-amber-500/30 bg-[#0f172a] !p-8 !rounded-[2.5rem] shadow-2xl shadow-amber-900/20">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                    <Info size={32} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-4">{t('warning_title')}</h2>
                <p className="text-slate-300 text-center mb-8 leading-relaxed">{t('med_type_psych_desc')}</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">{t('close')}</Button>
                    <Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1 bg-amber-600 hover:bg-amber-500 border-amber-500">موافق، تابع</Button>
                </div>
            </Card>
        </div>
      ); 
      
      return (
        <OnboardingWrapper dir={dir}>
            <NavBackBtn onClick={() => setStep('USER_PATH_SELECT')} dir={dir} />
            <header className="text-center mb-12 animate-in slide-in-from-top-4 relative z-10">
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-xl">{t('med_type_title')}</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full relative z-10">
                {[
                    { type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose' }, 
                    { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber' }, 
                    { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald' }
                ].map((item: any) => (
                    <button 
                        key={item.type} 
                        onClick={() => handleMedTypeSelect(item.type)} 
                        className={`group relative p-8 rounded-[2.5rem] border border-white/5 bg-[#0f172a]/40 hover:bg-[#0f172a]/60 backdrop-blur-xl transition-all text-right hover:-translate-y-2 duration-300 hover:border-${item.color}-500/30 hover:shadow-2xl hover:shadow-${item.color}-500/10`}
                    >
                        <div className={`w-20 h-20 rounded-[1.5rem] bg-${item.color}-500/10 flex items-center justify-center mb-8 border border-${item.color}-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                            <item.icon className={`w-10 h-10 text-${item.color}-500`} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                    </button>
                ))}
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_FORM') { 
      return (
        <OnboardingWrapper dir={dir}>
            <NavBackBtn onClick={() => setStep('ALGO_SETUP_MED')} dir={dir} />
            <div className="max-w-2xl w-full animate-in zoom-in duration-500 text-center">
                <h1 className="text-4xl font-black text-white mb-10 drop-shadow-lg">{t('med_form_title')}</h1>
                
                <div className="grid grid-cols-2 gap-6 mb-12">
                    <button onClick={() => setMedForm('tablet')} className={`group p-8 rounded-[2.5rem] border transition-all duration-300 ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/30 scale-105' : 'bg-[#0f172a]/40 border-white/10 text-slate-400 hover:bg-[#0f172a]/60'}`}>
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors ${medForm === 'tablet' ? 'bg-white/20' : 'bg-slate-800'}`}>
                            <Pill className="w-10 h-10" />
                        </div>
                        <span className="block font-bold text-2xl">{t('form_tablet')}</span>
                    </button>
                    <button onClick={() => setMedForm('liquid')} className={`group p-8 rounded-[2.5rem] border transition-all duration-300 ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/30 scale-105' : 'bg-[#0f172a]/40 border-white/10 text-slate-400 hover:bg-[#0f172a]/60'}`}>
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors ${medForm === 'liquid' ? 'bg-white/20' : 'bg-slate-800'}`}>
                            <FlaskConical className="w-10 h-10" />
                        </div>
                        <span className="block font-bold text-2xl">{t('form_liquid')}</span>
                    </button>
                </div>
                
                {medForm && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-12">
                        <h2 className="text-xl font-bold text-slate-300 mb-6">{t('unit_title')}</h2>
                        <div className="flex justify-center gap-4">
                            {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                <button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-8 py-4 rounded-2xl font-bold text-xl border transition-all duration-200 ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-[#0f172a]/50 border-white/10 text-slate-500 hover:text-white'}`}>
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button variant="success" className="w-full py-5 text-xl !rounded-2xl shadow-xl shadow-emerald-500/20" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>
                    التالي <ArrowRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_INV') { 
      return (
        <OnboardingWrapper dir={dir}>
            <NavBackBtn onClick={() => setStep('ALGO_SETUP_FORM')} dir={dir} />
            <div className="max-w-4xl w-full animate-in fade-in duration-500">
                <Card className="!bg-[#0f172a]/80 backdrop-blur-xl border-white/10 shadow-2xl !rounded-[2.5rem] !p-10 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner"><Pill size={28} /></span>
                        {t('inventory_title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider ml-1">{t('boxes')} ({formLabel})</label>
                            <input 
                                type="number" min="0" 
                                className="w-full bg-[#020617]/50 p-6 rounded-[1.5rem] text-5xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center shadow-inner focus:ring-4 focus:ring-indigo-500/10" 
                                placeholder="0" 
                                value={localInv.boxes} 
                                onChange={(e) => setLocalInv({...localInv, boxes: e.target.value})} 
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider ml-1">{t('pills_per_box')}</label>
                            <input 
                                type="number" min="1" 
                                className="w-full bg-[#020617]/50 p-6 rounded-[1.5rem] text-5xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center shadow-inner focus:ring-4 focus:ring-indigo-500/10" 
                                placeholder="0" 
                                value={localInv.pills} 
                                onChange={(e) => setLocalInv({...localInv, pills: e.target.value})} 
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider ml-1">{t('loose_pills')}</label>
                            <input 
                                type="number" min="0" step="0.5"
                                className="w-full bg-[#020617]/50 p-6 rounded-[1.5rem] text-5xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center shadow-inner focus:ring-4 focus:ring-indigo-500/10" 
                                placeholder="0" 
                                value={localInv.loose} 
                                onChange={(e) => setLocalInv({...localInv, loose: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center bg-[#020617]/30 -mx-10 -mb-10 p-10 rounded-b-[2.5rem]">
                        <span className="text-slate-400 font-bold text-lg uppercase tracking-widest">{t('total_balance')}</span>
                        <span className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 filter drop-shadow-lg">
                            {localTotalInventory} <span className="text-2xl text-slate-500 font-sans">{unitLabel}</span>
                        </span>
                    </div>
                </Card>
                
                <Card className="!bg-[#0f172a]/80 backdrop-blur-xl border-white/10 shadow-xl !p-8 !rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20"><Activity size={24}/></div>
                        <h2 className="text-xl font-bold text-white">{t('current_habit')} ({unitLabel})</h2>
                    </div>
                    
                    <div className="flex-1 flex gap-3 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setLocalDose(dose.toString())} className={`h-14 min-w-[4.5rem] px-2 rounded-xl font-mono font-bold text-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${parseFloat(localDose) === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-[#020617]/50 border-white/10 text-slate-500 hover:bg-[#020617] hover:text-white'}`}>{dose}</button>
                        ))}
                    </div>
                    
                    <div className="relative min-w-[140px] w-full md:w-auto">
                        <input 
                            type="number" min="0.1" step="0.1"
                            placeholder="..." 
                            className="h-14 w-full bg-[#020617] rounded-xl border border-white/10 px-6 font-mono font-bold text-lg text-white focus:border-indigo-500 outline-none transition-all text-center placeholder-slate-600 shadow-inner" 
                            value={localDose}
                            onChange={(e) => setLocalDose(e.target.value)} 
                        />
                    </div>
                </Card>
                
                <div className="mt-8">
                    <Button className="w-full text-2xl py-6 rounded-[1.5rem] shadow-2xl shadow-indigo-500/30 animate-pulse-glow hover:scale-[1.01] transition-transform" variant="success" disabled={parseFloat(localDose) <= 0 || localTotalInventory <= 0} onClick={generatePreview}>
                        {t('analyze_plan')} <BrainCircuit className="ml-3" size={28}/>
                    </Button>
                </div>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_PREVIEW') { 
      return (
        <OnboardingWrapper dir={dir}>
            <ScientificPlanModal 
                isOpen={showSciModal} 
                onClose={() => setShowSciModal(false)} 
                onConfirm={() => setShowSciModal(false)} 
            />

            <NavBackBtn onClick={() => setStep('ALGO_SETUP_INV')} dir={dir} />
            <div className="max-w-4xl w-full text-center space-y-10 animate-in zoom-in duration-500 pt-10">
                <div className="inline-flex p-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2 shadow-[0_0_80px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30">
                    <CheckCircle size={80} className="text-emerald-400 drop-shadow-lg" />
                </div>
                
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4">تم إنشاء الخطة المبدئية</h1>
                    <p className="text-slate-400 text-lg">بناءً على مخزونك الحالي والجرعة المعتادة</p>
                </div>
                
                {/* Safety Warning Block */}
                <div className="bg-amber-950/40 border border-amber-500/30 p-8 rounded-[2rem] text-left flex flex-col md:flex-row items-center md:items-start gap-6 backdrop-blur-md shadow-xl">
                    <div className="p-4 bg-amber-500/20 rounded-2xl text-amber-400 shrink-0">
                        <Info size={32} />
                    </div>
                    <div>
                        <h4 className="text-amber-300 font-bold text-xl mb-2">تنويه هام قبل البدء</h4>
                        <p className="text-amber-100/80 text-base leading-relaxed">
                            هذه الخطة تم توليدها رياضياً بناءً على الكمية المتوفرة لديك لضمان عدم انقطاع الدواء فجأة. 
                            <strong> يرجى عرض هذه الخطة على طبيبك المختص للموافقة عليها قبل البدء.</strong>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="text-center border-indigo-500/30 bg-[#0f172a]/80 !p-10 !rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="text-sm text-indigo-300 font-bold uppercase mb-4 tracking-[0.2em]">{t('duration_days')}</div>
                            <div className="text-7xl font-black text-white tracking-tighter">{previewPlan.length}</div>
                            <div className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-wider">يوم تقديري</div>
                        </div>
                    </Card>
                    <Card className="text-center border-emerald-500/30 bg-[#0f172a]/80 !p-10 !rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="text-sm text-emerald-300 font-bold uppercase mb-4 tracking-[0.2em]">تغطية المخزون</div>
                            <div className="text-7xl font-black text-emerald-400 tracking-tighter">100%</div>
                            <div className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-wider">كافٍ لإتمام الجدول</div>
                        </div>
                    </Card>
                </div>

                <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl shadow-2xl shadow-emerald-500/20 !rounded-[1.5rem]" disabled={loading}>
                    {loading ? 'جاري الإعداد...' : t('confirm_log')} <ChevronRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }

  return null;
};