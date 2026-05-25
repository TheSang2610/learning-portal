import { apiRequest } from "./apiHelper";

export interface ProviderData {
  _id?: string; // Để dấu ? vì khi tạo mới chưa có _id từ MongoDB
  name: string;
  slug: string;
  logo: string;
  type: "company" | "university";
}

// 1. Lấy toàn bộ danh sách đối tác (Học viên & Admin đều dùng)
export const getProviders = async (): Promise<ProviderData[]> => {
  return apiRequest("/providers", {
    method: "GET",
  });
};

// 2. Tạo mới một đối tác (Admin - Truyền vào FormData chứa file ảnh logo)
export const createProviderAdmin = async (formData: FormData): Promise<ProviderData> => {
  return apiRequest("/providers", {
    method: "POST",
    body: formData, // apiHelper sẽ tự xóa Content-Type để trình duyệt tự bắt webkit-boundary
  });
};

// 3. Cập nhật thông tin đối tác (Admin - Truyền id và FormData chỉnh sửa)
export const updateProviderAdmin = async (id: string, formData: FormData): Promise<ProviderData> => {
  return apiRequest(`/providers/${id}`, {
    method: "PUT",
    body: formData,
  });
};

// 4. Xóa đối tác khỏi hệ thống (Admin)
export const deleteProviderAdmin = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/providers/${id}`, {
    method: "DELETE",
  });
};

// 5. Lấy chi tiết đối tác qua Slug (Phục vụ trang SEO hiển thị khóa học của riêng đối tác đó)
export const getProviderBySlug = async (slug: string): Promise<ProviderData> => {
  return apiRequest(`/providers/slug/${slug}`, {
    method: "GET",
  });
};