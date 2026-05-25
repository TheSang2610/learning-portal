import { apiRequest } from "./apiHelper";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt?: string;
}

export const getUsers = async (): Promise<User[]> => {
  return apiRequest("/users");
};

export const updateUserRole = async (
  userId: string,
  role: string
) => {
  return apiRequest(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
};

export const deleteUser = async (
  userId: string
) => {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
};