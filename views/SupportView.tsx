import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { 
    LifeBuoy, Plus, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, 
    Stethoscope, ChevronRight, Loader2, AlertCircle, MessageSquare, Mail
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
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch User Tickets --
    useEffect(() => {
        if (!user.uid) return;
        
        let q;
        
        // IF ADMIN: Fetch ALL tickets
        if (user.role === 'admin') {
            q = query(
                collection(db, "tickets"), 
                orderBy("lastUpdate", "desc")
            );
        } 
        // IF USER: Fetch OWN tickets
        else {
            q = query(
                collection(db, "tickets"), 
                where("userId", "==", user.uid), 
                orderBy("lastUpdate", "desc")
            );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            // Real-time update for active ticket
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, user.role, activeTicket?.id]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (activeTicket) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [activeTicket?.messages, activeTicket]);

    // -- 2. Actions --
    
    const createTicket = async () => {
        if (!user.uid) return;
        if (!newSubject.trim() || !newMessage.trim()) return;
        
        setIsSubmitting(true);
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage.trim().slice(0, 1000), // Max length check
            timestamp: Date.now(),
            isAdmin: user.role === 'admin'
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
        } catch (e) {
            console.error("Error creating ticket:", e);
            alert("Failed to create ticket.");
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
            isAdmin: user.role === 'admin' // Dynamic check for admin role
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            const currentMessages = activeTicket.messages || [];
            
            // If admin replies, status might be 'pending' (waiting for user) or keep 'open'.
            // If user replies, status 'open'. 
            // For simplicity, we keep 'open' or set 'resolved' manually later.
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

    // Mark ticket as resolved/closed (Admin or User)
    const toggleResolve = async () => {
        if (!activeTicket || !activeTicket.id) return;
        const newStatus = activeTicket.status === 'resolved' ? 'open' : 'resolved';
        try {
            await updateDoc(doc(db, "tickets", activeTicket.id), { status: newStatus });
        } catch(e) { console.error(e); }
    };

    // Helper for translation keys
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return t('status_open') || 'Open';
            case 'pending': return t('status_pending') || 'Pending';
            case 'resolved': return t('status_resolved') || 'Resolved';
            case 'closed': return t('status_closed') || 'Closed';
            default: return status;
        }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title={user.role === 'admin' ? (language === 'ar' ? 'مركز دعم العملاء' : 'Support Center') : t('nav_support')} 
                subtitle={user.role === 'admin' ? (language === 'ar' ? 'إدارة التذاكر والردود' : 'Manage tickets and replies') : (t('support_desc') || "Contact the support team directly.")}
                action={
                    // Only show Create Ticket button if NOT admin, or keep it if admin wants to create internal tickets
                    <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20" aria-label={t('new_ticket')}>
                        <Plus size={18} aria-hidden="true" /> {t('new_ticket') || "New Ticket"}
                    </Button>
                }
            />

            {/* Context Banner - Semantic Header Info */}
            <section aria-label="User Context" className="mb-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/10 p-5 rounded-3xl flex items-center justify-between backdrop-blur-xl shadow-xl animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-900/20" aria-hidden="true">
                        {user.role === 'doctor' ? <Stethoscope size={24}/> : 
                         user.role === 'admin' ? <Lock size={24} /> :
                         user.medForm === 'liquid' ? <FlaskConical size={24} /> : 
                         user.medForm === 'tablet' ? <Pill size={24} /> : <User size={24}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('current_account') || "Current Account"}</p>
                        <p className="text-white font-bold text-lg flex items-center gap-2">
                            {user.name} 
                            <Badge color="blue" className="!py-0.5 !px-2 !text-[10px] shadow-none">{user.role.toUpperCase()}</Badge>
                        </p>
                    </div>
                </div>
                {user.role === 'normal_user' && user.planType === 'algorithm' && (
                    <Badge color="indigo" className="hidden md:flex">Smart Algorithm</Badge>
                )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900/80 border-white/10 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                        <h3 className="font-bold text-white text-lg">
                            {user.role === 'admin' ? (language === 'ar' ? 'صندوق التذاكر' : 'Ticket Inbox') : (t('my_tickets') || "My Tickets")}
                        </h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <ul className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2" role="list">
                        {tickets.length === 0 && (
                            <li className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl m-2 flex flex-col items-center">
                                <LifeBuoy className="mb-3 opacity-30" size={32} aria-hidden="true"/>
                                {t('no_tickets') || "No tickets found."}
                            </li>
                        )}
                        {tickets.map(ticket => (
                            <li key={ticket.id}>
                                <button 
                                    onClick={() => setActiveTicket(ticket)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        activeTicket?.id === ticket.id 
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                                        : 'bg-slate-950/30 border-transparent hover:bg-slate-800 hover:border-white/5'
                                    }`}
                                    aria-current={activeTicket?.id === ticket.id ? 'true' : undefined}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="max-w-[70%]">
                                            {/* Show user email if Admin */}
                                            {user.role === 'admin' && (
                                                <p className="text-[10px] text-indigo-400 font-mono mb-1 truncate">{ticket.userEmail || ticket.userId}</p>
                                            )}
                                            <h4 className={`font-bold text-sm truncate ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                {ticket.subject}
                                            </h4>
                                        </div>
                                        <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-2 !py-0.5">
                                            {getStatusLabel(ticket.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end text-[10px] text-slate-500">
                                        <span className="font-mono">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${activeTicket?.id === ticket.id ? 'text-indigo-400 translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} aria-hidden="true"/>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900/60 border-white/10 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 opacity-50 shadow-inner border border-white/5">
                                <LifeBuoy size={48} aria-hidden="true"/>
                            </div>
                            <p className="text-lg font-medium">{t('select_ticket_prompt') || "Select a ticket to view details"}</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
                                <div className="flex-1 mr-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTicket(null)} 
                                        className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs hover:text-white transition-colors focus:outline-none focus:text-white"
                                        aria-label={t('close')}
                                    >
                                        <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : 'rotate-0'}/> {t('close')}
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg truncate">
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0"><Lock size={16} className="text-emerald-500" aria-hidden="true"/></div>
                                        {activeTicket.subject}
                                    </h3>
                                    {user.role === 'admin' && (
                                        <div className="flex items-center gap-2 mt-1 ml-9">
                                            <Mail size={10} className="text-slate-500"/>
                                            <p className="text-[10px] text-slate-400 font-mono">{activeTicket.userEmail}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTicket.status === 'resolved' ? (
                                        <button onClick={toggleResolve} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-colors">
                                            <CheckCircle size={14} aria-hidden="true"/> {t('status_resolved') || "Resolved"}
                                        </button>
                                    ) : (
                                        <button onClick={toggleResolve} className="px-3 py-1 bg-slate-800 border border-white/10 text-slate-400 rounded-full text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors">
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area (Live Region) */}
                            <div 
                                className="flex-1 overflow-y-auto p-6 pt-32 space-y-6 custom-scrollbar bg-slate-900/30"
                                role="log"
                                aria-live="polite"
                                aria-label="Ticket Conversation"
                            >
                                {activeTicket.messages?.map((msg, idx) => {
                                    // If user is Admin, they are "Me" (right side) if msg.isAdmin is true.
                                    // If user is User, they are "Me" (right side) if msg.isAdmin is false.
                                    
                                    const isMe = (user.role === 'admin' && msg.isAdmin) || (user.role !== 'admin' && !msg.isAdmin);
                                    const senderLabel = msg.isAdmin 
                                        ? (user.role === 'admin' ? (t('me') || 'Me') : (t('support_team') || 'Support'))
                                        : (user.role === 'admin' ? 'User' : (t('me') || 'Me'));

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

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
                                {activeTicket.status === 'resolved' && user.role !== 'admin' ? (
                                    <div className="text-center text-sm text-emerald-400 font-bold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 shadow-lg flex items-center justify-center gap-2">
                                        <CheckCircle size={16} aria-hidden="true"/>
                                        {t('ticket_closed_msg') || "This ticket is closed."}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <label htmlFor="reply-input" className="sr-only">{t('write_reply') || "Write your reply"}</label>
                                        <input 
                                            id="reply-input"
                                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:bg-slate-900 outline-none transition-all placeholder-slate-600 shadow-inner disabled:opacity-50"
                                            placeholder={t('write_reply') || "Write your reply..."}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !isSubmitting && sendReply()}
                                            disabled={isSubmitting}
                                            maxLength={1000}
                                        />
                                        <button 
                                            onClick={sendReply} 
                                            disabled={!newMessage.trim() || isSubmitting}
                                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            aria-label={language === 'ar' ? 'إرسال الرد' : 'Send Reply'}
                                        >
                                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="new-ticket-title"
                >
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl overflow-hidden">
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                        
                        <button 
                            type="button" 
                            onClick={() => setShowCreateModal(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t('close')}
                        >
                            <X size={20}/>
                        </button>
                        
                        <div className="relative z-10 p-2">
                            <h3 id="new-ticket-title" className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-xl"><LifeBuoy className="text-indigo-400" size={24} aria-hidden="true"/></div>
                                {t('new_ticket_title') || "New Request"}
                            </h3>
                            
                            <div className="space-y-5">
                                <div className="group">
                                    <label htmlFor="ticket-subject" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_subject') || "Subject"}</label>
                                    <input 
                                        id="ticket-subject"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500" 
                                        value={newSubject} 
                                        onChange={e => setNewSubject(e.target.value)} 
                                        placeholder="Briefly describe the issue..." 
                                        maxLength={100}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="group">
                                    <label htmlFor="ticket-details" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_details') || "Details"}</label>
                                    <textarea 
                                        id="ticket-details"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none h-40 resize-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500" 
                                        value={newMessage} 
                                        onChange={e => setNewMessage(e.target.value)} 
                                        placeholder="Provide more details here..." 
                                        maxLength={1000}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-right text-[10px] text-slate-600 mt-1">{newMessage.length}/1000</p>
                                </div>
                                <Button 
                                    onClick={createTicket} 
                                    variant="primary" 
                                    className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20" 
                                    disabled={!newSubject || !newMessage || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={20} className="animate-spin mr-2"/> Sending...</>
                                    ) : (
                                        t('send_request') || "Submit Request"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};