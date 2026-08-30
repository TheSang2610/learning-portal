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
  provider?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  status?: boolean;
  // Co googleId nghia la tai khoan da lien ket Google
  googleId?: string;
  // Tai khoan Google chua tung dat mat khau -> false
  hasPassword?: boolean;
  // Anh tu Google chi tra ve trong response, KHONG luu vao DB
  googlePicture?: string;
}

// Body gui len khi cap nhat ho so.
// currentPassword chi bat buoc khi doi mat khau (tai khoan Google chua co
// mat khau thi dat lan dau khong can).
export interface UpdateProfilePayload {
  name?: string;
  fullname?: string;
  birthday?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  provider?: string | null;
  password?: string;
  currentPassword?: string;
}

export interface Provider {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  type: "company" | "university";
}

export const getUsers = async (): Promise<User[]> => {
  return apiRequest("/users");
};

export const updateUserProfileApi = async (profileData: UpdateProfilePayload): Promise<User> => {
  return apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

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
export interface ActivityDay {
  date: string;   // YYYY-MM-DD
  count: number;
  lessons: number;
  quizzes: number;
  reviews: number;
  achievements: number;
}

export interface ActivitySummary {
  from: string;
  to: string;
  total: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  days: ActivityDay[];
}

// Thong tin day du cua tai khoan dang dang nhap.
// localStorage chi luu _id/name/email/role tu response login,
// nen fullname / birthday / avatar phai lay tu day.
export const getMyProfile = async (): Promise<User> => {
  return apiRequest("/users/profile");
};

export const getMyActivity = async (): Promise<ActivitySummary> => {
  return apiRequest("/users/activity");
};

// Tu vo hieu hoa tai khoan. Sau khi goi thanh cong, token hien tai coi nhu het
// tac dung: protect() chan status === false o moi request tiep theo.
export const deactivateMyAccount = async (password: string): Promise<{ message: string }> => {
  return apiRequest("/users/deactivate", {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
};
