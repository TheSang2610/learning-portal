import { apiRequest } from "./apiHelper";
import type { Course } from "./course";
import type { Lesson } from "./lesson.api";

// Cac kieu duoi day chep theo dung backend/src/models/Enrollment.js va theo
// hinh dang that ma enrollmentController tra ve - khong phai suy doan.

export type LessonStatus = "not_started" | "in_progress" | "completed";
export type EnrollmentStatus = "active" | "completed" | "dropped";

export interface LessonProgress {
  _id?: string;
  // GET /enrollments/:courseId populate san bai hoc (title, duration, order,
  // content, videoUrl). Cac endpoint con lai tra ve ObjectId dang chuoi, nen
  // moi cho doc phai tu phan biet hai truong hop.
  lesson: string | Lesson | null;
  status: LessonStatus;
  watchedDuration: number;
  completedAt?: string | null;
}

export interface Enrollment {
  _id: string;
  course: string | Course;
  // GET /enrollments/:courseId/students populate san (name email avatar);
  // cac endpoint khac tra ve ObjectId dang chuoi.
  student: string | { _id: string; name: string; email: string; avatar?: string };
  lessonProgress: LessonProgress[];
  totalProgress: number;
  status: EnrollmentStatus;
  completedAt?: string | null;
  lastAccessedAt?: string | null;
  finalScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

// Chua dang ky thi backend van tra 200 kem isEnrolled: false chu KHONG tra 404
// (xem ghi chu trong enrollmentController). Nen kieu tra ve la hop cua hai hinh
// dang, va noi goi buoc phai kiem tra isEnrolled truoc khi doc lessonProgress.
export type EnrollmentByCourseResponse =
  | ({ isEnrolled: true } & Enrollment)
  | { isEnrolled: false; message: string; data: null };

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  progressPercentage: number;
  completionStatus: EnrollmentStatus;
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  lessonDetails: Array<{
    lesson: string | Lesson | null;
    status: LessonStatus;
    watchedDuration: number;
    completedAt?: string | null;
  }>;
}

// GET /enrollments/my-courses chi populate MOT PHAN khoa hoc
// ('title slug thumbnail price rating instructor'), va tra null neu khoa hoc da
// bi xoa - nen khong dung kieu Course day du o day duoc, dung se noi doi.
export interface EnrolledCourseSummary {
  _id: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  price?: number;
  rating?: number;
  instructor?: string | { _id: string; name: string; email: string };
}

export interface EnrolledCourseItem {
  _id: string;
  course: EnrolledCourseSummary | null;
  totalProgress: number;
  status: EnrollmentStatus;
  lastAccessedAt?: string;
  createdAt: string;
}

export const enrollInCourse = async (
  courseId: string,
): Promise<{ message: string; enrollment: Enrollment; studentsCount: number }> => {
  return apiRequest(`/enrollments/${courseId}`, {
    method: "POST",
  });
};

export const getMyEnrolledCourses = async (): Promise<EnrolledCourseItem[]> => {
  return apiRequest("/enrollments/my-courses");
};

export const getEnrollmentByCourse = async (
  courseId: string,
): Promise<EnrollmentByCourseResponse> => {
  return apiRequest(`/enrollments/${courseId}`);
};

export const startLesson = async (
  courseId: string,
  lessonId: string,
): Promise<Enrollment> => {
  return apiRequest(`/enrollments/${courseId}/start-lesson`, {
    method: "PUT",
    body: JSON.stringify({ lessonId }),
  });
};

// Khac voi cac endpoint tien do con lai: cho nay backend BOC them mot lop
// { message, status, data } chu khong tra thang ban ghi dang ky.
export interface CompleteLessonResponse {
  message: string;
  status: LessonStatus;
  data: Enrollment;
}

export const completeLesson = async (
  courseId: string,
  lessonId: string,
  watchedDuration = 0,
): Promise<CompleteLessonResponse> => {
  return apiRequest(`/enrollments/${courseId}/complete-lesson`, {
    method: "PUT",
    body: JSON.stringify({ lessonId, watchedDuration }),
  });
};

export const updateWatchTime = async (
  courseId: string,
  lessonId: string,
  watchedDuration: number,
): Promise<Enrollment> => {
  return apiRequest(`/enrollments/${courseId}/update-watch-time`, {
    method: "PUT",
    body: JSON.stringify({ lessonId, watchedDuration }),
  });
};

export const getProgressStats = async (courseId: string): Promise<ProgressStats> => {
  return apiRequest(`/enrollments/${courseId}/progress`);
};

export const completeCourse = async (courseId: string): Promise<Enrollment> => {
  return apiRequest(`/enrollments/${courseId}/complete-course`, {
    method: "PUT",
  });
};

export const dropCourse = async (courseId: string): Promise<Enrollment> => {
  return apiRequest(`/enrollments/${courseId}/drop`, {
    method: "PUT",
  });
};

export const getCourseStudents = async (courseId: string): Promise<Enrollment[]> => {
  return apiRequest(`/enrollments/${courseId}/students`);
};
