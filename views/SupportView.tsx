import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { PageHeader, LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, Stethoscope } from 'lucide-react';

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
        
        // جلب التذاكر الخاصة بالمستخدم الحالي فقط
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
            
            // تحديث التذكرة المفتوحة حالياً إذا وصل رد جديد (Real-time)
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, activeTicket?.id]);

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
        if (!newSubject.trim() || !newMessage.trim() || !user.uid) return;
        
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
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
            alert("فشل إنشاء التذكرة. يرجى المحاولة لاحقاً.");
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
            // استخدمنا any هنا لتجاوز تدقيق Typescript الصارم مع Firestore arrayUnion في بعض النسخ، 
            // لكن التحديث المباشر للمصفوفة كما يلي يعمل بشكل جيد مع البيانات المجلوبة
            const currentMessages = activeTicket.messages || [];
            
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                // إذا رد المستخدم، نعيد فتح التذكرة إذا كانت "قيد الانتظار" أو "مغلقة"
                status: 'open' 
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title="مركز المساعدة والدعم" 
                subtitle="تواصل مباشرة مع الفريق التقني والإداري للنظام."
                action={
                    <Button onClick={() => setShowCreateModal(true)} variant="primary">
                        <Plus size={18} /> فتح تذكرة جديدة
                    </Button>
                }
            />

            {/* Context Banner: يعرض هوية المستخدم لتسهيل لقطات الشاشة للدعم */}
            <div className="mb-6 bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                        {user.role === 'doctor' ? <Stethoscope size={20}/> : 
                         user.medForm === 'liquid' ? <FlaskConical size={20} /> : 
                         user.medForm === 'tablet' ? <Pill size={20} /> : <User size={20}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">حسابك الحالي</p>
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                            {user.name} 
                            <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">{user.role.toUpperCase()}</Badge>
                        </p>
                    </div>
                </div>
                {user.role === 'normal_user' && user.planType === 'algorithm' && (
                    <Badge color="indigo">خوارزمية ذكية</Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900 border-white/5 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                        <h3 className="font-bold text-white">تذاكري</h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                        {tickets.length === 0 && (
                            <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl m-2">
                                <LifeBuoy className="mx-auto mb-2 opacity-50" size={24}/>
                                لا توجد تذاكر سابقة.
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeTicket?.id === ticket.id 
                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                    : 'bg-slate-950/50 border-transparent hover:bg-slate-800 hover:border-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-sm truncate max-w-[70%] ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                        {ticket.subject}
                                    </h4>
                                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-1.5">
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

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900 border-white/5 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <LifeBuoy size={40} />
                            </div>
                            <p>اختر تذكرة لعرض التفاصيل أو ابدأ تذكرة جديدة</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                                <div>
                                    <button onClick={() => setActiveTicket(null)} className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs">
                                        <X size={14}/> إغلاق
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Lock size={14} className="text-emerald-500"/> {activeTicket.subject}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">Ref: {activeTicket.id}</p>
                                </div>
                                {activeTicket.status === 'resolved' && <Badge color="green"><CheckCircle size={12} /> تم الحل</Badge>}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                                {activeTicket.messages?.map((msg, idx) => {
                                    const isMe = !msg.isAdmin; 
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                                isMe 
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                                                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 mt-1 px-1 flex items-center gap-1">
                                                {isMe ? 'أنا' : 'الدعم الفني'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center text-xs text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                        تم إغلاق هذه التذكرة. لفتحها مجدداً، يرجى إنشاء تذكرة جديدة.
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                            placeholder="اكتب ردك هنا..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                                        />
                                        <Button onClick={sendReply} variant="primary" disabled={!newMessage.trim()} className="!rounded-xl !px-4">
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20}/></button>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <LifeBuoy className="text-indigo-500"/> طلب مساعدة جديد
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">الموضوع</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all" 
                                    value={newSubject} 
                                    onChange={e => setNewSubject(e.target.value)} 
                                    placeholder="مثال: مشكلة في تسجيل الجرعة" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">التفاصيل</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none transition-all" 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    placeholder="اشرح المشكلة بالتفصيل..." 
                                />
                            </div>
                            <Button onClick={createTicket} variant="primary" className="w-full py-3" disabled={!newSubject || !newMessage}>
                                إرسال الطلب
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};