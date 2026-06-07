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

export const updateUserProfileApi = async (profileData: Partial<User>): Promise<User> => {
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