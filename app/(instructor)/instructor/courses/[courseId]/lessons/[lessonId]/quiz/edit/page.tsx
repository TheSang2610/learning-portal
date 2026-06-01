"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, HelpCircle, Save, AlertCircle } from "lucide-react";
import { getCourseQuizzes, updateQuiz } from "@/src/services/quizService"; 

export default function InstructorEditQuizPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string; 

  const [targetQuizId, setTargetQuizId] = useState<string>(""); 
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [quizConfig, setQuizConfig] = useState({
    title: "",
    description: "",
    lessonId: "",
    passingScore: 70,
    timeLimit: 15,
    attempts: 1,
  });

  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const dataList = await getCourseQuizzes(courseId, lessonId); 
        
        const currentQuiz = Array.isArray(dataList) ? dataList.find((q: any) => {
          const qLessonId = typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
          return qLessonId === lessonId;
        }) : null;

        if (currentQuiz) {
          setTargetQuizId(currentQuiz._id); 
          setQuizConfig({
            title: currentQuiz.title || "",
            description: currentQuiz.description || "",
            lessonId: lessonId,
            passingScore: currentQuiz.passingScore || 70,
            timeLimit: currentQuiz.timeLimit || 15,
            attempts: currentQuiz.attempts || 1,
          });
          setQuestions(currentQuiz.questions || []);
        } else {
          alert("Không tìm thấy dữ liệu bài tập cho bài học này!");
          // 🎯 ĐIỀU HƯỚNG SAI/THIẾU VỀ LẠI INSTRUCTOR LESSONS
          router.push(`/instructor/courses/${courseId}/lessons`);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin chi tiết Quiz:", err);
        alert("Lỗi kết nối máy chủ khi tải bài tập.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchQuizDetails();
    }
  }, [courseId, lessonId]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "multiple_choice", points: 1, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) return alert("Bài tập trắc nghiệm phải có ít nhất 1 câu hỏi!");
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
    if (!targetQuizId) return alert("Lỗi định danh bài tập, không thể cập nhật.");

    try {
      setSubmitting(true);
      const payload = {
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

      await updateQuiz(targetQuizId, payload); 
      alert("Cập nhật bài tập trắc nghiệm thành công!");
      
      // 🎯 ĐIỀU HƯỚNG THÀNH CÔNG VỀ INSTRUCTOR LESSONS
      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (error: any) {
      alert(`Lỗi cập nhật: ${error?.message || "Hệ thống gặp trục trặc."}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải cấu trúc đề thi...</div>;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6">
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold">Chế độ Giảng viên (Instructor Mode)</p>
          <p className="text-amber-600 mt-0.5">Mọi thay đổi tại đây sẽ cập nhật trực tiếp vào kho lưu trữ học liệu của bạn.</p>
        </div>
      </div>

      <div>
        {/* 🎯 ĐỔI LINK SANG INSTRUCTOR */}
        <Link href={`/instructor/courses/${courseId}/lessons`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft size={14} /> Quay lại giáo trình
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Cập Nhật Bài Tập Trắc Nghiệm</h1>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* THÔNG TIN CHUNG */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề Quiz</label>
            <input
              type="text"
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
              value={quizConfig.title}
              onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Thời gian (Phút)</label>
              <input type="number" className="w-full border rounded-xl p-2.5 text-sm outline-none" value={quizConfig.timeLimit || ""} onChange={(e) => setQuizConfig({ ...quizConfig, timeLimit: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Điểm Đạt (%)</label>
              <input type="number" className="w-full border rounded-xl p-2.5 text-sm outline-none" value={quizConfig.passingScore} onChange={(e) => setQuizConfig({ ...quizConfig, passingScore: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Số lượt làm</label>
              <input type="number" className="w-full border rounded-xl p-2.5 text-sm outline-none" value={quizConfig.attempts} onChange={(e) => setQuizConfig({ ...quizConfig, attempts: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1"><HelpCircle size={16} className="text-blue-500" /> Danh sách câu hỏi ({questions.length})</h2>
            <button type="button" onClick={addQuestion} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold transition">+ Thêm câu hỏi</button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm relative">
              <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
              <div className="grid grid-cols-4 gap-4">
                <input type="text" className="col-span-3 border rounded-xl p-2.5 text-sm focus:border-blue-500 outline-none" value={question.text} onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)} placeholder="Nội dung câu hỏi..." required />
                <input type="number" className="border rounded-xl p-2.5 text-sm outline-none" value={question.points} onChange={(e) => handleQuestionChange(qIndex, "points", Number(e.target.value))} />
              </div>

              <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-dashed">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Các phương án:</span><button type="button" onClick={() => addOption(qIndex)} className="text-xs text-blue-600 font-semibold hover:underline">+ Thêm phương án</button></div>
                {question.options?.map((option: any, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <input type="radio" name={`correct-ans-edit-${qIndex}`} checked={option.isCorrect} onChange={() => handleOptionChange(qIndex, oIndex, "isCorrect", true)} className="w-4 h-4 text-blue-600" />
                    <input type="text" className="w-full border bg-white rounded-lg p-2 text-xs outline-none focus:border-blue-500" value={option.text} onChange={(e) => handleOptionChange(qIndex, oIndex, "text", e.target.value)} required />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* NÚT LƯU */}
        <div className="flex justify-end gap-3">
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 transition text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 disabled:bg-blue-400">
            <Save size={14} /> {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}