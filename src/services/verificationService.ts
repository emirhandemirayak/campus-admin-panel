import { db } from '../firebase/config';
import { ref, get, update } from 'firebase/database';

export interface ManualVerificationRequest {
  id: string;
  userId: string;
  barcode: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface UserInfo {
  uid: string;
  email?: string;
  displayName?: string;
  isVerifiedStudent?: boolean;
  [key: string]: any;
}

export class VerificationService {
  static async getManualVerificationRequests(): Promise<ManualVerificationRequest[]> {
    try {
      const requestsRef = ref(db, 'manual_verification_requests');
      const snapshot = await get(requestsRef);
      const requestsObj = snapshot.exists() ? snapshot.val() : {};
      const requests: ManualVerificationRequest[] = Object.entries(requestsObj)
        .map(([id, data]) => ({ id, ...(data as any) }))
        .filter(request => request.status === 'pending');
      return requests;
    } catch (error) {
      console.error('Error fetching manual verification requests:', error);
      throw error;
    }
  }

  static async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const userRef = ref(db, `user_info/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return { uid: userId, ...snapshot.val() } as UserInfo;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  static async approveVerification(requestId: string, adminId: string): Promise<void> {
    try {
      // Get the verification request
      const requestRef = ref(db, `manual_verification_requests/${requestId}`);
      const requestSnap = await get(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Verification request not found');
      }
      
      const request = requestSnap.val() as ManualVerificationRequest;
      
      // Update the verification request status
      await update(requestRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminId
      });
      
      // Update user's isVerifiedStudent status to true
      const userInfoRef = ref(db, `user_info/${request.userId}`);
      await update(userInfoRef, {
        isVerifiedStudent: true,
        verificationStatus: 'approved',
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId
      });
      
      console.log(`Verification approved for user ${request.userId}`);
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  static async rejectVerification(requestId: string, adminId: string): Promise<void> {
    try {
      // Get the verification request
      const requestRef = ref(db, `manual_verification_requests/${requestId}`);
      const requestSnap = await get(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Verification request not found');
      }
      
      const request = requestSnap.val() as ManualVerificationRequest;
      
      // Update the verification request status
      await update(requestRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminId
      });
      
      // Update user's isVerifiedStudent status to false
      const userInfoRef = ref(db, `user_info/${request.userId}`);
      await update(userInfoRef, {
        isVerifiedStudent: false,
        verificationStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: adminId
      });
      
      console.log(`Verification rejected for user ${request.userId}`);
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  static async getPendingVerificationCount(): Promise<number> {
    try {
      const requests = await this.getManualVerificationRequests();
      return requests.length;
    } catch (error) {
      console.error('Error getting pending verification count:', error);
      return 0;
    }
  }
} 