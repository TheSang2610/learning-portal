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

  const executeSubmit = async () => {
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
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        <Loader2 className="animate-spin mr-2" size={20} /> Đang kiểm tra lịch sử làm bài...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-20 text-center text-red-400 bg-slate-900 rounded-2xl border border-slate-800">
        Không tìm thấy thông tin bài kiểm tra.
      </div>
    );
  }

  const canRetry = result && !result.passed && (result.attemptNumber < (quiz.attempts || 1));

  return (
    <div className="space-y-6">
      {/* THANH THOÁT / QUAY LẠI VIDEO */}
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 w-fit"
      >
        <ArrowLeft size={14} /> Quay lại bài học
      </button>

      {/* THÔNG TIN CHI TIẾT BÀI KIỂM TRA */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        {isLocked && (
          <div className="absolute top-3 right-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
            <Lock size={12} /> CHẾ ĐỘ XEM LẠI KẾT QUẢ
          </div>
        )}
        <h1 className="text-base font-extrabold text-white mb-2">{quiz.title}</h1>
        <p className="text-xs text-slate-400 mb-4">{quiz.description}</p>
        
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px]">
            Giới hạn lượt làm bài: {quiz.attempts} lần
          </span>
          <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px]">
            <Award size={13} className="text-amber-500" /> Cần {quiz.passingScore}% để đạt
          </span>
          {timeLeft !== null && !isLocked && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] ${
              timeLeft < 60 ? "bg-red-950/50 border-red-500 text-red-400 animate-pulse" : "bg-blue-950/50 border-blue-500/50 text-blue-400"
            }`}>
              <Timer size={13} /> Thời gian: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* KHỐI THÔNG BÁO ĐIỂM SỐ */}
      {result && (
        <div className={`border p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl ${
          result.passed 
            ? 'bg-emerald-950/40 border-emerald-500/40' 
            : 'bg-red-950/40 border-red-500/40' 
        }`}>
          <div>
            <h2 className={`text-sm font-black flex items-center gap-2 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.passed ? "BẠN ĐÃ ĐẠT TIÊU CHUẨN BÀI HỌC" : "BẠN CHƯA ĐẠT ĐIỂM ĐIỀU KIỆN"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Bạn đã hoàn thành bài kiểm tra ở lượt thứ <b>{result.attemptNumber || 1}/{quiz.attempts}</b>.<br />
              Đạt tỉ lệ: <span className="font-bold text-white text-xs">{result.percentage}%</span> | Điểm số: {result.score}/{quiz.totalPoints || quiz.questions.length}
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
            >
              Làm lại bài mới
            </button>
          ) : (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              result.passed 
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                : "text-red-400 bg-red-500/10 border-red-500/20" 
            }`}>
              {result.passed ? "✓ Đã Hoàn Thành" : "✕ Đã Hết Lượt Làm Bài"}
            </span>
          )}
        </div>
      )}

      {/* DANH SÁCH KHỐI CÂU HỎI */}
<div className="space-y-4">
  {quiz.questions.map((q: any, index: number) => {
    // 🎯 Lấy bản ghi chấm điểm chi tiết của câu hỏi này từ Backend gửi về
    const studentAnswerRecord = result?.answers?.find(
      (ans: any) => (ans.questionId?._id || ans.questionId) === q._id
    );
    
    // Trạng thái đúng/sai thực tế của câu hỏi này
    const isQuestionCorrect = studentAnswerRecord?.isCorrect === true;
    
    // Nội dung text mà học sinh đã chọn làm đáp án
    const studentSelectedText = answers[q._id!] || studentAnswerRecord?.studentAnswer;

    return (
      <div key={q._id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
        <h3 className="text-xs font-bold text-white mb-3 leading-snug flex items-center justify-between">
          <span>
            <span className="text-blue-400 mr-1">Câu {index + 1}:</span> {q.text}
          </span>
          {result && (
            isQuestionCorrect 
              ? <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">✓ Đúng</span>
              : <span className="text-red-400 text-[11px] font-medium flex items-center gap-1">✕ Sai</span>
          )}
        </h3>
        
        <div className="grid grid-cols-1 gap-2.5">
          {q.options?.map((option: any) => {
            const isThisOptionSelected = studentSelectedText === option.text;
            
            let optionStyle = "border-slate-800 bg-slate-950/30 hover:bg-slate-800/30 text-slate-300";
            
            if (result) {
              // 🌟 THAY ĐỔI LOGIC TÔ MÀU AN TOÀN TẠI ĐÂY:
              if (isThisOptionSelected) {
                // Nếu đây là câu học sinh chọn: Dựa vào kết quả chấm điểm tổng của câu hỏi để tô màu
                if (isQuestionCorrect) {
                  optionStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-medium";
                } else {
                  optionStyle = "border-red-500/50 bg-red-500/5 text-red-400 font-medium";
                }
              } else {
                // Đối với các câu học sinh KHÔNG chọn:
                // Nếu Backend có trả về flag isCorrect thì hiển thị, nếu không thì giữ nguyên màu mặc định
                if (option.isCorrect === true) {
                  optionStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-medium";
                }
              }
            } else if (answers[q._id!] === option.text) {
              // Đang làm bài bình thường: hiện viền xanh dương khi click chọn
              optionStyle = "border-blue-500 bg-blue-600/10 text-blue-400 font-medium";
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
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={13} />}
            Gửi bài chấm điểm
          </button>
        </div>
      )}
    </div>
  );
}