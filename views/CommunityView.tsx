import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc, where 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { PageHeader, LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe } from 'lucide-react';

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

    // Fetch Rooms
    useEffect(() => {
        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const r: ChatRoom[] = [];
            snapshot.forEach((doc) => r.push({ id: doc.id, ...doc.data() } as ChatRoom));
            setRooms(r);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Leaderboard
    useEffect(() => {
        if (tab === 'leaderboard') {
            // In a real app, you might want to index 'progress' or 'streak'
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(20));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // Fetch Messages when room active
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            // Scroll to bottom
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
        if (confirm("Delete this room?")) {
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
        <LayoutContainer className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex gap-4 mb-4 shrink-0">
                <Button variant={tab === 'rooms' ? 'primary' : 'secondary'} onClick={() => {setTab('rooms'); setActiveRoom(null);}} className="flex-1">
                    <MessageCircle size={18} /> {t('comm_rooms')}
                </Button>
                <Button variant={tab === 'leaderboard' ? 'primary' : 'secondary'} onClick={() => setTab('leaderboard')} className="flex-1">
                    <Trophy size={18} /> {t('comm_leaderboard')}
                </Button>
            </div>

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && (
                <Card className="flex-1 overflow-y-auto bg-slate-900/50">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Trophy className="text-amber-400" /> {t('comm_leaderboard')}
                    </h2>
                    <div className="space-y-3">
                        {leaderboard.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                                        idx === 0 ? 'bg-amber-400 text-black' : 
                                        idx === 1 ? 'bg-slate-300 text-black' : 
                                        idx === 2 ? 'bg-orange-400 text-black' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{user.name} {user.isAdmin && <Badge color="indigo">Admin</Badge>}</p>
                                        <p className="text-xs text-slate-500">{t('streak')}: {user.streak || 0}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-indigo-400">{Math.round(user.progress || 0)}%</span>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t('progress')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* ROOMS TAB (List) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-2xl font-bold text-white">{t('comm_rooms')}</h2>
                        <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-sm">
                            <Plus size={16} /> {t('create_room')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                        {rooms.map(room => (
                            <div key={room.id} onClick={() => setActiveRoom(room)} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Users />
                                    </div>
                                    {(currentUser.uid === room.createdBy || currentUser.isAdmin) && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-full transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">{t('user')}: {room.creatorName}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Globe size={12} /> {t('join')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">{t('create_room')}</h3>
                                <input 
                                    className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
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
                <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-[2rem] border border-white/5 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageCircle className="text-indigo-400" /> {activeRoom.name}
                        </h3>
                        <Button variant="secondary" className="!py-1 !px-3 !text-xs" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map(msg => {
                            const isMe = msg.senderId === currentUser.uid;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        isMe ? 'bg-indigo-600 text-white rounded-br-none' : 
                                        msg.isAdmin ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200' :
                                        'bg-slate-800 text-slate-200 rounded-bl-none'
                                    }`}>
                                        {!isMe && <p className="text-[10px] font-bold opacity-50 mb-1 flex items-center gap-1">
                                            {msg.senderName} {msg.isAdmin && <Badge color="amber" className="!text-[8px] !px-1 !py-0">ADMIN</Badge>}
                                        </p>}
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-slate-600 mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950/50 border-t border-white/5 flex gap-2">
                        <input 
                            className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};