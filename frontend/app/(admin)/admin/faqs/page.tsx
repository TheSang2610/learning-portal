"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
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
    <div className="space-y-6">
      {/* HEADER TÍNH NĂNG */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <HelpCircle className="text-blue-600" size={26} />
            Homepage FAQs Management
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý các câu hỏi thường gặp hiển thị công khai ở khu vực Trang chủ hệ
            thống.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/10 transition-all hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New FAQ
        </button>
      </div>

      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div className="animate-fadeIn flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle className="flex-shrink-0 text-emerald-500" size={20} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* TRẠNG THÁI LOADING / LỖI / DANH SÁCH DỮ LIỆU */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-medium">Fetching FAQ collections...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
          <AlertCircle size={32} />
          <p className="font-semibold">Đã xảy ra lỗi dữ liệu</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <HelpCircle className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="font-medium text-slate-600">Chưa có câu hỏi nào được tạo</p>
          <p className="mt-1 text-xs text-slate-500">
            Bấm nút &quot;Add New FAQ&quot; ở góc trên để bắt đầu thêm câu hỏi đầu tiên.
          </p>
        </div>
      ) : (
        /* DANH SÁCH FAQ DẠNG GRID/LIST */
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
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

              {/* HÀNH ĐỘNG ĐIỀU KHIỂN (SỬA / XÓA) */}
              <div className="flex flex-shrink-0 items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                  title="Sửa câu hỏi"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq._id!)}
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
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
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="animate-scaleUp w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h4 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Homepage FAQ" : "Create New Homepage FAQ"}
              </h4>
              <button
                onClick={() => setIsOpenModal(false)}
                className="rounded-lg p-1 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Question (Câu hỏi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Chính sách hoàn trả học phí như thế nào?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Answer (Câu trả lời ngắn gọn) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập nội dung câu trả lời hiển thị chi tiết tại đây..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/10 transition-all hover:bg-blue-700 disabled:bg-blue-400"
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
