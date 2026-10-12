import type { QuizQuestion } from "@/src/services/quizService";

// Cau hoi luc dang soan khac QuizQuestion cua tang service o hai cho: chua co
// _id (bai chua luu), va options luon co mat vi giao dien luon dung it nhat
// mot phuong an. Tach rieng de khoi phai kiem tra undefined o moi cho.
export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface DraftQuestion {
  text: string;
  type: QuizQuestion["type"];
  points: number;
  options: Option[];
}

/** Cau hinh chung cua mot bai quiz tren man hinh soan. */
export interface QuizConfigDraft {
  title: string;
  description: string;
  lessonId: string;
  passingScore: number;
  timeLimit: number;
  attempts: number;
}

/** Bai hoc de chon gan quiz. */
export interface LessonOption {
  _id: string;
  title: string;
}
