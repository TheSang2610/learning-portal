import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Notification.js. Doi enum ben do thi phai doi ca
// o day, neu khong giao dien nhan mot loai no khong biet ve bieu tuong gi.
export type LoaiThongBao =
  | "don_duoc_duyet"
  | "don_bi_tu_choi"
  | "khoa_duoc_mo"
  | "chung_nhan"
  | "tra_loi_hoi_dap"
  | "coin_duoc_cong"
  | "he_thong";

export interface ThongBao {
  _id: string;
  loai: LoaiThongBao;
  tieuDe: string;
  noiDung: string;
  duongDan: string;
  daDoc: boolean;
  createdAt: string;
}

export interface TrangThongBao {
  danhSach: ThongBao[];
  chuaDoc: number;
  trang: number;
  tong: number;
  conNua: boolean;
}

/**
 * Danh sach thong bao cua chinh minh.
 *
 * May chu luon loc theo nguoi dang dang nhap, khong nhan id nguoi dung tu day —
 * nen khong co cach nao doc nham thong bao cua nguoi khac.
 */
export const layThongBao = async (trang = 1): Promise<TrangThongBao> => {
  return apiRequest(`/thong-bao?trang=${trang}`, { method: "GET" });
};

/**
 * Chi lay so chua doc, cho cai cham do tren chuong.
 *
 * Duong rieng chu khong dung layThongBao() roi doc `chuaDoc`: cai nay goi moi
 * lan doi trang, con danh sach day du thi chi khi nguoi dung bam chuong. Ben
 * may chu no la mot phep dem tren index, khong phai mot luot doc du lieu.
 *
 * apiRequest giu ket qua GET 30 giay. Voi con so nay thi do la dieu MUON: doi
 * trang lien tuc khong sinh ra hang loat luot goi, ma cham nhat 30 giay la co
 * so moi. Cac thao tac danh dau da doc deu la PUT nen tu don bo dem — con so
 * cap nhat ngay sau khi bam, khong phai cho het 30 giay.
 */
export const demChuaDoc = async (): Promise<{ chuaDoc: number }> => {
  return apiRequest("/thong-bao/chua-doc", { method: "GET" });
};

export const danhDauDaDoc = async (id: string): Promise<{ thongBao: ThongBao }> => {
  return apiRequest(`/thong-bao/${id}/doc`, { method: "PUT" });
};

export const danhDauTatCa = async (): Promise<{ daDanhDau: number }> => {
  return apiRequest("/thong-bao/doc-het", { method: "PUT" });
};

/**
 * Gui thong bao he thong cho nhieu nguoi (chi quan tri).
 *
 * `vaiTro` rong nghia la gui cho moi hoc vien VA giang vien. May chu khong bao
 * gio gui cho admin - thong bao he thong la thu quan tri viet ra.
 */
export const guiThongBaoHeThong = async (than: {
  tieuDe: string;
  noiDung?: string;
  duongDan?: string;
  vaiTro?: "student" | "instructor" | "";
}): Promise<{ daGui: number }> => {
  return apiRequest("/thong-bao/quan-tri/gui", {
    method: "POST",
    body: JSON.stringify(than),
  });
};
