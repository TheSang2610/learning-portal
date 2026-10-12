"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { INSTRUCTOR_LESSON_DETAIL as C } from "@/src/constants/instructor/lesson-detail-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { deleteLesson, getLessonById, updateLesson } from "@/src/services/lesson.api";

/** Nap bai hoc (?lessonId=), luu thay doi va xoa bai, roi quay ve giao trinh. */
export function useInstructorLessonDetail() {
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
  // Video dang o kho kin: o nhap link de trong (link phat chi song 2 gio, khong
  // phai link de sua), de trong khi luu thi giu nguyen video kin.
  const [privateVideo, setPrivateVideo] = useState(false);
  const [order, setOrder] = useState(1);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lesson = await getLessonById(lessonId);

        setTitle(lesson.title || "");
        setContent(lesson.content || "");
        setPrivateVideo(Boolean(lesson.videoKin));
        setVideoUrl(lesson.videoKin ? "" : lesson.videoUrl || "");
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

  const backToLessons = () => router.push(C.lessonsHref(courseId));

  const saveHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert(C.messages.needTitle);

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      // Video kin ma o link de trong: khong gui gi, giu nguyen video kin.
      if (!(privateVideo && !videoUrl.trim())) {
        formData.append("videoUrl", videoUrl.trim());
      }
      formData.append("order", String(order));

      await updateLesson(lessonId, formData);

      alert(C.messages.saved);
      backToLessons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, C.messages.saveFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHandler = async () => {
    const isConfirmed = window.confirm(C.messages.confirmDelete);
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert(C.messages.deleted);
      backToLessons();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, C.messages.deleteFailed));
    } finally {
      setDeleting(false);
    }
  };

  return {
    lessonId,
    loading,
    submitting,
    deleting,
    title,
    content,
    videoUrl,
    privateVideo,
    order,
    setTitle,
    setContent,
    setVideoUrl,
    setOrder,
    backToLessons,
    saveHandler,
    deleteHandler,
  };
}
