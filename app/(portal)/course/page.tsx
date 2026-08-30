"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, BookOpen, User, CheckCircle, GraduationCap, 
  Calendar, ShieldCheck, CreditCard, Star, ThumbsUp, MessageSquare,
  ChevronDown, HelpCircle, Loader2, Award, Clock, Sliders
} from "lucide-react";
import Link from "next/link";

import { getCourseBySlug } from "@/src/services/course";
import { getEnrollmentByCourse, enrollInCourse, getProgressStats } from "@/src/services/enrollment.api";
import { reviewService, Review, ReviewStats } from "@/src/services/review"; 
import { faqService, FaqItem } from "@/src/services/faq"; 

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-24 antialiased animate-pulse">
      {/* 1. Hero Banner Skeleton */}
      <div className="bg-[#FBFCFD] py-16 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="space-y-3">
              <div className="h-10 bg-slate-200 rounded w-11/12 md:w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="h-4 bg-slate-200 rounded w-40"></div>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <div className="h-14 bg-slate-200 rounded-lg w-52"></div>
              <div className="h-4 bg-slate-200 rounded w-48"></div>
            </div>
          </div>
          <div className="lg:col-span-5 w-full aspect-video rounded-xl bg-slate-200 order-first lg:order-last"></div>
        </div>
      </div>

      {/* 2. Sticky Sub-Navbar Skeleton */}
      <div className="border-b border-slate-200 bg-white hidden md:block">
        <div className="max-w-[1400px] mx-auto px-12 flex gap-8 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 bg-slate-200 rounded w-24"></div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12">
        {/* Grid 4 thông số */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border border-slate-200 rounded-xl bg-slate-50/50 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Cột trái & Cột phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cột trái (70%) */}
          <div className="lg:col-span-8 space-y-16">
            {/* Về khóa học */}
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            </div>

            {/* Chương trình học */}
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-56"></div>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4 w-2/3">
                      <div className="h-4 bg-slate-200 rounded w-6"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải (30%) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-8 bg-slate-200 rounded w-32"></div>
              </div>
              <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
              <div className="pt-4 space-y-3 border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseDetailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";

  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  const [userProgress, setUserProgress] = useState<number>(0); 
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Thêm state để switch tab giống Coursera
  const [activeTab, setActiveTab] = useState<string>("about");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !courseSlug) return; 

    let isComponentMounted = true; 

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const courseData = await getCourseBySlug(courseSlug) as any;
        if (!courseData || courseData.error) {
          if (isComponentMounted) setCourse(null);
          return;
        }

        if (isComponentMounted) setCourse(courseData);
        const realCourseId = courseData._id;

        loadReviewsAndStats(realCourseId);
        loadCourseFaqs(realCourseId);

        const token = localStorage.getItem("authToken") || 
                      document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1];
        
        if (!token) {
          if (isComponentMounted) setIsEnrolled(false);
          return;
        }

        try {
          const [enrollmentData, progressData] = await Promise.all([
            getEnrollmentByCourse(realCourseId),
            getProgressStats(realCourseId).catch(() => null)
          ]);
          
          if (isComponentMounted) {
            if (enrollmentData && enrollmentData.isEnrolled === true) {
              setIsEnrolled(true); 
              const currentProgress = progressData?.totalProgress ?? enrollmentData?.totalProgress ?? 0;
              setUserProgress(currentProgress);
            } else {
              setIsEnrolled(false); 
              setUserProgress(0);
            }
          }
        } catch (err: any) {
          console.log("Học viên chưa đăng ký khóa học.");
          if (isComponentMounted) {
            setIsEnrolled(false);
            setUserProgress(0);
          }
        }

      } catch (error) {
        console.error("Lỗi hệ thống khi kết nối Backend:", error);
        if (isComponentMounted) {
          setCourse(null);
          setError("Không thể tải thông tin chi tiết khóa học");
        }
      } finally {
        if (isComponentMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isComponentMounted = false;
    };
  }, [courseSlug, isMounted]);

  const loadCourseFaqs = async (courseId: string) => {
    try {
      setLoadingFaqs(true);
      const faqsData = await faqService.getFaqsByCourse(courseId);
      setFaqs(faqsData || []);
    } catch (err) {
      console.error("Không thể tải danh sách câu hỏi FAQ của khóa học:", err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const loadReviewsAndStats = async (courseId: string) => {
    try {
      setLoadingReviews(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getCourseReviews(courseId, { limit: 10, sortBy: "newest" }),
        reviewService.getReviewStats(courseId)
      ]);
      setReviews(reviewsData.reviews || []);
      setStats(statsData);
    } catch (err) {
      console.error("Không thể tải dữ liệu đánh giá:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.markHelpful(reviewId);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: updatedReview.helpful } : r));
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    }
  };

  const handleEnrollCourse = async () => {
    if (!course?._id) {
      setError("Không tìm thấy thông tin định danh khóa học");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const result = await enrollInCourse(course._id) as any;
      
      setCourse((prevCourse: any) => {
        if (!prevCourse) return null;
        const newCount = (result && result.studentsCount !== undefined) 
          ? result.studentsCount 
          : (prevCourse.studentsCount || 0) + 1;
          
        return { ...prevCourse, studentsCount: newCount };
      });
      
      setIsEnrolled(true);
      router.refresh();
      router.push(`/learn?slug=${courseSlug}`);
      
    } catch (error: any) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = error.message || "";

      if (errorMsg.includes("401")) {
        setError("Vui lòng đăng nhập để tiếp tục chương trình học");
        // Khong co route /login - dang nhap la modal tren trang chu
        router.push("/?auth=login");
      } else if (errorMsg.includes("đã đăng ký") || errorMsg.includes("400")) {
        setIsEnrolled(true);
        router.push(`/learn?slug=${courseSlug}`);
      } else {
        setError(errorMsg || "Không thể xử lý ghi danh. Vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CourseDetailSkeleton />
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border">
          <p className="text-red-500 font-bold text-base">Không tìm thấy dữ liệu</p>
          <p className="text-slate-500 text-xs mt-1">{error || "Khóa học không tồn tại hoặc chưa được xuất bản."}</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const instructorName = typeof course.instructor === "object" 
    ? course.instructor.name 
    : course.instructor || "Expert Instructor";

  return (
    <div className="min-h-screen bg-white pb-24 antialiased">
      
      {/* 1. HERO BANNER - FULL WIDTH CHUẨN COURSERA */}
      <div className="bg-[#FBFCFD] text-slate-900 py-16 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Thông tin khóa học */}
          <div className="lg:col-span-7 space-y-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline tracking-wider transition"
            >
              <ArrowLeft size={14} /> QUAY LẠI DANH MỤC
            </button>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {course.description?.split(".")[0]}. Học cách thiết kế hệ thống thực chiến, tăng tư duy logic cốt lõi.
              </p>
            </div>

            {/* Khối Đánh giá nhanh dưới Title */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm pt-2 text-slate-700">
              {stats && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900">{Number(stats.averageRating).toFixed(1)}</span>
                  <span className="text-slate-500">({stats.totalReviews} đánh giá)</span>
                </div>
              )}
              <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-slate-500" />
                <span>Giảng viên: <strong className="text-slate-950 font-medium">{instructorName}</strong></span>
              </div>
            </div>

            {/* Nút Đăng ký To bự trên Banner (Khác biệt lớn nhất của Coursera) */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {isEnrolled ? (
                <Link
                  href={`/learn?slug=${courseSlug}`}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg transition text-center shadow-sm text-base tracking-wide"
                >
                  Vào lớp học ngay
                </Link>
              ) : (
                <button
                  onClick={handleEnrollCourse}
                  disabled={submitting}
                  className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-4 px-10 rounded-lg transition text-center shadow-md text-base tracking-wide flex items-center gap-3"
                >
                  {submitting ? "Đang xử lý..." : "Đăng ký học miễn phí"}
                  <span className="text-xs font-normal opacity-80">Bắt đầu ngay</span>
                </button>
              )}
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{(course.studentsCount || 0).toLocaleString()}</span> học viên đã tham gia khóa học này.
              </div>
            </div>
          </div>

          {/* Hình ảnh/Thumbnail bên phải chuẩn Coursera */}
          <div className="lg:col-span-5 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200/60 order-first lg:order-last">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-500">
                <BookOpen size={48} className="stroke-[1.2]" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. SUB-NAVBAR CHỈ MỤC (STICKY SUB-HEADER) */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-40 shadow-sm hidden md:block">
        <div className="max-w-[1400px] mx-auto px-12 flex gap-8">
          {[
            { id: "about", label: "Tổng quan" },
            { id: "curriculum", label: "Chương trình học" },
            { id: "faqs", label: "Câu hỏi thường gặp" },
            { id: "reviews", label: "Đánh giá" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={`py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id ? "border-blue-700 text-blue-700 font-bold" : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH - 3 THÔNG SỐ SƠ LƯỢC KẾ HOẠCH */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12">
        
        {/* Khối Grid 4 cột tổng quan thông số kĩ thuật */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border border-slate-200 rounded-xl bg-slate-50/50 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <Award size={14} className="text-blue-600" /> Tiến độ học
            </div>
            <p className="text-sm font-bold text-slate-800">Cấp chứng chỉ hoàn thành</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <Clock size={14} className="text-blue-600" /> Thời gian học
            </div>
            <p className="text-sm font-bold text-slate-800">Khoảng 4 tháng (Tự điều chỉnh)</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <Sliders size={14} className="text-blue-600" /> Cấp độ chuyên môn
            </div>
            <p className="text-sm font-bold text-slate-800 capitalize">{course.level || "Beginner level"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <Calendar size={14} className="text-blue-600" /> Lịch trình học
            </div>
            <p className="text-sm font-bold text-slate-800">100% Linh hoạt theo ý bạn</p>
          </div>
        </div>

        {/* Bố cục Grid chính: Cột trái (70%) - Cột phải (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* CỘT TRÁI CHỨA NỘI DUNG CHI TIẾT */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Tab 1: About */}
            <section id="about" className="space-y-4 scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Giới thiệu về khóa học này</h2>
              <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line font-normal pr-4">
                {course.description || "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này."}
              </div>
            </section>

            {/* Tab 2: Curriculum */}
            <section id="curriculum" className="space-y-6 scroll-mt-20">
              <div className="flex justify-between items-end border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nội dung chương trình đào tạo</h2>
                <span className="text-xs text-slate-500 font-bold tracking-wide uppercase bg-slate-100 px-2.5 py-1 rounded">
                  {course.lessons?.length || 0} Học phần bài giảng
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                {course.lessons && course.lessons.length > 0 ? (
                  [...course.lessons]
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((lesson: any, index: number) => (
                      <div 
                        key={lesson._id || index} 
                        className="p-4 md:p-5 flex items-center justify-between bg-white hover:bg-slate-50/60 transition group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-6 text-sm font-bold text-slate-500 text-center group-hover:text-blue-600">
                            {index + 1}
                          </span>
                          <CheckCircle size={16} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                          <span className="text-sm md:text-base font-medium text-slate-800 truncate">{lesson.title}</span>
                        </div>
                        {lesson.videoUrl && (
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                            Bài học Video
                          </span>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-500 italic py-8 text-center bg-slate-50/50">Nội dung bài học hiện tại đang được xây dựng.</p>
                )}
              </div>
            </section>

            {/* Tab 3: FAQs */}
            <section id="faqs" className="space-y-6 scroll-mt-20">
              {(loadingFaqs || faqs.length > 0) && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Các câu hỏi thường gặp hệ thống
                  </h2>

                  {loadingFaqs ? (
                    <div className="flex items-center gap-2 py-4 text-slate-500 text-xs">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                      <span>Đang kết nối hệ thống giải đáp...</span>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden bg-white shadow-sm">
                      {faqs.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div key={faq._id || index} className="p-1">
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                              className="w-full flex items-center justify-between text-left p-4 group select-none"
                            >
                              <span className="text-base font-semibold text-slate-800 pr-4 group-hover:text-blue-700 transition-colors">
                                {faq.question}
                              </span>
                              <ChevronDown
                                size={18}
                                className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ${
                                  isOpen ? "rotate-180 text-blue-700" : ""
                                }`}
                              />
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-in-out ${
                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <p className="text-sm text-slate-600 leading-relaxed mx-4 mb-4 mt-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tab 4: Reviews */}
            <section id="reviews" className="space-y-6 scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ý kiến từ cộng đồng học viên</h2>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border border-slate-200 p-6 rounded-xl bg-slate-50/50 items-center">
                  <div className="md:col-span-4 text-center md:border-r border-slate-200 py-2">
                    <p className="text-5xl font-black text-slate-900 tracking-tight">{Number(stats.averageRating).toFixed(1)}</p>
                    <div className="flex justify-center my-2 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.round(Number(stats.averageRating)) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stats.totalReviews} xếp hạng thực tế</p>
                  </div>

                  <div className="md:col-span-8 space-y-2 px-2">
                    {Object.entries(stats.ratingDistribution).reverse().map(([star, count]) => (
                      <div key={star} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                        <span className="w-3 text-right">{star}</span>
                        <Star size={12} fill="currentColor" className="text-amber-500 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}></div>
                        </div>
                        <span className="w-8 text-slate-500 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KHU VỰC THÊM ĐÁNH GIÁ CỦA BẢN THÂN */}
              {isEnrolled && userProgress >= 25 ? (
                <div className="p-5 border border-blue-100 rounded-xl bg-blue-50/40 space-y-4 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    Chia sẻ trải nghiệm học của bạn (Tiến độ: {userProgress}%)
                  </h4>
                  
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-500 transition hover:scale-110"
                      >
                        <Star size={20} fill={star <= newRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Nội dung kiến thức có sát với thực chiến không? Hãy đánh giá trung thực để cải thiện hệ thống nhé..."
                      className="w-full p-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white min-h-[90px] resize-none shadow-inner"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          if (!newComment.trim()) return alert("Vui lòng nhập phản hồi!");
                          try {
                            setIsSubmittingReview(true);
                            await reviewService.createReview({
                              courseId: course._id,
                              rating: newRating,
                              comment: newComment
                            });
                            setNewComment("");
                            loadReviewsAndStats(course._id);
                            alert("Gửi phản hồi thành công!");
                          } catch (err: any) {
                            alert(err.message || "Gặp sự cố khi gửi");
                          } finally {
                            setIsSubmittingReview(false);
                          }
                        }}
                        disabled={isSubmittingReview}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition uppercase tracking-wider"
                      >
                        {isSubmittingReview ? "Đang gửi đi..." : "Đăng tải phản hồi"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                  <p className="text-xs text-slate-500 font-semibold">
                    🔒 Bạn cần tích lũy học tập tối thiểu <strong className="text-slate-900">25%</strong> tổng thời lượng khóa học để mở khóa tính năng viết bình luận.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Tiến trình lớp học hiện tại của bạn: {userProgress}%</p>
                </div>
              ) : null}

              {/* LIST HIỂN THỊ ĐÁNH GIÁ */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <p className="text-xs text-slate-500 text-center py-4">Đang đồng bộ bình luận...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="p-5 border border-slate-200 rounded-xl bg-white space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 font-bold text-blue-700 text-xs flex items-center justify-center uppercase">
                            {review.student?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{review.student?.name}</p>
                            <div className="flex text-amber-500 gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed pl-1 font-normal">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-4 pt-1 pl-1">
                        <button 
                          onClick={() => handleMarkHelpful(review._id)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-semibold transition"
                        >
                          <ThumbsUp size={13} />
                          <span>Bình luận hữu ích ({review.helpful})</span>
                        </button>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            Tài khoản đã được xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic py-6 text-center border border-dashed rounded-xl">Khóa học này hiện chưa nhận được phản hồi.</p>
                )}
              </div>
            </section>

          </div>

          {/* CỘT PHẢI: BANNER BOX PHỤ (TRÁNH BỊ TRỐNG KHI CUỘN) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Mức giá chương trình</span>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">
                  {course.price === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn Phí</span>
                  ) : (
                    <span>{course.price?.toLocaleString("vi-VN")}đ</span>
                  )}
                </div>
              </div>

              {error && !isEnrolled && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              {isEnrolled ? (
                <Link
                  href={`/learn?slug=${courseSlug}`}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition text-center shadow-md block text-sm uppercase tracking-wider"
                >
                  Tiếp tục học tập
                </Link>
              ) : (
                <button
                  onClick={handleEnrollCourse}
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition text-center shadow-md text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CreditCard size={15} />
                  {submitting ? "Đang liên kết..." : "Ghi danh học viên"}
                </button>
              )}

              <div className="pt-4 space-y-3 text-xs text-slate-600 font-medium border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Quyền sở hữu chương trình vô thời hạn</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Tự động nhận bài tập & giáo trình mới nhất</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseDetailPageContent />
    </Suspense>
  );
}
