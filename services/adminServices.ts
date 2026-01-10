import { 
    collection, addDoc, updateDoc, doc, getDocs, query, orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog, Ticket, Article, UserProfile } from '../types';

// --- Audit Logger (نظام المراقبة) ---
// يسجل كل حركة يقوم بها الأدمن لضمان عدم التلاعب
export const logAdminAction = async (adminUser: UserProfile, action: string, details: string, targetId?: string) => {
    if (adminUser.role !== 'admin' || !adminUser.uid) return;
    
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

// --- User Management (إدارة المستخدمين) ---

// وضع علامة "خطر" على المستخدم لمراقبته
export const flagUser = async (admin: UserProfile, targetUid: string, isFlagged: boolean) => {
    await updateDoc(doc(db, 'users', targetUid), { isFlagged });
    await logAdminAction(admin, 'FLAG_USER', `Set flagged status to ${isFlagged}`, targetUid);
};

// حفظ ملاحظات سرية عن المستخدم (لا يراها المستخدم)
export const saveDoctorNotes = async (targetUid: string, notes: string) => {
    // نستخدم حقل doctorNotes لهذا الغرض، سواء كتبها طبيب أو أدمن
    await updateDoc(doc(db, 'users', targetUid), { doctorNotes: notes });
};

// --- CMS (نظام إدارة المحتوى) ---

export const publishArticle = async (admin: UserProfile, article: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
    if (!admin.uid) return;
    
    await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Date.now(),
        authorName: admin.name,
        authorId: admin.uid,
        authorRole: 'admin',
        isPublished: true
    });
    await logAdminAction(admin, 'CREATE_ARTICLE', `Published article: ${article.title}`);
};

export const fetchArticles = async () => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
};

// --- Support Tickets (نظام الدعم الفني) ---

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
    if (!admin.uid) return;

    const newMessage = {
        senderId: admin.uid,
        senderName: admin.name,
        text,
        timestamp: Date.now(),
        isAdmin: true // This flags the message as coming from Support/Admin
    };
    
    await updateDoc(doc(db, 'tickets', ticketId), {
        messages: [...currentMessages, newMessage],
        lastUpdate: Date.now(),
        status: 'pending' // انتظار رد المستخدم
    });
};