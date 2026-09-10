"use client";

import React, { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  MessageSquare,
  Star,
  Trash2,
  BookOpen,
  User,
  RefreshCw,
  CheckCircle,
  Edit3,
  Plus,
  X,
} from "lucide-react";
import { reviewService, Review } from "@/src/services/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Trạng thái điều khiển Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Form State
  const [courseId, setCourseId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 📥 Tải toàn bộ danh sách review hệ thống từ API Admin mới tạo
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAllReviewsForAdmin({ limit: 100 });
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

  // 🗑️ [DELETE] Xử lý xóa Review
  const handleDeleteReview = async (reviewId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không? Hành động này không thể hoàn tác.",
      )
    ) {
      return;
    }

    try {
      setIsDeleting(reviewId);
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xóa đánh giá này."));
    } finally {
      setIsDeleting(null);
    }
  };

  // ✍️ Mở Modal ở chế độ thêm mới (CREATE)
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedReviewId(null);
    setCourseId("");
    setRating(5);
    setComment("");
    setIsModalOpen(true);
  };

  // ✏️ Mở Modal ở chế độ chỉnh sửa (UPDATE)
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

  // 💾 [CREATE / UPDATE] Xử lý gửi Form dữ liệu
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 10) {
      alert("Nội dung bình luận phải có ít nhất 10 ký tự.");
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "create") {
        if (!courseId.trim()) {
          alert("Vui lòng nhập Course ID hợp lệ.");
          return;
        }
        // Gọi API Tạo mới
        await reviewService.createReview({ courseId, rating, comment: comment.trim() });
        alert("Đã thêm đánh giá thành công!");
      } else if (modalMode === "update" && selectedReviewId) {
        // Gọi API Cập nhật
        await reviewService.updateReview(selectedReviewId, {
          rating,
          comment: comment.trim(),
        });
        alert("Cập nhật đánh giá thành công!");
      }

      setIsModalOpen(false);
      fetchAllReviews(); // Tải lại bảng dữ liệu mới nhất
    } catch (error) {
      alert(getErrorMessage(error, "Đã xảy ra lỗi khi xử lý thao tác."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800">
            <MessageSquare className="text-blue-600" size={24} />
            Reviews Management
          </h1>
          <p className="text-sm text-slate-500">
            Xem, tạo mới, chỉnh sửa hoặc loại bỏ các nội dung đánh giá trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllReviews}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-100 transition hover:bg-blue-700"
          >
            <Plus size={14} />
            Tạo Review mới
          </button>
        </div>
      </div>

      {/* BẢNG QUẢN LÝ DANH SÁCH */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-xs font-medium text-slate-500">
              Đang tải dữ liệu đánh giá toàn hệ thống...
            </p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <th className="w-[220px] p-4">Học viên / Ngày đăng</th>
                  <th className="w-[200px] p-4">Khóa học</th>
                  <th className="w-[120px] p-4">Đánh giá</th>
                  <th className="p-4">Nội dung bình luận</th>
                  <th className="w-[100px] p-4 text-center">Tương tác</th>
                  <th className="w-[110px] p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {reviews.map((review) => {
                  const studentName = review.student?.name || "Ẩn danh";
                  // review.course la ObjectId dang chuoi khi khong duoc populate.
                  const courseTitle =
                    (typeof review.course === "object" ? review.course?.title : "") ||
                    "Khóa học học viên đăng ký";

                  return (
                    <tr
                      key={review._id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <User size={14} className="text-slate-500" />
                            <span className="max-w-[160px] truncate">{studentName}</span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")} lúc{" "}
                            {new Date(review.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <BookOpen size={14} className="flex-shrink-0 text-blue-500" />
                          <span className="line-clamp-2 leading-relaxed">
                            {courseTitle}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 rounded border border-emerald-100 bg-emerald-50 px-1 py-0.5 text-[9px] font-bold text-emerald-600">
                              <CheckCircle size={9} /> Đã mua
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="line-clamp-3 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 text-xs leading-relaxed text-slate-600 italic">
                          &quot;{review.comment}&quot;
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          👍 {review.helpful || 0}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openUpdateModal(review)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                            title="Sửa đánh giá"
                          >
                            <Edit3 size={15} /> Sửa
                          </button>
                          <button
                            disabled={isDeleting === review._id}
                            onClick={() => handleDeleteReview(review._id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-blue-100"
                            title="Xóa đánh giá"
                          >
                            <Trash2 size={15} /> Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-2 py-16 text-center text-slate-500">
            <MessageSquare size={36} className="mx-auto stroke-[1.5] text-slate-400" />
            <p className="text-sm font-medium">
              Chưa có đánh giá nào được ghi nhận trên hệ thống.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL DIỀU HƯỚNG: CREATE / UPDATE ================= */}
      {isModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-base font-bold text-slate-800">
                {modalMode === "create"
                  ? "Tạo Đánh Giá Trực Tiếp"
                  : "Chỉnh Sửa Đánh Giá Học Viên"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="space-y-4 p-6">
              {modalMode === "create" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Course ID (Mã khóa học)
                  </label>
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Nhập chuỗi ID khóa học (e.g. 6a149071d...)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Xếp hạng (Số sao)
                </label>
                <div className="flex w-fit items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-amber-400 transition duration-150 hover:scale-110"
                    >
                      <Star size={22} fill={star <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-500">
                    {rating}/5 Sao
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Nội dung bình luận
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét tối thiểu 10 ký tự về khóa học..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
