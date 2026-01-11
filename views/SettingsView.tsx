import React, { useState, useEffect } from 'react';
import { 
    Activity, ShieldCheck, Zap, AlertTriangle, Save, Camera, MapPin, Phone, 
    User, Award, Clock, Package, Pill, RefreshCw
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Inventory } from '../types';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext'; // استيراد Context للوصول للمخزون

interface SettingsViewProps {
    userProfile: UserProfile;
    resetAllData: () => void;
    updateSpeedSettings: (speed: number) => void;
}

export const SettingsView = ({ userProfile, resetAllData, updateSpeedSettings }: SettingsViewProps) => {
    const { t, language } = useLanguage();
    const { inventory, setInventory } = useData(); // جلب المخزون من البيانات العامة
    const [loading, setLoading] = useState(false);

    // -- Doctor Form State --
    const [formData, setFormData] = useState({
        photoUrl: '',
        bio: '',
        phoneNumber: '',
        clinicLocation: '',
        name: ''
    });

    // -- Inventory Edit State (للمستخدم العادي) --
    const [localInventory, setLocalInventory] = useState<Inventory>({
        boxes: 0, 
        pillsPerBox: 0, 
        loosePills: 0, 
        totalPills: 0
    });

    // Load initial data
    useEffect(() => {
        // Doctor Data
        if (userProfile.role === 'doctor' && userProfile.doctorData) {
            setFormData({
                photoUrl: userProfile.doctorData.photoUrl || '',
                bio: userProfile.doctorData.bio || '',
                phoneNumber: userProfile.doctorData.phoneNumber || '',
                clinicLocation: userProfile.doctorData.clinicLocation || '',
                name: userProfile.name || ''
            });
        }
        
        // User Inventory Data
        if (inventory) {
            setLocalInventory(inventory);
        }
    }, [userProfile, inventory]);

    // -- Save Profile Changes (Doctor) --
    const handleSaveProfile = async () => {
        if (!userProfile.uid) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                name: formData.name,
                "doctorData.photoUrl": formData.photoUrl,
                "doctorData.bio": formData.bio,
                "doctorData.phoneNumber": formData.phoneNumber,
                "doctorData.clinicLocation": formData.clinicLocation
            });
            alert("Profile updated successfully!");
        } catch (e) {
            console.error("Error updating profile:", e);
            alert("Failed to update profile.");
        }
        setLoading(false);
    };

    // -- Update Inventory (User) --
    const handleUpdateInventory = () => {
        // حساب المجموع الكلي الجديد
        const newTotal = (localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills;
        const updatedInv = { ...localInventory, totalPills: newTotal };
        
        // تحديث الحالة العامة (سيقوم DataContext بحفظها في Firebase تلقائياً)
        setInventory(updatedInv);
        
        alert(language === 'ar' ? 'تم تحديث المخزون وإعادة حساب الرصيد.' : 'Inventory updated successfully.');
    };

    // --- DOCTOR PROFILE VIEW ---
    if (userProfile.role === 'doctor') {
        const level = userProfile.doctorData?.doctorLevel || 1;
        const recovered = userProfile.doctorData?.recoveredCount || 0;
        const active = userProfile.doctorData?.activePatients || 0;

        return (
            <LayoutContainer>
                <PageHeader title={t('profile_title')} subtitle={t('nav_settings')} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: ID Card & Stats */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900 border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                            
                            <div className="relative z-10">
                                <div className="w-32 h-32 mx-auto bg-slate-950 rounded-full border-4 border-slate-800 flex items-center justify-center mb-4 overflow-hidden shadow-2xl relative group-hover:border-indigo-500/50 transition-colors">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-600" />
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-black text-white mb-1">{formData.name}</h2>
                                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4">
                                    {userProfile.doctorData?.specialty}
                                </p>
                                
                                <div className="flex justify-center gap-2 mb-6">
                                    <Badge color="amber">LVL {level}</Badge>
                                    <Badge color={userProfile.doctorData?.accountStatus === 'approved' ? 'green' : 'red'}>
                                        {userProfile.doctorData?.accountStatus.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                    <div>
                                        <span className="block text-2xl font-black text-white">{active}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Active Patients</span>
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-black text-emerald-400">{recovered}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Recovered</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                                <Award size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-500 text-lg">{t('rank_label')}</h3>
                                <p className="text-xs text-amber-200/60">Top 10% of Doctors</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-900 border-white/5 h-full">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="text-indigo-400" /> {t('edit_profile')}
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_fullname')}</label>
                                    <input 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('photo_url_label')}</label>
                                    <div className="relative">
                                        <Camera className="absolute top-3 right-3 text-slate-600" size={18} />
                                        <input 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                            placeholder="https://example.com/photo.jpg"
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_phone')}</label>
                                        <div className="relative">
                                            <Phone className="absolute top-3 right-3 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                                value={formData.phoneNumber}
                                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_location')}</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-3 right-3 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                                value={formData.clinicLocation}
                                                onChange={e => setFormData({...formData, clinicLocation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_bio')}</label>
                                    <textarea 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none"
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <Button onClick={handleSaveProfile} variant="primary" disabled={loading}>
                                        <Save size={18} className="mr-2" /> {loading ? 'Saving...' : t('save_changes')}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </LayoutContainer>
        );
    }

    // --- PATIENT / USER SETTINGS VIEW ---
    return (
        <LayoutContainer>
            <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
            
            {/* Algorithm Pace Settings */}
            <Card className="bg-slate-900 border-white/5 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-indigo-400" /> {t('pace_control')}
                </h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl">{t('pace_desc')}</p>
                
                {userProfile?.role === 'patient' || userProfile?.planType === 'manual' ? (
                        <div className="p-8 bg-slate-950 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 text-center flex flex-col items-center gap-4">
                            <ShieldCheck size={40} className="text-slate-700" />
                            <p>هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي للسرعة غير متاح.</p>
                        </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button 
                            onClick={() => updateSpeedSettings(0.8)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <Clock size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_slow')}</span>
                            <span className="text-[10px] opacity-70">تمديد المدة للراحة</span>
                        </button>
                        
                        <button 
                            onClick={() => updateSpeedSettings(1.0)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier >= 0.9 && userProfile.speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <ShieldCheck size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_balanced')}</span>
                            <span className="text-[10px] opacity-70">الوضع القياسي</span>
                        </button>
                        
                        <button 
                            onClick={() => updateSpeedSettings(1.2)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <Zap size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_fast')}</span>
                            <span className="text-[10px] opacity-70">تقليص المدة (مكثف)</span>
                        </button>
                    </div>
                )}
            </Card>

            {/* Inventory Management Section (New) */}
            {userProfile?.role === 'normal_user' && (
                <Card className="bg-slate-900 border-white/5 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Package className="text-blue-400" /> {t('inventory_title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('boxes')}</label>
                            <div className="flex items-center gap-3">
                                <Package className="text-slate-600" size={20} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.boxes}
                                    onChange={(e) => setLocalInventory({...localInventory, boxes: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('pills_per_box')}</label>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-bold">x</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.pillsPerBox}
                                    onChange={(e) => setLocalInventory({...localInventory, pillsPerBox: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('loose_pills')}</label>
                            <div className="flex items-center gap-3">
                                <Pill className="text-slate-600" size={20} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.loosePills}
                                    onChange={(e) => setLocalInventory({...localInventory, loosePills: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                        <div className="text-sm">
                            <span className="text-slate-500">{t('total_balance')}: </span>
                            <span className="text-white font-bold font-mono text-lg">
                                {(localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills} {userProfile.medUnit || 'mg'}
                            </span>
                        </div>
                        <Button onClick={handleUpdateInventory} variant="secondary" className="!py-2 !px-4">
                            <RefreshCw size={16} className="mr-2"/> {t('save_changes')}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Account Actions */}
            <Card className="border-rose-500/10 bg-rose-900/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-rose-500"/> {t('danger_zone')}</h2>
                <Button variant="danger" onClick={resetAllData}>{t('factory_reset_btn')}</Button>
            </Card>
        </LayoutContainer>
    );
};