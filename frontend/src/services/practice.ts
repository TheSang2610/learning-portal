import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/PracticeAttempt.js.
export interface BaiLamTomTat {
  _id: string;
  deId: string;
  soDung: number;
  soCau: number;
  /** So giay da lam */
  giay: number;
  createdAt: string;
}

export interface BaiLam extends BaiLamTomTat {
  /** Vi tri cau (theo thu tu da hien) trong file de, dem tu 0 */
  cau: number[];
  /** Thu tu dap an da hien cua tung cau; [] = giu nguyen */
  dapAn: number[][];
  /** Lua chon cua nguoi lam, theo thu tu dap an DA HIEN */
  chon: number[][];
}

export type BaiLamGuiLen = Omit<BaiLam, "_id" | "createdAt" | "soCau">;

/** Luu mot lan lam bai - chi cho nguoi da dang nhap. */
export const luuBaiLam = async (
  bai: BaiLamGuiLen,
): Promise<{ _id: string; createdAt: string }> =>
  apiRequest("/luyen-tap/bai-lam", { method: "POST", body: JSON.stringify(bai) });

/** Cac lan lam bai CUA TOI trong mot de, moi nhat truoc. */
export const lichSuBaiLam = async (deId: string): Promise<{ danhSach: BaiLamTomTat[] }> =>
  apiRequest(`/luyen-tap/bai-lam?${new URLSearchParams({ deId }).toString()}`, {
    method: "GET",
  });

export const chiTietBaiLam = async (id: string): Promise<{ bai: BaiLam }> =>
  apiRequest(`/luyen-tap/bai-lam/${encodeURIComponent(id)}`, { method: "GET" });
