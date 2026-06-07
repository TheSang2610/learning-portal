import { apiRequest } from "./apiHelper";

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export const createCategory = async (categoryData: Omit<Category, "_id">): Promise<Category> => {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const getCategories = async (): Promise<Category[]> => {
  return apiRequest("/categories");
};