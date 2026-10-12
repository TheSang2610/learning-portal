import { apiRequest } from "./apiHelper";

export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";

export interface TransferInfo {
  nganHang: string;
  soTaiKhoan: string;
  tenTaiKhoan: string;
  soTien: number;
  noiDung: string;
  /** null khi máy chủ chưa được khai báo tài khoản nhận tiền. */
  anhQR: string | null;
  daCauHinh: boolean;
}

export interface OrderCourse {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
}

export interface Order {
  code: string;
  status: OrderStatus;
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
  /**
   * Lúc học viên bấm "Tôi đã chuyển khoản". `null` = chưa bấm.
   *
   * Không phải bằng chứng đã trả tiền — chỉ là lời khai, dùng để xếp thứ tự
   * việc cho quản trị và để giao diện biết đã báo rồi thì đừng cho bấm lại.
   */
  daBaoChuyenKhoanLuc: string | null;
  createdAt: string;
  course: OrderCourse | null;
  /**
   * Đơn thanh toán cả giỏ hàng: mọi khóa trong đơn (đã gồm `course`).
   * Đơn mua lẻ để mảng rỗng — khi đó chỉ hiện `course`.
   */
  courses: OrderCourse[];
  chuyenKhoan: TransferInfo | null;

  /** Giá trước khi giảm. Bằng `amount` khi không dùng mã. */
  giaGoc: number;
  maGiamGia: string | null;
  soTienGiam: number;
}

/**
 * Tạo đơn cho một khóa học có phí.
 *
 * Gọi lại nhiều lần cho cùng khóa học thì máy chủ trả về ĐÚNG đơn đang chờ chứ
 * không sinh đơn mới — nếu không, người dùng bấm Mua hai lần sẽ có hai mã khác
 * nhau và chuyển tiền theo mã cũ thì đơn mới không bao giờ khớp.
 */
export const createOrder = async (
  courseId: string,
  voucher?: string,
): Promise<{ order: Order }> =>
  apiRequest("/orders", {
    method: "POST",
    // Chi gui `maGiamGia` khi that su co: gui chuoi rong thi may chu vao nhanh
    // ap ma roi tra 400 "Bạn chưa nhập mã giảm giá" cho mot nguoi khong he
    // dinh dung ma nao.
    body: JSON.stringify(voucher ? { courseId, maGiamGia: voucher } : { courseId }),
  });

/**
 * Tạo MỘT đơn cho cả giỏ hàng → một mã QR, một số tiền.
 *
 * Mã giảm giá áp vào đúng một khóa trong giỏ (`courseIdGiam`), giống ô nhập mã
 * trên trang giỏ hàng. Gọi lại với đúng bộ khóa đó thì máy chủ trả lại đơn đang
 * chờ thay vì sinh mã mới.
 */
export const createCartOrder = async (
  courseIds: string[],
  discount?: { maGiamGia: string; courseIdGiam: string },
): Promise<{ order: Order }> =>
  apiRequest("/orders/gio-hang", {
    method: "POST",
    body: JSON.stringify(
      discount?.maGiamGia ? { courseIds, ...discount } : { courseIds },
    ),
  });

export const getOrderByCode = async (code: string): Promise<{ order: Order }> =>
  apiRequest(`/orders/${encodeURIComponent(code)}`);

export const cancelOrder = async (code: string): Promise<{ message: string }> =>
  apiRequest(`/orders/${encodeURIComponent(code)}/cancel`, { method: "PUT" });

/**
 * Học viên báo đã chuyển khoản → máy chủ gửi mail cho quản trị đối chiếu.
 *
 * KHÔNG đổi đơn sang "đã thanh toán": đây là lời khai của người mua, chỉ quản
 * trị nhìn thấy tiền trong sao kê mới được xác nhận.
 */
export const reportTransfer = async (
  code: string,
): Promise<{
  message: string;
  daBaoChuyenKhoanLuc: string;
  daQuaHan: boolean;
  daGuiMail: boolean;
  mailDaCauHinh: boolean;
}> => apiRequest(`/orders/${encodeURIComponent(code)}/da-chuyen`, { method: "PUT" });

// ---------------------------------------------------------------------------
// Phần dành cho quản trị
// ---------------------------------------------------------------------------

export interface AdminOrder {
  /** Lúc học viên bấm "Tôi đã chuyển khoản". `null` = chưa bấm. */
  daBaoChuyenKhoanLuc?: string | null;
  _id: string;
  code: string;
  status: OrderStatus;
  amount: number;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  note: string;
  course: { _id: string; title: string; slug: string; price: number } | null;
  /** Đơn giỏ hàng: mọi khóa trong đơn. Đơn mua lẻ: mảng rỗng hoặc không có. */
  courses?: { _id: string; title: string; slug: string; price: number }[];
  student: { _id: string; name: string; email: string; avatar?: string } | null;
  confirmedBy: { _id: string; name: string } | null;
}

export const getAdminOrders = async (options?: {
  status?: OrderStatus | "";
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  orders: AdminOrder[];
  page: number;
  limit: number;
  total: number;
  pendingCount: number;
  /** Số đơn CÓ NGƯỜI ĐANG CHỜ: đã bấm báo chuyển khoản, đang đợi đối chiếu. */
  daBaoCount: number;
}> => {
  const q = new URLSearchParams();
  if (options?.status) q.set("status", options.status);
  if (options?.search) q.set("search", options.search);
  if (options?.page) q.set("page", String(options.page));
  if (options?.limit) q.set("limit", String(options.limit));
  const extension = q.toString();
  return apiRequest(`/admin/orders${extension ? `?${extension}` : ""}`);
};

export const confirmOrder = async (
  code: string,
  note?: string,
): Promise<{ message: string }> =>
  apiRequest(`/admin/orders/${encodeURIComponent(code)}/confirm`, {
    method: "PUT",
    body: JSON.stringify({ note: note ?? "" }),
  });

export const rejectOrder = async (
  code: string,
  note?: string,
): Promise<{ message: string }> =>
  apiRequest(`/admin/orders/${encodeURIComponent(code)}/reject`, {
    method: "PUT",
    body: JSON.stringify({ note: note ?? "" }),
  });

/** 1399000 -> "1.399.000đ", đúng cách viết tiền Việt. */
export const formatMoney = (amount: number): string =>
  `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
