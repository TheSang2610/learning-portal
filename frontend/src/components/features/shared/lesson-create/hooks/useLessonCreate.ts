"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  LESSON_CREATE as C,
  LESSON_CREATE_ROLE,
  type LessonCreateRole,
} from "@/src/constants/shared/lesson-create-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getCourseById } from "@/src/services/course";
import { addLesson, uploadPrivateVideo } from "@/src/services/lesson.api";
import type { LessonCreateFormData } from "@/src/types/lesson";

/** State va gui bieu mau them bai hoc cho khoa ?courseId=. */
export function useLessonCreate(role: LessonCreateRole) {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("courseId") || "";

  const [submitting, setSubmitting] = useState(false);
  // % tai video len kho kin; null = khong dang tai.
  const [progress, setProgress] = useState<number | null>(null);
  const [formData, setFormData] = useState<LessonCreateFormData>({
    title: "",
    description: "",
    videoUrl: "",
    documentUrl: "",
    duration: 0,
    order: 1,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Thu tu mac dinh la bai ke tiep. Truoc day o day ghi cung "1" cho moi bai,
  // nen ca khoa deu order = 1 va muc luc xep lung tung.
  const getNextOrder = useCallback(async () => {
    if (!courseId) return;
    try {
      const course = await getCourseById(courseId);
      const lessonCount = Array.isArray(course?.lessons) ? course.lessons.length : 0;
      setFormData((before) => ({ ...before, order: lessonCount + 1 }));
    } catch {
      // Khong lay duoc thi cu de 1, nguoi dung van sua tay duoc.
    }
  }, [courseId]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang: goi thang thi setState nam
    // dong bo ngay trong than effect, React phai chay them mot vong ve lai
    // (rule react-hooks/set-state-in-effect). Cung cach lam voi trang
    // admin/lessons.
    void Promise.resolve().then(getNextOrder);
  }, [getNextOrder]);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "duration" || name === "order" ? Number(value) : value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert(C.messages.needTitle);
    if (!courseId) return alert(C.messages.needCourse);

    try {
      setSubmitting(true);

      const dataToSend = new FormData();
      dataToSend.append("courseId", courseId);
      dataToSend.append("title", formData.title.trim());
      dataToSend.append("content", formData.description.trim());
      dataToSend.append("order", String(formData.order));

      // O nhap tinh bang PHUT cho de doc, nhung trang danh sach bai hoc chia
      // cho 60 roi ghi "x phut" - tuc la kho dang luu bang GIAY. Doi ngay tai
      // day de hai noi khong lech don vi.
      if (formData.duration > 0) {
        dataToSend.append("duration", String(Math.round(formData.duration * 60)));
      }

      // Co tep thi uu tien tep: trinh duyet tai THANG len kho kin Cloudinary
      // roi chi gui ma video (videoPublicId). Truoc day gui file qua backend -
      // hong voi video that tren Vercel (gioi han ~4.5 MB moi request), va video
      // nam o che do cong khai. Xem uploadPrivateVideo.
      if (videoFile) {
        setProgress(0);
        const videoId = await uploadPrivateVideo(videoFile, setProgress);
        dataToSend.append("videoPublicId", videoId);
      } else if (formData.videoUrl.trim()) {
        dataToSend.append("videoUrl", formData.videoUrl.trim());
      }

      if (documentFile) {
        dataToSend.append("document", documentFile);
      } else if (formData.documentUrl.trim()) {
        dataToSend.append("documentUrl", formData.documentUrl.trim());
      }

      await addLesson(dataToSend);

      alert(C.messages.success);
      router.push(LESSON_CREATE_ROLE[role].lessonsHref(courseId));
    } catch (error) {
      console.error("Lỗi tạo bài học:", error);
      alert(getErrorMessage(error) || getErrorMessage(error, C.messages.failure));
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  return {
    courseId,
    submitting,
    progress,
    formData,
    videoFile,
    documentFile,
    setVideoFile,
    setDocumentFile,
    changeHandler,
    submitHandler,
  };
}
