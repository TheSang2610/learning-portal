import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/MaGiamGia.js.
export type LoaiGiamGia = "phanTram" | "soTien";

export interface MaGiamGia {
  _id: string;
  ma: string;
  moTa: string;
  loai: LoaiGiamGia;
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

export interface KetQuaKiemMa {
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
 * Luot chi bi tru luc that su dat don hoac tru coin - luc do gui kem
 * `maGiamGia` trong than yeu cau cua hai duong do.
 */
export const kiemMaGiamGia = async (
  ma: string,
  courseId: string,
): Promise<KetQuaKiemMa> => {
  return apiRequest("/ma-giam-gia/kiem", {
    method: "POST",
    body: JSON.stringify({ ma, courseId }),
  });
};

/* ==========================================================================
   QUAN TRI
   ========================================================================== */

export interface TrangMaGiamGia {
  danhSach: MaGiamGia[];
  trang: number;
  tong: number;
  conNua: boolean;
}

export const danhSachMa = async (trang = 1): Promise<TrangMaGiamGia> => {
  return apiRequest(`/ma-giam-gia/quan-tri?trang=${trang}`, { method: "GET" });
};

// Than gui len khi tao/sua. `ma` chi dung luc TAO - may chu khong cho doi chuoi
// ma sau khi da phat, vi doi la lam hong moi cho da chia se ma do.
export interface ThanMaGiamGia {
  ma?: string;
  moTa?: string;
  loai: LoaiGiamGia;
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

export const taoMa = async (than: ThanMaGiamGia): Promise<{ ma: MaGiamGia }> => {
  return apiRequest("/ma-giam-gia/quan-tri", {
    method: "POST",
    body: JSON.stringify(than),
  });
};

export const suaMa = async (
  id: string,
  than: ThanMaGiamGia,
): Promise<{ ma: MaGiamGia }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}`, {
    method: "PUT",
    body: JSON.stringify(than),
  });
};

export const batTatMa = async (id: string): Promise<{ ma: MaGiamGia }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}/bat-tat`, { method: "PUT" });
};

export interface LuotDung {
  _id: string;
  user: { _id: string; name?: string; email?: string } | null;
  course: { _id: string; title: string } | null;
  soTienGiam: number;
  createdAt: string;
}

export const luotDungCuaMa = async (
  id: string,
): Promise<{ danhSach: LuotDung[]; tongGiam: number }> => {
  return apiRequest(`/ma-giam-gia/quan-tri/${id}/luot-dung`, { method: "GET" });
};
