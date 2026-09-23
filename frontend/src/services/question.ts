import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/LessonQuestion.js.
export type VaiTroTraLoi = "hocVien" | "giangVien" | "quanTri";

export interface NguoiDungGon {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface TraLoiHoiDap {
  _id: string;
  user: NguoiDungGon | null;
  vaiTro: VaiTroTraLoi;
  noiDung: string;
  createdAt: string;
}

export interface CauHoiHoiDap {
  _id: string;
  student: NguoiDungGon | null;
  noiDung: string;
  traLoi: TraLoiHoiDap[];
  daGiaiQuyet: boolean;
  createdAt: string;
}

export interface TrangHoiDap {
  danhSach: CauHoiHoiDap[];
  trang: number;
  tong: number;
  conNua: boolean;
  // Vai tro cua CHINH minh o khoa nay, do may chu tra ve. Dung cai nay de quyet
  // dinh hien nut gi, dung tu suy tu `role` cua tai khoan: mot giang vien day
  // khoa khac thi o khoa nay chi la hoc vien.
  vaiTro: VaiTroTraLoi;
}

/**
 * Danh sach cau hoi cua mot bai.
 *
 * May chu kiem duocXemNoiDung() truoc khi tra ve bat cu gi, va kiem ca chuyen
 * bai co thuoc khoa nay khong. Nem 403 kem requiresEnrollment neu chua ghi danh.
 */
export const layCauHoi = async (
  courseId: string,
  lessonId: string,
  trang = 1,
): Promise<TrangHoiDap> => {
  const q = new URLSearchParams({ courseId, lessonId, trang: String(trang) });
  return apiRequest(`/hoi-dap?${q.toString()}`, { method: "GET" });
};

export const dangCauHoi = async (tham: {
  courseId: string;
  lessonId: string;
  noiDung: string;
}): Promise<{ cauHoi: CauHoiHoiDap }> => {
  return apiRequest("/hoi-dap", {
    method: "POST",
    body: JSON.stringify(tham),
  });
};

/**
 * Tra loi mot cau hoi.
 *
 * Khong gui kem courseId/lessonId: may chu lay tu chinh cau hoi. Gui tu day thi
 * nguoi goi tu khai mot khoa ma ho co quyen roi tra loi vao cau hoi cua khoa
 * khac — xem ghi chu trong hoiDapController.
 */
export const traLoiCauHoi = async (
  id: string,
  noiDung: string,
): Promise<{ cauHoi: CauHoiHoiDap }> => {
  return apiRequest(`/hoi-dap/${id}/tra-loi`, {
    method: "POST",
    body: JSON.stringify({ noiDung }),
  });
};

export const xoaCauHoi = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/hoi-dap/${id}`, { method: "DELETE" });
};

// Cau hoi trong hang doi cua giang vien mang them ten khoa va ten bai - hai thu
// ma man hinh trong bai hoc khong can (luc do da biet dang o bai nao) nhung o
// day thi bat buoc, vi danh sach tron cau hoi cua moi khoa.
export interface CauHoiChoGiangVien extends CauHoiHoiDap {
  course: { _id: string; title: string; slug?: string } | null;
  lesson: { _id: string; title: string } | null;
}

export interface TrangChoGiangVien {
  danhSach: CauHoiChoGiangVien[];
  trang: number;
  tong: number;
  conNua: boolean;
  chiChuaXong: boolean;
}

/**
 * Hang doi cau hoi chua tra loi trong cac khoa minh day.
 *
 * May chu chan pham vi ngay trong truy van (chi khoa co instructor la minh),
 * nen khong co cach nao doc duoc cau hoi cua khoa nguoi khac day.
 */
export const layCauHoiChoGiangVien = async (
  trang = 1,
  tatCa = false,
): Promise<TrangChoGiangVien> => {
  const q = new URLSearchParams({ trang: String(trang) });
  if (tatCa) q.set("tatCa", "1");

  return apiRequest(`/hoi-dap/cho-giang-vien?${q.toString()}`, { method: "GET" });
};
