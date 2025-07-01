import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User, VerificationRequest } from '../types';

export class UserService {
  static async getUsers(_page: number = 1, pageSize: number = 20): Promise<{ users: User[], total: number }> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const users: User[] = [];
      
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });
      
      // Get total count (simplified - in production you might want to use a counter)
      const totalSnapshot = await getDocs(usersRef);
      const total = totalSnapshot.size;
      
      return { users, total };
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserVerification(userId: string, isVerified: boolean, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified,
        verificationStatus: status,
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'moderator' | 'user'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      throw error;
    }
  }

  static async getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requests: VerificationRequest[] = [];
      
      snapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        } as VerificationRequest);
      });
      
      return requests;
    } catch (error) {
      throw error;
    }
  }

  static async approveVerification(requestId: string, adminId: string, notes?: string): Promise<void> {
    try {
      const requestRef = doc(db, 'verificationRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Verification request not found');
      }
      
      const request = requestDoc.data() as VerificationRequest;
      
      // Update verification request
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes
      });
      
      // Update user verification status
      await this.updateUserVerification(request.userId, true, 'approved');
    } catch (error) {
      throw error;
    }
  }

  static async rejectVerification(requestId: string, adminId: string, notes?: string): Promise<void> {
    try {
      const requestRef = doc(db, 'verificationRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Verification request not found');
      }
      
      const request = requestDoc.data() as VerificationRequest;
      
      // Update verification request
      await updateDoc(requestRef, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes
      });
      
      // Update user verification status
      await this.updateUserVerification(request.userId, false, 'rejected');
    } catch (error) {
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const users: User[] = [];
      
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });
      
      return users;
    } catch (error) {
      throw error;
    }
  }
} 