import React, { useState } from 'react';
import { Search, Ban, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    // تصفية المستخدمين (نستبعد الأطباء والأدمن)
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* شريط البحث */}
            <div className="flex bg-slate-900 p-4 rounded-2xl border border-white/5 mb-4">
                <Search className="text-slate-500 ml-4" size={20} />
                <input 
                    className="bg-transparent w-full text-white outline-none"
                    placeholder={t('search_user_placeholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* شبكة المستخدمين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normalUsers
                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(user => (
                    <div key={user.uid} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {user.name} 
                                    {user.isBanned && <Ban size={12} className="text-rose-500"/>}
                                </h4>
                                <div className="flex gap-2 mt-1">
                                    <Badge color="blue" className="!text-[9px] !px-1.5 !py-0.5">{user.role === 'patient' ? t('role_patient') : 'User'}</Badge>
                                    {user.patientData?.assignedDoctorName && (
                                        <span className="text-[9px] text-slate-500 flex items-center">Dr: {user.patientData.assignedDoctorName}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleBan(user)} className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" title={user.isBanned ? t('unban_user') : t('ban_user')}>
                                <Ban size={16} />
                            </button>
                            <button onClick={() => user.uid && deleteUser(user.uid)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" title={t('delete_user')}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};