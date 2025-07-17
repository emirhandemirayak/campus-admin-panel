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

// Kulüp gönderisi tipi
export interface ClubPost {
  postId: string; // Gönderi ID'si
  clubId: string; // Kulüp ID'si
  authorId: string; // Yazarın kullanıcı ID'si
  textContent: string; // Gönderi metni
  mediaUrls: string[]; // Medya URL'leri
  link?: string; // (Opsiyonel) Bağlantı
  timestamp: string; // Oluşturulma zamanı (ISO string)
}

// Kulüp üyesi tipi
export interface ClubMember {
  userId: string; // Kullanıcı ID'si
  name: string; // Kullanıcı adı
  role: string; // Rol (örn: 'Yönetici', 'Üye', ...)
  status: 'active' | 'kicked' | 'reported'; // Üye durumu
}

// Kulüp tipi
export interface Club {
  clubId: string; // Kulüp ID'si
  name: string; // Kulüp adı
  bio: string; // Kulüp açıklaması
  logoUrl: string; // Logo URL'si
  memberList: ClubMember[]; // Üye listesi
  events: string[]; // Etkinlik ID listesi
  badgeRoles: string[]; // Rozet/rol listesi
}

// Etkinlik tipi
export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  category: string;
  type: string; // Added for event type
  imageUrl: string;
  mediaUrls: string[]; // Added for multiple media
  link?: string; // Optional event link
  quota?: number | string; // Optional quota, can be 'limitsiz'
  price?: string; // Optional price
  organizerId: string;
  organizerName: string;
  organizerImage: string;
  timestamp: string;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  attendees?: Record<string, boolean>;
} 