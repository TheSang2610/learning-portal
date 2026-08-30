import { apiRequest } from "./apiHelper";

export const getDashboardStatistics = async () => {
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
export const getAllUsersAdmin = async (q: AdminUserQuery = {}) => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.search) p.set("search", q.search);
  if (q.role) p.set("role", q.role);
  if (q.status !== undefined) p.set("status", String(q.status));
  const qs = p.toString();
  return apiRequest(`/admin/users${qs ? "?" + qs : ""}`);
};

export const createUserAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: boolean;
  phone?: string;
}) => {
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
  }
) => {
  return apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const getUserDetailsAdmin = async (id: string) => {
  return apiRequest(`/admin/users/${id}`);
};

export const updateUserStatusAdmin = async (id: string, status: boolean) => {
  return apiRequest(`/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export const deleteUserAdmin = async (id: string) => {
  return apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });
};

export const getAllCoursesAdmin = async () => {
  return apiRequest("/admin/courses");
};

export const getCourseDetailsAdmin = async (id: string) => {
  return apiRequest(`/admin/courses/${id}`);
};

export const updateCoursePublishStatus = async (id: string, isPublished: boolean) => {
  return apiRequest(`/admin/courses/${id}/publish`, {
    method: "PUT",
    body: JSON.stringify({ isPublished }),
  });
};

export const deleteCourseAdmin = async (id: string) => {
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
export const getAllEnrollmentsAdmin = async (q: AdminListQuery = {}) => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.status) p.set("status", q.status);
  if (q.courseId) p.set("courseId", q.courseId);
  if (q.studentId) p.set("studentId", q.studentId);
  const qs = p.toString();
  return apiRequest(`/admin/enrollments${qs ? "?" + qs : ""}`);
};

export const updateEnrollmentStatusAdmin = async (id: string, status: string) => {
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

export const getAllCertificatesAdmin = async (q: AdminCertQuery = {}) => {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.isValid !== undefined) p.set("isValid", String(q.isValid));
  if (q.courseId) p.set("courseId", q.courseId);
  if (q.studentId) p.set("studentId", q.studentId);
  const qs = p.toString();
  return apiRequest(`/admin/certificates${qs ? "?" + qs : ""}`);
};

export const revokeCertificateAdmin = async (id: string) => {
  return apiRequest(`/admin/certificates/${id}/revoke`, {
    method: "PUT",
  });
};

export const getAllReviewsAdmin = async () => {
  return apiRequest("/admin/reviews");
};

export const deleteReviewAdmin = async (id: string) => {
  return apiRequest(`/admin/reviews/${id}`, {
    method: "DELETE",
  });
};