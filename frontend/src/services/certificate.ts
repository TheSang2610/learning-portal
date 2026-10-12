import { apiRequest } from "./apiHelper";

// GET /certificates/verify/:code khong tra ve ban ghi Certificate day du ma mot
// ban rut gon danh cho nguoi tra cuu cong khai - xem verifyCertificate trong
// certificateController.
export interface VerifyCertificateResponse {
  valid: true;
  certificate: {
    certificateNumber: string;
    student: string;
    course: string;
    completionDate: string;
    issuedAt: string;
    instructorName: string;
    signedBy: string;
  };
}

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

/**
 * Địa chỉ tệp PDF của một chứng nhận.
 *
 * Trả về đường dẫn TƯƠNG ĐỐI để trình duyệt đi qua `rewrites()` của Next —
 * cùng gốc nên cookie phiên là first-party, máy chủ mới nhận ra người đang mở
 * là ai. Nối thẳng sang tên miền backend thì chứng nhận riêng tư sẽ trả 403 vì
 * cookie không được gửi kèm.
 */
export const certificatePdfUrl = (id: string) => `/api/certificates/${id}/pdf`;

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

  verifyCertificate: async (code: string): Promise<VerifyCertificateResponse> => {
    return apiRequest(`/certificates/verify/${code}`);
  },

  updateCertificate: async (
    id: string,
    data: { isPublic: boolean },
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
