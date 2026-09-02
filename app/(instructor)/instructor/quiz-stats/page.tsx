"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  RotateCcw,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { getQuizStats, allowStudentRetry, QuizStats } from "@/src/services/quizService";

function QuizStatsPageContent() {
  // Moi tham so deu lay tu query string:
  // /instructor/quiz-stats?courseId=...&lessonId=...&quizId=...
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId") || "";
  const quizId = searchParams.get("quizId");

  // 3. Các state quản lý dữ liệu
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"submitted" | "unsubmitted">("submitted");

  // State phục vụ tính năng mở lại kèm lý do
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [retryReason, setRetryReason] = useState("");

  const loadStats = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const data = await getQuizStats(quizId);
      setStats(data);
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
      // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
      // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
      // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
      // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
      void Promise.resolve().then(loadStats);
    }
  }, [loadStats, quizId]);

  // 🎯 XỬ LÝ KHI BẤM NÚT "CHO LÀM LẠI" -> MỞ MODAL NHẬP LÝ DO
  const openRetryModal = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setRetryReason(""); // Reset lại ô nhập lý do cũ
  };

  const handleConfirmRetry = async () => {
    if (!selectedStudent || !quizId) return;
    if (!retryReason.trim()) {
      alert("Vui lòng nhập lý do cho phép học sinh làm lại bài!");
      return;
    }

    setSubmittingId(selectedStudent.id);
    try {
      const res = await allowStudentRetry(quizId, selectedStudent.id, retryReason);

      alert(
        res?.message ||
          `Đã cấp quyền làm lại bài cho [${selectedStudent.name}] thành công!`,
      );
      setSelectedStudent(null); // Đóng modal nhập liệu
      await loadStats(); // Reload lại bảng điểm hiển thị mới nhất
    } catch (error) {
      alert(getErrorMessage(error, "Có lỗi xảy ra khi thực hiện mở lại bài."));
    } finally {
      setSubmittingId(null);
    }
  };

  if (!quizId) {
    return (
      <div className="p-8 text-center font-semibold text-red-500">
        Không tìm thấy ID bài tập Quiz hợp lệ. Vui lòng quay lại giáo trình!
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <p className="text-sm font-medium">Đang tải báo cáo lớp học...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-slate-700">
      {/* NÚT QUAY LẠI GIÁO TRÌNH */}
      <div>
        <button
          onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
          className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Quay lại quản lý giáo trình
        </button>
        <span className="block text-xs font-bold tracking-wider text-blue-600 uppercase">
          Báo cáo tổng quan điểm số
        </span>
        <h1 className="mt-0.5 text-2xl font-bold text-slate-900">
          Bài tập: {stats?.title || "Đang cập nhật..."}
        </h1>
      </div>

      {/* THẺ TỔNG QUAN SỐ LIỆU (LIGHT MODE) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đã nộp bài</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats?.submittedList?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Điểm trung bình</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats?.averageScore || 0}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tỷ lệ Đạt (Pass)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {stats?.passRate || 0}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Chưa hoàn thành</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {stats?.unsubmittedList?.length || 0}
          </p>
        </div>
      </div>

      {/* THANH DI CHUYỂN TAB */}
      <div className="flex gap-6 border-b border-slate-200 text-sm font-bold">
        <button
          onClick={() => setActiveTab("submitted")}
          className={`relative pb-3 transition-colors ${activeTab === "submitted" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-600"}`}
        >
          Đã làm bài ({stats?.submittedList?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("unsubmitted")}
          className={`relative pb-3 transition-colors ${activeTab === "unsubmitted" ? "border-b-2 border-amber-600 text-amber-600" : "text-slate-500 hover:text-slate-600"}`}
        >
          Chưa nộp bài ({stats?.unsubmittedList?.length || 0})
        </button>
      </div>

      {/* DANH SÁCH ĐÃ LÀM BÀI */}
      {activeTab === "submitted" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Học viên</th>
                <th className="p-4">Kết quả đạt được</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thời gian nộp bài</th>
                <th className="p-4 text-right">Hệ thống quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.submittedList?.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{item.student?.name}</p>
                    <p className="text-xs text-slate-500">{item.student?.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{item.score} điểm</span>
                    <span className="block text-xs text-slate-500">
                      Tỷ lệ chính xác: {item.percentage}%
                    </span>
                  </td>
                  <td className="p-4">
                    {item.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle size={12} /> Đạt yêu cầu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                        <XCircle size={12} /> Điểm thấp
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(item.submittedAt).toLocaleString("vi-VN")}
                    <p className="text-[10px] text-slate-500">
                      Lượt làm: Thứ #{item.attemptNumber}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        openRetryModal(item.student?._id, item.student?.name)
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        !item.passed
                          ? "border-amber-200 bg-amber-50 text-amber-700 shadow-xs hover:bg-amber-100"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <RotateCcw size={12} />
                      Cho làm lại
                    </button>
                  </td>
                </tr>
              ))}
              {stats?.submittedList?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-xs text-slate-500 italic"
                  >
                    Chưa có học sinh nào nộp bài tập này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DANH SÁCH CHƯA LÀM BÀI */}
      {activeTab === "unsubmitted" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.unsubmittedList?.map((student) => (
                <tr key={student._id} className="transition-colors hover:bg-slate-50/50">
                  <td className="inline-flex items-center gap-2 p-4 font-semibold text-slate-900">
                    <AlertCircle size={14} className="text-amber-500" />
                    {student.name}
                  </td>
                  <td className="p-4 text-slate-500">{student.email}</td>
                  <td className="p-4 text-right">
                    <a
                      href={`mailto:${student.email}?subject=Nhắc nhở làm bài tập&body=Chào ${student.name}, bạn chưa hoàn thành bài tập trắc nghiệm.`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Mail size={12} /> Hối thúc lẹ
                    </a>
                  </td>
                </tr>
              ))}
              {stats?.unsubmittedList?.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-10 text-center text-xs font-bold text-emerald-600"
                  >
                    🎉 Đơn lớp hoàn hảo! Không có ai nợ bài tập này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🎯 MODAL NHẬP LÝ DO CHO LÀM LẠI BÀI */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl duration-150">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-2 text-amber-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận cấp quyền làm lại
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Học sinh được chọn:{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedStudent.name}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500">
                Lý do mở khóa lại (Bắt buộc)
              </label>
              <textarea
                rows={3}
                value={retryReason}
                onChange={(e) => setRetryReason(e.target.value)}
                placeholder="Ví dụ: Điểm thấp dưới trung bình, lỗi đường truyền mạng tại lớp, xin làm lại để cải thiện điểm số..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600 transition hover:bg-slate-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRetry}
                disabled={submittingId !== null}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingId ? <Loader2 className="animate-spin" size={12} /> : null}
                Xác nhận & Khởi tạo lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function QuizStatsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <QuizStatsPageContent />
    </Suspense>
  );
}
