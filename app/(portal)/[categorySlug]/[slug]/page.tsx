"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, BookOpen, User, CheckCircle, GraduationCap, 
  Calendar, ShieldCheck, CreditCard, Star, ThumbsUp, MessageSquare,
  ChevronDown, HelpCircle, Loader2
} from "lucide-react";
import Link from "next/link";

import { getCourseBySlug } from "@/src/services/course";
import { getEnrollmentByCourse, enrollInCourse, getProgressStats } from "@/src/services/enrollment.api";
import { reviewService, Review, ReviewStats } from "@/src/services/review"; 
// 🎯 IMPORT SERVICE FAQ ĐỂ LẤY DỮ LIỆU THẬT THEO COURSE ID
import { faqService, FaqItem } from "@/src/services/faq"; 

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseSlug = (params.slug || params.id) as string;
  const categorySlug = params.categorySlug as string;

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

  // 🎯 CÁC STATE QUẢN LÝ DỮ LIỆU FAQ CỦA KHÓA HỌC
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

        // 📥 TẢI SONG SONG CẢ REVIEWS VÀ FAQS SAU KHI CÓ REAL COURSE ID
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
          console.log("Học viên chưa đăng ký khóa học hoặc không lấy được tiến độ.");
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

  // 🎯 HÀM GỌI API LẤY FAQS THEO COURSEID
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
          
        return {
          ...prevCourse,
          studentsCount: newCount
        };
      });
      
      setIsEnrolled(true);
      router.refresh();
      router.push(`/${categorySlug}/${courseSlug}/learn`);
      
    } catch (error: any) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = error.message || "";

      if (errorMsg.includes("401")) {
        setError("Vui lòng đăng nhập để tiếp tục chương trình học");
        router.push("/login");
      } else if (errorMsg.includes("đã đăng ký") || errorMsg.includes("400")) {
        setIsEnrolled(true);
        router.push(`/${categorySlug}/${courseSlug}/learn`);
      } else {
        setError(errorMsg || "Không thể xử lý ghi danh. Vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Đang xác thực dữ liệu khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border">
          <p className="text-red-500 font-bold text-base">Không tìm thấy dữ liệu</p>
          <p className="text-slate-400 text-xs mt-1">{error || "Khóa học không tồn tại hoặc chưa được xuất bản."}</p>
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
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* BANNER */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={14} /> QUAY LẠI
          </button>
          
          <div className="space-y-4 max-w-3xl">
            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs font-bold uppercase tracking-wide border border-blue-500/20 capitalize">
              {course.level || "Beginner"}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-blue-400" />
                <span>Giảng viên: <strong className="text-white font-medium">{instructorName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={16} className="text-blue-400" />
                <span>Học viên: <strong className="text-white font-medium">{course.studentsCount || 0} đang học</strong></span>
              </div>
              {course.updatedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-slate-400">Cập nhật: {new Date(course.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Giới thiệu khóa học
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {course.description || "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-base text-slate-900">
                  Nội dung chương trình học
                </h3>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  {course.lessons?.length || 0} bài học
                </span>
              </div>

              <div className="space-y-2">
                {course.lessons && course.lessons.length > 0 ? (
                  [...course.lessons]
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((lesson: any, index: number) => (
                      <div 
                        key={lesson._id || index} 
                        className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-between group hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckCircle size={15} className="text-slate-300 group-hover:text-blue-500 transition flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700 truncate">{lesson.title}</span>
                        </div>
                        {lesson.videoUrl && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                            Video
                          </span>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-400 italic py-4 text-center">Nội dung bài học đang được cập nhật.</p>
                )}
              </div>
            </div>

            {/* ==========================================================================
                🎯 KHU VỰC HIỂN THỊ FAQS THEO COURSE ID (Mới thêm vào)
               ========================================================================== */}
            {(loadingFaqs || faqs.length > 0) && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <HelpCircle size={18} className="text-purple-600" />
                  Câu hỏi thường gặp
                </h3>

                {loadingFaqs ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400 text-xs justify-center">
                    <Loader2 className="animate-spin text-purple-600" size={16} />
                    <span>Đang tải các câu hỏi giải đáp...</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {faqs.map((faq, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div key={faq._id || index} className="py-3.5 first:pt-0 last:pb-0">
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between text-left group select-none"
                          >
                            <span className="text-sm md:text-base font-semibold text-slate-800 pr-4 group-hover:text-purple-600 transition-colors">
                              {faq.question}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                                isOpen ? "rotate-180 text-purple-600" : ""
                              }`}
                            />
                          </button>

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "grid-rows-[1fr] opacity-100 mt-2.5"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
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

            {/* MỤC REVIEWS ĐÁNH GIÁ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                Đánh giá từ học viên
              </h3>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl items-center">
                  <div className="text-center md:border-r border-slate-200/80 py-2">
                    <p className="text-3xl font-black text-slate-900">{Number(stats.averageRating).toFixed(1)}</p>
                    <div className="flex justify-center my-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.round(Number(stats.averageRating)) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{stats.totalReviews} lượt đánh giá</p>
                  </div>

                  <div className="md:col-span-3 space-y-1.5 px-2">
                    {Object.entries(stats.ratingDistribution).reverse().map(([star, count]) => {
                      return (
                        <div key={star} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                          <span className="w-3 text-right">{star}</span>
                          <Star size={12} fill="currentColor" className="text-amber-500 flex-shrink-0" />
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}></div>
                          </div>
                          <span className="w-8 text-slate-400 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isEnrolled && userProgress >= 25 ? (
                <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/40 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Star size={15} className="text-amber-500 fill-amber-500" />
                    Đóng góp ý kiến của bạn (Tiến độ học: {userProgress}%)
                  </h4>
                  
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-500 transition hover:scale-110"
                      >
                        <Star size={18} fill={star <= newRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Nội dung khóa học có chất lượng không? Góp ý tại đây..."
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white min-h-[75px] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          if (!newComment.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
                          try {
                            setIsSubmittingReview(true);
                            await reviewService.createReview({
                              courseId: course._id,
                              rating: newRating,
                              comment: newComment
                            });
                            setNewComment("");
                            loadReviewsAndStats(course._id);
                            alert("Gửi đánh giá thành công!");
                          } catch (err: any) {
                            alert(err.message || "Gặp sự cố khi gửi đánh giá");
                          } {
                            setIsSubmittingReview(false);
                          }
                        }}
                        disabled={isSubmittingReview}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition"
                      >
                        {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                  <p className="text-xs text-slate-500 font-semibold">
                    🔒 Bạn phải hoàn thành tối thiểu <strong>25%</strong> thời lượng bài học để kích hoạt bình luận.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Tiến độ hiện tại của bạn: {userProgress}%</p>
                </div>
              ) : null}

              <div className="space-y-4">
                {loadingReviews ? (
                  <p className="text-xs text-slate-400 text-center py-4">Đang tải các đánh giá...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="p-4 border border-slate-100 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-200 font-bold text-slate-600 text-xs flex items-center justify-center uppercase">
                            {review.student?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{review.student?.name}</p>
                            <div className="flex text-amber-500 gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed pl-1">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-4 pt-1 pl-1">
                        <button 
                          onClick={() => handleMarkHelpful(review._id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-medium transition"
                        >
                          <ThumbsUp size={13} />
                          <span>Hữu ích ({review.helpful})</span>
                        </button>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">
                            Đã xác thực mua
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center border border-dashed rounded-xl">Khóa học chưa có lượt bình luận nào.</p>
                )}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: SIDEBAR */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="aspect-video w-full bg-slate-100 relative border-b overflow-hidden flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1">
                    <BookOpen size={36} className="stroke-[1.5]" />
                    <span className="text-[11px]">E-Learning Course</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Học phí</span>
                  <div className="text-xl font-black text-slate-900">
                    {course.price === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
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
                    href={`/${categorySlug}/${courseSlug}/learn`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition text-center shadow-md block text-sm"
                  >
                    Vào lớp học ngay
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollCourse}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl transition text-center shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} />
                    {submitting ? "Đang ghi danh..." : "Đăng ký học ngay"}
                  </button>
                )}

                <div className="pt-2 space-y-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Quyền truy cập học tập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Tự do quản lý tiến độ học cá nhân</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}