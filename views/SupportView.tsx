import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { 
    LifeBuoy, Send, CheckCircle, Lock, User, 
    ChevronRight, Loader2, Mail, MessageSquareWarning, Plus, X, Inbox, Trash2, ShieldAlert
} from 'lucide-react';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface SupportViewProps {
    user: UserProfile;
}

export const SupportView = ({ user }: SupportViewProps) => {
    const { t, language, dir } = useLanguage();
    const isAdmin = user.role === 'admin' || user.email === 'admin@islamguide.com';
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch Data --
    useEffect(() => {
        if (!user.uid) return;
        
        let q;
        if (isAdmin) {
            // Admin sees ALL tickets
            q = query(collection(db, "tickets"), orderBy("lastUpdate", "desc"));
        } else {
            // User sees OWN tickets
            q = query(collection(db, "tickets"), where("userId", "==", user.uid), orderBy("lastUpdate", "desc"));
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            // Sync active ticket if open
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, isAdmin, activeTicket?.id]);

    // Auto-scroll
    useEffect(() => {
        if (activeTicket) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [activeTicket?.messages]);

    // -- 2. Actions --
    
    const sendComplaint = async () => {
        if (!user.uid) return;
        if (!newSubject.trim() || !newMessage.trim()) return;
        
        setIsSubmitting(true);
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage.trim().slice(0, 1000),
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            await addDoc(collection(db, "tickets"), {
                userId: user.uid,
                userEmail: user.email,
                subject: newSubject.trim().slice(0, 100),
                status: 'open',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                messages: [initialMsg]
            });
            setShowCreateModal(false);
            setNewSubject("");
            setNewMessage("");
            alert(language === 'ar' ? "تم إرسال الشكوى بنجاح." : "Complaint sent successfully.");
        } catch (e) {
            console.error("Error creating ticket:", e);
            alert("Failed to send complaint.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendReply = async () => {
        if (!user.uid) return;
        if (!newMessage.trim() || !activeTicket || !activeTicket.id) return;

        setIsSubmitting(true);
        const newMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage.trim().slice(0, 1000),
            timestamp: Date.now(),
            isAdmin: isAdmin
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            const currentMessages = activeTicket.messages || [];
            
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                status: 'open' 
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleResolve = async () => {
        if (!activeTicket || !activeTicket.id) return;
        const newStatus = activeTicket.status === 'resolved' ? 'open' : 'resolved';
        try {
            await updateDoc(doc(db, "tickets", activeTicket.id), { status: newStatus });
        } catch(e) { console.error(e); }
    };

    // --- NEW: Delete Ticket (Admin) ---
    const handleDeleteTicket = async (ticketId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the ticket
        if (!window.confirm(language === 'ar' ? "حذف هذه التذكرة نهائياً؟" : "Delete this ticket permanently?")) return;
        
        try {
            await deleteDoc(doc(db, "tickets", ticketId));
            if (activeTicket?.id === ticketId) setActiveTicket(null);
        } catch (e) {
            console.error("Error deleting ticket:", e);
            alert("Failed to delete ticket.");
        }
    };

    // --- NEW: Delete User (Admin) ---
    const handleDeleteSender = async () => {
        if (!activeTicket || !activeTicket.userId) return;
        const confirmMsg = language === 'ar' 
            ? "تحذير: هل أنت متأكد من حذف حساب هذا المستخدم نهائياً؟ سيتم مسح جميع بياناته." 
            : "Warning: Permanently delete this user account? All data will be wiped.";
            
        if (window.confirm(confirmMsg)) {
            try {
                // Delete the user document
                await deleteDoc(doc(db, "users", activeTicket.userId));
                // Optionally delete the ticket too or mark it
                alert(language === 'ar' ? "تم حذف المستخدم." : "User deleted.");
                setActiveTicket(null);
            } catch (e) {
                console.error("Error deleting user:", e);
                alert("Failed to delete user.");
            }
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return language === 'ar' ? 'مفتوح' : 'Open';
            case 'pending': return language === 'ar' ? 'قيد المراجعة' : 'Pending';
            case 'resolved': return language === 'ar' ? 'تم الحل' : 'Resolved';
            case 'closed': return language === 'ar' ? 'مغلق' : 'Closed';
            default: return status;
        }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title={isAdmin ? (language === 'ar' ? 'صندوق الشكاوى' : 'Complaints Inbox') : (language === 'ar' ? 'تقديم شكوى' : 'Contact Support')} 
                subtitle={isAdmin ? (language === 'ar' ? 'متابعة مشاكل المستخدمين' : 'Manage user complaints') : (language === 'ar' ? 'أرسل شكواك مباشرة للإدارة' : 'Send complaints directly to admin')}
                action={
                    !isAdmin ? (
                        <Button onClick={() => setShowCreateModal(true)} variant="danger" className="!rounded-xl shadow-rose-500/20" aria-label="New Complaint">
                            <MessageSquareWarning size={18} aria-hidden="true" /> {language === 'ar' ? 'شكوى جديدة' : 'New Complaint'}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400">
                            <Inbox size={16} />
                            {language === 'ar' ? 'وضع الاستقبال' : 'Inbox Mode'}
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                
                {/* LEFT COLUMN: LIST */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900/80 border-white/10 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                        <h3 className="font-bold text-white text-lg">
                            {language === 'ar' ? 'الرسائل الواردة' : 'Inbox'}
                        </h3>
                        <Badge color={isAdmin ? 'rose' : 'indigo'}>{tickets.length}</Badge>
                    </div>
                    
                    <ul className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2" role="list">
                        {tickets.length === 0 && (
                            <li className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl m-2 flex flex-col items-center">
                                <LifeBuoy className="mb-3 opacity-30" size={32} aria-hidden="true"/>
                                {language === 'ar' ? 'لا توجد رسائل.' : 'No messages found.'}
                            </li>
                        )}
                        {tickets.map(ticket => (
                            <li key={ticket.id} className="relative group">
                                <button 
                                    onClick={() => setActiveTicket(ticket)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        activeTicket?.id === ticket.id 
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                                        : 'bg-slate-950/30 border-transparent hover:bg-slate-800 hover:border-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="max-w-[70%]">
                                            {isAdmin && (
                                                <p className="text-[10px] text-indigo-400 font-mono mb-1 truncate flex items-center gap-1">
                                                    <User size={10} /> {ticket.userEmail || 'User'}
                                                </p>
                                            )}
                                            <h4 className={`font-bold text-sm truncate ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                {ticket.subject}
                                            </h4>
                                        </div>
                                        <Badge color={ticket.status === 'resolved' ? 'green' : 'rose'} className="!text-[9px] !px-2 !py-0.5">
                                            {getStatusLabel(ticket.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end text-[10px] text-slate-500">
                                        <span className="font-mono">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${activeTicket?.id === ticket.id ? 'text-indigo-400 translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} aria-hidden="true"/>
                                    </div>
                                </button>
                                
                                {/* ADMIN DELETE TICKET BUTTON */}
                                {isAdmin && ticket.id && (
                                    <button 
                                        onClick={(e) => handleDeleteTicket(ticket.id!, e)}
                                        className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                        title={language === 'ar' ? 'حذف التذكرة' : 'Delete Ticket'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* RIGHT COLUMN: CHAT */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900/60 border-white/10 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 opacity-50 shadow-inner border border-white/5">
                                <LifeBuoy size={48} aria-hidden="true"/>
                            </div>
                            <p className="text-lg font-medium">{language === 'ar' ? 'اختر رسالة لعرض التفاصيل' : 'Select a message to view details'}</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
                                <div className="flex-1 mr-4 overflow-hidden">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTicket(null)} 
                                        className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs hover:text-white transition-colors"
                                    >
                                        <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : 'rotate-0'}/> {t('close')}
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg truncate">
                                        <div className="p-1.5 bg-rose-500/10 rounded-lg shrink-0"><Lock size={16} className="text-rose-500" aria-hidden="true"/></div>
                                        {activeTicket.subject}
                                    </h3>
                                    {isAdmin && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-400">{activeTicket.userEmail}</p>
                                            <span className="text-slate-600">|</span>
                                            {/* DELETE USER BUTTON */}
                                            <button 
                                                onClick={handleDeleteSender}
                                                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                                            >
                                                <ShieldAlert size={10} /> {language === 'ar' ? 'حذف المرسل نهائياً' : 'Delete User Account'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <button onClick={toggleResolve} className={`px-3 py-1 border rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${activeTicket.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}>
                                        {activeTicket.status === 'resolved' ? <CheckCircle size={14}/> : null}
                                        {activeTicket.status === 'resolved' ? (language === 'ar' ? 'تم الحل' : 'Resolved') : (language === 'ar' ? 'تحديد كمحلول' : 'Mark Resolved')}
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div 
                                className="flex-1 overflow-y-auto p-6 pt-28 space-y-6 custom-scrollbar bg-slate-900/30"
                                role="log"
                                aria-live="polite"
                            >
                                {activeTicket.messages?.map((msg, idx) => {
                                    // Logic: "Me" is always on the right side.
                                    const isMe = (isAdmin && msg.isAdmin) || (!isAdmin && !msg.isAdmin);
                                    
                                    const senderLabel = msg.isAdmin 
                                        ? (isAdmin ? (language === 'ar' ? 'أنا (إدارة)' : 'Me (Admin)') : (language === 'ar' ? 'الدعم الفني' : 'Support Team'))
                                        : (isAdmin ? (language === 'ar' ? 'المستخدم' : 'User') : (language === 'ar' ? 'أنا' : 'Me'));

                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                                isMe 
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20' 
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-2 px-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                {senderLabel} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
                                <div className="flex gap-3">
                                    <input 
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:bg-slate-900 outline-none transition-all placeholder-slate-600 shadow-inner disabled:opacity-50"
                                        placeholder={language === 'ar' ? 'اكتب ردك هنا...' : 'Write your reply...'}
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !isSubmitting && sendReply()}
                                        disabled={isSubmitting || activeTicket.status === 'resolved'}
                                    />
                                    <button 
                                        onClick={sendReply} 
                                        disabled={!newMessage.trim() || isSubmitting || activeTicket.status === 'resolved'}
                                        className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Complaint Modal (User Only) */}
            {showCreateModal && !isAdmin && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in" role="dialog" aria-modal="true">
                    <Card className="w-full max-w-md bg-slate-900 border-rose-500/20 relative shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <div className="p-2">
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <MessageSquareWarning className="text-rose-500" size={28}/>
                                {language === 'ar' ? 'رفع شكوى للإدارة' : 'Submit Complaint'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{language === 'ar' ? 'عنوان الشكوى' : 'Subject'}</label>
                                    <input 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none"
                                        value={newSubject}
                                        onChange={e => setNewSubject(e.target.value)}
                                        placeholder={language === 'ar' ? 'اختصار المشكلة...' : 'Brief summary...'}
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{language === 'ar' ? 'التفاصيل' : 'Details'}</label>
                                    <textarea 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder={language === 'ar' ? 'اشرح المشكلة بالتفصيل...' : 'Explain the issue...'}
                                        maxLength={1000}
                                    />
                                </div>
                                <Button onClick={sendComplaint} variant="danger" className="w-full py-4 text-lg shadow-lg shadow-rose-900/20" disabled={!newSubject || !newMessage || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin"/> : (language === 'ar' ? 'إرسال الشكوى' : 'Send Complaint')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};