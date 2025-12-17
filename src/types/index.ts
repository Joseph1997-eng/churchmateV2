// TypeScript interfaces for Church Mate app

export interface BibleBook {
  id: number;
  name: string;
  chapters: number;
}

export interface BibleVerse {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Hymn {
  id: string;
  number: number;
  title: string;
  lyrics: string;
  category?: string;
  createdAt?: Date;
}

export interface BulletinItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'announcement' | 'event' | 'prayer' | 'general';
  priority?: 'high' | 'medium' | 'low';
}

export interface AppConfig {
  isDatabaseInitialized: boolean;
  lastSyncDate?: Date;
  theme: 'light' | 'dark';
}

// ============================================
// Authentication Types (Phase 2A)
// ============================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface ChurchSettings {
  id: 'main';
  churchName: string;
  logoURL: string;
  iconURL: string;
  splashURL: string;
  primaryColor: string;
  secondaryColor: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface AdminLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
}

// ============================================
// Bible Search & Bookmarks Types (Phase 3A)
// ============================================

export interface Bookmark {
  id: number;
  userId: string;
  verseId: number;
  verse: BibleVerse;
  note?: string;
  createdAt: number;
}

export interface SearchResult extends BibleVerse {
  highlightedText?: string;
}
