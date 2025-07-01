import { db } from '../firebase/config';
import { ref, get, update } from 'firebase/database';

export interface UserInfo {
  uid: string;
  email?: string;
  displayName?: string;
  isVerifiedStudent?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  lastLoginAt?: string;
  studentId?: string;
  department?: string;
  year?: number;
  photoURL?: string;
  phoneNumber?: string;
  lastActivity?: string;
  platform?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface UserToken {
  uid: string;
  lastUpdated: string;
  platform: string;
  token: string;
}

export interface UserFilters {
  verificationStatus?: 'all' | 'pending' | 'approved' | 'rejected';
  searchTerm?: string;
  department?: string;
  year?: number;
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  activeUsers: number;
  departments: Record<string, number>;
  years: Record<number, number>;
}

export class UserManagementService {
  static async getAllUsers(): Promise<UserInfo[]> {
    try {
      const [usersSnapshot, tokensSnapshot] = await Promise.all([
        get(ref(db, 'user_info')),
        get(ref(db, 'user_tokens'))
      ]);
      
      const usersObj = usersSnapshot.exists() ? usersSnapshot.val() : {};
      const tokensObj = tokensSnapshot.exists() ? tokensSnapshot.val() : {};
      
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const users: UserInfo[] = Object.entries(usersObj).map(([uid, data]) => {
        const userData = data as any;
        const tokenData = tokensObj[uid];
        
        return {
          uid,
          ...userData,
          lastActivity: tokenData?.lastUpdated || null,
          platform: tokenData?.platform || null,
          isActive: tokenData?.lastUpdated ? new Date(tokenData.lastUpdated) > oneHourAgo : false
        };
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(uid: string): Promise<UserInfo | null> {
    try {
      const userRef = ref(db, `user_info/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return { uid, ...snapshot.val() } as UserInfo;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<UserInfo[]> {
    try {
      const users = await this.getAllUsers();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return users.filter(user => 
        user.displayName?.toLowerCase().includes(lowerSearchTerm) ||
        user.email?.toLowerCase().includes(lowerSearchTerm) ||
        user.studentId?.toLowerCase().includes(lowerSearchTerm) ||
        user.department?.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async filterUsers(filters: UserFilters): Promise<UserInfo[]> {
    try {
      let users = await this.getAllUsers();

      // Apply verification status filter
      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        users = users.filter(user => user.verificationStatus === filters.verificationStatus);
      }

      // Apply search term filter
      if (filters.searchTerm) {
        const lowerSearchTerm = filters.searchTerm.toLowerCase();
        users = users.filter(user => 
          user.displayName?.toLowerCase().includes(lowerSearchTerm) ||
          user.email?.toLowerCase().includes(lowerSearchTerm) ||
          user.studentId?.toLowerCase().includes(lowerSearchTerm) ||
          user.department?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Apply department filter
      if (filters.department) {
        users = users.filter(user => user.department === filters.department);
      }

      // Apply year filter
      if (filters.year) {
        users = users.filter(user => user.year === filters.year);
      }

      return users;
    } catch (error) {
      console.error('Error filtering users:', error);
      throw error;
    }
  }

  static async updateUserVerification(uid: string, isVerified: boolean, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await update(ref(db, `user_info/${uid}`), {
        isVerifiedStudent: isVerified,
        verificationStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user verification:', error);
      throw error;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<UserInfo>): Promise<void> {
    try {
      await update(ref(db, `user_info/${uid}`), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async getUserStats(): Promise<UserStats> {
    try {
      const [users, userTokens] = await Promise.all([
        this.getAllUsers(),
        this.getUserTokens()
      ]);
      
      const stats: UserStats = {
        totalUsers: users.length,
        verifiedUsers: users.filter(u => u.isVerifiedStudent).length,
        pendingUsers: users.filter(u => u.verificationStatus === 'pending').length,
        rejectedUsers: users.filter(u => u.verificationStatus === 'rejected').length,
        activeUsers: this.calculateActiveUsers(userTokens),
        departments: {},
        years: {}
      };

      // Calculate department and year distributions
      users.forEach(user => {
        if (user.department) {
          stats.departments[user.department] = (stats.departments[user.department] || 0) + 1;
        }
        if (user.year) {
          stats.years[user.year] = (stats.years[user.year] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  static async getUserTokens(): Promise<UserToken[]> {
    try {
      const tokensRef = ref(db, 'user_tokens');
      const snapshot = await get(tokensRef);
      const tokensObj = snapshot.exists() ? snapshot.val() : {};
      const tokens: UserToken[] = Object.entries(tokensObj).map(([uid, data]) => ({
        uid,
        ...(data as any)
      }));
      return tokens;
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }
  }

  private static calculateActiveUsers(userTokens: UserToken[]): number {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return userTokens.filter(token => {
      const lastUpdated = new Date(token.lastUpdated);
      return lastUpdated > oneHourAgo;
    }).length;
  }

  static async getDepartments(): Promise<string[]> {
    try {
      const users = await this.getAllUsers();
      const departments = new Set<string>();
      users.forEach(user => {
        if (user.department) {
          departments.add(user.department);
        }
      });
      return Array.from(departments).sort();
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }

  static async getYears(): Promise<number[]> {
    try {
      const users = await this.getAllUsers();
      const years = new Set<number>();
      users.forEach(user => {
        if (user.year) {
          years.add(user.year);
        }
      });
      return Array.from(years).sort((a, b) => a - b);
    } catch (error) {
      console.error('Error getting years:', error);
      throw error;
    }
  }
} 