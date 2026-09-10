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
    <div className="space-y-6">
      {/* NÚT QUAY LẠI DANH SÁCH COURES */}
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <HelpCircle className="text-purple-600" size={26} />
            Course FAQs Management
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Thiết lập danh sách câu hỏi giải đáp thắc mắc hiển thị riêng cho khóa học này
            (ID: {courseId}).
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-purple-600/10 transition-all hover:bg-purple-700"
        >
          <Plus size={18} />
          Add Course FAQ
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle className="flex-shrink-0 text-emerald-500" size={20} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <p className="text-sm font-medium">Loading course questions...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
          <AlertCircle size={32} />
          <p className="font-semibold">Lỗi tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <HelpCircle className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="font-medium text-slate-600">
            Khóa học này chưa có câu hỏi FAQ nào
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Bấm nút &quot;Add Course FAQ&quot; ở trên để bổ trợ nội dung giải đáp cho học
            viên.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-600">
                    Q{index + 1}
                  </span>
                  <h4 className="text-[16px] leading-snug font-bold text-slate-800">
                    {faq.question}
                  </h4>
                </div>
                <div className="ml-4 border-l-2 border-slate-100 pl-9 text-[15px] leading-relaxed text-slate-600">
                  {faq.answer}
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-purple-50 hover:text-purple-600"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id!)}
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DIALOG */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h4 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Course FAQ" : "Add New Course FAQ"}
              </h4>
              <button
                onClick={() => setIsOpenModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Yêu cầu cấu hình tối thiểu để học mượt bài thực hành?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Answer
                </label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Bạn chỉ cần một chiếc máy tính RAM từ 4GB trở lên..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-purple-400"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <CourseFaqsPageContent />
    </Suspense>
  );
}
