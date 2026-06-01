"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, HelpCircle, Save, AlertCircle } from "lucide-react";
import { getCourseById } from "@/src/services/course";
import { createQuiz } from "@/src/services/quizService"; 

interface LessonSelect {
  _id: string;
  title: string;
}

export default function InstructorCreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = params.courseId as string;
  const defaultLessonId = searchParams.get("lessonId") || ""; 

  const [lessons, setLessons] = useState<LessonSelect[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [quizConfig, setQuizConfig] = useState({
    title: "",
    description: "",
    lessonId: defaultLessonId,
    passingScore: 70,
    timeLimit: 15,
    attempts: 1,
  });

  const [questions, setQuestions] = useState<any[]>([
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

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await getCourseById(courseId) as any;
        const courseData = response?.data || response?.course || response;
        if (courseData && Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons);
        }
      } catch (err) {
        console.error("Không tải được danh sách bài học:", err);
      }
    };
    fetchCourseData();
  }, [courseId]);

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

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) return alert("Bài trắc nghiệm phải có ít nhất 1 câu hỏi!");
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionChange = (qIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === "isCorrect" && value === true) {
      updated[qIndex].options = updated[qIndex].options.map((opt: any, idx: number) => ({
        ...opt,
        isCorrect: idx === oIndex,
      }));
    } else {
      updated[qIndex].options[oIndex][field] = value;
    }
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizConfig.title.trim()) return alert("Vui lòng nhập tiêu đề Quiz");

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) return alert(`Câu hỏi số ${i + 1} chưa điền nội dung!`);
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
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          points: Number(q.points) || 1,
          options: q.options.map((opt: any) => ({
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect
          }))
        })),
      };

      await createQuiz(payload);
      alert("Tạo bài tập trắc nghiệm (Quiz) thành công!");
      
      // 🎯 ĐIỀU HƯỚNG VỀ GIÁO TRÌNH INSTRUCTOR
      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (error: any) {
      console.error("Chi tiết lỗi nhận diện tại Frontend:", error);
      const errorMessage = error?.message || String(error) || "Lỗi không xác định từ hệ thống";
      alert(`Không thể tạo Quiz: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6">
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold">Chế độ Giảng viên (Instructor Mode)</p>
          <p className="text-amber-600 mt-0.5">Quiz mới tạo sẽ được lưu dưới dạng bản nháp đính kèm khóa học của bạn.</p>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          {/* 🎯 ĐỔI LINK SANG INSTRUCTOR */}
          <Link href={`/instructor/courses/${courseId}/lessons`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={14} /> Quay lại giáo trình
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Soạn Thảo Bài Tập Quiz</h1>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* KHỐI 1: CẤU HÌNH THÔNG TIN CHUNG */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b pb-2">1. Cấu hình bài kiểm tra</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề Quiz</label>
              <input
                type="text"
                placeholder="Ví dụ: Quiz ôn tập Kiến thức bài 1"
                className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Gắn vào Bài học (Lesson)</label>
              <select
                className="w-full border rounded-xl p-2.5 text-sm bg-white outline-none focus:border-blue-500"
                value={quizConfig.lessonId}
                onChange={(e) => setQuizConfig({ ...quizConfig, lessonId: e.target.value })}
              >
                <option value="">-- Bài tập tổng hợp (Không chọn bài học) --</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Thời gian (Phút)</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  value={quizConfig.timeLimit}
                  onChange={(e) => setQuizConfig({ ...quizConfig, timeLimit: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Điểm Đạt (%)</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  value={quizConfig.passingScore}
                  onChange={(e) => setQuizConfig({ ...quizConfig, passingScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Số lượt làm</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  value={quizConfig.attempts}
                  onChange={(e) => setQuizConfig({ ...quizConfig, attempts: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Mô tả / Hướng dẫn làm bài</label>
              <textarea
                rows={2}
                placeholder="Đọc kỹ câu hỏi trước khi chọn đáp án..."
                className="w-full border rounded-xl p-2.5 text-sm outline-none"
                value={quizConfig.description}
                onChange={(e) => setQuizConfig({ ...quizConfig, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* KHỐI 2: SOẠN BỘ CÂU HỎI ĐỘNG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              <HelpCircle size={16} className="text-blue-500" /> 2. Danh sách câu hỏi ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm relative">
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nội dung câu hỏi #{qIndex + 1}</label>
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Điểm câu này</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(qIndex, "points", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-dashed">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-600">Các phương án lựa chọn:</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Thêm phương án
                  </button>
                </div>

                {question.options.map((option: any, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-ans-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() => handleOptionChange(qIndex, oIndex, "isCorrect", true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <input
                      type="text"
                      placeholder={`Nhập phương án lựa chọn thứ ${oIndex + 1}`}
                      className="w-full border bg-white rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                      value={option.text}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, "text", e.target.value)}
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 disabled:bg-blue-400"
          >
            <Save size={14} /> {submitting ? "Đang lưu hệ thống..." : "Hoàn tất lưu Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}