// src/services/bannerService.ts
import { apiRequest } from "./apiHelper"; // Điều chỉnh đường dẫn import file chứa hàm apiRequest của bạn

export interface BannerData {
  _id: string; // MongoDB sử dụng _id thay vì id
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  imageUrl?: string;
  displayType: "DISCOUNT" | "IMAGE" | "DEFAULT";
  discountText?: string;
  discountSubtext?: string;
  page: "HOME" | "COURSE_LIST" | "PRODUCT_LIST" | "CART";
  isActive?: boolean;
}

export const bannerService = {
  /**
   * 1. Lấy danh sách banner theo từng trang (Dành cho Client hiển thị)
   * GET /api/banners?page=HOME
   */
  getBannersByPage: async (page: string): Promise<BannerData[]> => {
    try {
      // apiRequest đã tự động cấu hình URL gốc, bạn chỉ cần truyền path và query
      const json = await apiRequest(`/banners?page=${page.toUpperCase()}`, {
        method: "GET",
        cache: "no-store", // Đảm bảo Next.js luôn lấy dữ liệu mới nhất
      });
      
      // Khớp với cấu trúc dữ liệu { success: true, data: [...] } từ Backend trả về
      return json.success ? json.data : [];
    } catch (error) {
      console.error(`Lỗi khi fetch banner cho trang ${page}:`, error);
      return [];
    }
  },

  /**
   * 2. Admin: Tạo mới banner (Có kèm upload file ảnh)
   * POST /api/banners
   */
  createBanner: async (formData: FormData) => {
    // Hàm apiRequest của bạn sẽ tự phát hiện FormData và xóa Content-Type, cứ yên tâm truyền vào
    return await apiRequest("/banners", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * 3. Admin: Cập nhật banner theo ID (Có kèm upload/thay thế file ảnh)
   * PUT /api/banners/:id
   */
  updateBanner: async (id: string, formData: FormData) => {
    return await apiRequest(`/banners/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  /**
   * 4. Admin: Xóa banner tận gốc khỏi hệ thống
   * DELETE /api/banners/:id
   */
  deleteBanner: async (id: string) => {
    return await apiRequest(`/banners/${id}`, {
      method: "DELETE",
    });
  },
};