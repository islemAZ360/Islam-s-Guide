import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Ban, Trash2, User, Shield, Stethoscope, Mail, CheckCircle, Smartphone, Calendar, Eye, X, Activity, Ruler, Weight, Send, MessageSquare, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button'; 
import { Card } from '../../components/ui/Card';     

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t, language, dir } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Message State
    const [showMsgForm, setShowMsgForm] = useState(false);
    const [msgSubject, setMsgSubject] = useState("");
    const [msgContent, setMsgContent] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Focus management for accessibility
    useEffect(() => {
        if (selectedUser) {
            setTimeout(() => modalRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowMsgForm(false);
            setMsgSubject("");
            setMsgContent("");
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedUser]);

    // Performance: Memoize filtering
    const filteredUsers = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return users.filter(u => 
            (u.role === 'normal_user' || u.role === 'patient') &&
            (u.name.toLowerCase().includes(lowerTerm) || u.email.toLowerCase().includes(lowerTerm))
        );
    }, [users, searchTerm]);

    const handleCloseModal = () => setSelectedUser(null);

    const handleSendMessage = async () => {
        if (!selectedUser?.uid || !msgSubject.trim() || !msgContent.trim()) return;
        
        setIsSending(true);
        try {
            const adminUser = auth.currentUser;
            await addDoc(collection(db, "tickets"), {
                userId: selectedUser.uid,
                userEmail: selectedUser.email,
                subject: `[Admin] ${msgSubject}`,
                status: 'open',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                messages: [{
                    senderId: adminUser?.uid || 'admin',
                    senderName: 'Administrator',
                    text: msgContent,
                    timestamp: Date.now(),
                    isAdmin: true
                }]
            });
            alert(language === 'ar' ? "تم إرسال الرسالة بنجاح" : "Message sent successfully");
            setShowMsgForm(false);
            setMsgSubject("");
            setMsgContent("");
        } catch (e) {
            console.error("Failed to send message", e);
            alert("Error sending message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section aria-labelledby="users-section-title" className="space-y-8 animate-in fade-in">
            <h2 id="users-section-title" className="sr-only">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                        <Search size={20} aria-hidden="true" />
                    </div>
                    <label htmlFor="user-search" className="sr-only">{t('search_user_placeholder')}</label>
                    <input 
                        id="user-search"
                        className="w-full bg-transparent border-none text-white px-4 py-2 outline-none placeholder-slate-500 font-medium"
                        placeholder={t('search_user_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="px-4 text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block" aria-live="polite">
                        {filteredUsers.length} {language === 'ar' ? 'مستخدم' : 'Users'}
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 bg-slate-900/20" role="status">
                    <User size={48} className="mx-auto mb-4 opacity-20" aria-hidden="true"/>
                    <p>{language === 'ar' ? `لا توجد نتائج بحث مطابقة لـ "${searchTerm}"` : `No users found matching "${searchTerm}"`}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                    {filteredUsers.map(user => (
                        <li key={user.uid} className="group relative bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden shadow-lg list-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-950">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-inner transition-transform group-hover:scale-105 ${user.isBanned ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-white/5'}`}
                                        aria-hidden="true"
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            {user.name}
                                            {user.isBanned && <Badge color="red" className="!py-0 !px-1.5 text-[9px]">BANNED</Badge>}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color={user.role === 'patient' ? 'indigo' : 'blue'} className="bg-slate-950/50 border-white/5 shadow-none">
                                                {user.role === 'patient' ? 'Patient' : 'User'}
                                            </Badge>
                                            {user.planType && (
                                                <span className="text-[10px] text-slate-500 bg-slate-950/30 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                                                    {user.planType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <Mail size={14} className="text-slate-500" aria-hidden="true"/> 
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.patientData?.assignedDoctorName ? (
                                    <div className="flex items-center gap-3 text-sm text-indigo-300 bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/10">
                                        <Stethoscope size={14} aria-hidden="true"/> 
                                        <span>Dr. {user.patientData.assignedDoctorName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-white/5 border-dashed">
                                        <Shield size={14} aria-hidden="true"/> 
                                        <span>{language === 'ar' ? 'لا يوجد طبيب مشرف' : 'No Doctor Assigned'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[10px] text-slate-600 px-1 font-mono">
                                    <span className="flex items-center gap-1"><Smartphone size={10}/> ID: {user.uid?.slice(0,6)}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10}/> {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 relative z-10 pt-2 border-t border-white/5">
                                <button 
                                    onClick={() => setSelectedUser(user)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    aria-label={language === 'ar' ? 'عرض الملف' : 'View Profile'}
                                >
                                    <Eye size={14} aria-hidden="true" />
                                    {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                                </button>

                                <button 
                                    onClick={() => toggleBan(user)} 
                                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                                        user.isBanned 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white focus-visible:ring-emerald-500' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white focus-visible:ring-amber-500'
                                    }`}
                                    title={user.isBanned ? t('unban_user') : t('ban_user')}
                                    aria-label={user.isBanned ? t('unban_user') : t('ban_user')}
                                >
                                    {user.isBanned ? <CheckCircle size={16} aria-hidden="true"/> : <Ban size={16} aria-hidden="true"/>}
                                </button>
                                
                                <button 
                                    onClick={() => user.uid && deleteUser(user.uid)} 
                                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-rose-500"
                                    title={t('delete_user')}
                                    aria-label={`${t('delete_user')} ${user.name}`}
                                >
                                    <Trash2 size={16} aria-hidden="true"/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* USER DETAILS MODAL */}
            {selectedUser && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="user-modal-title"
                >
                    <div 
                        ref={modalRef}
                        tabIndex={-1}
                        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden outline-none flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                        <button 
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t('close')}
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pt-10 relative z-10 overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-slate-950 shadow-xl">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 id="user-modal-title" className="text-2xl font-black text-white">{selectedUser.name}</h2>
                                <p className="text-slate-500 font-mono text-xs mt-1">{selectedUser.email}</p>
                                {selectedUser.isBanned && (
                                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                                        ACCOUNT BANNED
                                    </span>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Activity size={18} className="mx-auto mb-2 text-indigo-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Progress</span>
                                    <span className="block text-lg font-black text-white">{Math.round(selectedUser.progress || 0)}%</span>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Weight size={18} className="mx-auto mb-2 text-emerald-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Weight</span>
                                    <span className="block text-lg font-black text-white">{selectedUser.weight || '-'} <span className="text-xs text-slate-600">kg</span></span>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Ruler size={18} className="mx-auto mb-2 text-amber-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Age</span>
                                    <span className="block text-lg font-black text-white">{selectedUser.age || '-'}</span>
                                </div>
                            </div>

                            {/* Actions / Message Toggle */}
                            <div className="mb-6">
                                {!showMsgForm ? (
                                    <Button 
                                        onClick={() => setShowMsgForm(true)} 
                                        variant="secondary" 
                                        className="w-full !py-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white"
                                    >
                                        <MessageSquare size={18} className="mr-2" /> {language === 'ar' ? 'إرسال رسالة خاصة' : 'Send Direct Message'}
                                    </Button>
                                ) : (
                                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/30 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><Send size={14} className="text-indigo-400"/> New Message</h4>
                                            <button onClick={() => setShowMsgForm(false)} className="text-slate-500 hover:text-white text-xs">Cancel</button>
                                        </div>
                                        <input 
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:border-indigo-500 outline-none"
                                            placeholder="Subject"
                                            value={msgSubject}
                                            onChange={(e) => setMsgSubject(e.target.value)}
                                        />
                                        <textarea 
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                                            placeholder="Message content..."
                                            value={msgContent}
                                            onChange={(e) => setMsgContent(e.target.value)}
                                        />
                                        <Button 
                                            onClick={handleSendMessage} 
                                            variant="primary" 
                                            className="w-full !py-2" 
                                            disabled={!msgSubject.trim() || !msgContent.trim() || isSending}
                                        >
                                            {isSending ? <Loader2 className="animate-spin" size={18} /> : "Send Ticket"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Medical Info */}
                            <div className="space-y-4 bg-slate-950/30 p-5 rounded-3xl border border-white/5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Activity size={14} /> Clinical Profile
                                </h3>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Medication</span>
                                    <span className="text-white font-bold">{selectedUser.medType || 'Not Set'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Form</span>
                                    <span className="text-white font-bold">{selectedUser.medForm || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Plan Type</span>
                                    <span className="text-indigo-400 font-bold uppercase">{selectedUser.planType || 'None'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Last Active</span>
                                    <span className="text-white font-mono">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                            <Button onClick={handleCloseModal} variant="secondary" className="w-full rounded-xl">
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};