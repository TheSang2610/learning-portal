import { apiRequest } from "./apiHelper";

export const enrollInCourse = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}`, {
    method: "POST",
  });
};

export const getMyEnrolledCourses = async () => {
  return apiRequest("/enrollments/my-courses");
};

export const getEnrollmentByCourse = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}`);
};

export const startLesson = async (courseId: string, lessonId: string) => {
  return apiRequest(`/enrollments/${courseId}/start-lesson`, {
    method: "PUT",
    body: JSON.stringify({ lessonId }),
  });
};

export const completeLesson = async (
  courseId: string,
  lessonId: string,
  watchedDuration = 0
) => {
  return apiRequest(`/enrollments/${courseId}/complete-lesson`, {
    method: "PUT",
    body: JSON.stringify({ lessonId, watchedDuration }),
  });
};

export const updateWatchTime = async (
  courseId: string,
  lessonId: string,
  watchedDuration: number
) => {
  return apiRequest(`/enrollments/${courseId}/update-watch-time`, {
    method: "PUT",
    body: JSON.stringify({ lessonId, watchedDuration }),
  });
};

export const getProgressStats = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}/progress`);
};

export const completeCourse = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}/complete-course`, {
    method: "PUT",
  });
};

export const dropCourse = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}/drop`, {
    method: "PUT",
  });
};

export const getCourseStudents = async (courseId: string) => {
  return apiRequest(`/enrollments/${courseId}/students`);
};