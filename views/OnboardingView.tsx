import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User, ChevronRight, Activity
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

// المكونات
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
  | 'ROLE_SELECT' 
  | 'DOCTOR_FORM' 
  | 'USER_PATH_SELECT' 
  | 'DOCTOR_SELECT' 
  | 'ALGO_SETUP_MED' 
  | 'ALGO_SETUP_FORM' 
  | 'ALGO_SETUP_INV' 
  | 'ALGO_PREVIEW';

export const OnboardingView = ({ 
  userProfile, setUserProfile, inventory, setInventory, 
  currentDoseHabit, setCurrentDoseHabit, startPlan, email, handleLogout
}: OnboardingViewProps) => {
  const { t, dir, language } = useLanguage();
  
  const [step, setStep] = useState<OnboardingStep>('ROLE_SELECT');
  const [loading, setLoading] = useState(false);
  
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
  
  const totalInventory = calculateTotalInventory(inventory);
  
  // -- Load existing data if resubmitting --
  useEffect(() => {
      if (userProfile.role === 'doctor' && userProfile.doctorData) {
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
  }, [userProfile]);

  const NavBackBtn = ({ to }: { to?: OnboardingStep }) => (
      <button 
        onClick={() => to ? setStep(to) : handleLogout?.()}
        className="absolute top-6 left-6 z-50 p-3 rounded-full glass hover:bg-white/10 text-slate-400 hover:text-white transition-all shadow-lg"
        disabled={loading}
      >
        {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
      </button>
  );

  // --- Actions ---

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

      startPlan(previewPlan, 1.0, 'algorithm');
      
      try {
          await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
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
      const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      setPreviewPlan(plan);
      setStep('ALGO_PREVIEW');
      setShowSciModal(true);
  };

  // --- RENDERS ---

  // Wrapper with Ambient Background
  const OnboardingWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center relative overflow-hidden" dir={dir}>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-40 delay-1000 pointer-events-none"></div>
          <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
          {children}
      </div>
  );

  if (step === 'ROLE_SELECT') {
      return (
        <OnboardingWrapper>
             {handleLogout && <NavBackBtn />}
             <header className="mb-12 text-center animate-in slide-in-from-top-4 relative z-10">
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{t('onboard_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">{t('onboard_desc')}</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
                 {/* خيار المريض */}
                 <button onClick={() => setStep('USER_PATH_SELECT')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <UserPlus size={32} className="text-indigo-400"/>
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">{t('role_patient')}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('role_patient_desc')}</p>
                 </button>
                 
                 {/* خيار الطبيب */}
                 <button onClick={() => setStep('DOCTOR_FORM')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                        <Stethoscope size={32} className="text-emerald-400"/>
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">{t('role_doctor')}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('role_doctor_desc')}</p>
                 </button>
             </div>
        </OnboardingWrapper>
      );
  }

  if (step === 'DOCTOR_FORM') {
      return (
          <OnboardingWrapper>
              <NavBackBtn to="ROLE_SELECT" />
              <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8 relative z-10 pt-20">
                  <header className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">{t('doc_req_title')}</h1>
                      <p className="text-slate-400">{t('doc_req_desc')}</p>
                  </header>
                  <Card className="!bg-slate-900/80 border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                      <div className="group">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_fullname')}</label>
                          <div className="relative">
                              <User className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                              <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_specialty')}</label>
                              <div className="relative">
                                  <Award className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_license')}</label>
                              <div className="relative">
                                  <FileText className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_location')}</label>
                              <div className="relative">
                                  <MapPin className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_phone')}</label>
                              <div className="relative">
                                  <Phone className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="group">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_bio')}</label>
                          <textarea className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-24 resize-none transition-all" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/>
                      </div>
                      
                      <Button variant="success" className="w-full py-4 text-lg shadow-lg shadow-emerald-500/20" onClick={handleDoctorSubmit} disabled={!doctorName || !doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || loading}>
                          {loading ? 'جاري الإرسال...' : t('doc_submit')}
                      </Button>
                  </Card>
              </div>
          </OnboardingWrapper>
      );
  }

  if (step === 'USER_PATH_SELECT') { 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ROLE_SELECT" />
            <header className="mb-12 text-center animate-in slide-in-from-top-4 relative z-10 pt-20">
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{t('path_select_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">{t('onboard_desc')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
                <button onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <BrainCircuit size={32} className="text-indigo-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('path_algo_desc')}</p>
                </button>
                <button onClick={() => setStep('DOCTOR_SELECT')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20 border border-blue-500/30">
                        <Stethoscope size={32} className="text-blue-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('path_doctor_desc')}</p>
                </button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'DOCTOR_SELECT') { 
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())); 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="USER_PATH_SELECT" />
            <div className="max-w-4xl w-full animate-in fade-in relative z-10 pt-20">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{t('doc_select_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>
                <div className="relative mb-8 group">
                    <Search className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20}/>
                    <input className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-4 px-14 text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all shadow-lg" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.length === 0 ? (
                        <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                            <Stethoscope className="mx-auto mb-4 text-slate-700" size={48} />
                            <p className="text-slate-500">{availableDoctors.length === 0 ? 'لا يوجد أطباء متاحين حالياً.' : 'لم يتم العثور على نتائج.'}</p>
                        </div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div key={doc.uid} className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group flex flex-col h-full shadow-xl hover:shadow-indigo-500/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt="Dr" className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                                        ) : (
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/20">Dr</div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                            <Badge color="blue">{doc.doctorData?.specialty}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 bg-slate-950/50 p-4 rounded-xl border border-white/5 flex-1 leading-relaxed">
                                    {doc.doctorData?.bio || "لا توجد نبذة تعريفية."}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider">
                                    <MapPin size={14}/> {doc.doctorData?.clinicLocation || "عيادة افتراضية"}
                                </div>
                                <Button onClick={() => handleAssignDoctor(doc)} className="w-full py-3" variant="secondary" disabled={loading}>
                                    {loading ? 'جاري الإرسال...' : t('doc_select_btn')}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </OnboardingWrapper>
      ); 
  }

  if (step === 'ALGO_SETUP_MED') { 
      if (blockedState) return (
        <OnboardingWrapper>
            <div className="text-center animate-in zoom-in max-w-lg">
                <div className="w-24 h-24 bg-rose-600/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-rose-500/30 shadow-2xl shadow-rose-900/50 animate-bounce">
                    <AlertTriangle size={48} className="text-rose-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">{t('blocked_title')}</h1>
                <p className="text-rose-200/80 text-xl leading-relaxed mb-8 bg-rose-900/20 p-6 rounded-2xl border border-rose-500/10">
                    {t('med_type_narcotic_desc')}
                </p>
                <Button onClick={() => setBlockedState(false)} variant="secondary" className="px-8">{t('close')}</Button>
            </div>
        </OnboardingWrapper>
      ); 
      
      if (psychWarning) return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in" dir={dir}>
            <Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse border border-amber-500/30">
                    <AlertTriangle size={32} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-4">{t('warning_title')}</h2>
                <p className="text-slate-300 text-center mb-8 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    {t('med_type_psych_desc')}
                </p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">{t('close')}</Button>
                    <Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1">موافق، تابع</Button>
                </div>
            </Card>
        </div>
      ); 
      
      return (
        <OnboardingWrapper>
            <NavBackBtn to="USER_PATH_SELECT" />
            <header className="text-center mb-12 animate-in slide-in-from-top-4 relative z-10 pt-20">
                <h1 className="text-4xl font-black text-white mb-4">{t('med_type_title')}</h1>
                <p className="text-slate-400">حدد نوع الدواء الذي تريد التعافي منه</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full relative z-10">
                {[
                    { type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_type_narcotic_desc') }, 
                    { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_type_psych_desc') }, 
                    { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_type_normal_desc') }
                ].map((item: any) => (
                    <button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-md hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/50 hover:shadow-2xl shadow-lg hover:scale-105 duration-300`}>
                        <div className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-${item.color}-500/20`}>
                            <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </button>
                ))}
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_FORM') { 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ALGO_SETUP_MED" />
            <div className="max-w-2xl w-full animate-in zoom-in relative z-10 pt-20 text-center">
                <h1 className="text-3xl font-black text-white mb-8">{t('med_form_title')}</h1>
                <div className="grid grid-cols-2 gap-6 mb-10">
                    <button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all duration-300 group ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}>
                        <Pill className={`mx-auto mb-4 w-12 h-12 ${medForm === 'tablet' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_tablet')}</span>
                    </button>
                    <button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all duration-300 group ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}>
                        <FlaskConical className={`mx-auto mb-4 w-12 h-12 ${medForm === 'liquid' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_liquid')}</span>
                    </button>
                </div>
                
                {medForm && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-10">
                        <h2 className="text-xl font-bold text-white mb-4">{t('unit_title')}</h2>
                        <div className="flex justify-center gap-4">
                            {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                <button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-8 py-4 rounded-2xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 border-white/10 text-slate-500 hover:text-white hover:bg-slate-800'}`}>
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button variant="success" className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-emerald-500/20" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>
                    التالي <ArrowRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_INV') { 
      const formLabel = medForm === 'liquid' ? 'عبوات' : 'علب'; 
      const unitLabel = medUnit || 'mg'; 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ALGO_SETUP_FORM" />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in relative z-10 pt-20 w-full">
                <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30"><Pill size={28} /></span>
                        {t('inventory_title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('boxes')} ({formLabel})</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('pills_per_box')}</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('loose_pills')}</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center bg-slate-950/30 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
                        <span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span>
                        <span className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                            {calculateTotalInventory(inventory)} <span className="text-lg text-slate-500">{unitLabel}</span>
                        </span>
                    </div>
                </Card>
                
                <Card className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="text-amber-400"/> {t('current_habit')} ({unitLabel})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-14 min-w-[4rem] px-4 rounded-xl font-mono font-bold border transition-all duration-300 ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950/50 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'}`}>{dose}</button>
                        ))}
                        <input 
                            type="number" 
                            placeholder="جرعة أخرى..." 
                            className="h-14 min-w-[8rem] bg-slate-950/50 rounded-xl border border-white/10 px-6 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all text-center placeholder-slate-600" 
                            onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} 
                        />
                    </div>
                </Card>
                
                <Button className="w-full text-2xl py-6 rounded-3xl shadow-2xl shadow-indigo-500/20 animate-pulse-glow" variant="success" disabled={currentDoseHabit === 0 || calculateTotalInventory(inventory) === 0} onClick={generatePreview}>
                    {t('analyze_plan')} <BrainCircuit className="ml-3" size={28}/>
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_PREVIEW') { 
      return (
        <OnboardingWrapper>
            <ScientificPlanModal 
                isOpen={showSciModal} 
                onClose={() => setShowSciModal(false)} 
                onConfirm={() => setShowSciModal(false)} 
            />

            <NavBackBtn to="ALGO_SETUP_INV" />
            <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in relative z-10 pt-20">
                <div className="inline-flex p-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={64} className="text-emerald-400" />
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight">تم إنشاء الخطة بنجاح!</h1>
                <p className="text-slate-400 text-xl">بناءً على مخزونك الحالي وجرعتك، هذه هي التوقعات:</p>
                
                <div className="grid grid-cols-2 gap-6">
                    <Card className="text-center border-indigo-500/30 bg-slate-900/80">
                        <div className="text-sm text-indigo-300 font-bold uppercase mb-2 tracking-widest">{t('duration_days')}</div>
                        <div className="text-6xl font-black text-white">{previewPlan.length}</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">يوم حتى التعافي</div>
                    </Card>
                    <Card className="text-center border-emerald-500/30 bg-slate-900/80">
                        <div className="text-sm text-emerald-300 font-bold uppercase mb-2 tracking-widest">تغطية المخزون</div>
                        <div className="text-6xl font-black text-emerald-400">100%</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">كافٍ تماماً</div>
                    </Card>
                </div>

                <div className="bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20 text-indigo-200 text-sm font-medium leading-relaxed backdrop-blur-md">
                    <p>سيتم الآن نقلك إلى لوحة القيادة المركزية. تذكر أن الالتزام اليومي هو مفتاح النجاح. يمكنك دائماً تعديل سرعة الخطة من الإعدادات إذا شعرت بأي تعب.</p>
                </div>

                <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl shadow-2xl shadow-emerald-500/20" disabled={loading}>
                    {loading ? 'جاري الإعداد...' : t('confirm_log')} <ChevronRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }

  return null;
};