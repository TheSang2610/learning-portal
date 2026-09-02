import { apiRequest } from "./apiHelper";
import type { Certificate } from "./certificate";
import type { Course } from "./course";
import type { Review } from "./review";
import type { Enrollment } from "./enrollment.api";
import type { User } from "./userApi";

// Cac kieu duoi day chep theo dung hinh dang adminController tra ve.
// Ba endpoint danh sach deu boc trong { <ten>, pagination }.
export interface AdminPagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface DashboardStatistics {
  users: { total: number; students: number; instructors: number; admins: number };
  courses: { total: number; published: number; draft: number };
  enrollments: { total: number; active: number; completed: number };
  certificates: { total: number; valid: number };
  reviews: { total: number; averageRating: number };
  quizzes: { total: number };
}

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  return apiRequest("/admin/dashboard/statistics");
};

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: boolean;
}

// Backend phan trang mac dinh limit=10 -> bat buoc truyen tham so, neu khong se mat user.
export interface AdminUsersResponse {
  users: User[];
  pagination: AdminPagination;
}

export const getAllUsersAdmin = async (
  q: AdminUserQuery = {},
): Promise<AdminUsersResponse> => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.search) p.set("search", q.search);
  if (q.role) p.set("role", q.role);
  if (q.status !== undefined) p.set("status", String(q.status));
  const qs = p.toString();
  return apiRequest(`/admin/users${qs ? "?" + qs : ""}`);
};

// Ba endpoint sua user deu tra ve { message, user } chu khong tra ve user tran.
export interface AdminUserMutationResponse {
  message: string;
  user: User;
}

export const createUserAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: boolean;
  phone?: string;
}): Promise<AdminUserMutationResponse> => {
  return apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUserAdmin = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    status?: boolean;
    password?: string;
    phone?: string;
  },
): Promise<AdminUserMutationResponse> => {
  return apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// enrollmentStats la ket qua $group cua Mongo: mot dong cho moi trang thai.
export interface AdminUserDetails extends User {
  enrollmentStats: Array<{ _id: Enrollment["status"]; count: number }>;
  certificatesCount: number;
}

export const getUserDetailsAdmin = async (id: string): Promise<AdminUserDetails> => {
  return apiRequest(`/admin/users/${id}`);
};

export const updateUserStatusAdmin = async (
  id: string,
  status: boolean,
): Promise<AdminUserMutationResponse> => {
  return apiRequest(`/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export const deleteUserAdmin = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });
};

export interface AdminCoursesResponse {
  courses: Course[];
  pagination: AdminPagination;
}

export const getAllCoursesAdmin = async (): Promise<AdminCoursesResponse> => {
  return apiRequest("/admin/courses");
};

export interface AdminCourseDetails extends Course {
  enrollmentsCount: number;
  completedCount: number;
}

export const getCourseDetailsAdmin = async (id: string): Promise<AdminCourseDetails> => {
  return apiRequest(`/admin/courses/${id}`);
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

export const deleteCourseAdmin = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/admin/courses/${id}`, {
    method: "DELETE",
  });
};

export interface AdminListQuery {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: string;
  studentId?: string;
}

// Backend phan trang mac dinh limit=10 -> phai truyen tham so
// GET /admin/enrollments populate rat gon: course chi lay title, student chi
// lay name va email - khong phai ban ghi day du nhu Enrollment thong thuong.
export interface AdminEnrollmentRow {
  _id: string;
  course: { _id: string; title: string } | null;
  student: { _id: string; name: string; email: string; avatar?: string } | null;
  totalProgress: number;
  status: Enrollment["status"];
  finalScore?: number | null;
  createdAt: string;
  completedAt?: string | null;
  lastAccessedAt?: string | null;
}

export interface AdminEnrollmentsResponse {
  enrollments: AdminEnrollmentRow[];
  pagination: AdminPagination;
}

export const getAllEnrollmentsAdmin = async (
  q: AdminListQuery = {},
): Promise<AdminEnrollmentsResponse> => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.status) p.set("status", q.status);
  if (q.courseId) p.set("courseId", q.courseId);
  if (q.studentId) p.set("studentId", q.studentId);
  const qs = p.toString();
  return apiRequest(`/admin/enrollments${qs ? "?" + qs : ""}`);
};

export const updateEnrollmentStatusAdmin = async (
  id: string,
  status: string,
): Promise<Enrollment> => {
  return apiRequest(`/admin/enrollments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export interface AdminCertQuery {
  page?: number;
  limit?: number;
  isValid?: boolean;
  courseId?: string;
  studentId?: string;
}

export interface AdminCertificatesResponse {
  certificates: Certificate[];
  pagination: AdminPagination;
}

export const getAllCertificatesAdmin = async (
  q: AdminCertQuery = {},
): Promise<AdminCertificatesResponse> => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.isValid !== undefined) p.set("isValid", String(q.isValid));
  if (q.courseId) p.set("courseId", q.courseId);
  if (q.studentId) p.set("studentId", q.studentId);
  const qs = p.toString();
  return apiRequest(`/admin/certificates${qs ? "?" + qs : ""}`);
};

export const revokeCertificateAdmin = async (
  id: string,
): Promise<{ message: string; certificate: Certificate }> => {
  return apiRequest(`/admin/certificates/${id}/revoke`, {
    method: "PUT",
  });
};

export interface AdminReviewsResponse {
  reviews: Review[];
  pagination: AdminPagination;
}

export const getAllReviewsAdmin = async (): Promise<AdminReviewsResponse> => {
  return apiRequest("/admin/reviews");
};

export const deleteReviewAdmin = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
};
