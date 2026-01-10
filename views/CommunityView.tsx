import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe, Crown, 
    ShieldCheck, Pill, FlaskConical, Zap 
} from 'lucide-react';

interface CommunityViewProps {
    currentUser: UserProfile;
}

export const CommunityView = ({ currentUser }: CommunityViewProps) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<'rooms' | 'leaderboard'>('rooms');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    
    // Create Room State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // 1. جلب غرف الدردشة (Realtime)
    useEffect(() => {
        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const r: ChatRoom[] = [];
            snapshot.forEach((doc) => r.push({ id: doc.id, ...doc.data() } as ChatRoom));
            setRooms(r);
        });
        return () => unsubscribe();
    }, []);

    // 2. جلب لوحة المتصدرين (Top 20 by Progress)
    useEffect(() => {
        if (tab === 'leaderboard') {
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(20));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // 3. جلب الرسائل عند دخول غرفة
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            // التمرير التلقائي لآخر رسالة
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsubscribe();
    }, [activeRoom]);

    const createRoom = async () => {
        if (!newRoomName.trim()) return;
        await addDoc(collection(db, "rooms"), {
            name: newRoomName,
            createdBy: currentUser.uid,
            creatorName: currentUser.name,
            language: 'mixed',
            createdAt: Date.now()
        });
        setNewRoomName("");
        setShowCreateModal(false);
    };

    const deleteRoom = async (roomId: string) => {
        if (confirm("هل أنت متأكد من حذف هذه الغرفة؟")) {
            await deleteDoc(doc(db, "rooms", roomId));
            if (activeRoom?.id === roomId) setActiveRoom(null);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom) return;
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name,
            timestamp: Date.now(),
            isAdmin: !!currentUser.isAdmin
        });
        setNewMessage("");
    };

    return (
            <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 mb-4 shrink-0">
                <button 
                    onClick={() => {setTab('rooms'); setActiveRoom(null);}} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'rooms' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <MessageCircle size={18} /> {t('comm_rooms')}
                </button>
                <button 
                    onClick={() => setTab('leaderboard')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Trophy size={18} /> {t('comm_leaderboard')}
                </button>
            </div>

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {leaderboard.map((user, idx) => {
                        // تلوين المراكز الثلاثة الأولى
                        let rankColor = 'bg-slate-800 text-slate-400';
                        let borderClass = 'border-white/5';
                        if (idx === 0) { rankColor = 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-amber-500/20 shadow-lg'; borderClass = 'border-amber-500/30'; }
                        else if (idx === 1) { rankColor = 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20 shadow-lg'; borderClass = 'border-slate-400/30'; }
                        else if (idx === 2) { rankColor = 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/20 shadow-lg'; borderClass = 'border-orange-500/30'; }

                        // تحديد أيقونة الدواء (سائل أم حبوب)
                        const MedIcon = user.medForm === 'liquid' ? FlaskConical : Pill;

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border ${borderClass} relative overflow-hidden group`}>
                                {idx < 3 && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl ${rankColor}`}>
                                        {idx === 0 ? <Crown size={24} /> : idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.isAdmin && <ShieldCheck size={14} className="text-indigo-400" />}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            {user.medType && (
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
                                                    <MedIcon size={10} /> {user.medType}
                                                </span>
                                            )}
                                            {user.streak ? (
                                                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-bold">
                                                    <Zap size={10} /> {user.streak} days
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="text-2xl font-black text-white">{Math.round(user.progress || 0)}<span className="text-sm text-slate-500">%</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ROOMS TAB (List) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe size={20} className="text-indigo-400"/> الغرف النشطة</h2>
                        <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-full">
                            <Plus size={16} /> {t('create_room')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.map(room => (
                            <div key={room.id} onClick={() => setActiveRoom(room)} className="bg-slate-900 border border-white/5 p-5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer group relative flex flex-col justify-between h-32">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <MessageCircle size={20} />
                                    </div>
                                    {/* زر الحذف لصاحب الغرفة أو الأدمن */}
                                    {(currentUser.uid === room.createdBy || currentUser.isAdmin) && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-full transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white truncate">{room.name}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">By {room.creatorName}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">{t('create_room')}</h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('close')}</Button>
                                    <Button variant="primary" onClick={createRoom}>{t('create_room')}</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT INTERFACE */}
            {tab === 'rooms' && activeRoom && (
                <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                <MessageCircle size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{activeRoom.name}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="!py-1.5 !px-3 !text-xs !rounded-full" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 pt-20 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${showAvatar ? (isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300') : 'opacity-0'}`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1">
                                                {msg.senderName}
                                                {msg.isAdmin && <Badge color="amber" className="!text-[8px] !px-1.5 !py-0">ADMIN</Badge>}
                                            </span>
                                        )}
                                        
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : msg.isAdmin 
                                                ? 'bg-amber-900/20 border border-amber-500/30 text-amber-100 rounded-tl-none'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1 px-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2 backdrop-blur-md">
                        <input 
                            className="flex-1 bg-slate-900 border border-white/10 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};