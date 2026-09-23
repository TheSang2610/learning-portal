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

import styles from "./page.module.scss";
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
      <div className={styles.box}>
        Không tìm thấy ID bài tập Quiz hợp lệ. Vui lòng quay lại giáo trình!
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.col}>
        <Loader2 className={styles.spinner} size={28} />
        <p className={styles.text}>Đang tải báo cáo lớp học...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* NÚT QUAY LẠI GIÁO TRÌNH */}
      <div>
        <button
          onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
          className={styles.button}
        >
          <ArrowLeft size={16} /> Quay lại quản lý giáo trình
        </button>
        <span className={styles.label}>Báo cáo tổng quan điểm số</span>
        <h1 className={styles.title}>Bài tập: {stats?.title || "Đang cập nhật..."}</h1>
      </div>

      {/* THẺ TỔNG QUAN SỐ LIỆU (LIGHT MODE) */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.text2}>Đã nộp bài</p>
          <p className={styles.text3}>{stats?.submittedList?.length || 0}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>Điểm trung bình</p>
          <p className={styles.text4}>{stats?.averageScore || 0}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>Tỷ lệ Đạt (Pass)</p>
          <p className={styles.text5}>{stats?.passRate || 0}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>Chưa hoàn thành</p>
          <p className={styles.text6}>{stats?.unsubmittedList?.length || 0}</p>
        </div>
      </div>

      {/* THANH DI CHUYỂN TAB */}
      <div className={styles.row}>
        <button
          onClick={() => setActiveTab("submitted")}
          className={`${styles.button9} ${activeTab === "submitted" ? styles.button2 : styles.button3}`}
        >
          Đã làm bài ({stats?.submittedList?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("unsubmitted")}
          className={`${styles.button9} ${activeTab === "unsubmitted" ? styles.button4 : styles.button3}`}
        >
          Chưa nộp bài ({stats?.unsubmittedList?.length || 0})
        </button>
      </div>

      {/* DANH SÁCH ĐÃ LÀM BÀI */}
      {activeTab === "submitted" && (
        <div className={styles.card2}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.row2}>
                <th className={styles.headCell}>Học viên</th>
                <th className={styles.headCell}>Kết quả đạt được</th>
                <th className={styles.headCell}>Trạng thái</th>
                <th className={styles.headCell}>Thời gian nộp bài</th>
                <th className={styles.headCell2}>Hệ thống quản trị</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {stats?.submittedList?.map((item) => (
                <tr key={item._id} className={styles.row3}>
                  <td className={styles.headCell}>
                    <p className={styles.text7}>{item.student?.name}</p>
                    <p className={styles.text8}>{item.student?.email}</p>
                  </td>
                  <td className={styles.headCell}>
                    <span className={styles.label2}>{item.score} điểm</span>
                    <span className={styles.label3}>
                      Tỷ lệ chính xác: {item.percentage}%
                    </span>
                  </td>
                  <td className={styles.headCell}>
                    {item.passed ? (
                      <span className={styles.card3}>
                        <CheckCircle size={12} /> Đạt yêu cầu
                      </span>
                    ) : (
                      <span className={styles.card4}>
                        <XCircle size={12} /> Điểm thấp
                      </span>
                    )}
                  </td>
                  <td className={styles.cell}>
                    {new Date(item.submittedAt).toLocaleString("vi-VN")}
                    <p className={styles.text9}>Lượt làm: Thứ #{item.attemptNumber}</p>
                  </td>
                  <td className={styles.headCell2}>
                    <button
                      onClick={() =>
                        openRetryModal(item.student?._id, item.student?.name)
                      }
                      className={`${styles.button10} ${
                        !item.passed ? styles.button5 : styles.button6
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
                  <td colSpan={5} className={styles.cell2}>
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
        <div className={styles.card2}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.row2}>
                <th className={styles.headCell}>Họ và tên</th>
                <th className={styles.headCell}>Email</th>
                <th className={styles.headCell2}>Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className={styles.tbody2}>
              {stats?.unsubmittedList?.map((student) => (
                <tr key={student._id} className={styles.row3}>
                  <td className={styles.cell3}>
                    <AlertCircle size={14} className={styles.box2} />
                    {student.name}
                  </td>
                  <td className={styles.cell4}>{student.email}</td>
                  <td className={styles.headCell2}>
                    <a
                      href={`mailto:${student.email}?subject=Nhắc nhở làm bài tập&body=Chào ${student.name}, bạn chưa hoàn thành bài tập trắc nghiệm.`}
                      className={styles.link}
                    >
                      <Mail size={12} /> Hối thúc lẹ
                    </a>
                  </td>
                </tr>
              ))}
              {stats?.unsubmittedList?.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.cell5}>
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
        <div className={styles.overlay}>
          <div className={`${styles.hienPhongTo} ${styles.card5}`}>
            <div className={styles.row4}>
              <div className={styles.card6}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className={styles.subheading}>Xác nhận cấp quyền làm lại</h3>
                <p className={styles.text10}>
                  Học sinh được chọn:{" "}
                  <span className={styles.label4}>{selectedStudent.name}</span>
                </p>
              </div>
            </div>

            <div className={styles.stack}>
              <label className={styles.fieldLabel}>Lý do mở khóa lại (Bắt buộc)</label>
              <textarea
                rows={3}
                value={retryReason}
                onChange={(e) => setRetryReason(e.target.value)}
                placeholder="Ví dụ: Điểm thấp dưới trung bình, lỗi đường truyền mạng tại lớp, xin làm lại để cải thiện điểm số..."
                className={styles.textarea}
              />
            </div>

            <div className={styles.row5}>
              <button onClick={() => setSelectedStudent(null)} className={styles.button7}>
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRetry}
                disabled={submittingId !== null}
                className={styles.button8}
              >
                {submittingId ? <Loader2 className={styles.spinner2} size={12} /> : null}
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
        <div className={styles.row6}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <QuizStatsPageContent />
    </Suspense>
  );
}
