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

// --- API SERVICES FOR REVIEWS ---

export const reviewService = {
  /**
   * @desc    Tạo review mới (Yêu cầu đăng ký học & tiến độ >= 10%)
   * @route   POST /api/reviews
   * @access  Private
   */
  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    return apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * @desc    Lấy tất cả reviews của một khóa học (Phân trang, sắp xếp)
   * @route   GET /api/reviews/course/:courseId
   * @access  Public
   */
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

  /**
   * @desc    Lấy thống kê rating của course (Số lượng, tỉ lệ % sao)
   * @route   GET /api/reviews/stats/:courseId
   * @access  Public
   */
  getReviewStats: async (courseId: string): Promise<ReviewStats> => {
    return apiRequest(`/reviews/stats/${courseId}`, {
      method: "GET",
    });
  },

  /**
   * @desc    Lấy toàn bộ danh sách review trên toàn hệ thống phục vụ Admin quản lý CRUD
   * @route   GET /api/reviews/admin/all
   * @access  Public (Không yêu cầu token / được điều hướng độc lập)
   */
  getAllReviewsForAdmin: async (query?: { page?: number; limit?: number }): Promise<GetReviewsResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/reviews/admin/all${queryString}`, {
      method: "GET",
    });
  },

  /**
   * @desc    Lấy thông tin chi tiết một review theo ID
   * @route   GET /api/reviews/:id
   * @access  Public
   */
  getReviewById: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}`, {
      method: "GET",
    });
  },

  /**
   * @desc    Cập nhật nội dung hoặc số sao review (Chỉ tác giả / Admin)
   * @route   PUT /api/reviews/:id
   * @access  Private
   */
  updateReview: async (id: string, updateData: UpdateReviewData): Promise<Review> => {
    return apiRequest(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  /**
   * @desc    Xóa review (Chỉ tác giả / Admin)
   * @route   DELETE /api/reviews/:id
   * @access  Private
   */
  deleteReview: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/reviews/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * @desc    Đánh dấu review là có hữu ích (Tăng bộ đếm helpful)
   * @route   POST /api/reviews/:id/helpful
   * @access  Public
   */
  markHelpful: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}/helpful`, {
      method: "POST",
    });
  },

  /**
   * @desc    Đánh dấu review là không hữu ích (Tăng bộ đếm unhelpful)
   * @route   POST /api/reviews/:id/unhelpful
   * @access  Public
   */
  markUnhelpful: async (id: string): Promise<Review> => {
    return apiRequest(`/reviews/${id}/unhelpful`, {
      method: "POST",
    });
  },
  
};