import { apiRequest } from "./apiHelper";

// ================= TYPES DEFINITION =================
export interface QuestionOption {
  text: string;
  isCorrect?: boolean; // Chỉ trả về cho Instructor/Admin
}

export interface QuestionData {
  _id?: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  questionText: string;
  options?: QuestionOption[];
  correctAnswer?: string; // Cho câu hỏi short_answer
  points?: number;
}

export interface QuizData {
  _id?: string;
  course: string;
  lesson?: string;
  title: string;
  description?: string;
  questions: QuestionData[];
  passingScore: number;
  timeLimit: number | null;
  attempts: number;
  isPublished: boolean;
  totalPoints?: number;
}

export interface StudentAnswer {
  questionId: string;
  studentAnswer: string;
}

// ================= API CALLS =================

/**
 * 1. Tạo Quiz mới (Instructor Only)
 * @route POST /api/quizzes
 */
export const createQuiz = async (quizData: Partial<QuizData>): Promise<QuizData> => {
  return apiRequest("/quizzes", {
    method: "POST",
    body: JSON.stringify(quizData),
  });
};

/**
 * 2. Lấy toàn bộ danh sách Quizzes trong một khóa học
 * @route GET /api/quizzes/course/:courseId
 */
export const getCourseQuizzes = async (courseId: string): Promise<QuizData[]> => {
  return apiRequest(`/quizzes/course/${courseId}`);
};

/**
 * 3. Lấy chi tiết một Quiz (Nếu là học viên sẽ tự động ẩn đáp án đúng)
 * @route GET /api/quizzes/:id
 */
export const getQuizById = async (id: string): Promise<QuizData> => {
  return apiRequest(`/quizzes/${id}`);
};

/**
 * 4. Cập nhật nội dung Quiz (Instructor Only)
 * @route PUT /api/quizzes/:id
 */
export const updateQuiz = async (id: string, quizData: Partial<QuizData>): Promise<QuizData> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(quizData),
  });
};

/**
 * 5. Bật/Tắt trạng thái hiển thị Quiz (Instructor Only)
 * @route PUT /api/quizzes/:id/publish
 */
export const publishQuiz = async (id: string): Promise<{ message: string; quiz: QuizData }> => {
  return apiRequest(`/quizzes/${id}/publish`, {
    method: "PUT",
  });
};

/**
 * 6. Xóa Quiz và toàn bộ dữ liệu lịch sử làm bài liên quan (Instructor Only)
 * @route DELETE /api/quizzes/:id
 */
export const deleteQuiz = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "DELETE",
  });
};

/**
 * 7. Nộp bài làm Quiz (Học viên)
 * @route POST /api/quizzes/:id/submit
 */
export const submitQuizAttempt = async (
  quizId: string,
  answers: StudentAnswer[]
): Promise<{
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalPoints: number;
  message: string;
}> => {
  return apiRequest(`/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
};

/**
 * 8. Lấy tất cả các lượt làm bài của chính học viên tại một Quiz cụ thể
 * @route GET /api/quizzes/:id/attempts
 */
export const getMyQuizAttempts = async (quizId: string): Promise<any[]> => {
  return apiRequest(`/quizzes/${quizId}/attempts`);
};

/**
 * 9. Xem chi tiết kết quả của một lượt làm bài (Bao gồm điểm số, đúng sai)
 * @route GET /api/quizzes/:id/attempt/:attemptId
 */
export const getQuizAttemptResult = async (quizId: string, attemptId: string): Promise<any> => {
  return apiRequest(`/quizzes/${quizId}/attempt/${attemptId}`);
};

/**
 * 10. Xem bảng thống kê phổ điểm và danh sách học viên đã nộp bài (Instructor Only)
 * @route GET /api/quizzes/:id/stats
 */
export const getQuizStats = async (quizId: string): Promise<any> => {
  return apiRequest(`/quizzes/${quizId}/stats`);
};