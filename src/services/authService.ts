import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase/config';
import type { AdminUser } from '../types';

export class AuthService {
  static async loginAdmin(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin using Realtime Database
      const adminRef = ref(db, `admins/${user.uid}`);
      const adminSnap = await get(adminRef);
      if (!adminSnap.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      return adminSnap.val() as AdminUser;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  static onAuthStateChange(callback: (user: AdminUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const adminRef = ref(db, `admins/${firebaseUser.uid}`);
          const adminSnap = await get(adminRef);
          if (adminSnap.exists()) {
            callback(adminSnap.val() as AdminUser);
          } else {
            callback(null);
          }
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  static async getCurrentAdmin(): Promise<AdminUser | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const adminRef = ref(db, `admins/${user.uid}`);
      const adminSnap = await get(adminRef);
      if (adminSnap.exists()) {
        return adminSnap.val() as AdminUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async getAdminUserInfo(): Promise<any | null> {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const userInfoRef = ref(db, `user_info/${user.uid}`);
      const userInfoSnap = await get(userInfoRef);
      if (userInfoSnap.exists()) {
        return userInfoSnap.val();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
} 