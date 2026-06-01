import { apiRequest } from "./apiHelper";

export interface User {
  _id: string;
  name: string;
  fullname?: string;
  birthday?: string;
  email: string;
  role: "student" | "instructor" | "admin";
  phone?: string;
  bio?: string;
  avatar?: string;
  provider?: string | { _id: string; name: string }; // Có thể là ID hoặc Object populate
  createdAt?: string;
}

export interface Provider {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  type: "company" | "university";
}

// Lấy danh sách toàn bộ User (Admin)
export const getUsers = async (): Promise<User[]> => {
  return apiRequest("/users");
};

// Cập nhật Profile thực tế kết nối với Backend (Dùng chung các role)
export const updateUserProfileApi = async (profileData: Partial<User>): Promise<User> => {
  return apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// Lấy danh sách trường/doanh nghiệp để Instructor chọn khi update profile
export const getProvidersApi = async (): Promise<Provider[]> => {
  return apiRequest("/providers");
};

export const updateUserRole = async (userId: string, role: string) => {
  return apiRequest(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
};

export const deleteUser = async (userId: string) => {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
};