import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Announcement.js.
export type AnnouncementLevel = "thong_tin" | "quan_trong";
export type RecipientRole = "" | "student" | "instructor";

export interface Announcement {
  _id: string;
  tieuDe: string;
  noiDung: string;
  duongDan: string;
  mucDo: AnnouncementLevel;
  createdAt: string;
  // Cac truong duoi chi co o danh sach quan tri.
  dangHien?: boolean;
  hetHan?: string | null;
  guiChuong?: boolean;
  vaiTro?: RecipientRole;
  soNguoiNhan?: number;
}

export interface AnnouncementContent {
  tieuDe: string;
  noiDung?: string;
  duongDan?: string;
  mucDo?: AnnouncementLevel;
  // Chuoi ISO hoac rong = hien toi khi go tay.
  hetHan?: string;
  hienDauTrang?: boolean;
}

/**
 * Thong bao cong khai dang hien, cho dai o dau trang.
 *
 * Duong nay KHONG can dang nhap - khach vang lai cung thay. apiRequest giu ket
 * qua GET 30 giay, du cho viec doi trang lien tuc khong goi lai nhieu lan.
 */
export const getAnnouncements = async (): Promise<{ danhSach: Announcement[] }> => {
  return apiRequest("/thong-bao-chung", { method: "GET" });
};

export const getAdminAnnouncements = async (): Promise<{
  danhSach: Announcement[];
}> => {
  return apiRequest("/thong-bao-chung/quan-tri", { method: "GET" });
};

/** Gui mot dot thong bao: dai dau trang va/hoac chuong. */
export const sendAdminAnnouncement = async (
  body: AnnouncementContent & { guiChuong: boolean; vaiTro?: RecipientRole },
): Promise<{ thongBao: Announcement; daGui: number }> => {
  return apiRequest("/thong-bao-chung/quan-tri", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/** Sua noi dung: may chu cap nhat ca dai dau trang lan chuong da gui. */
export const editAdminAnnouncement = async (
  id: string,
  body: AnnouncementContent,
): Promise<{ thongBao: Announcement; daCapNhat: number }> => {
  return apiRequest(`/thong-bao-chung/quan-tri/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

/** Thu hoi: xoa khoi dai dau trang va khoi chuong cua moi nguoi da nhan. */
export const deleteAdminAnnouncement = async (
  id: string,
): Promise<{ daThuHoi: number }> => {
  return apiRequest(`/thong-bao-chung/quan-tri/${id}`, { method: "DELETE" });
};
