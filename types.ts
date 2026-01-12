// ============================================================================
// 1. MEDICATION & CLINICAL TYPES
// ============================================================================

export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

// ============================================================================
// 2. USER ROLES & PROFILES
// ============================================================================

export type UserRole = 'admin' | 'doctor' | 'normal_user' | 'patient';

export type DoctorAccountStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorProfileData {
  specialty: string;        
  licenseNumber: string;    
  clinicLocation?: string;  
  phoneNumber: string;      
  bio: string;              
  photoUrl?: string | null;        
  accountStatus: DoctorAccountStatus; 
  
  // Rejection & Resubmission Logic
  rejectionReason?: string | null;       
  submissionCount?: number;       
  lastSubmissionDate?: number;    

  // Stats
  totalPatients: number;
  activePatients: number;
  recoveredCount: number;
  doctorLevel: number; 
}

export interface PatientProfileData {
  assignedDoctorId: string;
  assignedDoctorName: string;
  requestStatus: 'pending' | 'approved' | 'rejected'; 
  
  isPlanAssigned: boolean; 
  isRecovered: boolean;    
  recoveryDate?: string;   
}

export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  
  // Physical Stats (New for Safety Algo)
  age?: number;
  weight?: number; // kg
  height?: number; // cm

  role: UserRole; 
  
  doctorData?: DoctorProfileData;   
  patientData?: PatientProfileData; 
  
  medType?: MedType;
  medForm?: MedForm;
  medUnit?: MedUnit;
  durationMonths: number;
  setupComplete: boolean; 
  
  planType?: 'algorithm' | 'manual'; 
  speedModifier?: number; 
  
  isBanned?: boolean;
  lastActive?: string; 
  progress?: number;   
  streak?: number;     
  
  doctorNotes?: string; 
  isFlagged?: boolean; 
  
  logs?: DailyLog[];
  plan?: PlanDay[];
  inventory?: Inventory;
}

// ============================================================================
// 3. INVENTORY & PLANNING
// ============================================================================

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

// ============================================================================
// 4. CONTENT & CMS
// ============================================================================

export type ArticleCategory = 'medical' | 'motivation' | 'tip' | 'news' | 'announcement';

export interface Article {
  id?: string;
  title: string;
  content: string;
  category: ArticleCategory; 
  isPublished: boolean;
  createdAt: number;
  authorName: string;
  authorId: string;
  authorRole: 'admin' | 'doctor'; 
}

// ============================================================================
// 5. COMMUNITY & CHAT
// ============================================================================

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; 
  creatorName: string;
  createdAt: number;
  language?: string;
  isDoctorRoom?: boolean; 
  doctorId?: string;      
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  role: UserRole; 
  isDoctor?: boolean;
  isAdmin?: boolean;
}

// ============================================================================
// 6. SUPPORT SYSTEM
// ============================================================================

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
  isAdmin: boolean; // Flag to distinguish support staff
}

// ============================================================================
// 7. SECURITY & AUDIT
// ============================================================================

export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

// ============================================================================
// 8. NAVIGATION
// ============================================================================

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  ARTICLES = 'ARTICLES',
  
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  COMMUNITY = 'COMMUNITY',
  SUPPORT = 'SUPPORT',
  
  DOCTOR_DASHBOARD = 'DOCTOR_DASHBOARD', 
  DOCTOR_PATIENTS = 'DOCTOR_PATIENTS',   
  DOCTOR_MESSAGES = 'DOCTOR_MESSAGES',   
  
  ADMIN = 'ADMIN',
  
  WAITING_APPROVAL = 'WAITING_APPROVAL', 
  WAITING_PLAN = 'WAITING_PLAN'          
}