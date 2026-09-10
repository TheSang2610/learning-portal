import { apiRequest } from "./apiHelper";

export interface QuizOption {
  _id?: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  _id?: string;
  text: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: QuizOption[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  _id: string;
  course: string;
  lesson?:
    | {
        _id: string;
        title: string;
      }
    | string;
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

// studentAnswer trong model la Mixed (xem backend/src/models/QuizAttempt.js) nen
// cau true_false tra ve boolean chu khong phai chuoi. questionId thi tuy endpoint
// ma la ObjectId dang chuoi hoac doi tuong da populate.
export interface QuizAnswer {
  _id?: string;
  questionId: string | { _id: string };
  studentAnswer: string | boolean;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface StudentAnswerInput {
  questionId: string;
  studentAnswer: string;
}

export interface QuizSubmitResponse {
  _id: string;
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalPoints: number;
  timeSpent: number;
  message: string;
  attemptNumber?: number;
  answers: QuizAnswer[];
}

export interface QuizAttempt {
  _id: string;
  quiz: string | Quiz;
  student:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  answers: QuizAnswer[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  startedAt: string;
  submittedAt: string;
  attemptNumber: number;
  status: string;
}

// GET /quizzes/:id gan them latestAttempt vao ban ghi de khi nguoi goi da tung
// lam bai (xem cuoi getQuizById trong quizController). Khong phai luc nao cung co.
export interface QuizWithAttempt extends Quiz {
  latestAttempt?: QuizAttempt;
}

// Ket qua hien ra man hinh den tu hai nguon: lan vua nop (QuizSubmitResponse)
// hoac lan lam gan nhat kem theo de (QuizAttempt). Chi dung phan chung.
export interface KetQuaLamBai {
  score: number;
  percentage: number;
  passed: boolean;
  attemptNumber?: number;
  answers?: QuizAnswer[];
  message?: string;
}

export interface QuizStats {
  title: string;
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

export interface AllowRetryResponse {
  message: string;
  attempt: QuizAttempt;
}

export const createQuiz = async (quizData: Partial<Quiz>): Promise<Quiz> => {
  return apiRequest("/quizzes", {
    method: "POST",
    body: JSON.stringify(quizData),
  });
};

export const getCourseQuizzes = async (
  courseId: string,
  lessonId?: string,
): Promise<Quiz[]> => {
  const url = lessonId
    ? `/quizzes/course/${courseId}?lessonId=${lessonId}`
    : `/quizzes/course/${courseId}`;
  return apiRequest(url);
};

export const getQuizById = async (id: string): Promise<QuizWithAttempt> => {
  return apiRequest(`/quizzes/${id}`);
};

export const updateQuiz = async (id: string, quizData: Partial<Quiz>): Promise<Quiz> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(quizData),
  });
};

export const publishQuiz = async (
  id: string,
): Promise<{ message: string; quiz: Quiz }> => {
  return apiRequest(`/quizzes/${id}/publish`, {
    method: "PUT",
  });
};

export const deleteQuiz = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/quizzes/${id}`, {
    method: "DELETE",
  });
};

export const submitQuizAttempt = async (
  quizId: string,
  answers: StudentAnswerInput[],
  startedAt: string,
): Promise<QuizSubmitResponse> => {
  return apiRequest(`/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers, startedAt }),
  });
};

export const getQuizAttemptResult = async (
  quizId: string,
  attemptId: string,
): Promise<QuizAttempt> => {
  return apiRequest(`/quizzes/${quizId}/attempt/${attemptId}`);
};

export const getQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
  return apiRequest(`/quizzes/${quizId}/attempts`);
};

export const getQuizStats = async (quizId: string): Promise<QuizStats> => {
  return apiRequest(`/quizzes/${quizId}/stats`);
};

export const allowStudentRetry = async (
  quizId: string,
  studentId: string,
  reason: string,
): Promise<AllowRetryResponse> => {
  return apiRequest(`/quizzes/${quizId}/allow-retry/${studentId}`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};
