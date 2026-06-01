"use client";

import { useEffect, useState } from "react";
import { faqService, FaqItem } from "@/src/services/faq"; 
import { 
  Plus, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  X, 
  CheckCircle 
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
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
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
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi khi lưu dữ liệu.");
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
    } catch (err: any) {
      alert(err.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER TÍNH NĂNG */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={26} />
            Homepage FAQs Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các câu hỏi thường gặp hiển thị công khai ở khu vực Trang chủ hệ thống.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-md shadow-blue-600/10 transition-all text-sm"
        >
          <Plus size={18} />
          Add New FAQ
        </button>
      </div>

      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* TRẠNG THÁI LOADING / LỖI / DANH SÁCH DỮ LIỆU */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-medium">Fetching FAQ collections...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center text-rose-700 flex flex-col items-center justify-center gap-2">
          <AlertCircle size={32} />
          <p className="font-semibold">Đã xảy ra lỗi dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <HelpCircle className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="font-medium text-slate-600">Chưa có câu hỏi nào được tạo</p>
          <p className="text-xs text-slate-400 mt-1">Bấm nút "Add New FAQ" ở góc trên để bắt đầu thêm câu hỏi đầu tiên.</p>
        </div>
      ) : (
        /* DANH SÁCH FAQ DẠNG GRID/LIST */
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq._id} 
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-start gap-2.5">
                  <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-lg mt-0.5">
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

              {/* HÀNH ĐỘNG ĐIỀU KHIỂN (SỬA / XÓA) */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Sửa câu hỏi"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id!)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-lg">
                {editingId ? "Edit Homepage FAQ" : "Create New Homepage FAQ"}
              </h4>
              <button 
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Question (Câu hỏi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Chính sách hoàn trả học phí như thế nào?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Answer (Câu trả lời ngắn gọn) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập nội dung câu trả lời hiển thị chi tiết tại đây..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 flex items-center gap-2 disabled:bg-blue-400"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
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