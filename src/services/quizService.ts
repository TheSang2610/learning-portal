import { apiRequest } from "./apiHelper";

// ================= TYPES & INTERFACES =================

export interface QuizOption {
  _id?: string;
  text: string;
  isCorrect?: boolean; // Chỉ Instructor/Admin mới thấy hoặc truyền lên
}

export interface QuizQuestion {
  _id?: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: QuizOption[];
  correctAnswer?: string; // Chỉ dành cho short_answer / essay
  explanation?: string;
  points?: number;
}

export interface Quiz {
  _id: string;
  course: string;
  lesson?: {
    _id: string;
    title: string;
  } | string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number | null;
  attempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showAnswers: boolean;
  totalPoints: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnswerInput {
  questionId: string;
  studentAnswer: string;
}

export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalPoints: number;
  timeSpent: number;
  message: string;
  attemptNumber?: number;
}

export interface QuizAttempt {
  _id: string;
  quiz: string | Quiz;
  student: {
    _id: string;
    name: string;
    email: string;
  } | string;
  answers: {
    questionId: string;
    studentAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  startedAt: string;
  submittedAt: string;
  attemptNumber: number;
  status: string;
}

export interface QuizStats {
  title: string; // Khớp cấu trúc backend trả về tên đề thi
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  submittedList: Array<{
    _id: string;
    student: { _id: string; name: string; email: string };
    score: number;
    percentage: number;
    passed: boolean;
    attemptNumber: number;
    submittedAt: string;
  }>;
  unsubmittedList: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

// 🎯 BỔ SUNG: Kiểu dữ liệu trả về khi Giảng viên bấm reset bài làm
export interface AllowRetryResponse {
  message: string;
  attempt: QuizAttempt;
}

// ================= QUIZ API SERVICES =================

// 1. Tạo quiz mới (Instructor/Admin)
export const createQuiz = async (quizData: Partial<Quiz>): Promise<Quiz> => {
  return apiRequest("/quizzes", {
    method: "POST",
    body: JSON.stringify(quizData),
  });
};

// 2. Lấy tất cả quizzes của một khóa học
export const getCourseQuizzes = async (courseId: string, lessonId?: string): Promise<Quiz[]> => {
  const url = lessonId 
    ? `/quizzes/course/${courseId}?lessonId=${lessonId}` 
    : `/quizzes/course/${courseId}`;
  return apiRequest(url);
};

// 3. Lấy chi tiết một bài Quiz bằng ID (Student sẽ tự động bị ẩn đáp án từ Backend)
export const getQuizById = async (id: string): Promise<Quiz> => {
  return apiRequest(`/quizzes/${id}`);
};

// 4. Cập nhật cấu trúc / nội dung bài Quiz (Instructor/Admin)
export const updateQuiz = async (id: string, quizData: Partial<Quiz>): Promise<Quiz> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(quizData),
  });
};

// 5. Bật / Tắt trạng thái công bố bài Quiz (Instructor/Admin)
export const publishQuiz = async (id: string): Promise<{ message: string; quiz: Quiz }> => {
  return apiRequest(`/quizzes/${id}/publish`, {
    method: "PUT",
  });
};

// 6. Xóa bài Quiz khỏi hệ thống (Instructor/Admin)
export const deleteQuiz = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "DELETE",
  });
};

// 7. Nộp bài làm Quiz (Student)
export const submitQuizAttempt = async (
  quizId: string, 
  answers: StudentAnswerInput[], 
  startedAt: string
): Promise<QuizSubmitResponse> => {
  return apiRequest(`/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers, startedAt }),
  });
};

// 8. Xem kết quả chi tiết của 1 lượt làm bài (Cả Student & Instructor)
export const getQuizAttemptResult = async (quizId: string, attemptId: string): Promise<QuizAttempt> => {
  return apiRequest(`/quizzes/${quizId}/attempt/${attemptId}`);
};

// 9. Lấy danh sách lịch sử các lần làm bài của Học viên hiện tại đối với bài Quiz nàySs
export const getQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
  return apiRequest(`/quizzes/${quizId}/attempts`);
};

// 10. Xem thống kê báo cáo phổ điểm của bài Quiz (Instructor/Admin)
export const getQuizStats = async (quizId: string): Promise<QuizStats> => {
  return apiRequest(`/quizzes/${quizId}/stats`);
};

// 11. 🎯 BỔ SUNG: Kích hoạt quyền cho một học sinh làm lại bài (Instructor/Admin)
export const allowStudentRetry = async (quizId: string, studentId: string, reason: string): Promise<AllowRetryResponse> => {
  return apiRequest(`/quizzes/${quizId}/allow-retry/${studentId}`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};