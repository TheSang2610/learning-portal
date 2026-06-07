import { apiRequest } from "./apiHelper";

export interface Certificate {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
  };
  certificateNumber: string;
  title: string;
  description: string;
  completionDate: string;
  courseName: string;
  instructorName: string;
  courseDuration: string;
  finalScore: number;
  scorePercentage: number;
  isPublic: boolean;
  verificationUrl: string;
  verificationCode: string;
  issuedAt: string;
  expiresAt?: string;
  isValid: boolean;
  signedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  _id: string;
  student: string;
  type: string;
  title: string;
  description: string;
  badgeImage: string;
  relatedCourse?: {
    _id: string;
    title: string;
  };
  level: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  isPublic: boolean;
  unlockedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const certificateService = {
  createCertificate: async (enrollmentId: string): Promise<Certificate> => {
    return apiRequest("/certificates", {
      method: "POST",
      body: JSON.stringify({ enrollmentId }),
    });
  },

  getMyCertificates: async (): Promise<Certificate[]> => {
    return apiRequest("/certificates/my-certificates");
  },

  getCertificateById: async (id: string): Promise<Certificate> => {
    return apiRequest(`/certificates/${id}`);
  },

  verifyCertificate: async (code: string): Promise<any> => {
    return apiRequest(`/certificates/verify/${code}`);
  },

  updateCertificate: async (
    id: string,
    data: { isPublic: boolean }
  ): Promise<Certificate> => {
    return apiRequest(`/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getUserPublicCertificates: async (userId: string): Promise<Certificate[]> => {
    return apiRequest(`/certificates/user/${userId}`);
  },
};

export const achievementService = {
  getMyAchievements: async (): Promise<{
    totalAchievements: number;
    totalPoints: number;
    achievements: Achievement[];
  }> => {
    return apiRequest("/certificates/achievements/my-achievements");
  },

  getUserPublicAchievements: async (userId: string): Promise<{
    totalAchievements: number;
    totalPoints: number;
    achievements: Achievement[];
  }> => {
    return apiRequest(`/certificates/achievements/user/${userId}`);
  },

  getLeaderboard: async (limit: number = 10): Promise<any[]> => {
    return apiRequest(`/certificates/achievements/leaderboard?limit=${limit}`);
  },
};