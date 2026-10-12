"use client";

import { useEffect, useState } from "react";

import { ADMIN_REVIEWS as C } from "@/src/constants/admin/reviews-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { reviewService, Review } from "@/src/services/review";

/** Danh gia toan he thong: tai, xoa, hop tao / sua. */
export function useAdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const [courseId, setCourseId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAllReviewsForAdmin({ limit: C.limit });
      setReviews(data.reviews || data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchAllReviews);
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(C.messages.confirmDelete)) {
      return;
    }

    try {
      setIsDeleting(reviewId);
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error) {
      alert(getErrorMessage(error, C.messages.deleteFailed));
    } finally {
      setIsDeleting(null);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedReviewId(null);
    setCourseId("");
    setRating(5);
    setComment("");
    setIsModalOpen(true);
  };

  const openUpdateModal = (review: Review) => {
    setModalMode("update");
    setSelectedReviewId(review._id);
    setCourseId(
      typeof review.course === "string" ? review.course : review.course?._id || "",
    );
    setRating(review.rating);
    setComment(review.comment);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < C.minCommentLength) {
      alert(C.messages.commentTooShort);
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "create") {
        if (!courseId.trim()) {
          alert(C.messages.needCourseId);
          return;
        }
        await reviewService.createReview({ courseId, rating, comment: comment.trim() });
        alert(C.messages.created);
      } else if (modalMode === "update" && selectedReviewId) {
        await reviewService.updateReview(selectedReviewId, {
          rating,
          comment: comment.trim(),
        });
        alert(C.messages.updated);
      }

      setIsModalOpen(false);
      fetchAllReviews();
    } catch (error) {
      alert(getErrorMessage(error, C.messages.saveFailed));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviews,
    loading,
    isDeleting,
    isModalOpen,
    closeModal: () => setIsModalOpen(false),
    modalMode,
    courseId,
    setCourseId,
    rating,
    setRating,
    comment,
    setComment,
    submitting,
    fetchAllReviews,
    handleDeleteReview,
    openCreateModal,
    openUpdateModal,
    handleFormSubmit,
  };
}

export type AdminReviewsState = ReturnType<typeof useAdminReviews>;
