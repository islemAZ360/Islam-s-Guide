export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
// New: Medication Form & Unit
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  medType: MedType;
  
  // New Fields for Dosage Form
  medForm?: MedForm;
  medUnit?: MedUnit;
  
  durationMonths: number;
  setupComplete: boolean;
  
  planType?: 'algorithm' | 'manual';
  isBanned?: boolean;
  isAdmin?: boolean;
  lastActive?: string; 
  progress?: number;   
  streak?: number;     
  
  doctorNotes?: string; 
  isFlagged?: boolean; 
}

export interface Inventory {
  // We keep the logic "Boxes" vs "Single units" but concepts change for liquid
  // For liquid: boxes = bottles, pillsPerBox = ml per bottle, etc.
  boxes: number;
  pillsPerBox: number; // Represents: Pills per box OR Volume (ml) per bottle
  loosePills: number;  // Represents: Loose pills OR Loose ml remaining
  totalPills: number;  // Represents: Total amount in Base Unit (mg or ml)
}

export interface ManualPhase {
  dose: number;
  days: number;
  interval?: number; 
}

export interface PlanParams {
  currentDailyDose: number; 
  inventory: Inventory;
  startDate: string; 
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

// ... (No changes needed for Chat/Admin interfaces below)

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; 
  creatorName: string;
  language: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isAdmin?: boolean; 
}

export interface AdminMessage {
  id: string;
  text: string;
  fromAdmin: boolean;
  timestamp: number;
  read: boolean;
}

export interface Article {
  id?: string;
  title: string;
  content: string;
  category: 'tip' | 'medical' | 'motivation';
  isPublished: boolean;
  createdAt: number;
  authorName: string;
}

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

export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  ARTICLES = 'ARTICLES'
}