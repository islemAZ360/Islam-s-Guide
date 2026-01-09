export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;

export interface UserProfile {
  uid?: string; // Firebase UID
  email: string;
  name: string;
  medType: MedType;
  durationMonths: number;
  setupComplete: boolean;
  planType?: 'algorithm' | 'manual';
  isBanned?: boolean;
  isAdmin?: boolean;
  lastActive?: string;
  progress?: number; // For ranking
  streak?: number;   // For ranking
}

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

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; // UID
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

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  ADMIN = 'ADMIN'
}