import { apiRequest } from "./apiHelper";
import type { Lesson } from "./lesson.api";
import type { Enrollment } from "./enrollment.api";

export type ThamChieuChuDe = string | { _id?: string; $oid?: string; name?: string };

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  instructor: string | { _id: string; name: string; email: string };
  provider?:
    string | { _id: string; name: string; type: "company" | "university"; logo: string };
  // category trong model la MOT MANG ObjectId (backend/src/models/Course.js),
  // du ten truong o so it. Tuy endpoint ma no ve duoi dang mang id, mang doi
  // tuong da populate, hoac - voi ban ghi cu nhap thang bang Compass - dang
  // { $oid }. Kieu cu chi khai mot object don, ma typeof [] cung la "object",
  // nen doc thang .name hay ._id tra ve undefined ma khong ai hay: dung the la
  // bo loc theo chu de o /courses tra ve rong suot mot thoi gian.
  // Doc bang layIdChuDe / tenChuDe ben duoi, dung doc thang.
  category: ThamChieuChuDe | ThamChieuChuDe[];
  level: string;
  // Tuy endpoint: /courses tra ve mang ObjectId, /courses/slug/:slug populate
  // day du bai hoc. Noi goi phai tu phan biet.
  lessons: string[] | Lesson[];
  studentsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isPopular?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
}

// Doc chu de cua khoa hoc: chap nhan ca ba hinh dang o tren, luon tra ve mang.
const chuanHoaChuDe = (tho: Course["category"]): Exclude<ThamChieuChuDe, string>[] => {
  if (!tho) return [];
  const ds = Array.isArray(tho) ? tho : [tho];
  return ds.map((m) => (typeof m === "string" ? { _id: m } : m)).filter(Boolean);
};

export const layIdChuDe = (tho: Course["category"]): string[] =>
  chuanHoaChuDe(tho)
    .map((m) => m._id ?? m.$oid ?? "")
    .filter(Boolean);

// Chi co ten khi endpoint do populate chu de; khong thi tra ve mang rong.
export const tenChuDe = (tho: Course["category"]): string[] =>
  chuanHoaChuDe(tho)
    .map((m) => m.name ?? "")
    .filter(Boolean);

// instructor khi la ObjectId dang chuoi, khi la doi tuong da populate - chi lay
// duoc ten o truong hop thu hai.
export const tenGiangVien = (gv: Course["instructor"] | undefined): string =>
  gv && typeof gv === "object" ? (gv.name ?? "") : "";

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

export interface HomeSectionsResponse {
  success: boolean;
  data: {
    mostPopular: Course[];
    trendingNow: Course[];
    newReleases: Course[];
  };
}

export interface UpdateCourseTagsData {
  isPopular?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
}

export const getCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses");
};

export interface HomeSectionsResponse {
  success: boolean;
  data: {
    mostPopular: Course[];
    trendingNow: Course[];
    newReleases: Course[];
  };
}

export const getHomeSections = async (): Promise<HomeSectionsResponse> => {
  return apiRequest("/courses/home-sections");
};

export const getInstructorCourses = async (): Promise<InstructorCoursesResponse> => {
  return apiRequest("/courses/instructor", {
    method: "GET",
  });
};

export const getCourseById = async (id: string): Promise<Course> => {
  return apiRequest(`/courses/${id}`);
};

export const getCourseBySlug = async (
  slug: string,
): Promise<Course | { error: string }> => {
  return apiRequest(`/courses/slug/${slug}`);
};

export const createCourse = async (formData: FormData): Promise<Course> => {
  return apiRequest("/courses", {
    method: "POST",
    body: formData,
  });
};

export const updateCourse = async (id: string, formData: FormData): Promise<Course> => {
  return apiRequest(`/courses/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteCourseInstructor = async (
  id: string,
): Promise<{ message: string }> => {
  return apiRequest(`/courses/${id}`, {
    method: "DELETE",
  });
};

export const updateCoursePublishStatus = async (
  id: string,
  isPublished: boolean,
): Promise<{ message: string; course: Course }> => {
  return apiRequest(`/admin/courses/${id}/publish`, {
    method: "PUT",
    body: JSON.stringify({ isPublished }),
  });
};

// PATCH /courses/:id/tags boc trong { success, message, data } chu khong tra
// ve ban ghi khoa hoc tran nhu createCourse hay updateCourse.
export const updateCourseTags = async (
  id: string,
  tagsData: UpdateCourseTagsData,
): Promise<{ success: boolean; message: string; data: Course }> => {
  return apiRequest(`/courses/${id}/tags`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tagsData),
  });
};

export const enrollInCourse = async (
  id: string,
): Promise<{ message: string; enrollment: Enrollment }> => {
  return apiRequest(`/courses/${id}/enroll`, {
    method: "POST",
  });
};

export const getAdminPopularCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/most-popular");
};

export const getAdminTrendingCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/trending-now");
};

export const getAdminNewReleasesCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/new-releases");
};
