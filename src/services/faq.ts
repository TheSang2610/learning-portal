import { apiRequest } from "./apiHelper"; 

// Định nghĩa kiểu dữ liệu cho một câu FAQ từ Backend trả về
export interface FaqItem {
  _id?: string;
  courseId?: string | null;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dữ liệu truyền lên khi Thêm hoặc Sửa FAQ
export interface FaqData {
  courseId?: string | null; // Nếu tạo FAQ cho trang chủ thì truyền null hoặc không truyền
  question: string;
  answer: string;
}

export const faqService = {
  /**
   * 🔓 1. Lấy danh sách FAQ hiển thị ở TRANG CHỦ
   */
  getHomepageFaqs: async (): Promise<FaqItem[]> => {
    const res = await apiRequest("/faqs/homepage", { method: "GET" });
    return res.data; // Vì Backend trả về cấu trúc { success: true, count: ..., data: [...] }
  },

  /**
   * 🔓 2. Lấy danh sách FAQ hiển thị ở TRANG CHI TIẾT KHÓA HỌC
   */
  getFaqsByCourse: async (courseId: string): Promise<FaqItem[]> => {
    const res = await apiRequest(`/faqs/course/${courseId}`, { method: "GET" });
    return res.data;
  },

  /**
   * 🔒 3. Tạo mới một câu hỏi FAQ (Yêu cầu quyền Admin/Instructor)
   * Nhờ có apiRequest, authToken từ localStorage sẽ tự động được đính kèm ở Headers!
   */
  createFaq: async (faqData: FaqData): Promise<FaqItem> => {
    const res = await apiRequest("/faqs", {
      method: "POST",
      body: JSON.stringify(faqData),
    });
    return res.data;
  },

  /**
   * 🔒 4. Cập nhật câu hỏi FAQ bằng ID (Yêu cầu quyền Admin/Instructor)
   */
  updateFaq: async (id: string, faqData: Partial<FaqData>): Promise<FaqItem> => {
    const res = await apiRequest(`/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(faqData),
    });
    return res.data;
  },

  /**
   * 🔒 5. Xóa câu hỏi FAQ bằng ID (Yêu cầu quyền Admin/Instructor)
   */
  deleteFaq: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await apiRequest(`/faqs/${id}`, {
      method: "DELETE",
    });
  },
};