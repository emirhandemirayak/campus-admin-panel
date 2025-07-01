import { db } from '../firebase/config';
import type { User, VerificationRequest } from '../types';
import { ref, get, update, remove } from 'firebase/database';

export class UserService {
  static async getUsers(): Promise<{ users: User[], total: number }> {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const usersObj = snapshot.exists() ? snapshot.val() : {};
      const users: User[] = Object.entries(usersObj).map(([id, data]) => ({ id, ...(data as any) }));
      return { users, total: users.length };
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return { id: userId, ...snapshot.val() } as User;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserVerification(userId: string, isVerified: boolean, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await update(ref(db, `users/${userId}`), {
        isVerified,
        verificationStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'moderator' | 'user'): Promise<void> {
    try {
      await update(ref(db, `users/${userId}`), {
        role,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await remove(ref(db, `users/${userId}`));
    } catch (error) {
      throw error;
    }
  }

  static async getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const requestsRef = ref(db, 'verificationRequests');
      const snapshot = await get(requestsRef);
      const requestsObj = snapshot.exists() ? snapshot.val() : {};
      const requests: VerificationRequest[] = Object.entries(requestsObj).map(([id, data]) => ({ id, ...(data as any) }));
      return requests;
    } catch (error) {
      throw error;
    }
  }

  static async approveVerification(requestId: string, adminId: string, notes?: string): Promise<void> {
    try {
      const requestRef = ref(db, `verificationRequests/${requestId}`);
      const requestSnap = await get(requestRef);
      if (!requestSnap.exists()) throw new Error('Verification request not found');
      const request = requestSnap.val() as VerificationRequest;
      await update(requestRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminId,
        notes
      });
      await this.updateUserVerification(request.userId, true, 'approved');
    } catch (error) {
      throw error;
    }
  }

  static async rejectVerification(requestId: string, adminId: string, notes?: string): Promise<void> {
    try {
      const requestRef = ref(db, `verificationRequests/${requestId}`);
      const requestSnap = await get(requestRef);
      if (!requestSnap.exists()) throw new Error('Verification request not found');
      const request = requestSnap.val() as VerificationRequest;
      await update(requestRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminId,
        notes
      });
      await this.updateUserVerification(request.userId, false, 'rejected');
    } catch (error) {
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const usersObj = snapshot.exists() ? snapshot.val() : {};
      const users: User[] = Object.entries(usersObj)
        .map(([id, data]) => ({ id, ...(data as any) }))
        .filter(user => user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
      return users;
    } catch (error) {
      throw error;
    }
  }
} 