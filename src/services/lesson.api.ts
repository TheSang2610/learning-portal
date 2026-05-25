import { apiRequest } from "./apiHelper";

// Định nghĩa kiểu dữ liệu Lesson phục vụ cho toàn hệ thống Frontend
export interface LessonData {
  _id?: string;
  courseId?: string;
  title: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

/**
 * 1. Thêm bài học mới (Giữ nguyên logic gốc của bạn)
 */
export const addLesson = async (data: {
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}) => {
  return apiRequest("/lessons", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * 2. Lấy thông tin chi tiết của 1 bài học bằng ID
 * @route GET /api/lessons/:id
 */
export const getLessonById = async (lessonId: string) => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "GET",
  });
};

/**
 * 3. Cập nhật thông tin bài học
 * @route PUT /api/lessons/:id
 */
export const updateLesson = async (lessonId: string, data: LessonData) => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const getLessonBySlug = async (courseSlug: string, lessonSlug: string): Promise<LessonData> => {
  return apiRequest(`/lessons/course/${courseSlug}/lesson/${lessonSlug}`, {
    method: "GET",
  });
};