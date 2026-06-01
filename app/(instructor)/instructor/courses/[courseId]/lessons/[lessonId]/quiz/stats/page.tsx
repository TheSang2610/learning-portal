"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertCircle, Mail, RotateCcw, ArrowLeft, MessageSquare } from "lucide-react";
import { getQuizStats, allowStudentRetry, QuizStats } from "@/src/services/quizService";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default function QuizStatsPage({ params }: PageProps) {
  // 1. Giải nén params theo chuẩn Next.js mới nhất bằng react `use()`
  const { courseId, lessonId } = use(params);
  
  // 2. Lấy quizId từ Query String (?quizId=...)
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quizId");

  // 3. Các state quản lý dữ liệu
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"submitted" | "unsubmitted">("submitted");
  
  // State phục vụ tính năng mở lại kèm lý do
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [retryReason, setRetryReason] = useState("");

  const loadStats = async () => {
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
  };

  useEffect(() => {
    if (quizId) {
      loadStats();
    }
  }, [quizId]);

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
      
      alert(res?.message || `Đã cấp quyền làm lại bài cho [${selectedStudent.name}] thành công!`);
      setSelectedStudent(null); // Đóng modal nhập liệu
      await loadStats(); // Reload lại bảng điểm hiển thị mới nhất
    } catch (error: any) {
      alert(error?.message || "Có lỗi xảy ra khi thực hiện mở lại bài.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (!quizId) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Không tìm thấy ID bài tập Quiz hợp lệ. Vui lòng quay lại giáo trình!
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-2">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <p className="text-sm font-medium">Đang tải báo cáo lớp học...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-700">
      {/* NÚT QUAY LẠI GIÁO TRÌNH */}
      <div>
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
        >
          <ArrowLeft size={16} /> Quay lại quản lý giáo trình
        </button>
        <span className="block text-xs font-bold text-blue-600 tracking-wider uppercase">Báo cáo tổng quan điểm số</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Bài tập: {stats?.title || "Đang cập nhật..."}</h1>
      </div>

      {/* THẺ TỔNG QUAN SỐ LIỆU (LIGHT MODE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Đã nộp bài</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.submittedList?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Điểm trung bình</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.averageScore || 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Tỷ lệ Đạt (Pass)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.passRate || 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Chưa hoàn thành</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.unsubmittedList?.length || 0}</p>
        </div>
      </div>

      {/* THANH DI CHUYỂN TAB */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("submitted")}
          className={`pb-3 relative transition-colors ${activeTab === "submitted" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          Đã làm bài ({stats?.submittedList?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("unsubmitted")}
          className={`pb-3 relative transition-colors ${activeTab === "unsubmitted" ? "text-amber-600 border-b-2 border-amber-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          Chưa nộp bài ({stats?.unsubmittedList?.length || 0})
        </button>
      </div>

      {/* DANH SÁCH ĐÃ LÀM BÀI */}
      {activeTab === "submitted" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                <th className="p-4">Học viên</th>
                <th className="p-4">Kết quả đạt được</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thời gian nộp bài</th>
                <th className="p-4 text-right">Hệ thống quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.submittedList?.map((item: any) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{item.student?.name}</p>
                    <p className="text-xs text-slate-400">{item.student?.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{item.score} điểm</span>
                    <span className="text-xs text-slate-400 block">Tỷ lệ chính xác: {item.percentage}%</span>
                  </td>
                  <td className="p-4">
                    {item.passed ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border border-emerald-100">
                        <CheckCircle size={12} /> Đạt yêu cầu
                      </span>
                    ) : (
                      <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border border-red-100">
                        <XCircle size={12} /> Điểm thấp
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(item.submittedAt).toLocaleString("vi-VN")}
                    <p className="text-[10px] text-slate-400">Lượt làm: Thứ #{item.attemptNumber}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openRetryModal(item.student?._id, item.student?.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-lg transition text-xs border ${
                        !item.passed 
                          ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 shadow-xs" 
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
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
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-xs italic">Chưa có học sinh nào nộp bài tập này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DANH SÁCH CHƯA LÀM BÀI */}
      {activeTab === "unsubmitted" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.unsubmittedList?.map((student: any) => (
                <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 inline-flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" />
                    {student.name}
                  </td>
                  <td className="p-4 text-slate-500">{student.email}</td>
                  <td className="p-4 text-right">
                    <a
                      href={`mailto:${student.email}?subject=Nhắc nhở làm bài tập&body=Chào ${student.name}, bạn chưa hoàn thành bài tập trắc nghiệm.`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 transition"
                    >
                      <Mail size={12} /> Hối thúc lẹ
                    </a>
                  </td>
                </tr>
              ))}
              {stats?.unsubmittedList?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-emerald-600 font-bold text-xs">🎉 Đơn lớp hoàn hảo! Không có ai nợ bài tập này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🎯 MODAL NHẬP LÝ DO CHO LÀM LẠI BÀI */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận cấp quyền làm lại</h3>
                <p className="text-xs text-slate-400 mt-0.5">Học sinh được chọn: <span className="font-semibold text-slate-700">{selectedStudent.name}</span></p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Lý do mở khóa lại (Bắt buộc)</label>
              <textarea
                rows={3}
                value={retryReason}
                onChange={(e) => setRetryReason(e.target.value)}
                placeholder="Ví dụ: Điểm thấp dưới trung bình, lỗi đường truyền mạng tại lớp, xin làm lại để cải thiện điểm số..."
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRetry}
                disabled={submittingId !== null}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
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