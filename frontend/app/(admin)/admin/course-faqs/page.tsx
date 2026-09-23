"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams } from "next/navigation";
import { faqService, FaqItem } from "@/src/services/faq";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import styles from "./page.module.scss";
function CourseFaqsPageContent() {
  // Lấy courseId từ query string: /admin/course-faqs?courseId=...
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCourseFaqs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Đọc dữ liệu dựa theo courseId khóa học
      const data = await faqService.getFaqsByCourse(courseId);
      setFaqs(data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách câu hỏi của khóa học."));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    if (courseId) void Promise.resolve().then(fetchCourseFaqs);
  }, [fetchCourseFaqs, courseId]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setIsOpenModal(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingId(faq._id || null);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        await faqService.updateFaq(editingId, { question, answer });
        setSuccessMsg("Cập nhật câu hỏi khóa học thành công!");
      } else {
        // 🔥 GỬI KÈM COURSE ID KHI TẠO
        await faqService.createFaq({ courseId, question, answer });
        setSuccessMsg("Thêm câu hỏi mới cho khóa học thành công!");
      }
      setIsOpenModal(false);
      fetchCourseFaqs();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể lưu dữ liệu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi khóa học?")) return;

    try {
      await faqService.deleteFaq(id);
      setSuccessMsg("Xóa câu hỏi thành công!");
      fetchCourseFaqs();
    } catch (err) {
      alert(getErrorMessage(err, "Xóa thất bại."));
    }
  };

  return (
    <div className={styles.stack}>
      {/* NÚT QUAY LẠI DANH SÁCH COURES */}
      <div>
        <Link href="/admin/courses" className={styles.box}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>

      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <HelpCircle className={styles.box2} size={26} />
            Course FAQs Management
          </h3>
          <p className={styles.text}>
            Thiết lập danh sách câu hỏi giải đáp thắc mắc hiển thị riêng cho khóa học này
            (ID: {courseId}).
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className={styles.button}>
          <Plus size={18} />
          Add Course FAQ
        </button>
      </div>

      {successMsg && (
        <div className={styles.card}>
          <CheckCircle className={styles.box3} size={20} />
          <span className={styles.label}>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className={styles.card2}>
          <Loader2 className={styles.spinner} size={32} />
          <p className={styles.label}>Loading course questions...</p>
        </div>
      ) : error ? (
        <div className={styles.card3}>
          <AlertCircle size={32} />
          <p className={styles.text2}>Lỗi tải dữ liệu</p>
          <p className={styles.text3}>{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className={styles.card4}>
          <HelpCircle className={styles.box4} size={48} />
          <p className={styles.text4}>Khóa học này chưa có câu hỏi FAQ nào</p>
          <p className={styles.text5}>
            Bấm nút &quot;Add Course FAQ&quot; ở trên để bổ trợ nội dung giải đáp cho học
            viên.
          </p>
        </div>
      ) : (
        <div className={styles.stack2}>
          {faqs.map((faq, index) => (
            <div key={faq._id} className={`group ${styles.card5}`}>
              <div className={styles.stack3}>
                <div className={styles.row2}>
                  <span className={styles.label2}>Q{index + 1}</span>
                  <h4 className={styles.minorHeading}>{faq.question}</h4>
                </div>
                <div className={styles.box5}>{faq.answer}</div>
              </div>

              <div className={styles.row3}>
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className={styles.button2}
                >
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(faq._id!)} className={styles.button3}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DIALOG */}
      {isOpenModal && (
        <div className={styles.overlay}>
          <div className={styles.card6}>
            <div className={styles.row4}>
              <h4 className={styles.minorHeading2}>
                {editingId ? "Edit Course FAQ" : "Add New Course FAQ"}
              </h4>
              <button onClick={() => setIsOpenModal(false)} className={styles.button4}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className={styles.fieldLabel}>Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Yêu cầu cấu hình tối thiểu để học mượt bài thực hành?"
                  className={styles.input}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Answer</label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Bạn chỉ cần một chiếc máy tính RAM từ 4GB trở lên..."
                  className={styles.textarea}
                />
              </div>

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
                  {editingId ? "Save Changes" : "Add FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function CourseFaqsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row6}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <CourseFaqsPageContent />
    </Suspense>
  );
}
