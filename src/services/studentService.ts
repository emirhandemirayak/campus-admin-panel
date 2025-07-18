// src/services/studentService.ts
// Service to fetch students by universityId
import type { ClubMember } from '../types';

export const StudentService = {
  /**
   * Fetch all students for a given universityId
   * @param universityId string
   * @returns Promise<{ userId: string; name: string }[]>
   */
  async getStudentsByUniversity(universityId: string): Promise<{ userId: string; name: string }[]> {
    // TODO: Replace with real API call
    // Example mock data for demonstration
    if (!universityId) return [];
    return [
      { userId: '1', name: 'Ali Veli' },
      { userId: '2', name: 'Ayşe Fatma' },
      { userId: '3', name: 'Mehmet Can' },
      { userId: '4', name: 'Zeynep Yılmaz' },
    ];
  },
};
