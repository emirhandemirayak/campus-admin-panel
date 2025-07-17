import { db } from '../firebase/config';
import { ref, get, set, update } from 'firebase/database';
import type { Club, ClubMember } from '../types';

// Kulüp servisi - Realtime Database
export class ClubService {
  // Kulüp oluştur
  static async createClub(club: Club): Promise<void> {
    const clubRef = ref(db, `clubs/${club.clubId}`);
    await set(clubRef, club);
  }

  // Kulüp bilgisi getir
  static async getClubById(clubId: string): Promise<Club | null> {
    const clubRef = ref(db, `clubs/${clubId}`);
    const snapshot = await get(clubRef);
    return snapshot.exists() ? (snapshot.val() as Club) : null;
  }

  // Kulüp güncelle
  static async updateClub(clubId: string, data: Partial<Club>): Promise<void> {
    const clubRef = ref(db, `clubs/${clubId}`);
    await update(clubRef, data);
  }

  // Üye ekle
  static async addMember(clubId: string, member: ClubMember): Promise<void> {
    const memberRef = ref(db, `clubs/${clubId}/memberList/${member.userId}`);
    await set(memberRef, member);
  }

  // Üye rolünü güncelle
  static async updateMemberRole(clubId: string, userId: string, role: string): Promise<void> {
    const memberRef = ref(db, `clubs/${clubId}/memberList/${userId}/role`);
    await set(memberRef, role);
  }

  // Üyeyi at (kick)
  static async kickMember(clubId: string, userId: string): Promise<void> {
    const memberRef = ref(db, `clubs/${clubId}/memberList/${userId}/status`);
    await set(memberRef, 'kicked');
  }

  // Üyeyi şikayet et (report)
  static async reportMember(clubId: string, userId: string): Promise<void> {
    const memberRef = ref(db, `clubs/${clubId}/memberList/${userId}/status`);
    await set(memberRef, 'reported');
  }
}

// Üniversiteleri getir (düzeltildi: array yapısı, Adı, Logo, Şehir, Adres, Web Sitesi, Üniversite Türü)
export async function getAllUniversities(): Promise<{
  universityId: string;
  name: string;
  logo: string;
  city: string;
  type: string;
  address: string;
  website: string;
}[]> {
  const unisRef = ref(db, 'Universities');
  const snapshot = await get(unisRef);
  if (!snapshot.exists()) return [];
  const arr = snapshot.val();
  return Object.entries(arr).map(([idx, data]: any) => ({
    universityId: idx,
    name: data['Adı'],
    logo: data['Logo'],
    city: data['Şehir'],
    type: data['Üniversite Türü'],
    address: data['Adres'],
    website: data['Web Sitesi'],
  }));
} 