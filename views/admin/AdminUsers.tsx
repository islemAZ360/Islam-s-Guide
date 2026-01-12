import React, { useState } from 'react';
import { Search, Ban, Trash2, User, Shield, Stethoscope, Mail, CheckCircle, XCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button'; // استخدام الزر الموحد
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    // تصفية المستخدمين (نستبعد الأطباء والأدمن لعرض المستخدمين العاديين فقط)
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');

    // فلترة البحث
    const filteredUsers = normalUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* شريط البحث المتطور */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                        <Search size={20} />
                    </div>
                    <input 
                        className="w-full bg-transparent border-none text-white px-4 py-2 outline-none placeholder-slate-500 font-medium"
                        placeholder={t('search_user_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="px-4 text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block">
                        {filteredUsers.length} Users Found
                    </div>
                </div>
            </div>

            {/* شبكة المستخدمين */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                    <User size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>No users found matching "{searchTerm}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUsers.map(user => (
                        <div key={user.uid} className="group relative bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden shadow-lg">
                            {/* زخرفة خلفية */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-inner transition-transform group-hover:scale-105 ${user.isBanned ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-white/5'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                            {user.name}
                                            {user.isBanned && <Badge color="red" className="!py-0 !px-1.5 text-[9px]">BANNED</Badge>}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color={user.role === 'patient' ? 'indigo' : 'blue'} className="bg-slate-950/50 border-white/5 shadow-none">
                                                {user.role === 'patient' ? 'Patient' : 'User'}
                                            </Badge>
                                            {user.planType && (
                                                <span className="text-[10px] text-slate-500 bg-slate-950/30 px-2 py-0.5 rounded border border-white/5">
                                                    {user.planType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <Mail size={14} className="text-slate-500"/> 
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.patientData?.assignedDoctorName ? (
                                    <div className="flex items-center gap-3 text-sm text-indigo-300 bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/10">
                                        <Stethoscope size={14}/> 
                                        <span>Dr. {user.patientData.assignedDoctorName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-white/5 border-dashed">
                                        <Shield size={14}/> 
                                        <span>No Doctor Assigned</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 relative z-10 pt-2 border-t border-white/5">
                                <button 
                                    onClick={() => toggleBan(user)} 
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                        user.isBanned 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                    }`}
                                >
                                    {user.isBanned ? <CheckCircle size={14}/> : <Ban size={14}/>}
                                    {user.isBanned ? t('unban_user') : t('ban_user')}
                                </button>
                                
                                <button 
                                    onClick={() => user.uid && deleteUser(user.uid)} 
                                    className="flex-none p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                                    title={t('delete_user')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};