import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User
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
  const { t, dir } = useLanguage();
  
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
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        disabled={loading}
      >
        {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
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
      // 1. توليد الخطة
      const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      setPreviewPlan(plan);
      
      // 2. إصلاح الخطأ: الانتقال إلى صفحة المعاينة
      setStep('ALGO_PREVIEW');
      
      // 3. فتح المودال العلمي
      setShowSciModal(true);
  };

  // --- RENDERS ---

  if (step === 'ROLE_SELECT') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center relative">
             <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
             {handleLogout && <NavBackBtn />}
             <header className="mb-12 text-center animate-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">{t('onboard_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto">{t('onboard_desc')}</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 <button onClick={() => setStep('USER_PATH_SELECT')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <UserPlus size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('role_patient')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('role_patient_desc')}</p>
                 </button>
                 <button onClick={() => setStep('DOCTOR_FORM')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Stethoscope size={40} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('role_doctor')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('role_doctor_desc')}</p>
                 </button>
             </div>
        </div>
      );
  }

  if (step === 'DOCTOR_FORM') {
      return (
          <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
              <NavBackBtn to="ROLE_SELECT" />
              <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8">
                  <header className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">{t('doc_req_title')}</h1>
                      <p className="text-slate-400">{t('doc_req_desc')}</p>
                  </header>
                  <Card className="bg-slate-900 border-white/5 space-y-6">
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_fullname')}</label><div className="relative"><User className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_specialty')}</label><div className="relative"><Award className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/></div></div><div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_license')}</label><div className="relative"><FileText className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/></div></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_location')}</label><div className="relative"><MapPin className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_phone')}</label><div className="relative"><Phone className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_bio')}</label><textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none h-24 resize-none" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/></div>
                      <Button variant="success" className="w-full py-4 text-lg" onClick={handleDoctorSubmit} disabled={!doctorName || !doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || loading}>
                          {loading ? 'جاري الإرسال...' : t('doc_submit')}
                      </Button>
                  </Card>
              </div>
          </div>
      );
  }

  if (step === 'USER_PATH_SELECT') { return (<div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center"><NavBackBtn to="ROLE_SELECT" /><header className="mb-12 text-center animate-in slide-in-from-top-4"><h1 className="text-4xl font-black text-white mb-4">{t('path_select_title')}</h1><p className="text-slate-400 max-w-lg mx-auto">{t('onboard_desc')}</p></header><div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full"><button onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div><BrainCircuit size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/><h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3><p className="text-slate-500 leading-relaxed">{t('path_algo_desc')}</p></button><button onClick={() => setStep('DOCTOR_SELECT')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div><Stethoscope size={40} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform"/><h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3><p className="text-slate-500 leading-relaxed">{t('path_doctor_desc')}</p></button></div></div>); }
  
  if (step === 'DOCTOR_SELECT') { 
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())); 
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
            <NavBackBtn to="USER_PATH_SELECT" />
            <div className="max-w-4xl w-full animate-in fade-in">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{t('doc_select_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>
                <div className="relative mb-6"><Search className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" size={18}/><input className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-12 text-white outline-none focus:border-blue-500" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.length === 0 ? (<div className="col-span-2 text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800"><Stethoscope className="mx-auto mb-4 text-slate-700" size={48} /><p className="text-slate-500">{availableDoctors.length === 0 ? 'No approved doctors available yet.' : 'No results found.'}</p></div>) : (
                        filteredDocs.map(doc => (
                            <div key={doc.uid} className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-4">{doc.doctorData?.photoUrl ? (<img src={doc.doctorData.photoUrl} alt="Dr" className="w-12 h-12 rounded-full object-cover border border-white/10" />) : (<div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg">Dr</div>)}<div><h3 className="font-bold text-white text-lg">{doc.name}</h3><Badge color="blue">{doc.doctorData?.specialty}</Badge></div></div></div>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 bg-slate-950/50 p-3 rounded-lg border border-white/5 flex-1">{doc.doctorData?.bio || "No bio available."}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4"><MapPin size={14}/> {doc.doctorData?.clinicLocation || "Online"}</div>
                                <Button onClick={() => handleAssignDoctor(doc)} className="w-full" variant="secondary" disabled={loading}>{loading ? 'Sending...' : t('doc_select_btn')}</Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      ); 
  }

  if (step === 'ALGO_SETUP_MED') { if (blockedState) return (<div className="min-h-screen flex flex-col items-center justify-center bg-red-950 p-6 text-center animate-in zoom-in"><div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><AlertTriangle size={48} className="text-white" /></div><h1 className="text-4xl font-black text-white mb-4">{t('blocked_title')}</h1><p className="text-red-200 text-xl max-w-lg mb-8">{t('med_type_narcotic_desc')}</p><Button onClick={() => setBlockedState(false)} variant="secondary">{t('close')}</Button></div>); if (psychWarning) return (<div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in"><Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]"><div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse"><AlertTriangle size={32} className="text-amber-500" /></div><h2 className="text-2xl font-bold text-white text-center mb-4">{t('warning_title')}</h2><p className="text-slate-300 text-center mb-6 leading-relaxed">{t('med_type_psych_desc')}</p><div className="flex gap-4"><Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">{t('close')}</Button><Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1">OK</Button></div></Card></div>); return (<div className="min-h-screen bg-[#020617] p-6 pt-20"><NavBackBtn to="USER_PATH_SELECT" /><header className="text-center mb-12 animate-in slide-in-from-top-4"><h1 className="text-4xl font-black text-white mb-4">{t('med_type_title')}</h1></header><div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">{[{ type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_type_narcotic_desc') }, { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_type_psych_desc') }, { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_type_normal_desc') }].map((item: any) => (<button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-10 rounded-[2.5rem] border border-white/5 bg-slate-900 hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/30`}><div className={`w-20 h-20 rounded-3xl bg-${item.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}><item.icon className={`w-10 h-10 text-${item.color}-500`} /></div><h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3><p className="text-sm text-slate-500 font-bold">{item.desc}</p></button>))}</div></div>); }
  
  if (step === 'ALGO_SETUP_FORM') { return (<div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center pt-20"><NavBackBtn to="ALGO_SETUP_MED" /><div className="max-w-2xl w-full animate-in zoom-in"><h1 className="text-3xl font-black text-white text-center mb-8">{t('med_form_title')}</h1><div className="grid grid-cols-2 gap-4 mb-8"><button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}><Pill className="mx-auto mb-4" size={40} /><span className="block text-center font-bold text-lg">{t('form_tablet')}</span></button><button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}><FlaskConical className="mx-auto mb-4" size={40} /><span className="block text-center font-bold text-lg">{t('form_liquid')}</span></button></div>{medForm && (<div className="animate-in fade-in slide-in-from-bottom-4"><h2 className="text-xl font-bold text-white text-center mb-4">{t('unit_title')}</h2><div className="flex justify-center gap-4 mb-8">{(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (<button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-6 py-3 rounded-xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'}`}>{u}</button>))}</div></div>)}<Button variant="success" className="w-full py-5 text-xl" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>Next <ArrowRight /></Button></div></div>); }
  
  if (step === 'ALGO_SETUP_INV') { const formLabel = medForm === 'liquid' ? 'Bottles' : 'Boxes'; const unitLabel = medUnit || 'mg'; return (<div className="min-h-screen bg-[#020617] p-4 md:p-10 pt-20"><NavBackBtn to="ALGO_SETUP_FORM" /><div className="max-w-4xl mx-auto space-y-8 animate-in fade-in"><Card className="border-white/5 bg-slate-900"><h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Pill size={24} /></span>{t('inventory_title')}</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('boxes')} ({formLabel})</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} /></div><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('pills_per_box')}</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} /></div><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('loose_pills')}</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} /></div></div><div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center"><span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span><span className="text-5xl font-mono font-black text-emerald-400">{calculateTotalInventory(inventory)} <span className="text-sm text-emerald-600">{unitLabel}</span></span></div></Card><Card className="bg-slate-900 border-white/5"><h2 className="text-2xl font-bold text-white mb-8">{t('current_habit')} ({unitLabel})</h2><div className="flex flex-wrap gap-4">{[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (<button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-16 w-24 rounded-2xl font-mono font-bold border transition-all ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800'}`}>{dose}</button>))}<input type="number" placeholder="..." className="h-16 w-32 bg-slate-950 rounded-2xl border border-white/10 px-4 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all" onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} /></div></Card><Button className="w-full text-2xl py-8 rounded-3xl shadow-2xl shadow-indigo-900/20" variant="success" disabled={currentDoseHabit === 0 || calculateTotalInventory(inventory) === 0} onClick={generatePreview}>{t('analyze_plan')}</Button></div></div>); }
  
  // شاشة المعاينة النهائية
  if (step === 'ALGO_PREVIEW') { 
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
            {/* Scientific Modal Component */}
            <ScientificPlanModal 
                isOpen={showSciModal} 
                onClose={() => setShowSciModal(false)}
                onConfirm={() => setShowSciModal(false)} 
            />

            <NavBackBtn to="ALGO_SETUP_INV" />
            <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in">
                <h1 className="text-4xl font-black text-white">تم إنشاء الخطة بنجاح!</h1>
                <p className="text-slate-400">المدة المتوقعة: <span className="text-white font-bold">{previewPlan.length}</span> يوم</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900 text-center border-white/5">
                        <div className="text-xs text-slate-500 uppercase mb-2">{t('duration_days')}</div>
                        <div className="text-3xl font-bold text-white">{previewPlan.length}</div>
                    </Card>
                    <Card className="bg-slate-900 text-center border-white/5">
                        <div className="text-xs text-slate-500 uppercase mb-2">تغطية المخزون</div>
                        <div className="text-3xl font-bold text-emerald-400">100%</div>
                    </Card>
                </div>

                <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/20 text-indigo-300 text-sm">
                    سيتم الآن نقلك إلى لوحة التحكم للبدء في تنفيذ الخطة وتسجيل جرعاتك اليومية.
                </div>

                <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl shadow-emerald-500/20" disabled={loading}>
                    {loading ? 'جاري الإعداد...' : t('confirm_log')}
                </Button>
            </div>
        </div>
      ); 
  }

  return null;
};