import { apiRequest } from "./apiHelper";

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  instructor: string | { _id: string; name: string; email: string };
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
  level: string;
}

export const getCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses");
};

export const getCourseById = async (id: string): Promise<Course> => {
  return apiRequest(`/courses/${id}`);
};

export const getCourseBySlug = async (slug: string): Promise<Course | { error: string }> => {
  return apiRequest(`/courses/slug/${slug}`);
};

export const createCourse = async (courseData: CreateCourseData): Promise<Course> => {
  return apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
};

export const updateCourse = async (id: string, courseData: Partial<CreateCourseData & { isPublished: boolean }>): Promise<Course> => {
  return apiRequest(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(courseData),
  });
};

export const enrollInCourse = async (id: string): Promise<{ message: string; enrollment: any }> => {
  return apiRequest(`/courses/${id}/enroll`, {
    method: "POST",
  });
};