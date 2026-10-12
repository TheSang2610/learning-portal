import type {
  Enrollment,
  EnrollmentByCourseResponse,
  LessonProgress,
} from "@/src/services/enrollment.api";

// Backend tra ve 200 kem isEnrolled: false khi chua dang ky chu khong tra 404,
// nen phai thu hep kieu truoc thi moi doc duoc lessonProgress.
export const registered = (
  e: EnrollmentByCourseResponse | null,
): e is { isEnrolled: true } & Enrollment => Boolean(e && e.isEnrolled === true);

// lessonProgress.lesson khi la ObjectId dang chuoi, khi la ca doi tuong bai hoc
// da populate - tuy endpoint nao tra ve.
export const getLessonId = (lesson: LessonProgress["lesson"]): string | undefined =>
  typeof lesson === "string" ? lesson : (lesson?._id ?? undefined);

// Doc lessonProgress ma khong phai kiem tra isEnrolled lap lai o tung cho.
export const getProgress = (e: EnrollmentByCourseResponse | null): LessonProgress[] =>
  registered(e) ? e.lessonProgress : [];
