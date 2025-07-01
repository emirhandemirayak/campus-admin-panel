import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { AdminUser } from '../types';

export class AuthService {
  static async loginAdmin(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      return adminDoc.data() as AdminUser;
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
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            callback(adminDoc.data() as AdminUser);
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
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        return adminDoc.data() as AdminUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
} 