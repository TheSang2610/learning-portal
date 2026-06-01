"use client";

import { useEffect, useState, use } from "react";
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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseFaqsPage({ params }: PageProps) {
  // Giải nén courseId từ params động của URL
  const { courseId } = use(params);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCourseFaqs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Đọc dữ liệu dựa theo courseId khóa học
      const data = await faqService.getFaqsByCourse(courseId);
      setFaqs(data || []);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách câu hỏi của khóa học.");
    } {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourseFaqs();
  }, [courseId]);

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
    } catch (err: any) {
      alert(err.message || "Không thể lưu dữ liệu.");
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
    } catch (err: any) {
      alert(err.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* NÚT QUAY LẠI DANH SÁCH COURES */}
      <div>
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-purple-600" size={26} />
            Course FAQs Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập danh sách câu hỏi giải đáp thắc mắc hiển thị riêng cho khóa học này (ID: {courseId}).
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-md shadow-purple-600/10 transition-all text-sm"
        >
          <Plus size={18} />
          Add Course FAQ
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <p className="text-sm font-medium">Loading course questions...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center text-rose-700 flex flex-col items-center justify-center gap-2">
          <AlertCircle size={32} />
          <p className="font-semibold">Lỗi tải dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <HelpCircle className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="font-medium text-slate-600">Khóa học này chưa có câu hỏi FAQ nào</p>
          <p className="text-xs text-slate-400 mt-1">Bấm nút "Add Course FAQ" ở trên để bổ trợ nội dung giải đáp cho học viên.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq._id} 
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-start gap-2.5">
                  <span className="bg-purple-50 text-purple-600 font-bold text-xs px-2.5 py-1 rounded-lg mt-0.5">
                    Q{index + 1}
                  </span>
                  <h4 className="font-bold text-slate-800 text-[16px] leading-snug">
                    {faq.question}
                  </h4>
                </div>
                <div className="pl-9 text-[15px] text-slate-600 leading-relaxed border-l-2 border-slate-100 ml-4">
                  {faq.answer}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id!)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-lg">
                {editingId ? "Edit Course FAQ" : "Add New Course FAQ"}
              </h4>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Yêu cầu cấu hình tối thiểu để học mượt bài thực hành?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Bạn chỉ cần một chiếc máy tính RAM từ 4GB trở lên..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 flex items-center gap-2 disabled:bg-purple-400"
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