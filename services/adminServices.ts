import { 
    collection, doc, writeBatch, getDocs, query, orderBy, Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Article, Ticket, UserProfile } from '../types';

// نتيجة العملية الموحدة
interface ServiceResult {
    success: boolean;
    error?: string;
}

/**
 * Helper to create an audit log reference and data
 */
const createAuditLog = (batch: any, adminUid: string, adminName: string, action: string, details: string, targetId?: string) => {
    const logRef = doc(collection(db, 'audit_logs'));
    batch.set(logRef, {
        adminId: adminUid,
        adminName: adminName,
        action: action,
        details: details,
        targetId: targetId || null,
        timestamp: Date.now()
    });
};

// --- Atomic Admin Actions (Batch Write) ---

/**
 * Approve a doctor and log the action atomically.
 */
export const approveDoctorService = async (
    admin: UserProfile, 
    doctorUid: string, 
    doctorName: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        // 1. Update Doctor Status
        const doctorRef = doc(db, 'users', doctorUid);
        batch.update(doctorRef, {
            "doctorData.accountStatus": "approved",
            "doctorData.rejectionReason": null
        });

        // 2. Create Audit Log
        createAuditLog(batch, admin.uid, admin.name, 'APPROVE_DOCTOR', `Approved doctor account for ${doctorName}`, doctorUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        console.error("Approve Doctor Error:", e);
        return { success: false, error: e.message };
    }
};

/**
 * Reject a doctor and log the action atomically.
 */
export const rejectDoctorService = async (
    admin: UserProfile, 
    doctorUid: string, 
    doctorName: string, 
    reason: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const doctorRef = doc(db, 'users', doctorUid);
        batch.update(doctorRef, {
            "doctorData.accountStatus": "rejected",
            "doctorData.rejectionReason": reason
        });

        createAuditLog(batch, admin.uid, admin.name, 'REJECT_DOCTOR', `Rejected doctor ${doctorName}. Reason: ${reason}`, doctorUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Ban/Unban a user and log atomically.
 */
export const toggleBanService = async (
    admin: UserProfile, 
    targetUid: string, 
    targetName: string, 
    newBanStatus: boolean
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const userRef = doc(db, 'users', targetUid);
        batch.update(userRef, { isBanned: newBanStatus });

        createAuditLog(
            batch, 
            admin.uid, 
            admin.name, 
            newBanStatus ? 'BAN_USER' : 'UNBAN_USER', 
            `${newBanStatus ? 'Banned' : 'Unbanned'} user ${targetName}`, 
            targetUid
        );

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Delete a user and log atomically.
 */
export const deleteUserService = async (
    admin: UserProfile, 
    targetUid: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const userRef = doc(db, 'users', targetUid);
        batch.delete(userRef);

        createAuditLog(batch, admin.uid, admin.name, 'DELETE_USER', `Permanently deleted user ID ${targetUid}`, targetUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Publish article and log atomically.
 */
export const publishArticleService = async (
    admin: UserProfile, 
    article: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        // Need to create ref first to get ID
        const articleRef = doc(collection(db, 'articles'));
        batch.set(articleRef, {
            ...article,
            createdAt: Date.now(),
            authorName: admin.name,
            authorId: admin.uid,
            authorRole: 'admin',
            isPublished: true
        });

        createAuditLog(batch, admin.uid, admin.name, 'PUBLISH_ARTICLE', `Published article: ${article.title}`, articleRef.id);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

// --- Read Operations (Direct Queries) ---

export const fetchArticles = async () => {
    try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchAllTickets = async () => {
    try {
        const q = query(collection(db, 'tickets'), orderBy('lastUpdate', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
    } catch (e) {
        console.error(e);
        return [];
    }
};