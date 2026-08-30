"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Star, Trash2, BookOpen, User, RefreshCw, CheckCircle, Edit3, Plus, X } from "lucide-react";
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
    fetchAllReviews();
  }, []);

  // 🗑️ [DELETE] Xử lý xóa Review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      setIsDeleting(reviewId);
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error: any) {
      alert(error.message || "Không thể xóa đánh giá này.");
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
    setCourseId(typeof review.course === "string" ? review.course : review.course?._id || "");
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
        await reviewService.updateReview(selectedReviewId, { rating, comment: comment.trim() });
        alert("Cập nhật đánh giá thành công!");
      }
      
      setIsModalOpen(false);
      fetchAllReviews(); // Tải lại bảng dữ liệu mới nhất
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi khi xử lý thao tác.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={24} />
            Reviews Management
          </h1>
          <p className="text-sm text-slate-500">Xem, tạo mới, chỉnh sửa hoặc loại bỏ các nội dung đánh giá trên hệ thống.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAllReviews}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 bg-white transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-100"
          >
            <Plus size={14} />
            Tạo Review mới
          </button>
        </div>
      </div>

      {/* BẢNG QUẢN LÝ DANH SÁCH */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu đánh giá toàn hệ thống...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 w-[220px]">Học viên / Ngày đăng</th>
                  <th className="p-4 w-[200px]">Khóa học</th>
                  <th className="p-4 w-[120px]">Đánh giá</th>
                  <th className="p-4">Nội dung bình luận</th>
                  <th className="p-4 w-[100px] text-center">Tương tác</th>
                  <th className="p-4 w-[110px] text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {reviews.map((review) => {
                  const studentName = review.student?.name || "Ẩn danh";
                  const courseTitle = (review.course as any)?.title || "Khóa học học viên đăng ký";

                  return (
                    <tr key={review._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <User size={14} className="text-slate-500" />
                            <span className="truncate max-w-[160px]">{studentName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")} lúc {new Date(review.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                          <BookOpen size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-2 leading-relaxed">{courseTitle}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex text-amber-500 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded">
                              <CheckCircle size={9} /> Đã mua
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100 italic">
                          "{review.comment}"
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          👍 {review.helpful || 0}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openUpdateModal(review)}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3 py-2 rounded-xl transition"
                            title="Sửa đánh giá"
                          >
                            <Edit3 size={15} /> Sửa
                          </button>
                          <button
                            disabled={isDeleting === review._id}
                            onClick={() => handleDeleteReview(review._id)}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-red-600 font-bold text-xs px-3 py-2 rounded-xl transition"
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
          <div className="py-16 text-center text-slate-500 space-y-2">
            <MessageSquare size={36} className="mx-auto text-slate-400 stroke-[1.5]" />
            <p className="text-sm font-medium">Chưa có đánh giá nào được ghi nhận trên hệ thống.</p>
          </div>
        )}
      </div>

      {/* ================= MODAL DIỀU HƯỚNG: CREATE / UPDATE ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {modalMode === "create" ? "Tạo Đánh Giá Trực Tiếp" : "Chỉnh Sửa Đánh Giá Học Viên"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-500 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {modalMode === "create" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Course ID (Mã khóa học)</label>
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Nhập chuỗi ID khóa học (e.g. 6a149071d...)"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Xếp hạng (Số sao)</label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-amber-400 hover:scale-110 transition duration-150"
                    >
                      <Star size={22} fill={star <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-500 ml-2">{rating}/5 Sao</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nội dung bình luận</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét tối thiểu 10 ký tự về khóa học..."
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
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