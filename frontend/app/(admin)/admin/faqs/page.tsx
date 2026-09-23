"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { faqService, FaqItem } from "@/src/services/faq";

import styles from "./page.module.scss";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State kiểm soát Modal Thêm/Sửa
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State quản lý Form nhập liệu
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Tải danh sách FAQ Trang chủ khi vào trang
  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await faqService.getHomepageFaqs();
      setFaqs(data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách câu hỏi."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchFaqs);
  }, []);

  // Tự động tắt thông báo thành công sau 3 giây
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // 2. Mở modal ở chế độ "Thêm mới"
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setIsOpenModal(true);
  };

  // 3. Mở modal ở chế độ "Chỉnh sửa"
  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingId(faq._id || null);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsOpenModal(true);
  };

  // 4. Xử lý gửi Form (Cả Thêm lẫn Sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        // Gọi API Sửa
        await faqService.updateFaq(editingId, { question, answer });
        setSuccessMsg("Cập nhật câu hỏi thành công!");
      } else {
        // Gọi API Thêm (courseId truyền null vì đây là FAQ Trang chủ)
        await faqService.createFaq({ courseId: null, question, answer });
        setSuccessMsg("Thêm câu hỏi trang chủ thành công!");
      }
      setIsOpenModal(false);
      fetchFaqs(); // Tải lại danh sách mới
    } catch (err) {
      alert(getErrorMessage(err, "Đã xảy ra lỗi khi lưu dữ liệu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Xử lý Xóa câu hỏi
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;

    try {
      await faqService.deleteFaq(id);
      setSuccessMsg("Xóa câu hỏi thành công!");
      fetchFaqs();
    } catch (err) {
      alert(getErrorMessage(err, "Xóa thất bại."));
    }
  };

  return (
    <div className={styles.stack}>
      {/* HEADER TÍNH NĂNG */}
      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <HelpCircle className={styles.box} size={26} />
            Homepage FAQs Management
          </h3>
          <p className={styles.text}>
            Quản lý các câu hỏi thường gặp hiển thị công khai ở khu vực Trang chủ hệ
            thống.
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className={styles.button}>
          <Plus size={18} />
          Add New FAQ
        </button>
      </div>

      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div className={`${styles.hienDan} ${styles.card}`}>
          <CheckCircle className={styles.box2} size={20} />
          <span className={styles.label}>{successMsg}</span>
        </div>
      )}

      {/* TRẠNG THÁI LOADING / LỖI / DANH SÁCH DỮ LIỆU */}
      {isLoading ? (
        <div className={styles.card2}>
          <Loader2 className={styles.spinner} size={32} />
          <p className={styles.label}>Fetching FAQ collections...</p>
        </div>
      ) : error ? (
        <div className={styles.card3}>
          <AlertCircle size={32} />
          <p className={styles.text2}>Đã xảy ra lỗi dữ liệu</p>
          <p className={styles.text3}>{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className={styles.card4}>
          <HelpCircle className={styles.box3} size={48} />
          <p className={styles.text4}>Chưa có câu hỏi nào được tạo</p>
          <p className={styles.text5}>
            Bấm nút &quot;Add New FAQ&quot; ở góc trên để bắt đầu thêm câu hỏi đầu tiên.
          </p>
        </div>
      ) : (
        /* DANH SÁCH FAQ DẠNG GRID/LIST */
        <div className={styles.stack2}>
          {faqs.map((faq, index) => (
            <div key={faq._id} className={`group ${styles.card5}`}>
              <div className={styles.stack3}>
                <div className={styles.row2}>
                  <span className={styles.label2}>Q{index + 1}</span>
                  <h4 className={styles.minorHeading}>{faq.question}</h4>
                </div>
                <div className={styles.box4}>{faq.answer}</div>
              </div>

              {/* HÀNH ĐỘNG ĐIỀU KHIỂN (SỬA / XÓA) */}
              <div className={styles.row3}>
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className={styles.button2}
                  title="Sửa câu hỏi"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id!)}
                  className={styles.button3}
                  title="Xóa câu hỏi"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DIALOG: THÊM VÀ SỬA (OVERLAY) */}
      {isOpenModal && (
        <div className={`${styles.hienDan} ${styles.overlay}`}>
          <div className={`${styles.phongTo} ${styles.card6}`}>
            {/* Modal Header */}
            <div className={styles.row4}>
              <h4 className={styles.minorHeading2}>
                {editingId ? "Edit Homepage FAQ" : "Create New Homepage FAQ"}
              </h4>
              <button onClick={() => setIsOpenModal(false)} className={styles.button4}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className={styles.fieldLabel}>
                  Question (Câu hỏi) <span className={styles.label3}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Chính sách hoàn trả học phí như thế nào?"
                  className={styles.input}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>
                  Answer (Câu trả lời ngắn gọn) <span className={styles.label3}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập nội dung câu trả lời hiển thị chi tiết tại đây..."
                  className={styles.textarea}
                />
              </div>

              {/* Modal Actions */}
              <div className={styles.row5}>
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className={styles.button5}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.button6}>
                  {isSubmitting && <Loader2 className={styles.spinner2} size={16} />}
                  {editingId ? "Save Changes" : "Create Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
