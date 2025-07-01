export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'user';
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastLoginAt: Date;
  studentId?: string;
  department?: string;
  year?: number;
}

export interface Content {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'post' | 'comment' | 'announcement';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
  reportCount?: number;
  moderationNotes?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  studentId: string;
  department: string;
  year: number;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalContent: number;
  flaggedContent: number;
  activeUsers: number;
  pendingEvents: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'moderator';
  permissions: string[];
} 