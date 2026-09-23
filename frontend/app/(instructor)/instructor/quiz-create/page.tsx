"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, HelpCircle, Save, AlertCircle } from "lucide-react";
import { getCourseById } from "@/src/services/course";
import { createQuiz, type QuizQuestion } from "@/src/services/quizService";

import styles from "./page.module.scss";
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

function InstructorCreateQuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") || "";
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
      return alert("Bài trắc nghiệm phải có ít nhất 1 câu hỏi!");
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

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim())
        return alert(`Câu hỏi số ${i + 1} chưa điền nội dung!`);
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

      // 🎯 ĐIỀU HƯỚNG VỀ GIÁO TRÌNH INSTRUCTOR
      router.push(`/instructor/lessons?courseId=${courseId}`);
    } catch (error) {
      console.error("Chi tiết lỗi nhận diện tại Frontend:", error);
      const errorMessage =
        getErrorMessage(error) || String(error) || "Lỗi không xác định từ hệ thống";
      alert(`Không thể tạo Quiz: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className={styles.card}>
        <AlertCircle size={18} className={styles.box} />
        <div className={styles.box2}>
          <p className={styles.text}>Chế độ Giảng viên (Instructor Mode)</p>
          <p className={styles.text2}>
            Quiz mới tạo sẽ được lưu dưới dạng bản nháp đính kèm khóa học của bạn.
          </p>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className={styles.row}>
        <div>
          {/* 🎯 ĐỔI LINK SANG INSTRUCTOR */}
          <Link href={`/instructor/lessons?courseId=${courseId}`} className={styles.box3}>
            <ArrowLeft size={14} /> Quay lại giáo trình
          </Link>
          <h1 className={styles.title}>Soạn Thảo Bài Tập Quiz</h1>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.form}>
        {/* KHỐI 1: CẤU HÌNH THÔNG TIN CHUNG */}
        <div className={styles.card2}>
          <h2 className={styles.heading}>1. Cấu hình bài kiểm tra</h2>

          <div className={styles.grid}>
            <div className={styles.box4}>
              <label className={styles.fieldLabel}>Tiêu đề Quiz</label>
              <input
                type="text"
                placeholder="Ví dụ: Quiz ôn tập Kiến thức bài 1"
                className={styles.input}
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={styles.fieldLabel}>Gắn vào Bài học (Lesson)</label>
              <select
                className={styles.select}
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

            <div className={styles.grid2}>
              <div>
                <label className={styles.fieldLabel}>Thời gian (Phút)</label>
                <input
                  type="number"
                  className={styles.input2}
                  value={quizConfig.timeLimit}
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

            <div className={styles.box4}>
              <label className={styles.fieldLabel}>Mô tả / Hướng dẫn làm bài</label>
              <textarea
                rows={2}
                placeholder="Đọc kỹ câu hỏi trước khi chọn đáp án..."
                className={styles.input2}
                value={quizConfig.description}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* KHỐI 2: SOẠN BỘ CÂU HỎI ĐỘNG */}
        <div className={styles.stack}>
          <div className={styles.row2}>
            <h2 className={styles.heading2}>
              <HelpCircle size={16} className={styles.box5} /> 2. Danh sách câu hỏi (
              {questions.length})
            </h2>
            <button type="button" onClick={addQuestion} className={styles.button}>
              <Plus size={14} /> Thêm câu hỏi
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

              <div className={styles.grid3}>
                <div className={styles.box6}>
                  <label className={styles.fieldLabel2}>
                    Nội dung câu hỏi #{qIndex + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    className={styles.input}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel2}>Điểm câu này</label>
                  <input
                    type="number"
                    className={styles.input2}
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "points", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className={styles.card4}>
                <div className={styles.row3}>
                  <span className={styles.label}>Các phương án lựa chọn:</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className={styles.button3}
                  >
                    + Thêm phương án
                  </button>
                </div>

                {question.options.map((option, oIndex: number) => (
                  <div key={oIndex} className={styles.row4}>
                    <input
                      type="radio"
                      name={`correct-ans-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() =>
                        handleOptionChange(qIndex, oIndex, "isCorrect", true)
                      }
                      className={styles.input3}
                    />
                    <input
                      type="text"
                      placeholder={`Nhập phương án lựa chọn thứ ${oIndex + 1}`}
                      className={styles.input4}
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
        <div className={styles.row5}>
          <button type="submit" disabled={submitting} className={styles.button4}>
            <Save size={14} /> {submitting ? "Đang lưu hệ thống..." : "Hoàn tất lưu Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorCreateQuizPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row6}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorCreateQuizPageContent />
    </Suspense>
  );
}
