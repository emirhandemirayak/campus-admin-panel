import { db } from '../firebase/config';
import { ref, get, set } from 'firebase/database';
import { storage } from '../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { ClubPost } from '../types';

// Kulüp gönderi servisi - Realtime Database
export class ClubPostService {
  // Gönderi oluştur
  static async createPost(post: ClubPost): Promise<void> {
    const postRef = ref(db, `clubPosts/${post.clubId}/${post.postId}`);
    await set(postRef, post);
  }

  // Kulübe ait tüm gönderileri getir
  static async getPostsByClubId(clubId: string): Promise<ClubPost[]> {
    const postsRef = ref(db, `clubPosts/${clubId}`);
    const snapshot = await get(postsRef);
    if (!snapshot.exists()) return [];
    const postsObj = snapshot.val();
    return Object.values(postsObj) as ClubPost[];
  }

  // Gönderi ID'si ile gönderi getir
  static async getPostById(clubId: string, postId: string): Promise<ClubPost | null> {
    const postRef = ref(db, `clubPosts/${clubId}/${postId}`);
    const snapshot = await get(postRef);
    return snapshot.exists() ? (snapshot.val() as ClubPost) : null;
  }

  // Gönderi güncelle
  static async updatePost(clubId: string, postId: string, updatedPost: ClubPost): Promise<void> {
    const postRef = ref(db, `clubPosts/${clubId}/${postId}`);
    await set(postRef, updatedPost);
  }
}

// Utility to upload files to Firebase Storage and return their download URLs
export async function uploadFilesToStorage(files: File[], pathPrefix: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const fileRef = storageRef(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }
  return urls;
} 