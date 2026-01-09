import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldAlert, Ban, UserCheck, MessageSquare, Activity, Search } from 'lucide-react';

export const AdminView = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messageText, setMessageText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newStatus = !user.isBanned;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                isBanned: newStatus
            });
            setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isBanned: newStatus } : u));
        } catch (e) {
            console.error("Error banning user", e);
        }
    };

    const sendMessage = async () => {
        if (!selectedUser?.uid || !messageText) return;
        try {
            await addDoc(collection(db, "users", selectedUser.uid, "admin_messages"), {
                text: messageText,
                fromAdmin: true,
                timestamp: Date.now(),
                read: false
            });
            setMessageText("");
            setSelectedUser(null);
            alert(t('msg_sent'));
        } catch (e) {
            console.error("Error sending message", e);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutContainer>
            <PageHeader title={t('admin_title')} subtitle={`${t('admin_users')}: ${users.length}`} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="flex items-center gap-4 bg-indigo-900/20 border-indigo-500/20">
                    <Activity className="text-indigo-400" size={32} />
                    <div>
                        <div className="text-2xl font-bold text-white">{users.length}</div>
                        <div className="text-xs text-indigo-300 uppercase font-bold">{t('admin_users')}</div>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 bg-rose-900/20 border-rose-500/20">
                    <Ban className="text-rose-400" size={32} />
                    <div>
                        <div className="text-2xl font-bold text-white">{users.filter(u => u.isBanned).length}</div>
                        <div className="text-xs text-rose-300 uppercase font-bold">Banned</div>
                    </div>
                </Card>
            </div>

            {/* Message Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">{t('send_msg')}: {selectedUser.name}</h3>
                        <textarea 
                            className="w-full h-32 bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
                            placeholder={t('admin_note_placeholder')}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
                            <Button variant="primary" onClick={sendMessage}>Send</Button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="mb-6 relative">
                <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {loading ? <div className="text-center text-slate-500">Loading users...</div> : filteredUsers.map(user => (
                    <div key={user.uid} className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${user.isBanned ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {user.name}
                                    {user.isAdmin && <ShieldAlert size={14} className="text-indigo-400" />}
                                    {user.isBanned && <Ban size={14} className="text-rose-400" />}
                                </h4>
                                <p className="text-xs text-slate-500">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge color="blue">{user.medType || 'N/A'}</Badge>
                                    <Badge color="green">{user.progress ? Math.round(user.progress) : 0}%</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                                variant="secondary" 
                                className="!py-2 !text-xs flex-1 md:flex-none"
                                onClick={() => setSelectedUser(user)}
                            >
                                <MessageSquare size={16} /> {t('send_msg')}
                            </Button>
                            {!user.isAdmin && (
                                <Button 
                                    variant={user.isBanned ? 'success' : 'danger'}
                                    className="!py-2 !text-xs flex-1 md:flex-none"
                                    onClick={() => toggleBan(user)}
                                >
                                    {user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                                    {user.isBanned ? t('user_unban') : t('user_ban')}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </LayoutContainer>
    );
};