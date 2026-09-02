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
  // Hai truong nay co trong model Banner tu dau nhung thieu o day, nen moi cho
  // dung toi deu phai viet (banner as any).linkUrl de qua mat trinh bien dich.
  linkUrl?: string;
  order?: number;
  cloudinaryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// bannerController boc moi phan hoi trong { success, message, data } - khac voi
// da so endpoint khac tra ve ban ghi tran.
export interface BannerMutationResponse {
  success: boolean;
  message: string;
  data: BannerData;
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

  createBanner: async (formData: FormData): Promise<BannerMutationResponse> => {
    return await apiRequest("/banners", {
      method: "POST",
      body: formData,
    });
  },

  updateBanner: async (
    id: string,
    formData: FormData,
  ): Promise<BannerMutationResponse> => {
    return await apiRequest(`/banners/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  deleteBanner: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await apiRequest(`/banners/${id}`, {
      method: "DELETE",
    });
  },
};
