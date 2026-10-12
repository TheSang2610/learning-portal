"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ADMIN_LESSON_DETAIL as C } from "@/src/constants/admin/lesson-detail-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  deleteLesson,
  getLessonById,
  updateLesson,
  uploadPrivateVideo,
} from "@/src/services/lesson.api";

/** Sua bai hoc cua admin: noi dung, thu tu, video (tai tep kin hoac dan link). */
export function useAdminLessonDetail() {
  const params = useSearchParams();
  const router = useRouter();

  const courseId = params.get("courseId") || "";
  const lessonId = params.get("lessonId") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  // Video dang o kho kin: `videoUrl` luc tai trang la link ky chi de phat.
  const [privateVideo, setPrivateVideo] = useState(false);
  const [initialPrivateUrl, setInitialPrivateUrl] = useState("");
  // % tai video len kho kin; null = khong dang tai.
  const [progress, setProgress] = useState<number | null>(null);
  const [order, setOrder] = useState(1);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lesson = await getLessonById(lessonId);

        setTitle(lesson.title || "");
        setContent(lesson.content || "");
        setVideoUrl(lesson.videoUrl || "");
        setPrivateVideo(Boolean(lesson.videoKin));
        setInitialPrivateUrl(lesson.videoKin ? lesson.videoUrl || "" : "");
        setOrder(lesson.order || 1);
      } catch (error) {
        console.error(error);
        alert(getErrorMessage(error, C.messages.loadFailed));
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const backToCourse = () => router.push(C.courseDetailHref(courseId));

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        alert(C.messages.invalidVideo);
        return;
      }
      if (file.size > C.maxVideoBytes) {
        alert(C.messages.videoTooLarge);
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      // Chon tep moi thi bo link cu
      setVideoUrl("");
    }
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    setVideoPreview("");
  };

  const saveHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert(C.messages.needTitle);

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title);
      formData.append("content", content);
      formData.append("order", String(order));

      // File moi: tai THANG len kho kin Cloudinary roi chi gui ma video - xem
      // uploadPrivateVideo. Video kin cu ma khong doi gi thi KHONG gui videoUrl:
      // o do dang chua link ky chi de phat, gui len la mat video kin (backend
      // cung tu bo qua, day la chot thu hai).
      if (videoFile) {
        setProgress(0);
        const videoId = await uploadPrivateVideo(videoFile, setProgress);
        formData.append("videoPublicId", videoId);
      } else if (videoUrl && !(privateVideo && videoUrl === initialPrivateUrl)) {
        formData.append("videoUrl", videoUrl);
      }

      await updateLesson(lessonId, formData);

      alert(C.messages.saved);
      backToCourse();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, C.messages.saveFailed));
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  const deleteHandler = async () => {
    const isConfirmed = window.confirm(C.messages.confirmDelete);
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert(C.messages.deleted);
      backToCourse();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, C.messages.deleteFailed));
    } finally {
      setDeleting(false);
    }
  };

  return {
    loading,
    submitting,
    deleting,
    title,
    setTitle,
    content,
    setContent,
    videoUrl,
    setVideoUrl,
    videoFile,
    videoPreview,
    progress,
    order,
    setOrder,
    backToCourse,
    handleVideoFileChange,
    clearVideoFile,
    saveHandler,
    deleteHandler,
  };
}

export type AdminLessonDetailState = ReturnType<typeof useAdminLessonDetail>;
