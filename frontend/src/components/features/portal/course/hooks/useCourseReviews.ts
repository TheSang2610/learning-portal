"use client";

import { useCallback, useEffect, useState } from "react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { reviewService, type Review, type ReviewStats } from "@/src/services/review";

/** Danh gia + thong ke sao cua mot khoa, bam "huu ich" va gui danh gia moi. */
export function useCourseReviews(courseId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const loadReviewsAndStats = useCallback(async (id: string) => {
    try {
      setLoadingReviews(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getCourseReviews(id, C.reviewsQuery),
        reviewService.getReviewStats(id),
      ]);
      setReviews(reviewsData.reviews || []);
      setStats(statsData);
    } catch (err) {
      console.error("Không thể tải dữ liệu đánh giá:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // Tai ngay khi biet id khoa hoc. Goi qua mot vong microtask de setState
  // khong nam dong bo trong than effect (rule react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!courseId) return;
    void Promise.resolve().then(() => loadReviewsAndStats(courseId));
  }, [courseId, loadReviewsAndStats]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.markHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpful: updatedReview.helpful } : r,
        ),
      );
    } catch (err) {
      alert(getErrorMessage(err, C.messages.genericError));
    }
  };

  const submitReview = async () => {
    if (!courseId) return;
    if (!newComment.trim()) return alert(C.messages.emptyReview);
    try {
      setIsSubmittingReview(true);
      await reviewService.createReview({
        courseId,
        rating: newRating,
        comment: newComment,
      });
      setNewComment("");
      loadReviewsAndStats(courseId);
      alert(C.messages.reviewSent);
    } catch (err) {
      alert(getErrorMessage(err, C.messages.reviewFailed));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return {
    reviews,
    stats,
    loadingReviews,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    isSubmittingReview,
    handleMarkHelpful,
    submitReview,
  };
}

export type CourseReviewsState = ReturnType<typeof useCourseReviews>;
