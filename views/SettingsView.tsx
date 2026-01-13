import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, ShieldCheck, Zap, AlertTriangle, Save, Camera, MapPin, Phone, 
    User, Clock, Package, Pill, RefreshCw, Trash2, Download, CheckCircle, XCircle, Upload, Ruler, Weight, Calendar
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Inventory } from '../types';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

interface SettingsViewProps {
    userProfile: UserProfile;
    resetAllData: () => void;
    updateSpeedSettings: (speed: number) => void;
}

export const SettingsView = ({ userProfile, resetAllData, updateSpeedSettings }: SettingsViewProps) => {
    const { t, language } = useLanguage();
    const { inventory, setInventory, plan, logs } = useData(); 
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Optimistic UI State for Speed
    const [localSpeed, setLocalSpeed] = useState(userProfile.speedModifier || 1.0);

    // Refs
    const jsonFileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // -- Doctor Form State --
    const [doctorFormData, setDoctorFormData] = useState({
        photoUrl: '',
        bio: '',
        phoneNumber: '',
        clinicLocation: '',
        name: ''
    });

    // -- User Form State --
    const [userFormData, setUserFormData] = useState({
        name: '',
        photoUrl: '',
        age: '',
        weight: '',
        height: ''
    });

    // -- Inventory Edit State --
    const [localInventory, setLocalInventory] = useState<Inventory>({
        boxes: 0, 
        pillsPerBox: 0, 
        loosePills: 0, 
        totalPills: 0
    });

    // Sync local speed
    useEffect(() => {
        if (userProfile.speedModifier) {
            setLocalSpeed(userProfile.speedModifier);
        }
    }, [userProfile.speedModifier]);

    // Load initial data for Doctor
    useEffect(() => {
        if (userProfile.role === 'doctor' && userProfile.doctorData) {
            setDoctorFormData({
                photoUrl: userProfile.doctorData.photoUrl || userProfile.photoUrl || '',
                bio: userProfile.doctorData.bio || '',
                phoneNumber: userProfile.doctorData.phoneNumber || '',
                clinicLocation: userProfile.doctorData.clinicLocation || '',
                name: userProfile.name || ''
            });
        }
    }, [userProfile]);

    // Load initial data for Normal User
    useEffect(() => {
        if (userProfile.role !== 'doctor') {
            setUserFormData({
                name: userProfile.name || '',
                photoUrl: userProfile.photoUrl || '',
                age: userProfile.age?.toString() || '',
                weight: userProfile.weight?.toString() || '',
                height: userProfile.height?.toString() || ''
            });
        }
    }, [userProfile]);

    // Sync Inventory
    useEffect(() => {
        if (inventory) {
            setLocalInventory(prev => {
                const isPrevEmpty = prev.boxes === 0 && prev.pillsPerBox === 0 && prev.loosePills === 0;
                if (isPrevEmpty) return inventory;
                return prev;
            });
        }
    }, [inventory]);

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const handleSpeedChange = (newSpeed: number) => {
        setLocalSpeed(newSpeed); 
        setTimeout(() => {
            updateSpeedSettings(newSpeed);
        }, 10);
    };

    // --- Image Upload Logic (Base64) ---
    const handleImageClick = () => {
        imageInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit size to 500KB to avoid Firestore document limits
        if (file.size > 500 * 1024) {
            alert(language === 'ar' ? "حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 500 كيلوبايت." : "Image too large. Please select an image under 500KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (userProfile.role === 'doctor') {
                setDoctorFormData(prev => ({ ...prev, photoUrl: base64String }));
            } else {
                setUserFormData(prev => ({ ...prev, photoUrl: base64String }));
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Save Handlers ---
    const handleSaveDoctorProfile = async () => {
        if (!userProfile.uid) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                name: doctorFormData.name,
                photoUrl: doctorFormData.photoUrl,
                "doctorData.photoUrl": doctorFormData.photoUrl,
                "doctorData.bio": doctorFormData.bio,
                "doctorData.phoneNumber": doctorFormData.phoneNumber,
                "doctorData.clinicLocation": doctorFormData.clinicLocation
            });
            showStatus('success', language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح.' : 'Profile updated successfully.');
        } catch (e) {
            console.error("Error updating profile:", e);
            showStatus('error', language === 'ar' ? 'فشل التحديث. يرجى المحاولة لاحقاً.' : 'Failed to update profile.');
        }
        setLoading(false);
    };

    const handleSaveUserProfile = async () => {
        if (!userProfile.uid) return;
        if (!userFormData.name.trim()) {
            showStatus('error', language === 'ar' ? 'الاسم مطلوب.' : 'Name is required.');
            return;
        }
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                name: userFormData.name,
                photoUrl: userFormData.photoUrl,
                age: parseInt(userFormData.age) || null,
                weight: parseFloat(userFormData.weight) || null,
                height: parseFloat(userFormData.height) || null
            });
            showStatus('success', language === 'ar' ? 'تم حفظ البيانات بنجاح.' : 'Data saved successfully.');
        } catch (e) {
            console.error("Error updating user profile:", e);
            showStatus('error', language === 'ar' ? 'فشل الحفظ.' : 'Save failed.');
        }
        setLoading(false);
    };

    const handleUpdateInventory = () => {
        const newTotal = (localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills;
        const updatedInv = { ...localInventory, totalPills: newTotal };
        setInventory(updatedInv);
        setLocalInventory(updatedInv);
        showStatus('success', language === 'ar' ? 'تم تحديث المخزون وإعادة حساب الرصيد.' : 'Inventory updated successfully.');
    };

    const handleExportData = () => {
        const dataToExport = {
            profile: { ...userProfile, uid: undefined },
            inventory: inventory,
            plan: plan,
            logs: logs,
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `islams_guide_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showStatus('success', language === 'ar' ? 'تم تحميل بياناتك بنجاح.' : 'Data exported successfully.');
    };

    const handleImportClick = () => {
        jsonFileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userProfile.uid) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (!json.inventory || !Array.isArray(json.plan) || !Array.isArray(json.logs)) {
                    throw new Error("Invalid file format");
                }
                if (!window.confirm(language === 'ar' ? 'تحذير: استيراد البيانات سيستبدل بياناتك الحالية. هل أنت متأكد؟' : 'Warning: Importing will overwrite current data. Continue?')) {
                    return;
                }
                setLoading(true);
                const dataToRestore = {
                    inventory: json.inventory,
                    plan: json.plan,
                    logs: json.logs,
                    speedModifier: json.profile?.speedModifier || 1.0,
                };
                await updateDoc(doc(db, "users", userProfile.uid!), dataToRestore);
                showStatus('success', language === 'ar' ? 'تم استعادة البيانات بنجاح.' : 'Data restored successfully.');
            } catch (err) {
                console.error("Import Error:", err);
                showStatus('error', language === 'ar' ? 'ملف غير صالح أو تالف.' : 'Invalid or corrupt backup file.');
            } finally {
                setLoading(false);
                if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteAccount = () => {
        const confirmMsg = language === 'ar' 
            ? "تحذير: هل أنت متأكد تماماً من رغبتك في حذف حسابك نهائياً؟ سيتم فقدان جميع البيانات ولا يمكن استرجاعها."
            : "Warning: Are you sure you want to permanently delete your account? All data will be lost and cannot be recovered.";
        if (window.confirm(confirmMsg)) {
            resetAllData();
        }
    };

    // Hidden inputs for file operations
    const hiddenInputs = (
        <>
            <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
            <input type="file" accept=".json" ref={jsonFileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        </>
    );

    return (
        <LayoutContainer>
            <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
            {hiddenInputs}

            {statusMsg && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 mb-6 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`} role="status">
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="font-bold">{statusMsg.text}</span>
                </div>
            )}

            {/* --- DOCTOR VIEW --- */}
            {userProfile.role === 'doctor' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* Clickable ID Card for Photo Upload */}
                        <Card className="text-center relative overflow-hidden group border-white/10 !bg-slate-900/80">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/30 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 pt-8">
                                <div 
                                    onClick={handleImageClick}
                                    className="w-32 h-32 mx-auto bg-slate-950 rounded-full border-4 border-slate-800/80 flex items-center justify-center mb-4 overflow-hidden shadow-2xl relative group-hover:border-indigo-500/50 transition-all cursor-pointer"
                                >
                                    {doctorFormData.photoUrl ? (
                                        <img src={doctorFormData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-1">{doctorFormData.name}</h2>
                                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6">{userProfile.doctorData?.specialty}</p>
                                <div className="flex justify-center gap-2 mb-8">
                                    <Badge color="amber">LVL {userProfile.doctorData?.doctorLevel || 1}</Badge>
                                    <Badge color={userProfile.doctorData?.accountStatus === 'approved' ? 'green' : 'red'}>{userProfile.doctorData?.accountStatus.toUpperCase()}</Badge>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card className="h-full border-white/10">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg"><User className="text-indigo-400" size={20} /></div> {t('edit_profile')}
                            </h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveDoctorProfile(); }} className="space-y-6">
                                <div className="group">
                                    <label htmlFor="docName" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_fullname')}</label>
                                    <input id="docName" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" value={doctorFormData.name} onChange={e => setDoctorFormData({...doctorFormData, name: e.target.value})} />
                                </div>
                                {/* Removed Photo URL Input */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_phone')}</label>
                                        <input id="phone" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" value={doctorFormData.phoneNumber} onChange={e => setDoctorFormData({...doctorFormData, phoneNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_location')}</label>
                                        <input id="location" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" value={doctorFormData.clinicLocation} onChange={e => setDoctorFormData({...doctorFormData, clinicLocation: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="bio" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_bio')}</label>
                                    <textarea id="bio" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-32 resize-none transition-all" value={doctorFormData.bio} onChange={e => setDoctorFormData({...doctorFormData, bio: e.target.value})} />
                                </div>
                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <Button type="submit" variant="primary" disabled={loading} className="w-full md:w-auto">
                                        <Save size={18} className="mr-2" /> {loading ? 'Saving...' : t('save_changes')}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- PATIENT / NORMAL USER VIEW --- */}
            {userProfile.role !== 'doctor' && (
                <>
                    <Card className="mb-8 border-white/10">
                        <section aria-labelledby="user-profile-settings">
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                {/* Clickable Avatar for Users */}
                                <div 
                                    onClick={handleImageClick}
                                    className="w-32 h-32 shrink-0 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-lg mx-auto md:mx-0 cursor-pointer group relative"
                                >
                                    {userFormData.photoUrl ? (
                                        <img src={userFormData.photoUrl} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); handleSaveUserProfile(); }} className="flex-1 w-full space-y-6">
                                    <h2 id="user-profile-settings" className="text-xl font-bold text-white flex items-center gap-2">
                                        <User className="text-indigo-400" /> {t('profile_title')}
                                    </h2>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} placeholder="Name" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{language === 'ar' ? 'العمر' : 'Age'}</label>
                                            <div className="relative">
                                                <Calendar className="absolute top-3.5 right-2 text-slate-600" size={14} />
                                                <input type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-center" value={userFormData.age} onChange={e => setUserFormData({...userFormData, age: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{language === 'ar' ? 'الوزن (kg)' : 'Weight (kg)'}</label>
                                            <div className="relative">
                                                <Weight className="absolute top-3.5 right-2 text-slate-600" size={14} />
                                                <input type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-center" value={userFormData.weight} onChange={e => setUserFormData({...userFormData, weight: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{language === 'ar' ? 'الطول (cm)' : 'Height (cm)'}</label>
                                            <div className="relative">
                                                <Ruler className="absolute top-3.5 right-2 text-slate-600" size={14} />
                                                <input type="number" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-center" value={userFormData.height} onChange={e => setUserFormData({...userFormData, height: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" variant="primary" disabled={loading} className="!py-3 !px-6">
                                            <Save size={18} className="mr-2" /> {loading ? '...' : t('save_changes')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </Card>

                    {/* Pace Control */}
                    <Card className="mb-8 border-white/10">
                        <section aria-labelledby="pace-settings">
                            <h2 id="pace-settings" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="text-indigo-400" /> {t('pace_control')}
                            </h2>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                {t('pace_desc')}
                            </p>
                            
                            {userProfile.role === 'patient' || userProfile.planType === 'manual' ? (
                                <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-700 text-slate-500 text-center flex flex-col items-center gap-4">
                                    <ShieldCheck size={40} className="text-slate-600" />
                                    <p className="max-w-md">هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي للسرعة غير متاح.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { speed: 0.8, label: t('pace_slow'), icon: Clock, desc: 'تمديد المدة للراحة', color: 'indigo' },
                                        { speed: 1.0, label: t('pace_balanced'), icon: ShieldCheck, desc: 'الوضع القياسي', color: 'emerald' },
                                        { speed: 1.2, label: t('pace_fast'), icon: Zap, desc: 'تقليص المدة (مكثف)', color: 'rose' },
                                    ].map((opt) => (
                                        <button 
                                            key={opt.speed}
                                            onClick={() => handleSpeedChange(opt.speed)} 
                                            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 focus:outline-none focus:ring-4 focus:ring-${opt.color}-500/30 ${
                                                localSpeed && Math.abs(localSpeed - opt.speed) < 0.1
                                                ? `bg-${opt.color}-600 border-${opt.color}-500 text-white shadow-xl shadow-${opt.color}-500/20` 
                                                : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-600'
                                            }`}
                                            aria-pressed={localSpeed === opt.speed}
                                        >
                                            <div className={`p-4 rounded-full transition-colors ${localSpeed === opt.speed ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                                <opt.icon size={28} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-bold text-lg">{opt.label}</span>
                                                <span className="text-[10px] opacity-70">{opt.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </Card>

                    {/* Inventory Management */}
                    <Card className="mb-8 border-white/10">
                        <section aria-labelledby="inventory-settings">
                            <h2 id="inventory-settings" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="text-blue-400" /> {t('inventory_title')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invBoxes" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('boxes')}</label>
                                    <div className="flex items-center gap-3">
                                        <Package className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                        <input id="invBoxes" type="number" className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700" value={localInventory.boxes} onChange={(e) => setLocalInventory({...localInventory, boxes: parseInt(e.target.value) || 0})} placeholder="0" min="0" />
                                    </div>
                                </div>
                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invPills" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('pills_per_box')}</label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-600 font-bold text-xl group-focus-within:text-indigo-500">x</span>
                                        <input id="invPills" type="number" className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700" value={localInventory.pillsPerBox} onChange={(e) => setLocalInventory({...localInventory, pillsPerBox: parseInt(e.target.value) || 0})} placeholder="0" min="0" />
                                    </div>
                                </div>
                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invLoose" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('loose_pills')}</label>
                                    <div className="flex items-center gap-3">
                                        <Pill className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                        <input id="invLoose" type="number" className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700" value={localInventory.loosePills} onChange={(e) => setLocalInventory({...localInventory, loosePills: parseInt(e.target.value) || 0})} placeholder="0" min="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6">
                                <div className="text-sm bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-slate-500">{t('total_balance')}: </span>
                                    <span className="text-emerald-400 font-bold font-mono text-xl ml-2">
                                        {(localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills} <span className="text-xs">{userProfile.medUnit || 'mg'}</span>
                                    </span>
                                </div>
                                <Button onClick={handleUpdateInventory} variant="primary" className="!py-3 !px-6 w-full md:w-auto">
                                    <RefreshCw size={18} className="mr-2"/> {t('save_changes')}
                                </Button>
                            </div>
                        </section>
                    </Card>
                </>
            )}

            {/* Privacy & Data Section */}
            <Card className="mb-8 border-white/10 bg-indigo-900/10">
                <section aria-labelledby="privacy-settings">
                    <h2 id="privacy-settings" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Download className="text-indigo-400" /> {language === 'ar' ? 'بياناتي' : 'My Data'}
                    </h2>
                    <p className="text-indigo-200/60 text-sm mb-6 max-w-xl">
                        {language === 'ar' ? 'يمكنك تحميل نسخة احتياطية (تصدير) أو استعادة بياناتك السابقة (استيراد).' : 'You can backup (Export) or restore previous data (Import).'}
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <Button onClick={handleExportData} variant="secondary" className="border-indigo-500/30 hover:bg-indigo-500/20">
                            <Download size={18} className="mr-2" /> {language === 'ar' ? 'تصدير' : 'Export Data'}
                        </Button>
                        <Button onClick={handleImportClick} variant="secondary" className="border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400">
                            <Upload size={18} className="mr-2" /> {language === 'ar' ? 'استيراد' : 'Import Data'}
                        </Button>
                    </div>
                </section>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-500/20 bg-rose-900/10 hover:bg-rose-900/20 transition-colors">
                <section aria-labelledby="danger-zone">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 id="danger-zone" className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="text-rose-500" /> {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
                            </h2>
                            <p className="text-rose-200/60 text-sm max-w-md">
                                {language === 'ar' ? 'هذا الإجراء سيقوم بحذف حسابك وجميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.' : 'This action permanently deletes your account and all data. This cannot be undone.'}
                            </p>
                        </div>
                        <Button variant="danger" onClick={handleDeleteAccount} className="w-full md:w-auto whitespace-nowrap !py-4 !px-8 shadow-lg shadow-rose-900/20 text-lg font-bold">
                            <Trash2 size={20} className="mr-2"/> {t('delete_user')}
                        </Button>
                    </div>
                </section>
            </Card>
        </LayoutContainer>
    );
};