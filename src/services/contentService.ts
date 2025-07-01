import { db } from '../firebase/config';
import type { Content } from '../types';
import { ref, get, update, remove } from 'firebase/database';

export class ContentService {
  static async getContent(status?: string): Promise<{ content: Content[], total: number }> {
    try {
      const contentRef = ref(db, 'content');
      const snapshot = await get(contentRef);
      const contentObj = snapshot.exists() ? snapshot.val() : {};
      let content: Content[] = Object.entries(contentObj).map(([id, data]) => ({ id, ...(data as any) }));
      if (status) {
        content = content.filter(item => item.status === status);
      }
      return { content, total: content.length };
    } catch (error) {
      throw error;
    }
  }

  static async getContentById(contentId: string): Promise<Content | null> {
    try {
      const contentRef = ref(db, `content/${contentId}`);
      const snapshot = await get(contentRef);
      if (snapshot.exists()) {
        return { id: contentId, ...snapshot.val() } as Content;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async approveContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await update(ref(db, `content/${contentId}`), {
        status: 'approved',
        updatedAt: new Date().toISOString(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async rejectContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await update(ref(db, `content/${contentId}`), {
        status: 'rejected',
        updatedAt: new Date().toISOString(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async flagContent(contentId: string, _adminId: string, notes?: string): Promise<void> {
    try {
      await update(ref(db, `content/${contentId}`), {
        status: 'flagged',
        updatedAt: new Date().toISOString(),
        moderationNotes: notes
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteContent(contentId: string): Promise<void> {
    try {
      await remove(ref(db, `content/${contentId}`));
    } catch (error) {
      throw error;
    }
  }

  static async getFlaggedContent(): Promise<Content[]> {
    try {
      const contentRef = ref(db, 'content');
      const snapshot = await get(contentRef);
      const contentObj = snapshot.exists() ? snapshot.val() : {};
      const content: Content[] = Object.entries(contentObj)
        .map(([id, data]) => ({ id, ...(data as any) }))
        .filter(item => item.status === 'flagged');
      return content;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingContent(): Promise<Content[]> {
    try {
      const contentRef = ref(db, 'content');
      const snapshot = await get(contentRef);
      const contentObj = snapshot.exists() ? snapshot.val() : {};
      const content: Content[] = Object.entries(contentObj)
        .map(([id, data]) => ({ id, ...(data as any) }))
        .filter(item => item.status === 'pending');
      return content;
    } catch (error) {
      throw error;
    }
  }
} 