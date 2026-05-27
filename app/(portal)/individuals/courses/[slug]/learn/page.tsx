"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, Award, BookOpen, Clock, FileText, HelpCircle, Loader2, XCircle, Timer, CheckCircle2 } from "lucide-react";

// Đổi từ getCourseById sang getCourseBySlug để tìm kiếm bằng chuỗi chữ chuẩn SEO
import { getCourseBySlug } from "@/src/services/course";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
} from "@/src/services/enrollment.api";

// Kết nối API thực tế từ file service của bạn
import { getCourseQuizzes, getQuizById, submitQuizAttempt, Quiz, QuizSubmitResponse } from "@/src/services/quizService"; 

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseSlug = (params.slug || params.id) as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  // States quản lý dữ liệu dự án
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý xem bài học hiện tại có Quiz đi kèm không
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);

  // 🎯 STATE ĐIỀU KHIỂN HIỂN THỊ QUIZ TẠI CHỖ (CÁCH 1)
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);

  // 1. Tải thông tin tổng quan khi vào trang bằng Slug
  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        
        const courseData = await getCourseBySlug(courseSlug) as any;
        if (!courseData || courseData.error) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse(courseData);

        const realCourseId = courseData._id;

        const enrollData = await getEnrollmentByCourse(realCourseId);
        setEnrollment(enrollData);

        const stats = await getProgressStats(realCourseId);
        setProgress(stats);

        if (courseData?.lessons && courseData.lessons.length > 0) {
          const sortedLessons = [...courseData.lessons].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          const lastActiveLessonId = enrollData?.currentLessonId;
          const defaultLesson = sortedLessons.find((l: any) => l._id === lastActiveLessonId) || sortedLessons[0];
          
          setActiveLesson(defaultLesson);
          try {
            await startLesson(realCourseId, defaultLesson._id);
            const history = enrollData?.completedLessons?.find((h: any) => h.lessonId === defaultLesson._id);
            if (history?.watchedDuration && videoRef.current) {
              videoRef.current.currentTime = history.watchedDuration;
            }
          } catch (err) {
            console.error("Lỗi kích hoạt bài học mặc định:", err);
          }
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo màn hình học tập:", error);
      } finally {
        setLoading(false);
      }
    };

    initLearnPage();
  }, [courseSlug]);

  // 🎯 KIỂM TRA BÀI QUIZ ĐI KÈM MỖI KHI ĐỔI BÀI HỌC
  useEffect(() => {
    if (!activeLesson || !course?._id) return;

    const checkQuizForLesson = async () => {
      try {
        // Tắt trạng thái làm quiz cũ nếu đổi sang bài học mới
        setIsDoingQuiz(false); 

        const res = await getCourseQuizzes(course._id, activeLesson._id);
        console.log("Dữ liệu Quiz trả về từ API:", res);
        
        if (Array.isArray(res) && res.length > 0) {
          setCurrentQuiz(res[0]); 
        } else {
          setCurrentQuiz(null);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm Quiz đính kèm bài học:", err);
        setCurrentQuiz(null);
      }
    };

    checkQuizForLesson();
  }, [activeLesson, course?._id]);

  // 2. Tự động cập nhật thời gian xem liên tục
  useEffect(() => {
    if (!activeLesson || !videoRef.current || !course?._id || isDoingQuiz) return;

    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        try {
          await updateWatchTime(course._id, activeLesson._id, currentTime);
          console.log(`Đã lưu thời gian xem: ${currentTime}s`);
        } catch (err) {
          console.error("Lỗi lưu watch time cập nhật ngầm:", err);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeLesson, course?._id, isDoingQuiz]);

  // 3. Xử lý khi học viên bấm chọn một bài học khác từ danh sách bên phải
  const handleSelectLesson = async (lesson: any) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    try {
      await startLesson(course._id, lesson._id);
      
      const history = enrollment?.completedLessons?.find((h: any) => h.lessonId === lesson._id);
      if (history?.watchedDuration && videoRef.current) {
        videoRef.current.currentTime = history.watchedDuration;
      }
    } catch (err) {
      console.error("Lỗi khi kích hoạt startLesson:", err);
    }
  };

  // 4. Xử lý khi xem hết Video (Video Ended) -> Đánh dấu hoàn thành bài học
  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      
      const response = await completeLesson(course._id, activeLesson._id, duration) as any;
      
      alert(response?.message || `Chúc mừng bạn đã hoàn thành phần video bài học: ${activeLesson.title}`);

      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100 || newStats?.completedCount === course?.lessons?.length) {
        await completeCourse(course._id);
        alert("🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ khóa học này!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả hoàn thành bài học:", error);
    }
  };

  // 🎯 HÀM ĐỒNG BỘ TIẾN ĐỘ SAU KHI LÀM QUIZ THÀNH CÔNG HOẶC NHẤN MANUAL MARK
  const handleQuizSuccess = async () => {
    if (!activeLesson || !course?._id) return;

    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      
      // Gọi lại API completeLesson để Backend quét qua bài Quiz đã Pass và kích hoạt trạng thái "completed" bài học
      const response = await completeLesson(course._id, activeLesson._id, duration) as any;
      
      // Cập nhật lại toàn bộ State tiến độ hiển thị trên màn hình
      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100) {
        await completeCourse(course._id);
        alert("🎉 Xuất sắc! Bạn đã hoàn thành khóa học!");
      }
    } catch (error) {
      console.error("Lỗi đồng bộ tiến độ sau khi hoàn thành bài học:", error);
    }
  };

  const checkLessonCompleted = (lessonId: string) => {
    if (!enrollment?.lessonProgress) return false;
    const found = enrollment.lessonProgress.find((lp: any) => lp.lesson?._id === lessonId || lp.lesson === lessonId);
    return found?.status === 'completed';
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-xs text-slate-400">Đang chuẩn bị phòng học trực tuyến...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#0f172a] text-white p-4">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-sm border border-slate-800">
          <p className="text-red-500 font-bold text-base">Không vào được phòng học</p>
          <p className="text-slate-400 text-xs mt-1">Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0f172a] text-slate-100 flex flex-col">
      
      {/* 1. TOP BAR HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => router.push(`/individuals/courses/${courseSlug}`)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{course?.title}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Giảng viên: {course?.instructor?.name || "Chuyên gia"}</p>
          </div>
        </div>

        {/* TIẾN ĐỘ TỔNG QUAN */}
        <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <Award size={16} className="text-yellow-500" />
          <div className="text-right">
            <span className="text-xs font-bold block text-white"> Tiến độ: {progress?.progressPercentage || 0}%</span>
            <span className="text-[10px] text-slate-400 block">Bài đã xong: {progress?.completedCount || progress?.completedLessons || 0}/{course?.lessons?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* 2. CHƯƠNG TRÌNH CHI TIẾT */}
      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden bg-[#0f172a]">
        
        {/* CỘT TRÁI: VIDEO PLAYER HOẶC VIEW LÀM QUIZ */}
        <div className="col-span-12 md:col-span-9 min-w-0 p-6 flex flex-col gap-4 overflow-y-auto">
          
          {isDoingQuiz && currentQuiz && currentQuiz._id ? (
            /* TRẠNG THÁI 1: ĐANG LÀM QUIZ TẠI CHỖ -> FIX: ĐÃ THÊM PROP onSuccess */
            <StudentQuizView 
              quizId={currentQuiz._id} 
              onClose={() => setIsDoingQuiz(false)} 
              onSuccess={handleQuizSuccess}
            />
          ) : activeLesson ? (
            /* TRẠNG THÁI 2: HIỂN THỊ VIDEO BÀI HỌC BÌNH THƯỜNG */
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                {activeLesson.videoUrl ? (
                  <video
                    ref={videoRef}
                    key={activeLesson._id}
                    src={activeLesson.videoUrl}
                    controls
                    autoPlay
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <BookOpen size={48} className="text-slate-700 animate-pulse" />
                    <p className="text-xs">Bài học này chưa được cấu hình liên kết Video bài giảng</p>
                  </div>
                )}
              </div>

              {/* KHU VỰC THÔNG TIN BÀI HỌC */}
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Đang diễn ra
                    </span>
                    {checkLessonCompleted(activeLesson._id) && (
                      <span className="text-[10px] font-bold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        Đã hoàn thành
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {activeLesson.description || "Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống."}
                  </p>
                </div>

                {/* HÀNH ĐỘNG: LÀM QUIZ HOẶC MANUAL MARK AS COMPLETE */}
                <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch gap-2 flex-shrink-0 pt-2 md:pt-0">
                  {currentQuiz && (
                    <button
                      onClick={() => {
                        setIsDoingQuiz(true);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-900/20 transition-all transform active:scale-95"
                    >
                      <FileText size={16} />
                      Làm bài kiểm tra ({currentQuiz.passingScore}% để đạt)
                    </button>
                  )}
                  

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
              <Play size={40} className="stroke-[1.5] mb-2" />
              <p className="text-xs">Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: SIDEBAR DANH SÁCH BÀI GIẢNG */}
        <div className="col-span-12 md:col-span-3 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nội dung bài học</h3>
            <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {course?.lessons?.length || 0} mục
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {course?.lessons && course.lessons.length > 0 ? (
              [...course.lessons]
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((lesson: any, index: number) => {
                  const isCurrent = activeLesson?._id === lesson._id;
                  const isCompleted = checkLessonCompleted(lesson._id);

                  return (
                    <button
                      key={lesson._id || index}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition group relative ${
                        isCurrent 
                          ? "bg-blue-600/10 border border-blue-500/30 text-white" 
                          : "hover:bg-slate-800/50 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? "border-blue-400" : "border-slate-600 group-hover:border-slate-400"} flex items-center justify-center text-[9px] font-bold`}>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-medium block truncate leading-snug ${isCurrent ? "text-blue-400 font-bold" : "group-hover:text-white"}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock size={10} />
                            <span>{lesson.duration ? `${lesson.duration} phút` : "Bài học Video"}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center">Đang cập nhật bài giảng.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 🎯 COMPONENT SUB-VIEW LÀM QUIZ ĐƯỢC ĐÓNG GÓI TẠI CHỖ (CONNECTED TO REAL API)
// =========================================================================
interface StudentQuizViewProps {
  quizId: string;
  onClose: () => void;
  onSuccess?: () => void; // Khai báo prop callback đồng bộ tiến độ
}

function StudentQuizView({ quizId, onClose, onSuccess }: StudentQuizViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>("");
  
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) return;
    
    getQuizById(quizId)
      .then((data) => {
        setQuiz(data);
        setStartedAt(new Date().toISOString());
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
    if (timeLeft === null || result) return;

    if (timeLeft <= 0) {
      alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài của bạn.");
      executeSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionId: string, optionText: string) => {
    if (result) return;
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
    if (!quiz) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${quiz.questions.length} câu hỏi. Bạn vẫn muốn nộp bài chứ?`)) {
        return;
      }
    }
    executeSubmit();
  };

  const executeSubmit = async () => {
    if (!quiz || submitting) return;
    
    // Khóa ngay lập tức trước các tiến trình async tiếp theo
    setSubmitting(true); 

    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q._id!,
      studentAnswer: answers[q._id!] || "",
    }));

    try {
      const res = await submitQuizAttempt(quizId, formattedAnswers, startedAt);
      setResult(res);
      
      if (res.passed && onSuccess) {
        await onSuccess();
      }

      const mainContainer = document.querySelector(".overflow-y-auto");
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Lỗi khi nộp bài:", error);
      // Hiển thị trực tiếp lý do lỗi từ backend trả về (Ví dụ: hết lượt làm bài)
      alert(error?.response?.data?.message || "Đã xảy ra lỗi trong quá trình nộp bài, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        <Loader2 className="animate-spin mr-2" size={20} /> Đang đồng bộ đề thi dữ liệu...
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

  return (
    <div className="space-y-6">
      {/* THANH THOÁT / QUAY LẠI VIDEO */}
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 w-fit"
      >
        <ArrowLeft size={14} /> Tắt Quiz và Quay lại Video bài học
      </button>

      {/* THÔNG TIN CHI TIẾT BÀI KIỂM TRA */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-base font-extrabold text-white mb-2">{quiz.title}</h1>
        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
          Bài học: {quiz.lesson && typeof quiz.lesson === 'object' ? (quiz.lesson as any).title : "Chưa phân loại"}
        </span>
        <p className="text-xs text-slate-400 mb-4">{quiz.description}</p>
        
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px]">
            Tổng số: {quiz.questions.length} câu hỏi
          </span>
          <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px]">
            <Award size={13} className="text-amber-500" /> Cần {quiz.passingScore}% để qua môn
          </span>
          {timeLeft !== null && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] ${
              timeLeft < 60 ? "bg-red-950/50 border-red-500 text-red-400 animate-pulse" : "bg-blue-950/50 border-blue-500/50 text-blue-400"
            }`}>
              <Timer size={13} /> Thời gian còn lại: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* HIỂN THỊ KẾT QUẢ KHI NỘP BÀI THÀNH CÔNG */}
      {result && (
        <div className={`border p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl ${
          result.passed ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-red-950/40 border-red-500/40'
        }`}>
          <div>
            <h2 className={`text-sm font-black flex items-center gap-2 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.passed ? "CHÚC MỪNG! BẠN ĐÃ ĐẠT TIÊU CHUẨN CỦA BÀI HỌC" : "BẠN CHƯA ĐẠT ĐIỂM ĐIỀU KIỆN"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {result.message} <br />
              Đạt tỉ lệ: <span className="font-bold text-white text-xs">{result.percentage}%</span> | Điểm số thực tế: {result.score}/{result.totalPoints}
            </p>
          </div>
          <button 
            onClick={() => {
              setResult(null);
              setAnswers({});
              if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
          >
            Làm lại bài mới
          </button>
        </div>
      )}

      {/* DANH SÁCH KHỐI CÂU HỎI */}
      <div className="space-y-4">
        {quiz.questions.map((q, index) => (
          <div key={q._id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-start gap-4 mb-3">
              <h3 className="text-xs font-bold text-white flex gap-2 leading-snug">
                <span className="text-blue-400 flex-shrink-0">Câu {index + 1}:</span>
                {q.text}
              </h3>
              {q.points && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex-shrink-0">{q.points}đ</span>}
            </div>
            
            {q.options && q.options.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {q.options.map((option) => {
                  const isSelected = answers[q._id!] === option.text;
                  
                  let optionStyle = "border-slate-800 bg-slate-950/30 hover:bg-slate-800/30 text-slate-300";
                  if (isSelected) optionStyle = "border-blue-500 bg-blue-600/10 text-blue-400 font-medium";

                  return (
                    <button
                      key={option._id}
                      onClick={() => handleSelectOption(q._id!, option.text)}
                      disabled={!!result || submitting}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between gap-4 ${optionStyle}`}
                    >
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                rows={q.type === 'essay' ? 4 : 2}
                disabled={!!result || submitting}
                placeholder="Nhập câu trả lời cụ thể của bạn..."
                value={answers[q._id!] || ""}
                onChange={(e) => handleSelectOption(q._id!, e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition resize-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* THỰC THI NỘP BÀI */}
      {!result && (
        <div className="flex justify-end pt-2">
          <button
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