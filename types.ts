// --- Basic Medication Types ---
export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

// --- ROLES & PERMISSIONS ---
// تم فصل "مستخدم عادي" عن "مريض" بناءً على طلبك
export type UserRole = 'admin' | 'doctor' | 'normal_user' | 'patient';

// --- DOCTOR SPECIFIC TYPES ---
export type DoctorAccountStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorProfileData {
  specialty: string;        // التخصص (نفسي، إدمان، عام...)
  licenseNumber: string;    // رقم الترخيص الطبي (للاعتماد)
  clinicLocation?: string;  // مكان العيادة
  phoneNumber: string;      // رقم الهاتف
  bio: string;              // نبذة تظهر للمرضى
  accountStatus: DoctorAccountStatus; 
  
  // Stats for Admin & Doctor Dashboard
  totalPatients: number;
  activePatients: number;
  recoveredCount: number;
  doctorLevel: number; // يزداد مع عدد المتعافين
}

// --- PATIENT SPECIFIC TYPES (For those following a doctor) ---
export interface PatientProfileData {
  assignedDoctorId: string;
  assignedDoctorName: string;
  isPlanAssigned: boolean; // هل قام الطبيب بوضع الخطة أم لا يزال المريض في الانتظار؟
  isRecovered: boolean;    // هل قام الطبيب بإغلاق الملف (تشافى)؟
  recoveryDate?: string;   // تاريخ التعافي (اختياري)
}

// --- MAIN USER PROFILE ---
export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  role: UserRole; // المحدد الرئيسي لنوع الحساب
  
  // -- Optional Data Sections based on Role --
  doctorData?: DoctorProfileData;   // موجود فقط إذا كان Role = doctor
  patientData?: PatientProfileData; // موجود فقط إذا كان Role = patient
  
  // -- Medical Data (For Normal Users & Patients) --
  medType?: MedType;
  medForm?: MedForm;
  medUnit?: MedUnit;
  durationMonths: number;
  setupComplete: boolean; // للمستخدم العادي: هل أدخل الجرعات؟ للطبيب: هل أدخل بياناته؟
  
  // -- Smart System Config --
  planType?: 'algorithm' | 'manual'; // algorithm للمستخدم العادي، manual للمريض (خطة طبيب)
  speedModifier?: number; 
  
  // -- General System Flags --
  isBanned?: boolean;
  lastActive?: string; 
  progress?: number;   
  streak?: number;     
  
  doctorNotes?: string; // ملاحظات سرية (سواء كتبها الطبيب للمريض أو الأدمن للمستخدم)
  isFlagged?: boolean; 
  
  // For Logging/Charts (Optional in profile, mostly strictly in collections)
  logs?: DailyLog[];
  plan?: PlanDay[];
  inventory?: Inventory;
}

// --- INVENTORY & PLANNING ---
export interface Inventory {
  boxes: number;
  pillsPerBox: number;
  loosePills: number;
  totalPills: number;
}

export interface ManualPhase {
  dose: number;
  days: number;
  interval?: number; 
}

export interface DailyLog {
  date: string; 
  doseTaken: number;
  mood: 'bad' | 'normal' | 'good' | null;
  sleepHours?: number; 
  symptoms?: string[]; 
  notes?: string;
}

export interface PlanDay {
  date: string;
  plannedDose: number;
  isPast: boolean;
  log?: DailyLog;
}

// --- CONTENT & CMS (Admin & Doctor) ---
export type ArticleCategory = 'medical' | 'motivation' | 'tip' | 'news' | 'announcement';

export interface Article {
  id?: string;
  title: string;
  content: string;
  category: ArticleCategory; // تصنيف المحتوى
  isPublished: boolean;
  createdAt: number;
  authorName: string;
  authorId: string;
  authorRole: 'admin' | 'doctor'; // لمعرفة مصدر المحتوى
}

// --- CHAT & COMMUNITY ---
export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; 
  creatorName: string;
  createdAt: number;
  language?: string;
  
  // New: Private Doctor Rooms
  isDoctorRoom?: boolean; // هل هي غرفة خاصة بمرضى طبيب معين؟
  doctorId?: string;      // معرف الطبيب مالك الغرفة
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  
  // Flags to distinguish sender type in UI
  role: UserRole; 
  // FIX: Added optional flags to prevent TS errors in CommunityView
  isDoctor?: boolean;
  isAdmin?: boolean;
}

// --- SUPPORT TICKETS ---
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface Ticket {
  id?: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  createdAt: number;
  lastUpdate: number;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  senderId: string; 
  senderName: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

// --- AUDIT LOGS (Admin) ---
export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

// --- APP NAVIGATION VIEWS ---
export enum AppView {
  // Common
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  ARTICLES = 'ARTICLES',
  
  // Normal User / Patient Views
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  COMMUNITY = 'COMMUNITY',
  SUPPORT = 'SUPPORT',
  
  // Doctor Views
  DOCTOR_DASHBOARD = 'DOCTOR_DASHBOARD', // الرئيسية للطبيب (احصائيات)
  DOCTOR_PATIENTS = 'DOCTOR_PATIENTS',   // إدارة المرضى
  DOCTOR_MESSAGES = 'DOCTOR_MESSAGES',   // رسائل المرضى
  
  // Admin Views
  ADMIN = 'ADMIN',
  
  // System States
  WAITING_APPROVAL = 'WAITING_APPROVAL', // للطبيب الذي ينتظر موافقة الأدمن
  WAITING_PLAN = 'WAITING_PLAN'          // للمريض الذي ينتظر خطة الطبيب
}