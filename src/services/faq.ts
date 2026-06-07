import { apiRequest } from "./apiHelper"; 

export interface FaqItem {
  _id?: string;
  courseId?: string | null;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqData {
  courseId?: string | null; 
  question: string;
  answer: string;
}

export const faqService = {

  getHomepageFaqs: async (): Promise<FaqItem[]> => {
    const res = await apiRequest("/faqs/homepage", { method: "GET" });
    return res.data; // Vì Backend trả về cấu trúc { success: true, count: ..., data: [...] }
  },

  getFaqsByCourse: async (courseId: string): Promise<FaqItem[]> => {
    const res = await apiRequest(`/faqs/course/${courseId}`, { method: "GET" });
    return res.data;
  },

  createFaq: async (faqData: FaqData): Promise<FaqItem> => {
    const res = await apiRequest("/faqs", {
      method: "POST",
      body: JSON.stringify(faqData),
    });
    return res.data;
  },

  updateFaq: async (id: string, faqData: Partial<FaqData>): Promise<FaqItem> => {
    const res = await apiRequest(`/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(faqData),
    });
    return res.data;
  },

  deleteFaq: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await apiRequest(`/faqs/${id}`, {
      method: "DELETE",
    });
  },
};