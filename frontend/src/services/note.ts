import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/LessonNote.js.
export interface Note {
  _id: string;
  noiDung: string;
  // null khi ghi chu o bai doc (khong co video). Dung 0 lam gia tri "khong co":
  // 0 la giay thu 0, mot moc hop le.
  mocGiay: number | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Ghi chu CUA MINH trong mot bai.
 *
 * May chu luon loc theo nguoi dang dang nhap, va con bat qua cong kiem quyen
 * xem noi dung khoa - khong co cach nao doc ghi chu cua nguoi khac.
 */
export const getNotes = async (
  courseId: string,
  lessonId: string,
): Promise<{ danhSach: Note[] }> => {
  const q = new URLSearchParams({ courseId, lessonId });
  return apiRequest(`/ghi-chu?${q.toString()}`, { method: "GET" });
};

export const addNote = async (tham: {
  courseId: string;
  lessonId: string;
  noiDung: string;
  mocGiay?: number | null;
}): Promise<{ ghiChu: Note }> => {
  return apiRequest("/ghi-chu", {
    method: "POST",
    body: JSON.stringify(tham),
  });
};

export const editNote = async (
  id: string,
  content: string,
): Promise<{ ghiChu: Note }> => {
  return apiRequest(`/ghi-chu/${id}`, {
    method: "PUT",
    body: JSON.stringify({ noiDung: content }),
  });
};

export const deleteNote = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/ghi-chu/${id}`, { method: "DELETE" });
};
