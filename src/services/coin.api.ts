import { apiRequest } from "./apiHelper";

// Vi coin cua hoc vien.
//
// Ty gia phai TRUNG voi backend/src/utils/coin.js. De o day mot ban rieng vi
// giao dien can bao gia truoc khi bam (khong the goi may chu cho tung the khoa
// hoc), nhung may chu VAN tinh lai khi tru tien - ban o day chi de hien thi,
// khong bao gio la nguon quyet dinh.
export const DONG_MOI_COIN = 1000;

/** Gia tien -> so coin. Lam tron LEN, giong het ham giaRaCoin ben may chu. */
export const giaRaCoin = (gia: number | undefined | null): number => {
  const so = Number(gia);
  if (!Number.isFinite(so) || so <= 0) return 0;
  return Math.ceil(so / DONG_MOI_COIN);
};

export interface GiaoDichCoin {
  _id: string;
  loai: "nap" | "thuHoi" | "mua" | "tangKhoa";
  /** Co dau: duong la vao vi, am la ra khoi vi. */
  soCoin: number;
  soDuSau: number;
  khoa?: { _id: string; title: string; slug?: string } | null;
  ghiChu?: string;
  nguoiTao?: { _id: string; name: string } | null;
  createdAt: string;
}

export interface ThongTinVi {
  hocVien: { _id: string; name: string; email?: string; avatar?: string };
  soDuCoin: number;
  /** So du quy ra dong, chi de hien thi cho de hinh dung. */
  soDuQuyDoi: number;
  /** Tong cac lan NAP, khong tru phan da tieu. */
  tongDaNap: number;
  soGiaoDich: number;
  nhatKy: GiaoDichCoin[];
}

/* ------------------------------- Hoc vien ------------------------------- */

export const layViCuaToi = (): Promise<ThongTinVi> => apiRequest("/coin/cua-toi");

export const muaBangCoin = (
  courseId: string,
): Promise<{ message: string; daTru: number; soDuCoin: number }> =>
  apiRequest(`/coin/mua/${courseId}`, { method: "POST" });

/* -------------------------------- Quan tri ------------------------------- */

export const layViHocVien = (userId: string): Promise<ThongTinVi> =>
  apiRequest(`/coin/quan-tri/${userId}`);

/** So am la thu hoi. */
export const napCoin = (
  userId: string,
  soCoin: number,
  ghiChu?: string,
): Promise<{ message: string; soDuCoin: number }> =>
  apiRequest(`/coin/quan-tri/${userId}`, {
    method: "POST",
    body: JSON.stringify({ soCoin, ghiChu }),
  });

export const tangKhoa = (
  userId: string,
  courseId: string,
  ghiChu?: string,
): Promise<{ message: string }> =>
  apiRequest(`/coin/quan-tri/${userId}/tang-khoa`, {
    method: "POST",
    body: JSON.stringify({ courseId, ghiChu }),
  });
