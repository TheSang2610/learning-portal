import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Voucher.js.
export type DiscountType = "phanTram" | "soTien";

export interface Voucher {
  _id: string;
  ma: string;
  moTa: string;
  loai: DiscountType;
  giaTri: number;
  donToiThieu: number;
  giamToiDa: number | null;
  batDau: string;
  ketThuc: string;
  soLuotToiDa: number | null;
  daDung: number;
  moiNguoiMotLan: boolean;
  apDungKhoa: Array<{ _id: string; title: string }> | string[];
  hoatDong: boolean;
  createdAt: string;
}

export interface VoucherCheckResult {
  // false KHONG phai la loi mang: "ma nay khong dung duoc" la mot ket qua hop
  // le cua viec kiem tra. May chu tra 200 kem `cau` giai thich, nen cho goi
  // khong can bat ngoai le de hien mot thong bao binh thuong.
  ok: boolean;
  cau: string;
  soTienGiam: number;
  phaiTra: number;
  giaGoc: number;
}

/**
 * Kiem ma truoc khi thanh toan. KHONG tru luot nao.
 *
 * Luot chi bi tru luc that su dat don - luc do gui kem `maGiamGia` trong
 * than yeu cau tao don.
 */
export const checkVoucher = async (
  code: string,
  courseId: string,
): Promise<VoucherCheckResult> => {
  return apiRequest("/ma-giam-gia/kiem", {
    method: "POST",
    body: JSON.stringify({ ma: code, courseId }),
  });
};

/* ==========================================================================
   QUAN TRI
   ========================================================================== */

export interface VoucherPage {
  danhSach: Voucher[];
  trang: number;
  tong: number;
  conNua: boolean;
}

export const listVouchers = async (page = 1): Promise<VoucherPage> => {
  return apiRequest(`/ma-giam-gia/quan-tri?trang=${page}`, { method: "GET" });
};

// Than gui len khi tao/sua. `ma` chi dung luc TAO - may chu khong cho doi chuoi
// ma sau khi da phat, vi doi la lam hong moi cho da chia se ma do.
export interface VoucherPayload {
  ma?: string;
  moTa?: string;
  loai: DiscountType;
  giaTri: number;
  donToiThieu?: number;
  giamToiDa?: number | null;
  batDau?: string;
  ketThuc: string;
  soLuotToiDa?: number | null;
  moiNguoiMotLan?: boolean;
  apDungKhoa?: string[];
  hoatDong?: boolean;
}

export const generateCode = async (body: VoucherPayload): Promise<{ ma: Voucher }> => {
  return apiRequest("/ma-giam-gia/quan-tri", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const editVoucher = async (
  id: string,
  body: VoucherPayload,
): Promise<{ ma: Voucher }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const toggleVoucher = async (id: string): Promise<{ ma: Voucher }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}/bat-tat`, { method: "PUT" });
};

export interface Usage {
  _id: string;
  user: { _id: string; name?: string; email?: string } | null;
  course: { _id: string; title: string } | null;
  soTienGiam: number;
  createdAt: string;
}

export const voucherUsage = async (
  id: string,
): Promise<{ danhSach: Usage[]; tongGiam: number }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}/luot-dung`, { method: "GET" });
};
