import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Lesson.js. Gan het la tuy chon vi tuy endpoint
// ma backend chi tra ve mot phan: vi du lessonProgress.lesson chi populate
// title, duration, order, content, videoUrl.
export interface LessonData {
  _id?: string;
  courseId?: string;
  title: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
  // La CHUOI trong model chu khong phai so, vi du "12:30".
  duration?: string;
  order?: number;
  // May chu dat co nay khi nguoi xem CHUA duoc mo khoa hoc: luc do videoUrl,
  // content va documentUrl bi cat het, chi con muc luc. Xem
  // backend/src/utils/quyenNoiDung.js.
  biKhoa?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Bai hoc do may chu tra ve thi LUON co _id. LessonData de _id tuy chon vi no
// con dung lam kieu dau vao luc tao bai moi, luc do chua co id nao ca. Tach ra
// hai ten de moi cho doc khong phai kiem tra _id vo ich.
export type Lesson = LessonData & { _id: string };

export const addLesson = async (formData: FormData): Promise<Lesson> => {
  return apiRequest("/lessons", {
    method: "POST",
    body: formData,
  });
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "GET",
  });
};

export const updateLesson = async (
  lessonId: string,
  formData: FormData,
): Promise<Lesson> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteLesson = async (lessonId: string): Promise<{ message: string }> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "DELETE",
  });
};

export const getLessonBySlug = async (
  courseSlug: string,
  lessonSlug: string,
): Promise<LessonData> => {
  return apiRequest(`/lessons/course/${courseSlug}/lesson/${lessonSlug}`, {
    method: "GET",
  });
};

export const getLessonsByCourseId = async (courseId: string): Promise<LessonData[]> => {
  return apiRequest(`/lessons?courseId=${courseId}`, {
    method: "GET",
  });
};
