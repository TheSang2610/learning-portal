"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, Award, BookOpen, Clock, FileText } from "lucide-react";

import CertificateModal from "@/src/components/certificate/CertificateModal";
import StudentQuizView from "@/src/components/quiz/StudentQuizView"; 

import { getCourseBySlug } from "@/src/services/course";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
} from "@/src/services/enrollment.api";

import { getCourseQuizzes } from "@/src/services/quizService"; 


function CourseLearnSkeleton() {
  return (
    <div className="h-full bg-[#f8f9fa] flex flex-col animate-pulse">
      {/* SKELETON HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="w-32 h-9 bg-slate-200 rounded-xl"></div>
      </header>

      {/* SKELETON CONTENT */}
      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden">
        {/* VIEW TRÁI: VIDEO SKELETON */}
        <div className="col-span-12 md:col-span-9 p-6 flex flex-col gap-4">
          <div className="aspect-video bg-slate-200 rounded-2xl shadow-sm w-full"></div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex justify-between items-center shadow-sm">
            <div className="space-y-3 flex-1">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="w-28 h-10 bg-slate-200 rounded-xl"></div>
          </div>
        </div>

        {/* VIEW PHẢI: MENU LESSONS SKELETON */}
        <div className="col-span-12 md:col-span-3 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-10"></div>
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseSlug = (params.slug || params.id) as string;
  const categorySlug = params.categorySlug as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string>("");

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
          
          let defaultLesson = null;

          if (enrollData?.lessonProgress && enrollData.lessonProgress.length > 0) {
            const nextIncompleteProgress = enrollData.lessonProgress.find((lp: any) => lp.status !== 'completed');
            
            if (nextIncompleteProgress) {
              const targetLessonId = nextIncompleteProgress.lesson?._id || nextIncompleteProgress.lesson;
              defaultLesson = sortedLessons.find((l: any) => l._id === targetLessonId);
            }
          }

          if (!defaultLesson) {
            const lastActiveLessonId = enrollData?.currentLessonId;
            defaultLesson = sortedLessons.find((l: any) => l._id === lastActiveLessonId) || sortedLessons[0];
          }
          
          setActiveLesson(defaultLesson);

          try {
            await startLesson(realCourseId, defaultLesson._id);

            const history = enrollData?.lessonProgress?.find((lp: any) => {
              const lpLessonId = lp.lesson?._id || lp.lesson;
              return lpLessonId === defaultLesson._id;
            });

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

  // 🎯 Xử lý video URL - Hỗ trợ HLS streaming
  useEffect(() => {
    if (!activeLesson?.videoUrl || !videoRef.current) return;

    const setupVideo = async () => {
      try {
        setVideoError("");
        const videoUrl = activeLesson.videoUrl;
        console.log("📹 Loading video URL:", videoUrl);

        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Always reset the current source before switching videos
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();

        const isHls = /\.m3u8(\?|$)|application\/vnd\.apple\.mpegurl/i.test(videoUrl);

        if (isHls) {
          const canNativeHls = videoElement.canPlayType("application/vnd.apple.mpegurl") || videoElement.canPlayType("application/x-mpegURL");

          if (canNativeHls) {
            videoElement.src = videoUrl;
            videoElement.load();
            console.log("✅ Native HLS source set");
          } else {
            try {
              const module = await import("hls.js");
              const Hls = module.default;

              if (Hls && Hls.isSupported()) {
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
                }

                const hls = new Hls({
                  debug: false,
                  enableWorker: true,
                });

                hlsRef.current = hls;
                hls.loadSource(videoUrl);
                hls.attachMedia(videoElement);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                  console.log("✅ HLS manifest loaded successfully");
                });

                hls.on(Hls.Events.ERROR, (event: string, data: any) => {
                  console.error("❌ HLS Error:", event, data);
                  if (data.fatal) {
                    const errorMsg = data.response?.status
                      ? `Lỗi tải video: ${data.response.status}`
                      : `Lỗi tải video: ${data.error || "Không xác định"}`;
                    setVideoError(errorMsg);
                  }
                });
              } else {
                console.warn("⚠️ Browser does not support HLS.js; falling back to native HLS");
                videoElement.src = videoUrl;
                videoElement.load();
              }
            } catch (error: any) {
              console.error("❌ Không tải được hls.js:", error);
              videoElement.src = videoUrl;
              videoElement.load();
            }
          }
        } else {
          videoElement.src = videoUrl;
          videoElement.load();
          console.log("✅ MP4/Direct video loaded");
        }
      } catch (error: any) {
        console.error("Lỗi setup video:", error);
        setVideoError(`Có lỗi khi tải video: ${error?.message || "Không xác định"}`);
      }
    };

    setupVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeLesson?.videoUrl]);

  useEffect(() => {
    if (!activeLesson || !course?._id) return;

    const checkQuizForLesson = async () => {
      try {
        setIsDoingQuiz(false); 
        const res = await getCourseQuizzes(course._id, activeLesson._id);
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

  useEffect(() => {
    if (!activeLesson || !videoRef.current || !course?._id || isDoingQuiz) return;

    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        try {
          await updateWatchTime(course._id, activeLesson._id, currentTime);
        } catch (err) {
          console.error("Lỗi lưu watch time cập nhật ngầm:", err);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeLesson, course?._id, isDoingQuiz]);

  const handleSelectLesson = async (lesson: any) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    setVideoError("");
    try {
      await startLesson(course._id, lesson._id);
      
      const history = enrollment?.lessonProgress?.find((lp: any) => {
        const lpLessonId = lp.lesson?._id || lp.lesson;
        return lpLessonId === lesson._id;
      });

      if (history?.watchedDuration && videoRef.current) {
        videoRef.current.currentTime = history.watchedDuration;
      }
    } catch (err) {
      console.error("Lỗi khi kích hoạt startLesson:", err);
    }
  };

  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      const response = await completeLesson(course._id, activeLesson._id, duration) as any;
      
      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100 || newStats?.completedCount === course?.lessons?.length) {
        await completeCourse(course._id);
        setShowCertificate(true); 
      } else {
        alert(response?.message || `Chúc mừng bạn đã hoàn thành phần video bài học: ${activeLesson.title}`);
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả hoàn thành bài học:", error);
    }
  };

  const handleQuizSuccess = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      await completeLesson(course._id, activeLesson._id, duration);
      
      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100) {
        await completeCourse(course._id);
        setShowCertificate(true);  
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
    return <CourseLearnSkeleton />;
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#f8f9fa] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border border-slate-200">
          <p className="text-red-600 font-bold text-base">Không vào được phòng học</p>
          <p className="text-gray-500 text-xs mt-1">Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-[#0056d2] hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#f8f9fa] text-[#1f2124] flex flex-col">
      {/* HEADER SÁNG */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => router.push(`/${categorySlug}/${courseSlug}`)}
            className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-black transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate">{course?.title}</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Giảng viên: <span className="font-medium text-slate-700">{course?.instructor?.name || "Chuyên gia"}</span></p>
          </div>
        </div>

        {/* Khung Tiến độ nổi bật */}
        <div className="flex items-center gap-3 bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100">
          <Award size={16} className="text-amber-500" />
          <div className="text-right">
            <span className="text-xs font-bold block text-[#0056d2]"> Tiến độ: {progress?.progressPercentage || 0}%</span>
            <span className="text-[10px] text-gray-500 block font-medium">Bài đã xong: {progress?.completedCount || progress?.completedLessons || 0}/{course?.lessons?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* KHU VỰC BÀI HỌC VÀ MENU DANH SÁCH */}
      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden bg-[#f8f9fa]">
        
        {/* VIEW TRÁI: VIDEO & NỘI DUNG BÀI HỌC CÙNG BÀI KIỂM TRA */}
        <div className="col-span-12 md:col-span-9 min-w-0 p-6 flex flex-col gap-4 overflow-y-auto">
          {isDoingQuiz && currentQuiz && currentQuiz._id ? (
            <StudentQuizView 
              quizId={currentQuiz._id} 
              onClose={() => setIsDoingQuiz(false)} 
              onSuccess={handleQuizSuccess}
            />
          ) : activeLesson ? (
            <div className="space-y-4">
              {/* Box Video bo góc thanh lịch */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-md">
                {activeLesson.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      key={activeLesson._id}
                      controls
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                      onEnded={handleVideoEnded}
                      onError={(e) => {
                        console.error("❌ Video element error:", e);
                        setVideoError("Không thể phát video. Kiểm tra kết nối mạng hoặc định dạng file.");
                      }}
                    />
                    {videoError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-red-400 gap-2 p-4 rounded-2xl">
                        <p className="text-xs text-center font-medium">❌ {videoError}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-slate-900 gap-2">
                    <BookOpen size={48} className="text-gray-600 animate-pulse" />
                    <p className="text-xs">Bài học này chưa được cấu hình liên kết Video bài giảng</p>
                  </div>
                )}
              </div>

              {/* Chi tiết bài học dưới Video (Nền Trắng) */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">
                      Đang diễn ra
                    </span>
                    {checkLessonCompleted(activeLesson._id) && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        Đã hoàn thành
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 pt-1">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {activeLesson.description || "Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống."}
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch gap-2 flex-shrink-0 pt-2 md:pt-0">
                  {currentQuiz && (
                    <button
                      onClick={() => setIsDoingQuiz(true)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs shadow-md transition-all transform active:scale-95"
                    >
                      <FileText size={16} />
                      Làm bài kiểm tra ({currentQuiz.passingScore}% để đạt)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20 bg-white rounded-2xl border border-slate-200">
              <Play size={40} className="stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-xs font-medium">Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.</p>
            </div>
          )}
        </div>

        {/* VIEW PHẢI: MENU DANH SÁCH BÀI HỌC (Nền Trắng) */}
        <div className="col-span-12 md:col-span-3 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col min-h-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nội dung bài học</h3>
            <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
              {course?.lessons?.length || 0} mục
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                          ? "bg-blue-50 text-[#0056d2] font-semibold border border-blue-100" 
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-emerald-500 fill-emerald-50" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? "border-blue-500 bg-[#0056d2] text-white" : "border-slate-300 text-slate-500 group-hover:border-slate-400"} flex items-center justify-center text-[9px] font-bold`}>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-medium block truncate leading-snug ${isCurrent ? "text-[#0056d2] font-bold" : "group-hover:text-black"}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock size={10} />
                            <span>{lesson.duration ? `${lesson.duration} phút` : "Bài học Video"}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
            ) : (
              <p className="text-xs text-slate-400 italic p-4 text-center">Đang cập nhật bài giảng.</p>
            )}
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        enrollmentId={enrollment?._id}
        courseTitle={course?.title}
        instructorName={course?.instructor?.name}
      />
    </div>
  );
}
