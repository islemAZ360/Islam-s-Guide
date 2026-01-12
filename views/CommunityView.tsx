import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { 
    Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe, Crown, 
    ShieldCheck, Pill, FlaskConical, Zap, Stethoscope, Lock, ChevronLeft
} from 'lucide-react';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface CommunityViewProps {
    currentUser: UserProfile;
}

export const CommunityView = ({ currentUser }: CommunityViewProps) => {
    const { t, language } = useLanguage();
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

    // 1. جلب غرف الدردشة
    useEffect(() => {
        if (!currentUser.uid) return;

        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRooms: ChatRoom[] = [];
            snapshot.forEach((doc) => allRooms.push({ id: doc.id, ...doc.data() } as ChatRoom));
            
            const filteredRooms = allRooms.filter(room => {
                if (currentUser.role === 'admin') return true;
                if (currentUser.role === 'patient') {
                    return room.isDoctorRoom && room.doctorId === currentUser.patientData?.assignedDoctorId;
                }
                if (currentUser.role === 'doctor') {
                    return room.doctorId === currentUser.uid;
                }
                if (currentUser.role === 'normal_user') {
                    return !room.isDoctorRoom;
                }
                return false;
            });

            setRooms(filteredRooms);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. جلب لوحة المتصدرين
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

    // 3. جلب الرسائل
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsubscribe();
    }, [activeRoom]);

    // --- Actions ---

    const createRoom = async () => {
        if (!newRoomName.trim() || !currentUser.uid) return;
        const isDoctor = currentUser.role === 'doctor';
        await addDoc(collection(db, "rooms"), {
            name: newRoomName,
            createdBy: currentUser.uid,
            creatorName: currentUser.name,
            language: 'mixed',
            createdAt: Date.now(),
            isDoctorRoom: isDoctor,
            doctorId: isDoctor ? currentUser.uid : null
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
        if (!newMessage.trim() || !activeRoom || !currentUser.uid) return;
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name,
            timestamp: Date.now(),
            role: currentUser.role,
            isDoctor: currentUser.role === 'doctor',
            isAdmin: currentUser.role === 'admin'
        });
        setNewMessage("");
    };

    const canCreateRoom = currentUser.role !== 'patient';

    return (
        <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col">
            
            {/* Tabs Navigation */}
            <div className="flex p-1.5 bg-slate-950/50 rounded-2xl border border-white/10 mb-6 shrink-0 backdrop-blur-md shadow-lg w-fit mx-auto md:w-full md:mx-0">
                <button 
                    onClick={() => {setTab('rooms'); setActiveRoom(null);}} 
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${tab === 'rooms' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <MessageCircle size={18} /> {t('comm_rooms')}
                </button>
                <button 
                    onClick={() => setTab('leaderboard')} 
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${tab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Trophy size={18} /> {t('comm_leaderboard')}
                </button>
            </div>

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-4">
                    {leaderboard.map((user, idx) => {
                        let rankStyle = 'bg-slate-800/50 text-slate-400 border-white/5';
                        let glow = '';
                        
                        if (idx === 0) { 
                            rankStyle = 'bg-gradient-to-r from-yellow-600/20 to-amber-500/20 border-amber-500/30 text-amber-200'; 
                            glow = 'shadow-[0_0_30px_rgba(245,158,11,0.1)]';
                        }
                        else if (idx === 1) { 
                            rankStyle = 'bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/30 text-slate-200'; 
                        }
                        else if (idx === 2) { 
                            rankStyle = 'bg-gradient-to-r from-orange-700/20 to-orange-500/20 border-orange-500/30 text-orange-200'; 
                        }

                        const MedIcon = user.medForm === 'liquid' ? FlaskConical : Pill;

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.01] ${rankStyle} ${glow}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg ${idx < 3 ? 'bg-white/10' : 'bg-slate-900/50'}`}>
                                        {idx === 0 ? <Crown size={20} className="text-amber-400" /> : idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.role === 'admin' && <ShieldCheck size={14} className="text-rose-400" />}
                                            {user.role === 'doctor' && <Stethoscope size={14} className="text-blue-400" />}
                                        </p>
                                        <div className="flex gap-3 mt-1">
                                            {user.medType && (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <MedIcon size={12} /> {user.medType}
                                                </span>
                                            )}
                                            {user.streak && (
                                                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                                                    <Zap size={12} fill="currentColor" /> {user.streak} days
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black">{Math.round(user.progress || 0)}<span className="text-sm opacity-60">%</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ROOMS TAB (List) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-indigo-400"/> 
                            {currentUser.role === 'patient' ? t('community_clinic') : t('comm_rooms')}
                        </h2>
                        {canCreateRoom && (
                            <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-xl shadow-emerald-500/20">
                                <Plus size={16} /> {t('create_room')}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                                <MessageCircle size={48} className="mx-auto mb-4 opacity-20"/>
                                <p>لا توجد غرف متاحة حالياً.</p>
                            </div>
                        )}
                        {rooms.map(room => (
                            <Card 
                                key={room.id} 
                                hoverEffect={true}
                                className={`!p-6 cursor-pointer flex flex-col justify-between h-36 border-white/5 ${room.isDoctorRoom ? 'bg-indigo-900/10' : ''}`}
                            >
                                <div className="absolute inset-0 z-20" onClick={() => setActiveRoom(room)}></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${room.isDoctorRoom ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                                        {room.isDoctorRoom ? <Stethoscope size={24} /> : <MessageCircle size={24} />}
                                    </div>
                                    
                                    {(currentUser.uid === room.createdBy || currentUser.role === 'admin') && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-lg transition-colors z-30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-white truncate flex items-center gap-2">
                                        {room.name}
                                        {room.isDoctorRoom && <Lock size={14} className="text-indigo-400"/>}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                        {room.isDoctorRoom ? t('community_clinic') : `By ${room.creatorName}`}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl relative">
                                <h3 className="text-lg font-bold text-white mb-6">
                                    {currentUser.role === 'doctor' ? t('community_clinic') : t('create_room')}
                                </h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-6 outline-none focus:border-indigo-500 transition-all"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    autoFocus
                                />
                                {currentUser.role === 'doctor' ? (
                                    <p className="text-xs text-indigo-300 mb-6 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                        {t('community_doctor_room_hint')}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500 mb-6">
                                        {t('community_public_room_hint')}
                                    </p>
                                )}
                                <div className="flex gap-3 justify-end">
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
                <div className="flex-1 flex flex-col h-full bg-slate-900/60 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative animate-in zoom-in">
                    
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setActiveRoom(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors md:hidden">
                                <ChevronLeft size={20} />
                            </button>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/10 ${activeRoom.isDoctorRoom ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                {activeRoom.isDoctorRoom ? <Stethoscope size={18}/> : <MessageCircle size={18} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{activeRoom.name}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Now</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="!py-2 !px-4 !text-xs !rounded-xl hidden md:flex" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 pt-24 space-y-6 custom-scrollbar">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            // أنماط الرسائل المخصصة
                            let bubbleStyle = 'bg-slate-800 text-slate-200 border-white/5';
                            if (isMe) bubbleStyle = 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-indigo-500';
                            else if (msg.isDoctor || msg.role === 'doctor') bubbleStyle = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/30 text-blue-100 shadow-lg';
                            else if (msg.isAdmin || msg.role === 'admin') bubbleStyle = 'bg-gradient-to-br from-rose-900/80 to-rose-800/80 border-rose-500/30 text-rose-100 shadow-lg';

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 ${showAvatar ? (isMe ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400') : 'opacity-0'}`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1 font-bold">
                                                {msg.senderName}
                                                {msg.role === 'doctor' && <Badge color="blue" className="!text-[8px] !px-1.5 !py-0">DR</Badge>}
                                                {msg.role === 'admin' && <Badge color="rose" className="!text-[8px] !px-1.5 !py-0">ADMIN</Badge>}
                                            </span>
                                        )}
                                        
                                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed border backdrop-blur-sm ${bubbleStyle} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1 px-1 opacity-70 font-mono">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950/80 border-t border-white/5 flex gap-3 backdrop-blur-xl relative z-20">
                        <input 
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600 shadow-inner"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};