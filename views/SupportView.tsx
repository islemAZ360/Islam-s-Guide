import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { PageHeader, LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Clock, Lock, X } from 'lucide-react';

interface SupportViewProps {
    user: UserProfile;
}

export const SupportView = ({ user }: SupportViewProps) => {
    const { t } = useLanguage();
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch User Tickets --
    useEffect(() => {
        if (!user.uid) return;
        const q = query(
            collection(db, "tickets"), 
            where("userId", "==", user.uid), 
            orderBy("lastUpdate", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            // Update active ticket if it exists (for real-time chat)
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, activeTicket?.id]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (activeTicket) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTicket?.messages]);

    // -- 2. Actions --
    
    const createTicket = async () => {
        if (!newSubject.trim() || !user.uid) return;
        
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage || "New Support Request",
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            await addDoc(collection(db, "tickets"), {
                userId: user.uid,
                userEmail: user.email,
                subject: newSubject,
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
        }
    };

    const sendReply = async () => {
        if (!newMessage.trim() || !activeTicket || !activeTicket.id || !user.uid) return;

        const newMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            const currentMessages = activeTicket.messages || [];
            
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                status: 'open' // Re-open if it was pending user response
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        }
    };

    // -- Render --
    return (
        <LayoutContainer>
            <PageHeader 
                title="مركز المساعدة والدعم" 
                subtitle="تواصل مباشرة مع الفريق الطبي والإداري."
                action={
                    <Button onClick={() => setShowCreateModal(true)} variant="primary">
                        <Plus size={18} /> فتح تذكرة جديدة
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
                {/* LIST OF TICKETS */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-white">تذاكري</h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {tickets.length === 0 && (
                            <div className="text-center py-10 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                                لا توجد تذاكر سابقة.
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeTicket?.id === ticket.id 
                                    ? 'bg-indigo-600/10 border-indigo-500' 
                                    : 'bg-slate-950 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-sm truncate max-w-[70%] ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                        {ticket.subject}
                                    </h4>
                                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'red' : 'amber'}>
                                        {ticket.status === 'resolved' ? 'مغلق' : ticket.status === 'open' ? 'مفتوح' : 'قيد المراجعة'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-end text-[10px] text-slate-500">
                                    <span>{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                    <MessageSquare size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CHAT AREA */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900 border-white/5 relative ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <LifeBuoy size={48} className="mb-4 opacity-20" />
                            <p>اختر تذكرة لعرض التفاصيل أو ابدأ تذكرة جديدة</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                                <div>
                                    <button onClick={() => setActiveTicket(null)} className="md:hidden text-slate-400 mr-2 mb-2">
                                        رجوع للقائمة
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Lock size={14} className="text-emerald-500"/> {activeTicket.subject}
                                    </h3>
                                    <p className="text-[10px] text-slate-500">Ticket ID: {activeTicket.id}</p>
                                </div>
                                {activeTicket.status === 'resolved' && (
                                    <Badge color="green"><CheckCircle size={12} /> تم الحل</Badge>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {activeTicket.messages?.map((msg, idx) => {
                                    const isMe = !msg.isAdmin; // In User View, user is me
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                                isMe 
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none' 
                                                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 mt-1 px-1">
                                                {isMe ? 'أنا' : 'الدعم الفني'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center text-xs text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                        تم إغلاق هذه التذكرة. لفتحها مجدداً، أرسل رسالة جديدة.
                                    </div>
                                ) : null}
                                <div className="flex gap-2 mt-2">
                                    <input 
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="اكتب ردك هنا..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendReply()}
                                    />
                                    <Button onClick={sendReply} variant="primary" disabled={!newMessage.trim()} className="!rounded-xl">
                                        <Send size={18} />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* CREATE TICKET MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white mb-6">طلب مساعدة جديد</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">الموضوع</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                                    placeholder="مثال: مشكلة في الجرعة، استفسار طبي..."
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">تفاصيل المشكلة</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none"
                                    placeholder="اشرح مشكلتك بالتفصيل..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                            </div>
                            <Button onClick={createTicket} variant="primary" className="w-full" disabled={!newSubject || !newMessage}>
                                إرسال الطلب
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};