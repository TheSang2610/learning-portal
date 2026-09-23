"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, HelpCircle, Save, AlertCircle } from "lucide-react";

import styles from "./page.module.scss";
import {
  getCourseQuizzes,
  updateQuiz,
  type QuizQuestion,
} from "@/src/services/quizService";

// Cau hoi luc dang soan khac QuizQuestion cua tang service o hai cho: options
// luon co mat vi giao dien luon dung it nhat mot phuong an, va cac truong deu
// bat buoc. Tach rieng de khoi phai kiem tra undefined o moi cho.
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

// Du lieu tu may chu de trong duoc points va options, con man hinh soan thao thi
// khong - dien gia tri mac dinh mot lan o day, thay vi kiem tra undefined o tung
// o nhap lieu.
const veDangSoan = (ds: QuizQuestion[]): CauHoiSoan[] =>
  ds.map((q) => ({
    text: q.text ?? "",
    type: q.type,
    points: q.points ?? 1,
    options: (q.options ?? []).map((o) => ({
      text: o.text ?? "",
      isCorrect: Boolean(o.isCorrect),
    })),
  }));

function InstructorEditQuizPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const courseId = params.get("courseId") || "";
  const lessonId = params.get("lessonId") || "";

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

  const [questions, setQuestions] = useState<CauHoiSoan[]>([]);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const dataList = await getCourseQuizzes(courseId, lessonId);

        const currentQuiz = Array.isArray(dataList)
          ? dataList.find((q) => {
              const qLessonId = typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
              return qLessonId === lessonId;
            })
          : null;

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
          setQuestions(veDangSoan(currentQuiz.questions || []));
        } else {
          alert("Không tìm thấy dữ liệu bài tập cho bài học này!");
          // 🎯 ĐIỀU HƯỚNG SAI/THIẾU VỀ LẠI INSTRUCTOR LESSONS
          router.push(`/instructor/lessons?courseId=${courseId}`);
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
  }, [courseId, lessonId, router]);

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
    if (questions.length === 1)
      return alert("Bài tập trắc nghiệm phải có ít nhất 1 câu hỏi!");
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

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

      await updateQuiz(targetQuizId, payload);
      alert("Cập nhật bài tập trắc nghiệm thành công!");

      // 🎯 ĐIỀU HƯỚNG THÀNH CÔNG VỀ INSTRUCTOR LESSONS
      router.push(`/instructor/lessons?courseId=${courseId}`);
    } catch (error) {
      alert(`Lỗi cập nhật: ${getErrorMessage(error, "Hệ thống gặp trục trặc.")}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.box}>Đang tải cấu trúc đề thi...</div>;

  return (
    <div className={styles.container}>
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className={styles.card}>
        <AlertCircle size={18} className={styles.box2} />
        <div className={styles.box3}>
          <p className={styles.text}>Chế độ Giảng viên (Instructor Mode)</p>
          <p className={styles.text2}>
            Mọi thay đổi tại đây sẽ cập nhật trực tiếp vào kho lưu trữ học liệu của bạn.
          </p>
        </div>
      </div>

      <div>
        {/* 🎯 ĐỔI LINK SANG INSTRUCTOR */}
        <Link href={`/instructor/lessons?courseId=${courseId}`} className={styles.box4}>
          <ArrowLeft size={14} /> Quay lại giáo trình
        </Link>
        <h1 className={styles.title}>Cập Nhật Bài Tập Trắc Nghiệm</h1>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.form}>
        {/* THÔNG TIN CHUNG */}
        <div className={styles.card2}>
          <div>
            <label className={styles.fieldLabel}>Tiêu đề Quiz</label>
            <input
              type="text"
              className={styles.input}
              value={quizConfig.title}
              onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
              required
            />
          </div>
          <div className={styles.grid}>
            <div>
              <label className={styles.fieldLabel}>Thời gian (Phút)</label>
              <input
                type="number"
                className={styles.input2}
                value={quizConfig.timeLimit || ""}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, timeLimit: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Điểm Đạt (%)</label>
              <input
                type="number"
                className={styles.input2}
                value={quizConfig.passingScore}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, passingScore: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Số lượt làm</label>
              <input
                type="number"
                className={styles.input2}
                value={quizConfig.attempts}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, attempts: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div className={styles.stack}>
          <div className={styles.row}>
            <h2 className={styles.heading}>
              <HelpCircle size={16} className={styles.box5} /> Danh sách câu hỏi (
              {questions.length})
            </h2>
            <button type="button" onClick={addQuestion} className={styles.button}>
              + Thêm câu hỏi
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className={styles.card3}>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className={styles.button2}
              >
                <Trash2 size={16} />
              </button>
              <div className={styles.grid2}>
                <input
                  type="text"
                  className={styles.input3}
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                  placeholder="Nội dung câu hỏi..."
                  required
                />
                <input
                  type="number"
                  className={styles.input4}
                  value={question.points}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "points", Number(e.target.value))
                  }
                />
              </div>

              <div className={styles.card4}>
                <div className={styles.row}>
                  <span className={styles.label}>Các phương án:</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className={styles.button3}
                  >
                    + Thêm phương án
                  </button>
                </div>
                {question.options?.map((option, oIndex: number) => (
                  <div key={oIndex} className={styles.row2}>
                    <input
                      type="radio"
                      name={`correct-ans-edit-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() =>
                        handleOptionChange(qIndex, oIndex, "isCorrect", true)
                      }
                      className={styles.input5}
                    />
                    <input
                      type="text"
                      className={styles.input6}
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

        {/* NÚT LƯU */}
        <div className={styles.row3}>
          <button type="submit" disabled={submitting} className={styles.button4}>
            <Save size={14} /> {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorEditQuizPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row4}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorEditQuizPageContent />
    </Suspense>
  );
}
