import { apiRequest } from "./apiHelper";
import type { ThongTinChuyenKhoan } from "./order";

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

/* ------------------------------ Nap coin -------------------------------- */
//
// Hoc vien tu dat yeu cau nap -> chuyen khoan theo ma -> quan tri doi chieu sao
// ke roi xac nhan -> coin moi vao vi. Bam "toi da chuyen khoan" KHONG cong coin,
// do chi la loi khai.

export type TrangThaiNap = "pending" | "paid" | "cancelled" | "expired";

export interface YeuCauNap {
  code: string;
  status: TrangThaiNap;
  soCoin: number;
  /** Số tiền phải chuyển, theo ĐỒNG. */
  amount: number;
  expiresAt: string;
  /** Số giây còn lại, do MÁY CHỦ tính — xem ghi chú ở `DonHang.secondsLeft`. */
  secondsLeft: number;
  paidAt: string | null;
  daBaoChuyenKhoanLuc: string | null;
  createdAt: string;
  chuyenKhoan: ThongTinChuyenKhoan | null;
}

export interface YeuCauNapAdmin {
  _id: string;
  code: string;
  status: TrangThaiNap;
  soCoin: number;
  amount: number;
  expiresAt: string;
  paidAt: string | null;
  daBaoChuyenKhoanLuc: string | null;
  createdAt: string;
  note: string;
  student: { _id: string; name: string; email: string; avatar?: string } | null;
  confirmedBy: { _id: string; name: string } | null;
}

export const taoYeuCauNap = (soCoin: number): Promise<{ yeuCau: YeuCauNap }> =>
  apiRequest("/coin/nap", { method: "POST", body: JSON.stringify({ soCoin }) });

// Truoc day co them layYeuCauDangCho() doc yeu cau dang cho cua chinh minh.
// Da bo: trang nap coin khong khoi phuc ma cu khi reload nua (roi khoi trang la
// mat ma, phai tao lai), nen khong con cho nao goi toi.

export const layYeuCauNap = (code: string): Promise<{ yeuCau: YeuCauNap }> =>
  apiRequest(`/coin/nap/${code}`);

export const huyYeuCauNap = (code: string): Promise<{ message: string }> =>
  apiRequest(`/coin/nap/${code}/huy`, { method: "PUT" });

// daGuiMail: may chu co gui duoc mail bao quan tri khong. Sai thi giao dien
// phai nhac hoc vien lien he bang duong khac - ngoi cho mot cai mail khong bao
// gio den la cach chac chan nhat de mat khach.
export const baoDaChuyenNap = (
  code: string,
): Promise<{ message: string; daGuiMail: boolean; mailDaCauHinh: boolean }> =>
  apiRequest(`/coin/nap/${code}/da-chuyen`, { method: "PUT" });

export const layDanhSachNapAdmin = (tuyChon?: {
  status?: TrangThaiNap | "";
  page?: number;
  limit?: number;
}): Promise<{
  yeuCau: YeuCauNapAdmin[];
  total: number;
  page: number;
  pages: number;
}> => {
  const t = new URLSearchParams();
  if (tuyChon?.status) t.set("status", tuyChon.status);
  if (tuyChon?.page) t.set("page", String(tuyChon.page));
  if (tuyChon?.limit) t.set("limit", String(tuyChon.limit));
  const q = t.toString();
  return apiRequest(`/coin/quan-tri/nap${q ? `?${q}` : ""}`);
};

export const xacNhanNapAdmin = (
  code: string,
  note?: string,
): Promise<{ message: string; soDuCoin: number }> =>
  apiRequest(`/coin/quan-tri/nap/${code}/confirm`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });

export const tuChoiNapAdmin = (
  code: string,
  note?: string,
): Promise<{ message: string }> =>
  apiRequest(`/coin/quan-tri/nap/${code}/huy`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });
