import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase/config';

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
  imageUrl: string;
  organizerId: string;
  organizerName: string;
  organizerImage: string;
  timestamp: string;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  attendees?: Record<string, boolean>;
}

export class EventService {
  static async getAllEvents(): Promise<Event[]> {
    const eventsRef = ref(db, 'events');
    const snapshot = await get(eventsRef);
    if (!snapshot.exists()) return [];
    const eventsObj = snapshot.val();
    return Object.values(eventsObj) as Event[];
  }

  static async getPendingEvents(): Promise<Event[]> {
    const events = await this.getAllEvents();
    return events.filter(event => event.status === 'pending');
  }

  static async updateEventStatus(eventId: string, status: 'approve' | 'reject' | 'flag', moderationNotes?: string): Promise<void> {
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected', 
      'flag': 'flagged'
    };
    const actualStatus = statusMap[status];
    const eventRef = ref(db, `events/${eventId}`);
    await update(eventRef, { status: actualStatus, moderationNotes: moderationNotes || '' });
  }

  static async deleteEvent(eventId: string): Promise<void> {
    const eventRef = ref(db, `events/${eventId}`);
    await remove(eventRef);
  }
} 