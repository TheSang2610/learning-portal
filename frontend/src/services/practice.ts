import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/PracticeAttempt.js.
export interface AttemptSummary {
  _id: string;
  deId: string;
  soDung: number;
  soCau: number;
  /** So giay da lam */
  giay: number;
  createdAt: string;
}

export interface Attempt extends AttemptSummary {
  /** Vi tri cau (theo thu tu da hien) trong file de, dem tu 0 */
  cau: number[];
  /** Thu tu dap an da hien cua tung cau; [] = giu nguyen */
  dapAn: number[][];
  /** Lua chon cua nguoi lam, theo thu tu dap an DA HIEN */
  chon: number[][];
}

export type AttemptSubmission = Omit<Attempt, "_id" | "createdAt" | "soCau">;

/** Luu mot lan lam bai - chi cho nguoi da dang nhap. */
export const saveAttempt = async (
  lesson: AttemptSubmission,
): Promise<{ _id: string; createdAt: string }> =>
  apiRequest("/luyen-tap/bai-lam", { method: "POST", body: JSON.stringify(lesson) });

/** Cac lan lam bai CUA TOI trong mot de, moi nhat truoc. */
export const attemptHistory = async (
  quizId: string,
): Promise<{ danhSach: AttemptSummary[] }> =>
  apiRequest(`/luyen-tap/bai-lam?${new URLSearchParams({ deId: quizId }).toString()}`, {
    method: "GET",
  });

export const attemptDetail = async (id: string): Promise<{ bai: Attempt }> =>
  apiRequest(`/luyen-tap/bai-lam/${encodeURIComponent(id)}`, { method: "GET" });
