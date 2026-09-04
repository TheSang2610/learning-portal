import { apiRequest } from "./apiHelper";

export type TrangThaiDon = "pending" | "paid" | "cancelled" | "expired";

export interface ThongTinChuyenKhoan {
  nganHang: string;
  soTaiKhoan: string;
  tenTaiKhoan: string;
  soTien: number;
  noiDung: string;
  /** null khi máy chủ chưa được khai báo tài khoản nhận tiền. */
  anhQR: string | null;
  daCauHinh: boolean;
}

export interface KhoaHocTrongDon {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
}

export interface DonHang {
  code: string;
  status: TrangThaiDon;
  amount: number;
  expiresAt: string;
  /**
   * Số giây còn lại, do MÁY CHỦ tính.
   *
   * Không tự trừ `expiresAt` cho đồng hồ máy người dùng: máy đặt sai giờ hoặc
   * sai múi giờ là đếm ra con số vô nghĩa — có người thấy đơn hết hạn ngay khi
   * vừa mở, có người thấy còn vài tiếng.
   */
  secondsLeft: number;
  paidAt: string | null;
  createdAt: string;
  course: KhoaHocTrongDon | null;
  chuyenKhoan: ThongTinChuyenKhoan | null;
}

/**
 * Tạo đơn cho một khóa học có phí.
 *
 * Gọi lại nhiều lần cho cùng khóa học thì máy chủ trả về ĐÚNG đơn đang chờ chứ
 * không sinh đơn mới — nếu không, người dùng bấm Mua hai lần sẽ có hai mã khác
 * nhau và chuyển tiền theo mã cũ thì đơn mới không bao giờ khớp.
 */
export const taoDonHang = async (courseId: string): Promise<{ order: DonHang }> =>
  apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });

export const layDonTheoMa = async (code: string): Promise<{ order: DonHang }> =>
  apiRequest(`/orders/${encodeURIComponent(code)}`);

export const layDonCuaToi = async (): Promise<{
  orders: DonHang[];
  page: number;
  limit: number;
  total: number;
}> => apiRequest("/orders/my");

export const huyDon = async (code: string): Promise<{ message: string }> =>
  apiRequest(`/orders/${encodeURIComponent(code)}/cancel`, { method: "PUT" });

// ---------------------------------------------------------------------------
// Phần dành cho quản trị
// ---------------------------------------------------------------------------

export interface DonHangAdmin {
  _id: string;
  code: string;
  status: TrangThaiDon;
  amount: number;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  note: string;
  course: { _id: string; title: string; slug: string; price: number } | null;
  student: { _id: string; name: string; email: string; avatar?: string } | null;
  confirmedBy: { _id: string; name: string } | null;
}

export const layDonHangAdmin = async (tuyChon?: {
  status?: TrangThaiDon | "";
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  orders: DonHangAdmin[];
  page: number;
  limit: number;
  total: number;
  pendingCount: number;
}> => {
  const q = new URLSearchParams();
  if (tuyChon?.status) q.set("status", tuyChon.status);
  if (tuyChon?.search) q.set("search", tuyChon.search);
  if (tuyChon?.page) q.set("page", String(tuyChon.page));
  if (tuyChon?.limit) q.set("limit", String(tuyChon.limit));
  const duoi = q.toString();
  return apiRequest(`/admin/orders${duoi ? `?${duoi}` : ""}`);
};

export const xacNhanDon = async (
  code: string,
  note?: string,
): Promise<{ message: string }> =>
  apiRequest(`/admin/orders/${encodeURIComponent(code)}/confirm`, {
    method: "PUT",
    body: JSON.stringify({ note: note ?? "" }),
  });

export const tuChoiDon = async (
  code: string,
  note?: string,
): Promise<{ message: string }> =>
  apiRequest(`/admin/orders/${encodeURIComponent(code)}/reject`, {
    method: "PUT",
    body: JSON.stringify({ note: note ?? "" }),
  });

/** 1399000 -> "1.399.000đ", đúng cách viết tiền Việt. */
export const dinhDangTien = (soTien: number): string =>
  `${Number(soTien || 0).toLocaleString("vi-VN")}đ`;
