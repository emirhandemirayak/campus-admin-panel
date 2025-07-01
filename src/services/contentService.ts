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
import type { Content } from '../types';

export class ContentService {
  static async getContent(_page: number = 1, pageSize: number = 20, status?: string): Promise<{ content: Content[], total: number }> {
    try {
      const contentRef = collection(db, 'content');
      let q = query(
        contentRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      if (status) {
        q = query(
          contentRef,
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const snapshot = await getDocs(q);
      const content: Content[] = [];
      
      snapshot.forEach((doc) => {
        content.push({
          id: doc.id,
          ...doc.data()
        } as Content);
      });
      
      const totalSnapshot = await getDocs(contentRef);
      const total = totalSnapshot.size;
      
      return { content, total };
    } catch (error) {
      throw error;
    }
  }

  static async getContentById(contentId: string): Promise<Content | null> {
    try {
      const contentDoc = await getDoc(doc(db, 'content', contentId));
      if (contentDoc.exists()) {
        return { id: contentDoc.id, ...contentDoc.data() } as Content;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async approveContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'content', contentId), {
        status: 'approved',
        updatedAt: new Date(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async rejectContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'content', contentId), {
        status: 'rejected',
        updatedAt: new Date(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async flagContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'content', contentId), {
        status: 'flagged',
        updatedAt: new Date(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteContent(contentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'content', contentId));
    } catch (error) {
      throw error;
    }
  }

  static async getFlaggedContent(): Promise<Content[]> {
    try {
      const contentRef = collection(db, 'content');
      const q = query(
        contentRef,
        where('status', '==', 'flagged'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const content: Content[] = [];
      
      snapshot.forEach((doc) => {
        content.push({
          id: doc.id,
          ...doc.data()
        } as Content);
      });
      
      return content;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingContent(): Promise<Content[]> {
    try {
      const contentRef = collection(db, 'content');
      const q = query(
        contentRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const content: Content[] = [];
      
      snapshot.forEach((doc) => {
        content.push({
          id: doc.id,
          ...doc.data()
        } as Content);
      });
      
      return content;
    } catch (error) {
      throw error;
    }
  }
} 