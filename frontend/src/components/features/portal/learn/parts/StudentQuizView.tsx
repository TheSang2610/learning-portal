"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";

import QuizAttemptHistory from "./QuizAttemptHistory";
import styles from "./StudentQuizView.module.scss";
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
  resetMyQuizAttempts,
  submitQuizAttempt,
  type AttemptResult,
  type QuizAnswer,
  type QuizQuestion,
  type QuizWithAttempt,
} from "@/src/services/quizService";

// questionId khi la chuoi, khi la doi tuong da populate - tuy endpoint tra ve.
const getQuestionId = (id: QuizAnswer["questionId"]): string =>
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
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  // Doi sau moi lan nop de lich su lam bai tai lai.
  const [historyKey, setHistoryKey] = useState<string>("");
  // Tang len de tai lai de tu may chu (vd nop bi tu choi vi het luot).
  const [reloadKey, setReloadKey] = useState(0);
  const [resetting, setResetting] = useState(false);

  // Dat lai bai lam: cac luot cu thanh "khong tinh" (van nam trong lich su),
  // roi tai lai de de lam tu dau voi du so luot.
  const handleReset = async () => {
    if (resetting) return;
    if (
      !window.confirm(
        "Đặt lại bài làm? Các lượt cũ vẫn được giữ trong lịch sử nhưng không tính nữa, bạn sẽ làm lại từ đầu.",
      )
    )
      return;
    setResetting(true);
    try {
      await resetMyQuizAttempts(quizId);
      setResult(null);
      setAnswers({});
      setIsLocked(false);
      setHistoryKey(String(Date.now()));
      setReloadKey((k) => k + 1);
    } catch (error) {
      alert(getErrorMessage(error, "Không đặt lại được bài làm, vui lòng thử lại!"));
    } finally {
      setResetting(false);
    }
  };

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
              oldAnswers[getQuestionId(ans.questionId)] = String(ans.studentAnswer);
            });
            setAnswers(oldAnswers);
          }

          const maxAttemptsAllowed = data.attempts || 1;
          // So luot HOP LE (may chu dem, khong tinh luot giang vien cho lam lai).
          // attemptNumber dem ca luot do nen khong dung de khoa duoc nua.
          const currentAttemptCount = data.usedAttempts ?? attempt.attemptNumber ?? 1;

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
  }, [quizId, reloadKey]);

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

      if (res.passed || (res.usedAttempts ?? 1) >= (quiz.attempts || 1)) {
        setIsLocked(true);
      }
      setQuiz({ ...quiz, usedAttempts: res.usedAttempts ?? quiz.usedAttempts });
      setHistoryKey(res._id);

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
      // Tai lai de: may chu co the da co luot lam ma man hinh chua biet (het
      // luot, mo bai o tab khac...). Khong tai lai thi nguoi dung ket o de trong.
      setReloadKey((k) => k + 1);
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
      <div className={styles.card}>
        <Loader2 className={styles.spinner} size={20} /> Đang kiểm tra lịch sử làm bài...
      </div>
    );
  }

  if (!quiz) {
    return <div className={styles.card2}>Không tìm thấy thông tin bài kiểm tra.</div>;
  }

  // So luot hop le da dung; thieu thi coi nhu lan thu nhat.
  const used = result?.usedAttempts ?? quiz.usedAttempts ?? result?.attemptNumber ?? 1;
  const canRetry = result && !result.passed && used < (quiz.attempts || 1);

  return (
    <div className={styles.stack}>
      {/* THANH THOÁT / QUAY LẠI VIDEO */}
      <button onClick={onClose} className={styles.button}>
        <ArrowLeft size={14} /> Quay lại bài học
      </button>

      {/* THÔNG TIN CHI TIẾT BÀI KIỂM TRA */}
      <div className={styles.card3}>
        {isLocked && (
          <div className={styles.floating}>
            <Lock size={12} /> Chế độ xem lại kết quả
          </div>
        )}
        <h1 className={styles.title}>{quiz.title}</h1>
        <p className={styles.text}>{quiz.description}</p>

        <div className={styles.row}>
          <span className={styles.card4}>Giới hạn lượt làm bài: {quiz.attempts} lần</span>
          <span className={styles.card4}>
            <Award size={13} className={styles.box} /> Cần {quiz.passingScore}% để đạt
          </span>
          {timeLeft !== null && !isLocked && (
            <span
              className={`${styles.row5} ${timeLeft < 60 ? styles.label : styles.label2}`}
            >
              <Timer size={13} /> Thời gian: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* KHỐI THÔNG BÁO ĐIỂM SỐ PASTEL */}
      {result && (
        <div className={`${styles.col} ${result.passed ? styles.box2 : styles.box3}`}>
          <div>
            <h2
              className={`${styles.heading3} ${result.passed ? styles.heading : styles.heading2}`}
            >
              {result.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.passed
                ? "BẠN ĐÃ ĐẠT TIÊU CHUẨN BÀI HỌC"
                : "BẠN CHƯA ĐẠT ĐIỂM ĐIỀU KIỆN"}
            </h2>
            <p className={styles.text2}>
              Bạn đã hoàn thành bài kiểm tra ở lượt thứ{" "}
              <span className={styles.label3}>
                {used}/{quiz.attempts}
              </span>
              .<br />
              Đạt tỉ lệ: <span className={styles.label4}>{result.percentage}%</span> |
              Điểm số:{" "}
              <span className={styles.label3}>
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
              className={styles.button2}
            >
              Làm lại bài mới
            </button>
          ) : (
            <span
              className={`${styles.label8} ${
                result.passed ? styles.label5 : styles.label6
              }`}
            >
              {result.passed ? "✓ Đã Hoàn Thành" : "✕ Đã Hết Lượt Làm Bài"}
            </span>
          )}
          {!canRetry && (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className={styles.button2}
            >
              {resetting ? "Đang đặt lại…" : "Đặt lại bài làm"}
            </button>
          )}
        </div>
      )}

      {/* DANH SÁCH KHỐI CÂU HỎI SÁNG */}
      <div className={styles.stack2}>
        {quiz.questions.map((q, index: number) => {
          const studentAnswerRecord = result?.answers?.find(
            (ans) => getQuestionId(ans.questionId) === q._id,
          );

          const isQuestionCorrect = studentAnswerRecord?.isCorrect === true;
          const studentSelectedText =
            answers[q._id!] || studentAnswerRecord?.studentAnswer;

          return (
            <div key={q._id} className={styles.card5}>
              <h3 className={styles.subheading}>
                <span>
                  <span className={styles.label7}>Câu {index + 1}:</span> {q.text}
                </span>
                {result &&
                  (isQuestionCorrect ? (
                    <span className={styles.row2}>✓ Đúng</span>
                  ) : (
                    <span className={styles.row3}>✕ Sai</span>
                  ))}
              </h3>

              <div className={styles.grid}>
                {q.options?.map((option) => {
                  const isThisOptionSelected = studentSelectedText === option.text;

                  // Style mặc định Light Mode cho các ô đáp án
                  let optionStyle = styles.box4;

                  if (result) {
                    if (isThisOptionSelected) {
                      if (isQuestionCorrect) {
                        optionStyle = styles.box5;
                      } else {
                        optionStyle = styles.box6;
                      }
                    } else {
                      if (option.isCorrect === true) {
                        optionStyle = styles.box5;
                      }
                    }
                  } else if (answers[q._id!] === option.text) {
                    // Đang làm bài bình thường: hiện viền xanh dương chuẩn hiệu ứng click hệ thống sáng
                    optionStyle = styles.box7;
                  }

                  return (
                    <button
                      type="button"
                      key={option._id}
                      onClick={() => handleSelectOption(q._id!, option.text)}
                      disabled={isLocked || !!result || submitting}
                      className={`${styles.button4} ${optionStyle}`}
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

      {/* LICH SU MOI LUOT - xem lai cau nao sai o luot nao */}
      <QuizAttemptHistory quizId={quizId} refreshKey={historyKey} />

      {/* KHỐI GỬI BÀI CHẤM ĐIỂM */}
      {!result && !isLocked && (
        <div className={styles.row4}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={styles.button3}
          >
            {submitting && <Loader2 className={styles.spinner2} size={13} />}
            Gửi bài chấm điểm
          </button>
        </div>
      )}
    </div>
  );
}
