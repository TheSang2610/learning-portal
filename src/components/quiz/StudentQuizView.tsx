"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Award, Timer, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react";
import { getQuizById, submitQuizAttempt } from "@/src/services/quizService"; 

interface StudentQuizViewProps {
  quizId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StudentQuizView({ quizId, onClose, onSuccess }: StudentQuizViewProps) {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>("");
  
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (!quizId) return;
    
    getQuizById(quizId)
      .then((data: any) => {
        setQuiz(data);
        setStartedAt(new Date().toISOString());

        if (data.latestAttempt) {
          const attempt = data.latestAttempt;
          setResult(attempt); 
          
          if (attempt.answers) {
            const oldAnswers: { [key: string]: string } = {};
            attempt.answers.forEach((ans: any) => {
              const qId = ans.questionId?._id || ans.questionId;
              oldAnswers[qId] = ans.studentAnswer;
            });
            setAnswers(oldAnswers);
          }

          const maxAttemptsAllowed = data.attempts || 1;
          const currentAttemptCount = attempt.attemptNumber || 1;

          if (attempt.passed || currentAttemptCount >= maxAttemptsAllowed) {
            setIsLocked(true); 
            setTimeLeft(null); 
            return;
          }
        } else {
          setResult(null);
          setAnswers({});
          setIsLocked(false);
        }

        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải bài kiểm tra:", err);
        alert("Không thể tải bài kiểm tra này!");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  async function executeSubmit() {
    if (!quiz || submitting || isLocked) return;
    
    setSubmitting(true); 

    const formattedAnswers = quiz.questions.map((q: any) => ({
      questionId: q._id!,
      studentAnswer: answers[q._id!] || "",
    }));

    try {
      const res = await submitQuizAttempt(quizId, formattedAnswers, startedAt);
      setResult(res);
      
      if (res.passed || quiz.attempts === 1) {
        setIsLocked(true);
      }

      if (res.passed && onSuccess) {
        await onSuccess();
      }

      const mainContainer = document.querySelector(".overflow-y-auto");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Lỗi khi nộp bài:", error);
      alert(error?.response?.data?.message || "Đã xảy ra lỗi trong quá trình nộp bài, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (timeLeft === null || result || isLocked) return;

    if (timeLeft <= 0) {
      alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài của bạn.");
      executeSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, result, isLocked]);

  const handleSelectOption = (questionId: string, optionText: string) => {
    if (result || isLocked) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubmit = async () => {
    if (!quiz || isLocked) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${quiz.questions.length} câu hỏi. Bạn vẫn muốn nộp bài chứ?`)) {
        return;
      }
    }
    executeSubmit();
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="animate-spin mr-2 text-[#0056d2]" size={20} /> Đang kiểm tra lịch sử làm bài...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-20 text-center text-red-600 bg-white rounded-2xl border border-slate-200 shadow-sm font-medium">
        Không tìm thấy thông tin bài kiểm tra.
      </div>
    );
  }

  const canRetry = result && !result.passed && (result.attemptNumber < (quiz.attempts || 1));

  return (
    <div className="space-y-6 text-slate-700">
      {/* THANH THOÁT / QUAY LẠI VIDEO */}
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm w-fit"
      >
        <ArrowLeft size={14} /> Quay lại bài học
      </button>

      {/* THÔNG TIN CHI TIẾT BÀI KIỂM TRA */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        {isLocked && (
          <div className="absolute top-3 right-3 bg-blue-50 text-[#0056d2] border border-blue-100 text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1 uppercase tracking-wider">
            <Lock size={12} /> Chế độ xem lại kết quả
          </div>
        )}
        <h1 className="text-base font-extrabold text-slate-900 mb-2">{quiz.title}</h1>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">{quiz.description}</p>
        
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium">
            Giới hạn lượt làm bài: {quiz.attempts} lần
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium">
            <Award size={13} className="text-amber-500" /> Cần {quiz.passingScore}% để đạt
          </span>
          {timeLeft !== null && !isLocked && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] ${
              timeLeft < 60 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-blue-50 border-blue-100 text-[#0056d2]"
            }`}>
              <Timer size={13} /> Thời gian: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* KHỐI THÔNG BÁO ĐIỂM SỐ PASTEL */}
      {result && (
        <div className={`border p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          result.passed 
            ? 'bg-emerald-50/60 border-emerald-200' 
            : 'bg-red-50/60 border-red-200' 
        }`}>
          <div>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.passed ? "BẠN ĐÃ ĐẠT TIÊU CHUẨN BÀI HỌC" : "BẠN CHƯA ĐẠT ĐIỂM ĐIỀU KIỆN"}
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Bạn đã hoàn thành bài kiểm tra ở lượt thứ <span className="font-semibold text-slate-800">{result.attemptNumber || 1}/{quiz.attempts}</span>.<br />
              Đạt tỉ lệ: <span className="font-bold text-slate-900 text-xs">{result.percentage}%</span> | Điểm số: <span className="font-semibold text-slate-800">{result.score}/{quiz.totalPoints || quiz.questions.length}</span>
            </p>
          </div>
          
          {canRetry ? (
            <button 
              type="button"
              onClick={() => {
                setResult(null);
                setAnswers({});
                setIsLocked(false);
                if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex-shrink-0"
            >
              Làm lại bài mới
            </button>
          ) : (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              result.passed 
                ? "text-emerald-700 bg-emerald-100/60 border-emerald-200" 
                : "text-red-700 bg-red-100/60 border-red-200" 
            }`}>
              {result.passed ? "✓ Đã Hoàn Thành" : "✕ Đã Hết Lượt Làm Bài"}
            </span>
          )}
        </div>
      )}

      {/* DANH SÁCH KHỐI CÂU HỎI SÁNG */}
      <div className="space-y-4">
        {quiz.questions.map((q: any, index: number) => {
          const studentAnswerRecord = result?.answers?.find(
            (ans: any) => (ans.questionId?._id || ans.questionId) === q._id
          );
          
          const isQuestionCorrect = studentAnswerRecord?.isCorrect === true;
          const studentSelectedText = answers[q._id!] || studentAnswerRecord?.studentAnswer;

          return (
            <div key={q._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 mb-3 leading-snug flex items-center justify-between">
                <span>
                  <span className="text-[#0056d2] mr-1">Câu {index + 1}:</span> {q.text}
                </span>
                {result && (
                  isQuestionCorrect 
                    ? <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">✓ Đúng</span>
                    : <span className="text-red-600 text-[11px] font-bold flex items-center gap-1">✕ Sai</span>
                )}
              </h3>
              
              <div className="grid grid-cols-1 gap-2.5">
                {q.options?.map((option: any) => {
                  const isThisOptionSelected = studentSelectedText === option.text;
                  
                  // Style mặc định Light Mode cho các ô đáp án
                  let optionStyle = "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700";
                  
                  if (result) {
                    if (isThisOptionSelected) {
                      if (isQuestionCorrect) {
                        optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold";
                      } else {
                        optionStyle = "border-red-500 bg-red-50 text-red-700 font-semibold";
                      }
                    } else {
                      if (option.isCorrect === true) {
                        optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold";
                      }
                    }
                  } else if (answers[q._id!] === option.text) {
                    // Đang làm bài bình thường: hiện viền xanh dương chuẩn hiệu ứng click hệ thống sáng
                    optionStyle = "border-[#0056d2] bg-blue-50/60 text-[#0056d2] font-semibold";
                  }

                  return (
                    <button
                      type="button"
                      key={option._id}
                      onClick={() => handleSelectOption(q._id!, option.text)}
                      disabled={isLocked || !!result || submitting}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between gap-4 ${optionStyle}`}
                    >
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* KHỐI GỬI BÀI CHẤM ĐIỂM */}
      {!result && !isLocked && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={13} />}
            Gửi bài chấm điểm
          </button>
        </div>
      )}
    </div>
  );
}