import { apiRequest } from "./apiHelper";

export interface LessonData {
  _id?: string;
  courseId?: string;
  title: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

export const addLesson = async (formData: FormData) => {
  return apiRequest("/lessons", {
    method: "POST",
    body: formData,
  });
};

export const getLessonById = async (lessonId: string) => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "GET",
  });
};

export const updateLesson = async (lessonId: string, formData: FormData) => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteLesson = async (lessonId: string) => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "DELETE",
  });
};

export const getLessonBySlug = async (courseSlug: string, lessonSlug: string): Promise<LessonData> => {
  return apiRequest(`/lessons/course/${courseSlug}/lesson/${lessonSlug}`, {
    method: "GET",
  });
};

export const getLessonsByCourseId = async (courseId: string): Promise<LessonData[]> => {
  return apiRequest(`/lessons?courseId=${courseId}`, {
    method: "GET",
  });
};