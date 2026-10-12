/** Mot chung chi trong bang quan tri (/admin/certificates). */
export interface AdminCertificateRow {
  _id: string;
  certificateNumber?: string;
  verificationCode?: string;
  course?: { _id: string; title: string } | null;
  student?: { _id: string; name: string; email: string } | null;
  courseName?: string;
  instructorName?: string;
  scorePercentage?: number;
  finalScore?: number;
  isValid?: boolean;
  issuedAt?: string;
  completionDate?: string;
}
