import { apiRequest } from "./apiHelper"; 

export interface CreateReviewData {
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewStudentInfo {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface ReviewCourseInfo {
  _id: string;
  title: string;
}

export interface Review {
  _id: string;
  course: string | ReviewCourseInfo;
  student: ReviewStudentInfo;
  rating: number;
  comment: string;
  helpful: number;
  unhelpful: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: string | number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export const reviewService = {
  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    return apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  getCourseReviews: async (
    courseId: string,
    query?: { sortBy?: "newest" | "highest" | "lowest" | "helpful"; page?: number; limit?: number }
  ): Promise<GetReviewsResponse> => {
    const params = new URLSearchParams();
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/reviews/course/${courseId}${queryString}`, {
      method: "GET",
    });
  },

  getReviewStats: async (courseId: string): Promise<ReviewStats> => {
    return apiRequest(`/reviews/stats/${courseId}`, {
      method: "GET",
    });
  },

  getAllReviewsForAdmin: async (query?: { page?: number; limit?: number }): Promise<GetReviewsResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/reviews/admin/all${queryString}`, {
      method: "GET",
    });
  },

  getReviewById: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}`, {
      method: "GET",
    });
  },

  updateReview: async (id: string, updateData: UpdateReviewData): Promise<Review> => {
    return apiRequest(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  deleteReview: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/reviews/${id}`, {
      method: "DELETE",
    });
  },

  markHelpful: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}/helpful`, {
      method: "POST",
    });
  },

  markUnhelpful: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}/unhelpful`, {
      method: "POST",
    });
  },
  
};