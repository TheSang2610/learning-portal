import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/LessonNote.js.
export interface GhiChu {
  _id: string;
  noiDung: string;
  // null khi ghi chu o bai doc (khong co video). Dung 0 lam gia tri "khong co":
  // 0 la giay thu 0, mot moc hop le.
  mocGiay: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface GhiChuTongHop extends GhiChu {
  course: { _id: string; title: string; slug?: string } | null;
  lesson: { _id: string; title: string } | null;
}

/**
 * Ghi chu CUA MINH trong mot bai.
 *
 * May chu luon loc theo nguoi dang dang nhap, va con bat qua cong kiem quyen
 * xem noi dung khoa - khong co cach nao doc ghi chu cua nguoi khac.
 */
export const layGhiChu = async (
  courseId: string,
  lessonId: string,
): Promise<{ danhSach: GhiChu[] }> => {
  const q = new URLSearchParams({ courseId, lessonId });
  return apiRequest(`/ghi-chu?${q.toString()}`, { method: "GET" });
};

export const themGhiChu = async (tham: {
  courseId: string;
  lessonId: string;
  noiDung: string;
  mocGiay?: number | null;
}): Promise<{ ghiChu: GhiChu }> => {
  return apiRequest("/ghi-chu", {
    method: "POST",
    body: JSON.stringify(tham),
  });
};

export const suaGhiChu = async (
  id: string,
  noiDung: string,
): Promise<{ ghiChu: GhiChu }> => {
  return apiRequest(`/ghi-chu/${id}`, {
    method: "PUT",
    body: JSON.stringify({ noiDung }),
  });
};

export const xoaGhiChu = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/ghi-chu/${id}`, { method: "DELETE" });
};

export const ghiChuCuaToi = async (
  trang = 1,
): Promise<{
  danhSach: GhiChuTongHop[];
  trang: number;
  tong: number;
  conNua: boolean;
}> => {
  return apiRequest(`/ghi-chu/cua-toi?trang=${trang}`, { method: "GET" });
};
