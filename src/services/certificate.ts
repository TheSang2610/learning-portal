import { apiRequest } from "./apiHelper";

// ==================== TYPES ====================
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

// ==================== CERTIFICATE API ====================
export const certificateService = {
  // Tạo chứng chỉ sau khi hoàn thành khóa học
  createCertificate: async (enrollmentId: string): Promise<Certificate> => {
    return apiRequest("/certificates", {
      method: "POST",
      body: JSON.stringify({ enrollmentId }),
    });
  },

  // Lấy danh sách chứng chỉ của bản thân
  getMyCertificates: async (): Promise<Certificate[]> => {
    return apiRequest("/certificates/my-certificates");
  },

  // Lấy chi tiết một chứng chỉ
  getCertificateById: async (id: string): Promise<Certificate> => {
    return apiRequest(`/certificates/${id}`);
  },

  // Verify chứng chỉ bằng code công khai
  verifyCertificate: async (code: string): Promise<any> => {
    return apiRequest(`/certificates/verify/${code}`);
  },

  // Cập nhật trạng thái công khai/riêng tư
  updateCertificate: async (
    id: string,
    data: { isPublic: boolean }
  ): Promise<Certificate> => {
    return apiRequest(`/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Lấy chứng chỉ công khai của một user
  getUserPublicCertificates: async (userId: string): Promise<Certificate[]> => {
    return apiRequest(`/certificates/user/${userId}`);
  },
};

// ==================== ACHIEVEMENT API ====================
export const achievementService = {
  // Lấy danh sách thành tích của bản thân
  getMyAchievements: async (): Promise<{
    totalAchievements: number;
    totalPoints: number;
    achievements: Achievement[];
  }> => {
    return apiRequest("/certificates/achievements/my-achievements");
  },

  // Lấy thành tích công khai của một user
  getUserPublicAchievements: async (userId: string): Promise<{
    totalAchievements: number;
    totalPoints: number;
    achievements: Achievement[];
  }> => {
    return apiRequest(`/certificates/achievements/user/${userId}`);
  },

  // Lấy bảng xếp hạng
  getLeaderboard: async (limit: number = 10): Promise<any[]> => {
    return apiRequest(`/certificates/achievements/leaderboard?limit=${limit}`);
  },
};