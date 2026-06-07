import { apiRequest } from "./apiHelper";

export const getDashboardStatistics = async () => {
  return apiRequest("/admin/dashboard/statistics");
};

export const getAllUsersAdmin = async () => {
  return apiRequest("/admin/users");
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

export const getAllEnrollmentsAdmin = async () => {
  return apiRequest("/admin/enrollments");
};

export const updateEnrollmentStatusAdmin = async (id: string, status: string) => {
  return apiRequest(`/admin/enrollments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export const getAllCertificatesAdmin = async () => {
  return apiRequest("/admin/certificates");
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