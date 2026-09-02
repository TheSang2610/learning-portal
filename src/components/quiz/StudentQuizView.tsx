"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  ArrowLeft,
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
} from "lucide-react";
import {
  getQuizById,
  submitQuizAttempt,
  type KetQuaLamBai,
  type QuizAnswer,
  type QuizQuestion,
  type QuizWithAttempt,
} from "@/src/services/quizService";

// questionId khi la chuoi, khi la doi tuong da populate - tuy endpoint tra ve.
const layIdCauHoi = (id: QuizAnswer["questionId"]): string =>
  typeof id === "string" ? id : id._id;

interface StudentQuizViewProps {
  quizId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StudentQuizView({
  quizId,
  onClose,
  onSuccess,
}: StudentQuizViewProps) {
  const [quiz, setQuiz] = useState<QuizWithAttempt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>("");

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<KetQuaLamBai | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (!quizId) return;

    getQuizById(quizId)
      .then((data) => {
        setQuiz(data);
        setStartedAt(new Date().toISOString());

        if (data.latestAttempt) {
          const attempt = data.latestAttempt;
          setResult(attempt);

          if (attempt.answers) {
            const oldAnswers: { [key: string]: string } = {};
            attempt.answers.forEach((ans) => {
              // studentAnswer la Mixed ben may chu (cau dung/sai tra ve boolean),
              // con o day chi so sanh voi chu cua phuong an nen ep ve chuoi.
              oldAnswers[layIdCauHoi(ans.questionId)] = String(ans.studentAnswer);
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

    const formattedAnswers = quiz.questions.map((q: QuizQuestion) => ({
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
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      alert(
        getErrorMessage(
          error,
          "Đã xảy ra lỗi trong quá trình nộp bài, vui lòng thử lại!",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (timeLeft === null || result || isLocked) return;

    if (timeLeft <= 0) {
      alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài của bạn.");
      // Goi qua mot vong microtask thay vi goi thang: executeSubmit bat dau
      // bang setSubmitting(true), goi thang la setState dong bo ngay trong
      // than effect (rule react-hooks/set-state-in-effect). Ban than alert()
      // o tren da chan luong lai roi nen mot vong microtask khong doi gi ca.
      void Promise.resolve().then(executeSubmit);
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
    // executeSubmit KHONG cho vao deps mot cach co y.
    // No doc quiz, answers, submitting, isLocked - tuc la gan nhu moi state cua
    // man hinh nay. Boc useCallback ma sot mot dependency se khien bai nop di la
    // ban CU cua dap an. Hien tai ham duoc tao lai moi lan render nen luon doc
    // gia tri moi nhat, va effect nay von da chay lai moi giay theo timeLeft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (
        !confirm(
          `Bạn mới trả lời ${answeredCount}/${quiz.questions.length} câu hỏi. Bạn vẫn muốn nộp bài chứ?`,
        )
      ) {
        return;
      }
    }
    executeSubmit();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-500 shadow-sm">
        <Loader2 className="mr-2 animate-spin text-[#0056d2]" size={20} /> Đang kiểm tra
        lịch sử làm bài...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center font-medium text-red-600 shadow-sm">
        Không tìm thấy thông tin bài kiểm tra.
      </div>
    );
  }

  // attemptNumber co the vang mat trong phan hoi; coi nhu lan thu nhat.
  const canRetry =
    result && !result.passed && (result.attemptNumber ?? 1) < (quiz.attempts || 1);

  return (
    <div className="space-y-6 text-slate-700">
      {/* THANH THOÁT / QUAY LẠI VIDEO */}
      <button
        onClick={onClose}
        className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-black"
      >
        <ArrowLeft size={14} /> Quay lại bài học
      </button>

      {/* THÔNG TIN CHI TIẾT BÀI KIỂM TRA */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLocked && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#0056d2] uppercase">
            <Lock size={12} /> Chế độ xem lại kết quả
          </div>
        )}
        <h1 className="mb-2 text-base font-extrabold text-slate-900">{quiz.title}</h1>
        <p className="mb-4 text-xs leading-relaxed text-slate-500">{quiz.description}</p>

        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium">
            Giới hạn lượt làm bài: {quiz.attempts} lần
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium">
            <Award size={13} className="text-amber-500" /> Cần {quiz.passingScore}% để đạt
          </span>
          {timeLeft !== null && !isLocked && (
            <span
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold ${
                timeLeft < 60
                  ? "animate-pulse border-red-200 bg-red-50 text-red-600"
                  : "border-blue-100 bg-blue-50 text-[#0056d2]"
              }`}
            >
              <Timer size={13} /> Thời gian: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* KHỐI THÔNG BÁO ĐIỂM SỐ PASTEL */}
      {result && (
        <div
          className={`flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 shadow-sm md:flex-row ${
            result.passed
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-red-200 bg-red-50/60"
          }`}
        >
          <div>
            <h2
              className={`flex items-center gap-2 text-sm font-bold ${result.passed ? "text-emerald-700" : "text-red-700"}`}
            >
              {result.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.passed
                ? "BẠN ĐÃ ĐẠT TIÊU CHUẨN BÀI HỌC"
                : "BẠN CHƯA ĐẠT ĐIỂM ĐIỀU KIỆN"}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Bạn đã hoàn thành bài kiểm tra ở lượt thứ{" "}
              <span className="font-semibold text-slate-800">
                {result.attemptNumber || 1}/{quiz.attempts}
              </span>
              .<br />
              Đạt tỉ lệ:{" "}
              <span className="text-xs font-bold text-slate-900">
                {result.percentage}%
              </span>{" "}
              | Điểm số:{" "}
              <span className="font-semibold text-slate-800">
                {result.score}/{quiz.totalPoints || quiz.questions.length}
              </span>
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
              className="flex-shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Làm lại bài mới
            </button>
          ) : (
            <span
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                result.passed
                  ? "border-emerald-200 bg-emerald-100/60 text-emerald-700"
                  : "border-red-200 bg-red-100/60 text-red-700"
              }`}
            >
              {result.passed ? "✓ Đã Hoàn Thành" : "✕ Đã Hết Lượt Làm Bài"}
            </span>
          )}
        </div>
      )}

      {/* DANH SÁCH KHỐI CÂU HỎI SÁNG */}
      <div className="space-y-4">
        {quiz.questions.map((q, index: number) => {
          const studentAnswerRecord = result?.answers?.find(
            (ans) => layIdCauHoi(ans.questionId) === q._id,
          );

          const isQuestionCorrect = studentAnswerRecord?.isCorrect === true;
          const studentSelectedText =
            answers[q._id!] || studentAnswerRecord?.studentAnswer;

          return (
            <div
              key={q._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 flex items-center justify-between text-xs leading-snug font-bold text-slate-900">
                <span>
                  <span className="mr-1 text-[#0056d2]">Câu {index + 1}:</span> {q.text}
                </span>
                {result &&
                  (isQuestionCorrect ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      ✓ Đúng
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                      ✕ Sai
                    </span>
                  ))}
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {q.options?.map((option) => {
                  const isThisOptionSelected = studentSelectedText === option.text;

                  // Style mặc định Light Mode cho các ô đáp án
                  let optionStyle =
                    "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700";

                  if (result) {
                    if (isThisOptionSelected) {
                      if (isQuestionCorrect) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold";
                      } else {
                        optionStyle =
                          "border-red-500 bg-red-50 text-red-700 font-semibold";
                      }
                    } else {
                      if (option.isCorrect === true) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold";
                      }
                    }
                  } else if (answers[q._id!] === option.text) {
                    // Đang làm bài bình thường: hiện viền xanh dương chuẩn hiệu ứng click hệ thống sáng
                    optionStyle =
                      "border-[#0056d2] bg-blue-50/60 text-[#0056d2] font-semibold";
                  }

                  return (
                    <button
                      type="button"
                      key={option._id}
                      onClick={() => handleSelectOption(q._id!, option.text)}
                      disabled={isLocked || !!result || submitting}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-3.5 text-left text-xs transition ${optionStyle}`}
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
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400"
          >
            {submitting && <Loader2 className="animate-spin" size={13} />}
            Gửi bài chấm điểm
          </button>
        </div>
      )}
    </div>
  );
}
