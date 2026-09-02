"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, HelpCircle, Save } from "lucide-react";
import { getCourseById } from "@/src/services/course";
import { createQuiz, type QuizQuestion } from "@/src/services/quizService"; // Import từ file dịch vụ của bạn

// Cau hoi luc dang soan khac QuizQuestion cua tang service o hai cho: chua co
// _id (bai chua luu), va options luon co mat vi giao dien luon dung it nhat
// mot phuong an. Tach rieng de khoi phai kiem tra undefined o moi cho.
interface PhuongAn {
  text: string;
  isCorrect: boolean;
}

interface CauHoiSoan {
  text: string;
  type: QuizQuestion["type"];
  points: number;
  options: PhuongAn[];
}

interface LessonSelect {
  _id: string;
  title: string;
}

function AdminCreateQuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") || "";
  const defaultLessonId = searchParams.get("lessonId") || ""; // Lấy từ URL nếu đi từ bài học sang

  const [lessons, setLessons] = useState<LessonSelect[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // State cấu hình cơ bản của Quiz
  const [quizConfig, setQuizConfig] = useState({
    title: "",
    description: "",
    lessonId: defaultLessonId,
    passingScore: 70,
    timeLimit: 15,
    attempts: 1,
  });

  // State quản lý danh sách câu hỏi động
  const [questions, setQuestions] = useState<CauHoiSoan[]>([
    {
      text: "",
      type: "multiple_choice",
      points: 1,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ]);

  // Load danh sách bài học để hiển thị vào thẻ <select>
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // GET /courses/:id tra thang ban ghi khoa hoc, khong boc them lop nao.
        const courseData = await getCourseById(courseId);
        if (courseData && Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as LessonSelect[]);
        }
      } catch (err) {
        console.error("Không tải được danh sách bài học:", err);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "multiple_choice",
        points: 1,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  // Xóa câu hỏi
  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1)
      return alert("Bài trắc nghiệm phải có ít nhất 1 câu hỏi!");
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  // Cập nhật nội dung câu hỏi
  // Cap nhat noi dung cau hoi.
  //
  // Kieu generic K buoc field va value phai khop nhau: goi
  // handleQuestionChange(i, "points", "abc") se bi tu choi ngay luc bien dich.
  const handleQuestionChange = <K extends keyof CauHoiSoan>(
    qIndex: number,
    field: K,
    value: CauHoiSoan[K],
  ) => {
    setQuestions((truoc) =>
      truoc.map((q, idx) => (idx === qIndex ? { ...q, [field]: value } : q)),
    );
  };

  // Cập nhật tùy chọn đáp án (Options)
  const handleOptionChange = <K extends keyof PhuongAn>(
    qIndex: number,
    oIndex: number,
    field: K,
    value: PhuongAn[K],
  ) => {
    setQuestions((truoc) =>
      truoc.map((q, idx) => {
        if (idx !== qIndex) return q;
        // Danh dau mot phuong an la dung -> tat cac phuong an dung khac cua
        // chinh cau hoi do, vi day la dang chon mot.
        if (field === "isCorrect" && value === true) {
          return {
            ...q,
            options: q.options.map((opt, i) => ({ ...opt, isCorrect: i === oIndex })),
          };
        }
        return {
          ...q,
          options: q.options.map((opt, i) =>
            i === oIndex ? { ...opt, [field]: value } : opt,
          ),
        };
      }),
    );
  };

  // Thêm phương án chọn lựa cho câu hỏi
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  // Submit Form tạo đề
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizConfig.title.trim()) return alert("Vui lòng nhập tiêu đề Quiz");

    // Thẩm định nhanh dữ liệu câu hỏi
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim())
        return alert(`Câu hỏi số ${i + 1} chưa điền nội dung!`);

      // Đảm bảo các option đáp án không bị bỏ trống chữ
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) {
          return alert(`Phương án lựa chọn số ${j + 1} của Câu hỏi ${i + 1} đang trống!`);
        }
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        courseId,
        lessonId: quizConfig.lessonId || undefined,
        title: quizConfig.title.trim(),
        description: quizConfig.description.trim(),
        passingScore: Number(quizConfig.passingScore),
        timeLimit: quizConfig.timeLimit ? Number(quizConfig.timeLimit) : null,
        attempts: Number(quizConfig.attempts),
        questions: questions.map((q) => ({
          text: q.text.trim(),
          type: q.type,
          points: Number(q.points) || 1,
          options: q.options.map((opt) => ({
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          })),
        })),
      };

      await createQuiz(payload);
      alert("Tạo bài tập trắc nghiệm (Quiz) thành công!");

      // Sử dụng router điều hướng an toàn
      router.push(`/admin/lessons?courseId=${courseId}`);
    } catch (error) {
      console.error("Chi tiết lỗi nhận diện tại Frontend:", error);

      // 🎯 Bọc thông báo lỗi an toàn bằng chuỗi String tường minh
      const errorMessage =
        getErrorMessage(error) || String(error) || "Lỗi không xác định từ hệ thống";
      alert(`Không thể tạo Quiz: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Link
            href={`/admin/lessons?courseId=${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={14} /> Quay lại giáo trình
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Soạn Thảo Bài Tập Quiz
          </h1>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* KHỐI 1: CẤU HÌNH THÔNG TIN CHUNG */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="border-b pb-2 text-sm font-bold text-slate-800">
            1. Cấu hình bài kiểm tra
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Tiêu đề Quiz
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Quiz ôn tập Kiến thức bài 1"
                className="w-full rounded-xl border p-2.5 text-sm outline-none focus:border-blue-500"
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Gắn vào Bài học (Lesson)
              </label>
              <select
                className="w-full rounded-xl border bg-white p-2.5 text-sm outline-none focus:border-blue-500"
                value={quizConfig.lessonId}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, lessonId: e.target.value })
                }
              >
                <option value="">-- Bài tập tổng hợp (Không chọn bài học) --</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">
                  Thời gian (Phút)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 text-sm outline-none"
                  value={quizConfig.timeLimit}
                  onChange={(e) =>
                    setQuizConfig({ ...quizConfig, timeLimit: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">
                  Điểm Đạt (%)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 text-sm outline-none"
                  value={quizConfig.passingScore}
                  onChange={(e) =>
                    setQuizConfig({ ...quizConfig, passingScore: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">
                  Số lượt làm
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 text-sm outline-none"
                  value={quizConfig.attempts}
                  onChange={(e) =>
                    setQuizConfig({ ...quizConfig, attempts: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Mô tả / Hướng dẫn làm bài
              </label>
              <textarea
                rows={2}
                placeholder="Đọc kỹ câu hỏi trước khi chọn đáp án..."
                className="w-full rounded-xl border p-2.5 text-sm outline-none"
                value={quizConfig.description}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* KHỐI 2: SOẠN BỘ CÂU HỎI ĐỘNG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-sm font-bold text-slate-800">
              <HelpCircle size={16} className="text-blue-500" /> 2. Danh sách câu hỏi (
              {questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
            >
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="relative space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-slate-500 transition hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-4">
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Nội dung câu hỏi #{qIndex + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:border-blue-500"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Điểm câu này
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border p-2.5 text-sm outline-none"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "points", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Soạn thảo các Option Đáp án */}
              <div className="space-y-2 rounded-xl border border-dashed bg-slate-50/50 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Các phương án lựa chọn:
                  </span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Thêm phương án
                  </button>
                </div>

                {question.options.map((option, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-ans-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() =>
                        handleOptionChange(qIndex, oIndex, "isCorrect", true)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <input
                      type="text"
                      placeholder={`Nhập phương án lựa chọn thứ ${oIndex + 1}`}
                      className="w-full rounded-lg border bg-white p-2 text-xs outline-none focus:border-blue-500"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(qIndex, oIndex, "text", e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* NÚT HOÀN TẤT */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:bg-blue-400"
          >
            <Save size={14} /> {submitting ? "Đang lưu hệ thống..." : "Hoàn tất lưu Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function AdminCreateQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <AdminCreateQuizPageContent />
    </Suspense>
  );
}
