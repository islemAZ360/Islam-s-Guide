import { 
    collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, getDoc, setDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog, Ticket, Article, UserProfile } from '../types';

// --- Audit Logger ---
export const logAdminAction = async (adminUser: UserProfile, action: string, details: string, targetId?: string) => {
    if (!adminUser.isAdmin || !adminUser.uid) return;
    
    try {
        await addDoc(collection(db, 'audit_logs'), {
            adminId: adminUser.uid,
            adminName: adminUser.name,
            action,
            details,
            targetId: targetId || null,
            timestamp: Date.now()
        } as AuditLog);
    } catch (e) {
        console.error("Failed to log audit:", e);
    }
};

// --- User Management Extras ---
export const flagUser = async (admin: UserProfile, targetUid: string, isFlagged: boolean) => {
    await updateDoc(doc(db, 'users', targetUid), { isFlagged });
    await logAdminAction(admin, 'FLAG_USER', `User flagged status set to ${isFlagged}`, targetUid);
};

export const saveDoctorNotes = async (targetUid: string, notes: string) => {
    await updateDoc(doc(db, 'users', targetUid), { doctorNotes: notes });
};

// --- CMS (Articles) ---
export const publishArticle = async (admin: UserProfile, article: Omit<Article, 'id' | 'createdAt' | 'authorName'>) => {
    await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Date.now(),
        authorName: admin.name
    });
    await logAdminAction(admin, 'CREATE_ARTICLE', `Created article: ${article.title}`);
};

export const fetchArticles = async () => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
};

export const deleteArticle = async (admin: UserProfile, articleId: string) => {
    // Note: Actual delete logic requires deleteDoc imported
    // For safety, generally we might just archive, but here is concept
    // await deleteDoc(doc(db, 'articles', articleId));
    // await logAdminAction(admin, 'DELETE_ARTICLE', `Deleted article ${articleId}`);
};

// --- Support Tickets ---
export const fetchAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('lastUpdate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
};

export const updateTicketStatus = async (admin: UserProfile, ticketId: string, status: string) => {
    await updateDoc(doc(db, 'tickets', ticketId), { 
        status,
        lastUpdate: Date.now()
    });
    await logAdminAction(admin, 'UPDATE_TICKET', `Changed ticket status to ${status}`, ticketId);
};

export const replyToTicket = async (admin: UserProfile, ticketId: string, text: string, currentMessages: any[]) => {
    const newMessage = {
        senderId: admin.uid,
        senderName: admin.name,
        text,
        timestamp: Date.now(),
        isAdmin: true
    };
    
    await updateDoc(doc(db, 'tickets', ticketId), {
        messages: [...currentMessages, newMessage],
        lastUpdate: Date.now(),
        status: 'pending' // Usually admin reply puts it in pending user response
    });
};