import { apiRequest } from "./apiHelper";

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  instructor: string | { _id: string; name: string; email: string };
  provider?: string | { _id: string; name: string; type: "company" | "university"; logo: string }
  category: string | { _id: string; name: string };
  level: string;
  lessons: string[] | any[];
  studentsCount: number; // Đổi từ mảng sang số đếm theo backend mới
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  providerId?: string;
  level: string;
}

export interface InstructorCoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
}

export const getCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses");
};

export const getInstructorCourses = async (): Promise<InstructorCoursesResponse> => {
  return apiRequest("/courses/instructor", {
    method: "GET",
  });
};

export const getCourseById = async (id: string): Promise<Course> => {
  return apiRequest(`/courses/${id}`);
};

export const getCourseBySlug = async (slug: string): Promise<Course | { error: string }> => {
  return apiRequest(`/courses/slug/${slug}`);
};

export const createCourse = async (formData: FormData) => {
  return apiRequest("/courses", {
    method: "POST",
    body: formData, // Nhận FormData trực tiếp
  });
};

export const updateCourse = async (id: string, formData: FormData) => {
  return apiRequest(`/courses/${id}`, {
    method: "PUT",
    body: formData, // Nhận FormData trực tiếp
  });
};

export const deleteCourseInstructor = async (id: string) => {
  return apiRequest(`/courses/${id}`, {
    method: "DELETE",
  });
};

export const updateCoursePublishStatus = async (id: string, isPublished: boolean) => {
  return apiRequest(`/admin/courses/${id}/publish`, {
    method: "PUT",
    body: JSON.stringify({ isPublished }),
  });
};

export const enrollInCourse = async (id: string): Promise<{ message: string; enrollment: any }> => {
  return apiRequest(`/courses/${id}/enroll`, {
    method: "POST",
  });
};