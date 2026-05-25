import { apiRequest } from "./apiHelper";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  // icon?: string; // Có thể xóa hẳn hoặc comment lại nếu không dùng nữa
}

// Sửa Omit ở đây: Chỉ loại bỏ "_id" thôi, giữ lại "name" và "slug"
export const createCategory = async (categoryData: Omit<Category, "_id">): Promise<Category> => {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const getCategories = async (): Promise<Category[]> => {
  return apiRequest("/categories");
};