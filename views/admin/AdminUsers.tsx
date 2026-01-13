import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Ban, Trash2, User, Shield, Stethoscope, Mail, CheckCircle, 
    Smartphone, Calendar, Eye, X, Activity, Ruler, Weight, Send, 
    MessageSquare, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
    collection, addDoc, query, where, orderBy, limit, getDocs, 
    startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button'; 
import { Card } from '../../components/ui/Card';     

// Limit items per page for Server-Side Pagination
const ITEMS_PER_PAGE = 10;

export const AdminUsers = () => {
    const { t, language, dir } = useLanguage();
    
    // -- Data State --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    
    // -- Pagination State --
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [pageStack, setPageStack] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [isLastPage, setIsLastPage] = useState(false);

    // -- Search State --
    const [searchTerm, setSearchTerm] = useState("");
    
    // -- Modal & Actions State --
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [showMsgForm, setShowMsgForm] = useState(false);
    const [msgSubject, setMsgSubject] = useState("");
    const [msgContent, setMsgContent] = useState("");
    const [isSending, setIsSending] = useState(false);

    // -- 1. Fetch Users Function (Server-Side) --
    const fetchUsers = async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            let q = query(usersRef, orderBy("createdAt", "desc"), limit(ITEMS_PER_PAGE));

            // Apply Search Filtering (Simple "Start With" logic for Name/Email)
            if (searchTerm.trim()) {
                // Note: Firestore search is limited. This works for exact prefixes.
                // For production with massive data, consider Algolia. 
                // Here we search by Name for simplicity in this demo.
                q = query(
                    usersRef, 
                    orderBy("name"), 
                    where("name", ">=", searchTerm), 
                    where("name", "<=", searchTerm + '\uf8ff'),
                    limit(ITEMS_PER_PAGE)
                );
            } else {
                // Apply Pagination logic only if not searching (or if searching logic supports it)
                if (direction === 'next' && lastVisible) {
                    q = query(usersRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(ITEMS_PER_PAGE));
                } else if (direction === 'prev' && pageStack.length > 1) {
                    // To go back, we use the doc at index [length - 2] as the startAfter point for the previous page
                    const prevStartDoc = pageStack[pageStack.length - 2];
                    q = query(usersRef, orderBy("createdAt", "desc"), startAfter(prevStartDoc), limit(ITEMS_PER_PAGE));
                }
            }

            const snapshot = await getDocs(q);
            
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(doc => fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile));
            
            setUsers(fetchedUsers);
            
            // Update Pagination Cursors
            if (snapshot.docs.length > 0) {
                const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                setLastVisible(lastDoc);
                
                if (direction === 'next') {
                    setPageStack(prev => [...prev, lastDoc]);
                } else if (direction === 'prev') {
                    setPageStack(prev => prev.slice(0, -1));
                } else if (direction === 'initial') {
                    setPageStack([lastDoc]);
                }
                
                setIsLastPage(snapshot.docs.length < ITEMS_PER_PAGE);
            } else {
                setIsLastPage(true);
            }
            
            setIsFirstPage(direction === 'initial' || (direction === 'prev' && pageStack.length <= 1));

        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    // Initial Load & Search Trigger
    useEffect(() => {
        // Debounce search to prevent too many reads
        const timer = setTimeout(() => {
            fetchUsers('initial');
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // -- 2. Focus Management --
    useEffect(() => {
        if (selectedUser) {
            setTimeout(() => modalRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowMsgForm(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedUser]);

    // -- 3. Actions Handlers --
    const handleSendMessage = async () => {
        if (!selectedUser?.uid || !msgSubject.trim() || !msgContent.trim()) return;
        setIsSending(true);
        try {
            const adminUser = auth?.currentUser;
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
            alert("Message sent successfully");
            setShowMsgForm(false);
            setMsgSubject("");
            setMsgContent("");
        } catch (e) {
            console.error(e);
            alert("Error sending message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section aria-labelledby="users-section-title" className="space-y-8 animate-in fade-in">
            <h2 id="users-section-title" className="sr-only">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>

            {/* Search Bar */}
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                    <Search size={20} />
                </div>
                <input 
                    className="w-full bg-transparent border-none text-white px-4 py-2 outline-none placeholder-slate-500 font-medium"
                    placeholder={language === 'ar' ? "بحث بالاسم..." : "Search by name..."}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Grid */}
            {loading ? (
                <div className="flex h-64 items-center justify-center text-indigo-400">
                    <Loader2 size={32} className="animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                    <User size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>{language === 'ar' ? 'لا يوجد مستخدمين.' : 'No users found.'}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map(user => (
                        <li key={user.uid} className="bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-white/5">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{user.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge color={user.role === 'patient' ? 'indigo' : 'blue'}>{user.role}</Badge>
                                            {user.isBanned && <Badge color="red">BANNED</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedUser(user)}
                                    className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div>
                                <div className="flex items-center gap-2"><Calendar size={14}/> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Controls */}
            {!searchTerm && !loading && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button 
                        variant="secondary" 
                        onClick={() => fetchUsers('prev')} 
                        disabled={isFirstPage}
                        className="!rounded-xl"
                    >
                        {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                    </Button>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'صفحة' : 'Page'} {pageStack.length}</span>
                    <Button 
                        variant="secondary" 
                        onClick={() => fetchUsers('next')} 
                        disabled={isLastPage}
                        className="!rounded-xl"
                    >
                        {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                    </Button>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <div ref={modalRef} tabIndex={-1} className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden outline-none">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-white z-10"><X size={20}/></button>
                        <div className="p-8 pt-12">
                            <h2 className="text-2xl font-black text-white mb-2">{selectedUser.name}</h2>
                            <p className="text-slate-400 mb-6">{selectedUser.email}</p>
                            
                            {/* Message Form */}
                            {!showMsgForm ? (
                                <Button onClick={() => setShowMsgForm(true)} className="w-full mb-4" variant="secondary">
                                    <MessageSquare size={18} className="mr-2"/> {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                                </Button>
                            ) : (
                                <div className="bg-slate-950 p-4 rounded-xl border border-white/10 mb-4 animate-in slide-in-from-top-2">
                                    <input className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 mb-2 text-white text-sm" placeholder="Subject" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />
                                    <textarea className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 mb-2 text-white text-sm h-20" placeholder="Message..." value={msgContent} onChange={e => setMsgContent(e.target.value)} />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setShowMsgForm(false)} className="text-xs text-slate-500">Cancel</button>
                                        <button onClick={handleSendMessage} disabled={isSending} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg">{isSending ? '...' : 'Send'}</button>
                                    </div>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">Role</span>
                                    <span className="text-white font-mono">{selectedUser.role}</span>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">Last Active</span>
                                    <span className="text-white font-mono">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};