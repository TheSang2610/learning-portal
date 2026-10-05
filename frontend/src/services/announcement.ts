import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Announcement.js.
export type MucDoThongBaoChung = "thong_tin" | "quan_trong";
export type VaiTroNhan = "" | "student" | "instructor";

export interface ThongBaoChung {
  _id: string;
  tieuDe: string;
  noiDung: string;
  duongDan: string;
  mucDo: MucDoThongBaoChung;
  createdAt: string;
  // Cac truong duoi chi co o danh sach quan tri.
  dangHien?: boolean;
  hetHan?: string | null;
  guiChuong?: boolean;
  vaiTro?: VaiTroNhan;
  soNguoiNhan?: number;
}

export interface NoiDungThongBao {
  tieuDe: string;
  noiDung?: string;
  duongDan?: string;
  mucDo?: MucDoThongBaoChung;
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
export const layThongBaoChung = async (): Promise<{ danhSach: ThongBaoChung[] }> => {
  return apiRequest("/thong-bao-chung", { method: "GET" });
};

export const layThongBaoChungQuanTri = async (): Promise<{
  danhSach: ThongBaoChung[];
}> => {
  return apiRequest("/thong-bao-chung/quan-tri", { method: "GET" });
};

/** Gui mot dot thong bao: dai dau trang va/hoac chuong. */
export const guiThongBaoQuanTri = async (
  than: NoiDungThongBao & { guiChuong: boolean; vaiTro?: VaiTroNhan },
): Promise<{ thongBao: ThongBaoChung; daGui: number }> => {
  return apiRequest("/thong-bao-chung/quan-tri", {
    method: "POST",
    body: JSON.stringify(than),
  });
};

/** Sua noi dung: may chu cap nhat ca dai dau trang lan chuong da gui. */
export const suaThongBaoQuanTri = async (
  id: string,
  than: NoiDungThongBao,
): Promise<{ thongBao: ThongBaoChung; daCapNhat: number }> => {
  return apiRequest(`/thong-bao-chung/quan-tri/${id}`, {
    method: "PUT",
    body: JSON.stringify(than),
  });
};

/** Thu hoi: xoa khoi dai dau trang va khoi chuong cua moi nguoi da nhan. */
export const xoaThongBaoQuanTri = async (id: string): Promise<{ daThuHoi: number }> => {
  return apiRequest(`/thong-bao-chung/quan-tri/${id}`, { method: "DELETE" });
};
