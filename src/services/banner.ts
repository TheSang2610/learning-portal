// src/services/bannerService.ts
import { apiRequest } from "./apiHelper"; 

export interface BannerData {
  _id: string; 
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
  getBannersByPage: async (page: string): Promise<BannerData[]> => {
    try {
      const json = await apiRequest(`/banners?page=${page.toUpperCase()}`, {
        method: "GET",
        cache: "no-store",
      });
      
      return json.success ? json.data : [];
    } catch (error) {
      console.error(`Lỗi khi fetch banner cho trang ${page}:`, error);
      return [];
    }
  },

  createBanner: async (formData: FormData) => {
    return await apiRequest("/banners", {
      method: "POST",
      body: formData,
    });
  },


  updateBanner: async (id: string, formData: FormData) => {
    return await apiRequest(`/banners/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  deleteBanner: async (id: string) => {
    return await apiRequest(`/banners/${id}`, {
      method: "DELETE",
    });
  },
};