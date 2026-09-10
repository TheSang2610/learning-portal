import { apiRequest } from "./apiHelper";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const createCategory = async (
  categoryData: Omit<Category, "_id">,
): Promise<Category> => {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const getCategories = async (): Promise<Category[]> => {
  // Khong tu gop request o day: apiHelper.apiRequest da gop san moi GET trung
  // nhau (inflight) va giu ket qua 30 giay. Them mot lop nua chi lam kho hieu.
  return apiRequest("/categories");
};

// slug do backend tu sinh tu name -> khong gui slug len
export const updateCategory = async (
  id: string,
  data: { name?: string; icon?: string },
): Promise<Category> => {
  return apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/categories/${id}`, {
    method: "DELETE",
  });
};
