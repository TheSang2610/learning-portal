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

import styles from "./page.module.scss";
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
    <div className={styles.stack}>
      {/* HEADER */}
      <div className={styles.col}>
        <div>
          <h1 className={styles.title}>
            <MessageSquare className={styles.box} size={24} />
            Reviews Management
          </h1>
          <p className={styles.text}>
            Xem, tạo mới, chỉnh sửa hoặc loại bỏ các nội dung đánh giá trên hệ thống.
          </p>
        </div>

        <div className={styles.row}>
          <button onClick={fetchAllReviews} className={styles.button}>
            <RefreshCw size={14} className={loading ? styles.spinner : ""} />
            Làm mới
          </button>

          <button onClick={openCreateModal} className={styles.button2}>
            <Plus size={14} />
            Tạo Review mới
          </button>
        </div>
      </div>

      {/* BẢNG QUẢN LÝ DANH SÁCH */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.stack2}>
            <div className={styles.spinner2}></div>
            <p className={styles.text2}>Đang tải dữ liệu đánh giá toàn hệ thống...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className={styles.scroller}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.row2}>
                  <th className={styles.headCell}>Học viên / Ngày đăng</th>
                  <th className={styles.headCell2}>Khóa học</th>
                  <th className={styles.headCell3}>Đánh giá</th>
                  <th className={styles.headCell4}>Nội dung bình luận</th>
                  <th className={styles.headCell5}>Tương tác</th>
                  <th className={styles.headCell6}>Hành động</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {reviews.map((review) => {
                  const studentName = review.student?.name || "Ẩn danh";
                  // review.course la ObjectId dang chuoi khi khong duoc populate.
                  const courseTitle =
                    (typeof review.course === "object" ? review.course?.title : "") ||
                    "Khóa học học viên đăng ký";

                  return (
                    <tr key={review._id} className={styles.row3}>
                      <td className={styles.headCell4}>
                        <div className={styles.stack3}>
                          <div className={styles.row4}>
                            <User size={14} className={styles.box2} />
                            <span className={styles.label}>{studentName}</span>
                          </div>
                          <p className={styles.text3}>
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")} lúc{" "}
                            {new Date(review.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>

                      <td className={styles.headCell4}>
                        <div className={styles.row5}>
                          <BookOpen size={14} className={styles.box3} />
                          <span className={styles.label2}>{courseTitle}</span>
                        </div>
                      </td>

                      <td className={styles.headCell4}>
                        <div className={styles.stack3}>
                          <div className={styles.row6}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className={styles.card2}>
                              <CheckCircle size={9} /> Đã mua
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={styles.headCell4}>
                        <p className={styles.text4}>&quot;{review.comment}&quot;</p>
                      </td>

                      <td className={styles.cell}>
                        <span className={styles.label3}>👍 {review.helpful || 0}</span>
                      </td>

                      <td className={styles.cell}>
                        <div className={styles.row7}>
                          <button
                            onClick={() => openUpdateModal(review)}
                            className={styles.button3}
                            title="Sửa đánh giá"
                          >
                            <Edit3 size={15} /> Sửa
                          </button>
                          <button
                            disabled={isDeleting === review._id}
                            onClick={() => handleDeleteReview(review._id)}
                            className={styles.button4}
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
          <div className={styles.stack4}>
            <MessageSquare size={36} className={styles.box4} />
            <p className={styles.text5}>
              Chưa có đánh giá nào được ghi nhận trên hệ thống.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL DIỀU HƯỚNG: CREATE / UPDATE ================= */}
      {isModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.card3}>
            {/* Modal Header */}
            <div className={styles.row8}>
              <h3 className={styles.subheading}>
                {modalMode === "create"
                  ? "Tạo Đánh Giá Trực Tiếp"
                  : "Chỉnh Sửa Đánh Giá Học Viên"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.button5}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className={styles.form}>
              {modalMode === "create" && (
                <div className={styles.stack5}>
                  <label className={styles.fieldLabel}>Course ID (Mã khóa học)</label>
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Nhập chuỗi ID khóa học (e.g. 6a149071d...)"
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.stack5}>
                <label className={styles.fieldLabel2}>Xếp hạng (Số sao)</label>
                <div className={styles.card4}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={styles.button6}
                    >
                      <Star size={22} fill={star <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className={styles.label4}>{rating}/5 Sao</span>
                </div>
              </div>

              <div className={styles.stack5}>
                <label className={styles.fieldLabel}>Nội dung bình luận</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét tối thiểu 10 ký tự về khóa học..."
                  className={styles.textarea}
                />
              </div>

              {/* Modal Footer */}
              <div className={styles.row9}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.button7}
                >
                  Hủy bỏ
                </button>
                <button type="submit" disabled={submitting} className={styles.button8}>
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
