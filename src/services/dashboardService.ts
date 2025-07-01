import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import type { DashboardStats } from '../types';

export class DashboardService {
  /**
   * Fetch all dashboard statistics from Firebase
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        totalContent,
        flaggedContent,
        activeUsers,
        pendingEvents
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getVerifiedUsers(),
        this.getPendingVerificationCount(),
        this.getTotalContent(),
        this.getFlaggedContent(),
        this.getActiveUsers(),
        this.getPendingEvents()
      ]);

      return {
        totalUsers,
        verifiedUsers,
        pendingVerifications,
        totalContent,
        flaggedContent,
        activeUsers,
        pendingEvents
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get total number of users from user_info
   */
  private static async getTotalUsers(): Promise<number> {
    try {
      const usersRef = ref(db, 'user_info');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        return Object.keys(snapshot.val()).length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }
  }

  /**
   * Get number of verified users from user_info
   */
  private static async getVerifiedUsers(): Promise<number> {
    try {
      const usersRef = ref(db, 'user_info');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.values(users).filter((user: any) => user.isVerifiedStudent === true).length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching verified users:', error);
      return 0;
    }
  }

  /**
   * Get number of pending verification requests
   */
  private static async getPendingVerificationCount(): Promise<number> {
    try {
      const verificationsRef = ref(db, 'verification_requests');
      const snapshot = await get(verificationsRef);
      
      if (snapshot.exists()) {
        const requests = snapshot.val();
        return Object.values(requests).filter((request: any) => request.status === 'pending').length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return 0;
    }
  }

  /**
   * Get total content count from posts and comments
   */
  private static async getTotalContent(): Promise<number> {
    try {
      const [postsSnapshot, commentsSnapshot] = await Promise.all([
        get(ref(db, 'posts')),
        get(ref(db, 'comments'))
      ]);
      
      let totalContent = 0;
      
      if (postsSnapshot.exists()) {
        totalContent += Object.keys(postsSnapshot.val()).length;
      }
      
      if (commentsSnapshot.exists()) {
        totalContent += Object.keys(commentsSnapshot.val()).length;
      }
      
      return totalContent;
    } catch (error) {
      console.error('Error fetching total content:', error);
      return 0;
    }
  }

  /**
   * Get flagged content count
   */
  private static async getFlaggedContent(): Promise<number> {
    try {
      const [postsSnapshot, commentsSnapshot] = await Promise.all([
        get(ref(db, 'posts')),
        get(ref(db, 'comments'))
      ]);
      
      let flaggedContent = 0;
      
      if (postsSnapshot.exists()) {
        const posts = postsSnapshot.val();
        flaggedContent += Object.values(posts).filter((post: any) => 
          post.status === 'flagged' || post.reportCount > 0
        ).length;
      }
      
      if (commentsSnapshot.exists()) {
        const comments = commentsSnapshot.val();
        flaggedContent += Object.values(comments).filter((comment: any) => 
          comment.status === 'flagged' || comment.reportCount > 0
        ).length;
      }
      
      return flaggedContent;
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      return 0;
    }
  }

  /**
   * Get active users count (users active in the last hour)
   */
  private static async getActiveUsers(): Promise<number> {
    try {
      const tokensRef = ref(db, 'user_tokens');
      const snapshot = await get(tokensRef);
      
      if (snapshot.exists()) {
        const tokens = snapshot.val();
        const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour ago
        
        return Object.values(tokens).filter((token: any) => 
          token.lastUpdated && token.lastUpdated > oneHourAgo
        ).length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching active users:', error);
      return 0;
    }
  }

  /**
   * Get pending events count
   */
  private static async getPendingEvents(): Promise<number> {
    try {
      const eventsRef = ref(db, 'events');
      const snapshot = await get(eventsRef);
      
      if (snapshot.exists()) {
        const events = snapshot.val();
        return Object.values(events).filter((event: any) => 
          !event.status || event.status === 'pending'
        ).length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching pending events:', error);
      return 0;
    }
  }

  /**
   * Get real-time stats updates (for future use with real-time listeners)
   */
  static async subscribeToStatsUpdates(callback: (stats: DashboardStats) => void) {
    // This could be implemented with onValue listeners for real-time updates
    // For now, we'll use polling approach
    const updateStats = async () => {
      try {
        const stats = await this.getDashboardStats();
        callback(stats);
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    };

    // Initial load
    await updateStats();

    // Set up polling every 30 seconds
    const interval = setInterval(updateStats, 30000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
} 