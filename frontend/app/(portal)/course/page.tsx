"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { taoDonHang, dinhDangTien } from "@/src/services/order";
import AnhDaiDien from "@/src/components/ui/Avatar";
import SafeImage from "@/src/components/ui/SafeImage";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { duongDanDangNhap, doiDiaChi } from "@/src/components/auth/loginUrl";
import {
  ArrowLeft,
  BookOpen,
  User,
  CheckCircle,
  Calendar,
  ShieldCheck,
  CreditCard,
  Star,
  ThumbsUp,
  ChevronDown,
  Loader2,
  Award,
  Clock,
  Sliders,
} from "lucide-react";
import Link from "next/link";

import { getCourseBySlug, type Course } from "@/src/services/course";
import {
  useDaGanVaoTrinhDuyet,
  useNguoiDungLuu,
  useDangTaiNguoiDung,
} from "@/src/hooks/userStore";
import type { Lesson } from "@/src/services/lesson.api";
import {
  getEnrollmentByCourse,
  enrollInCourse,
  getProgressStats,
} from "@/src/services/enrollment.api";
import NutMuaBangCoin from "@/src/components/common/BuyWithCoinButton";
import ONhapMaGiamGia from "@/src/components/vouchers/VoucherInput";
import { giaRaCoin } from "@/src/services/coin.api";
import GoiYKhoaHoc from "@/src/components/courses/CourseSuggestions";
import { useGioHang } from "@/src/hooks/cart";
import { ShoppingCart, Check } from "lucide-react";
import { reviewService, Review, ReviewStats } from "@/src/services/review";
import { faqService, FaqItem } from "@/src/services/faq";

import styles from "./page.module.scss";
function CourseDetailSkeleton() {
  return (
    <div className={styles.page}>
      {/* 1. Hero Banner Skeleton */}
      <div className={styles.box}>
        <div className={styles.container}>
          <div className={styles.stack}>
            <div className={styles.box2}></div>
            <div className={styles.stack2}>
              <div className={styles.box3}></div>
              <div className={styles.box4}></div>
              <div className={styles.box5}></div>
            </div>
            <div className={styles.row}>
              <div className={styles.box6}></div>
              <div className={styles.box6}></div>
            </div>
            <div className={styles.row2}>
              <div className={styles.box7}></div>
              <div className={styles.box8}></div>
            </div>
          </div>
          <div className={styles.box9}></div>
        </div>
      </div>

      {/* 2. Sticky Sub-Navbar Skeleton */}
      <div className={styles.box10}>
        <div className={styles.container2}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.box11}></div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className={styles.container3}>
        {/* Grid 4 thông số */}
        <div className={styles.card}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.stack3}>
              <div className={styles.box12}></div>
              <div className={styles.box2}></div>
            </div>
          ))}
        </div>

        {/* Cột trái & Cột phải */}
        <div className={styles.grid}>
          {/* Cột trái (70%) */}
          <div className={styles.stack4}>
            {/* Về khóa học */}
            <div className={styles.stack5}>
              <div className={styles.box13}></div>
              <div className={styles.stack3}>
                <div className={styles.box4}></div>
                <div className={styles.box4}></div>
                <div className={styles.box14}></div>
              </div>
            </div>

            {/* Chương trình học */}
            <div className={styles.stack5}>
              <div className={styles.box15}></div>
              <div className={styles.box16}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.row3}>
                    <div className={styles.row4}>
                      <div className={styles.box17}></div>
                      <div className={styles.box4}></div>
                    </div>
                    <div className={styles.box18}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải (30%) */}
          <div className={styles.stack6}>
            <div className={styles.card2}>
              <div className={styles.stack3}>
                <div className={styles.box19}></div>
                <div className={styles.box20}></div>
              </div>
              <div className={styles.box21}></div>
              <div className={styles.stack7}>
                <div className={styles.box22}></div>
                <div className={styles.box5}></div>
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

  // ?xem=1 => o lai trang gioi thieu, dung nhay vao bai hoc. Doc ra bien roi
  // moi dung trong effect: de nguyen searchParams thi phai bo ca doi tuong do
  // vao mang phu thuoc, ma no doi tham chieu moi lan dieu huong nen effect se
  // goi lai toan bo API mot cach thua thai.
  const boQuaNhayVaoHoc = searchParams.get("xem") === "1";

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  // Bat khi trang nay chi la tram trung chuyen sang /learn. Giu khung xam cho
  // toi luc doi trang, neu khong nguoi hoc thay trang gioi thieu nhap nhay mot
  // cai roi bien mat.
  const [dangNhayVaoHoc, setDangNhayVaoHoc] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Ma giam gia dang duoc ap, va so tien giam TUONG UNG.
  //
  // `soTienGiam` chi de HIEN cho nguoi dung xem truoc. May chu luon tinh lai
  // tu dau khi nhan `maGiamGia` - khong bao gio tin con so gui len tu day.
  const { them: themVaoGio, bo: boKhoiGio, coTrongGio } = useGioHang();
  const [maGiamGia, setMaGiamGia] = useState<string>("");
  const [soTienGiam, setSoTienGiam] = useState<number>(0);
  const [error, setError] = useState<string>("");
  // false khi dung HTML o may chu, true sau khi React gan vao trinh duyet.
  const isMounted = useDaGanVaoTrinhDuyet();
  const nguoiDung = useNguoiDungLuu();
  const dangTaiNguoiDung = useDangTaiNguoiDung();
  const duongDan = usePathname();

  // Mo hop dang nhap NGAY TREN trang nay, giu nguyen ?slug dang xem. Truoc day
  // cho nay day nguoi dung ve "/?auth=login" - dang nhap xong ho dung o trang
  // chu va phai tu tim lai khoa hoc.
  const moDangNhap = (lyDo: "hoc" | "ghidanh") =>
    doiDiaChi(duongDanDangNhap(duongDan, searchParams, lyDo));

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
        reviewService.getReviewStats(courseId),
      ]);
      setReviews(reviewsData.reviews || []);
      setStats(statsData);
    } catch (err) {
      console.error("Không thể tải dữ liệu đánh giá:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!isMounted || !courseSlug) return;

    let isComponentMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // getCourseBySlug tra ve Course HOAC { error }, phai loai truong hop
        // loi ra truoc thi phan con lai moi chac chan la Course.
        const courseData = await getCourseBySlug(courseSlug);
        if (!courseData || "error" in courseData) {
          if (isComponentMounted) setCourse(null);
          return;
        }

        if (isComponentMounted) setCourse(courseData);
        const realCourseId = courseData._id;

        loadReviewsAndStats(realCourseId);
        loadCourseFaqs(realCourseId);
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
  }, [courseSlug, isMounted, boQuaNhayVaoHoc, router]);
  // Ghi danh + tien do: effect RIENG, tach khoi luot tai khoa hoc.
  //
  // Vi sao phai tach: danh tinh gio den tu may chu (<NapNguoiDung />) chu
  // khong con doc duoc tuc thi tu localStorage. De chung mot effect thi effect
  // do phai phu thuoc vao danh tinh, va no se chay HAI lan - lan hai goi lai
  // setLoading(true) nen ca trang khoa hoc nhay ve khung xam mot cai sau khi
  // da hien noi dung.
  //
  // Tach ra thi noi dung khoa hoc tai ngay, khong phai cho biet nguoi xem la
  // ai; phan ghi danh tu dien vao sau.
  //
  // Khach vang lai KHONG duoc goi hai duong duoi day. Khong phai de tiet kiem
  // request: apiHelper gap 401 la goi xoaPhien() roi day ve trang chu, nen
  // khach dang doc trang khoa hoc se bi hat van ra ngoai. Cong chan nay la thu
  // duy nhat giu ho o lai.
  useEffect(() => {
    const realCourseId = course?._id;
    if (!realCourseId) return;

    // Con dang hoi may chu thi CHUA ket luan gi. Ket luan som la nguoi dang
    // dang nhap bi coi nhu khach va mat nut vao hoc.
    if (dangTaiNguoiDung) return;

    // Khach vang lai: thoat, KHONG goi setIsEnrolled(false).
    //
    // Gia tri khoi tao cua isEnrolled da la false, nen goi lai chi thua - va
    // eslint chan setState dong bo trong than effect (--max-warnings 0). Nguoi
    // dang xem ma dang xuat thi xoaPhien() chuyen han sang trang chu, component
    // nay bi thao, khong con trang thai cu de don.
    if (!nguoiDung) return;

    let isComponentMounted = true;

    const docGhiDanh = async () => {
      try {
        const [enrollmentData, progressData] = await Promise.all([
          getEnrollmentByCourse(realCourseId),
          getProgressStats(realCourseId).catch(() => null),
        ]);

        if (isComponentMounted) {
          if (enrollmentData && enrollmentData.isEnrolled === true) {
            setIsEnrolled(true);

            // DA GHI DANH thi vao thang bai giang, khong bat xem lai trang
            // gioi thieu nua - ke ca khoa co phi.
            //
            // Truoc day cho nay chi ap cho khoa gia 0, voi ly do "khoa co phi
            // van phai qua trang nay vi do la noi hien gia va nut thanh
            // toan". Ly do do chi dung voi nguoi CHUA ghi danh. Ma khoa co
            // phi thi may chu chi tao duoc ghi danh khi da co don hang trang
            // thai 'paid' (xem enrollInCourse trong courseController) - nen
            // chay den duoc dong nay nghia la nguoi ta tra tien xong roi.
            // Khong con luong mua nao de "bo qua", chi con bat ho bam them
            // mot lan nua moi vao duoc bai giang da mua.
            //
            // ?xem=1 la duong lui: nut quay lai o trang hoc mang tham so nay
            // nen van mo duoc trang gioi thieu de doc danh gia, hoi dap. Thieu
            // no thi hai trang day qua day lai thanh vong lap.
            if (!boQuaNhayVaoHoc) {
              setDangNhayVaoHoc(true);
              router.replace(`/learn?slug=${courseSlug}`);
              return;
            }
            // Truoc day dong nay doc progressData?.totalProgress, ma
            // ProgressStats khong he co truong do (ten that la
            // progressPercentage). Ve mat kieu la undefined, nen ve phai cua
            // ?? luon thang - tuc la ket qua cua getProgressStats bi vut di,
            // luot goi API do khong dung vao viec gi.
            const currentProgress =
              progressData?.progressPercentage ?? enrollmentData?.totalProgress ?? 0;
            setUserProgress(currentProgress);
          } else {
            setIsEnrolled(false);
            setUserProgress(0);
          }
        }
      } catch {
        if (isComponentMounted) {
          setIsEnrolled(false);
          setUserProgress(0);
        }
      }
    };

    docGhiDanh();

    return () => {
      isComponentMounted = false;
    };
  }, [course?._id, nguoiDung, dangTaiNguoiDung, boQuaNhayVaoHoc, courseSlug, router]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.markHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpful: updatedReview.helpful } : r,
        ),
      );
    } catch (err) {
      alert(getErrorMessage(err, "Đã xảy ra lỗi"));
    }
  };

  const handleEnrollCourse = async () => {
    if (!course?._id) {
      setError("Không tìm thấy thông tin định danh khóa học");
      return;
    }

    // Khach vang lai: hien hop dang nhap NGAY, khong goi may chu truoc.
    //
    // Truoc day cho nay cu goi ghi danh, an 401, roi moi mo dang nhap - tuc la
    // nguoi dung bam nut, ngoi cho mot luot mang, roi moi thay hop dang nhap.
    // Nhanh bat 401 ben duoi VAN giu: phien co the het han giua chung, va luc
    // do chi may chu moi biet.
    //
    // dangTaiNguoiDung: chua hoi xong may chu \"toi la ai\". Khong kiem co nay
    // thi nguoi DANG dang nhap bam nut trong mot phan giay dau se bi day vao
    // hop dang nhap oan.
    if (!dangTaiNguoiDung && !nguoiDung) {
      moDangNhap((course.price ?? 0) > 0 ? "ghidanh" : "hoc");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Khoa co phi: tao don roi sang trang thanh toan, khong goi ghi danh.
      // May chu cung chan duong ghi danh cho khoa co phi (402), day chi la de
      // nguoi dung khong phai bam mot nut roi nhan loi.
      if ((course.price ?? 0) > 0) {
        const { order } = await taoDonHang(course._id, maGiamGia || undefined);
        router.push(`/payment?code=${order.code}`);
        return;
      }

      const result = await enrollInCourse(course._id);

      setCourse((prevCourse) => {
        if (!prevCourse) return null;
        const newCount =
          result && result.studentsCount !== undefined
            ? result.studentsCount
            : (prevCourse.studentsCount || 0) + 1;

        return { ...prevCourse, studentsCount: newCount };
      });

      setIsEnrolled(true);
      router.refresh();
      router.push(`/learn?slug=${courseSlug}`);
    } catch (error) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = getErrorMessage(error, "");

      if (errorMsg.includes("401")) {
        // Phien vua het han giua chung. Mo hop dang nhap ngay tren trang nay,
        // KHONG day ve trang chu: dang nhap xong ho van o dung khoa hoc dang
        // xem va bam tiep duoc.
        setError("Vui lòng đăng nhập để tiếp tục chương trình học");
        moDangNhap("hoc");
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

  if (loading || dangNhayVaoHoc) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className={styles.page2}>
        <div className={styles.card3}>
          <p className={styles.text}>Không tìm thấy dữ liệu</p>
          <p className={styles.text2}>
            {error || "Khóa học không tồn tại hoặc chưa được xuất bản."}
          </p>
          <button onClick={() => router.push("/")} className={styles.button}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const instructorName =
    typeof course.instructor === "object"
      ? course.instructor.name
      : course.instructor || "Expert Instructor";

  return (
    <div className={styles.page3}>
      {/* 1. HERO BANNER - FULL WIDTH CHUẨN COURSERA */}
      <div className={styles.box23}>
        <div className={styles.container}>
          {/* Thông tin khóa học */}
          <div className={styles.stack}>
            {/* -my-2 py-2: noi cao vung cham len 40px cho ngon tay ma khong
                day chu xuong. Ban cu cao dung 16px - tren dien thoai bam
                truot la chuyen binh thuong. */}
            <button onClick={() => router.back()} className={styles.button2}>
              <ArrowLeft size={14} /> QUAY LẠI DANH MỤC
            </button>

            <div className={styles.stack5}>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.text3}>
                {course.description?.split(".")[0]}. Học cách thiết kế hệ thống thực
                chiến, tăng tư duy logic cốt lõi.
              </p>
            </div>

            {/* Khối Đánh giá nhanh dưới Title */}
            <div className={styles.row5}>
              {stats && (
                <div className={styles.row6}>
                  <Star size={16} className={styles.box24} />
                  <span className={styles.label}>
                    {Number(stats.averageRating).toFixed(1)}
                  </span>
                  <span className={styles.label2}>({stats.totalReviews} đánh giá)</span>
                </div>
              )}
              <div className={styles.box25}></div>
              <div className={styles.row7}>
                <User size={16} className={styles.label2} />
                <span>
                  Giảng viên: <strong className={styles.strong}>{instructorName}</strong>
                </span>
              </div>
            </div>

            {/* Nút Đăng ký To bự trên Banner (Khác biệt lớn nhất của Coursera) */}
            <div className={styles.col}>
              {isEnrolled ? (
                <Link href={`/learn?slug=${courseSlug}`} className={styles.card4}>
                  Vào lớp học ngay
                </Link>
              ) : (
                <button
                  onClick={() => {
                    // Khoa co phi: dua xuong the mua, KHONG tao don rồi nhay
                    // thang sang man hinh QR nhu truoc. Nut nay la nut to nhat
                    // trang nen hau het nguoi dung bam no - nhay thang sang QR
                    // tuc la ai co san coin trong vi cung bi day sang chuyen
                    // khoan, khong he biet la co duong khac.
                    if ((course.price ?? 0) > 0) {
                      document
                        .getElementById("mua-khoa-hoc")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      return;
                    }
                    void handleEnrollCourse();
                  }}
                  disabled={submitting}
                  className={styles.button3}
                >
                  {submitting
                    ? "Đang xử lý..."
                    : (course.price ?? 0) > 0
                      ? `Mua khóa học - ${dinhDangTien(course.price ?? 0)}`
                      : "Đăng ký học miễn phí"}
                  <span className={styles.label3}>
                    {(course.price ?? 0) > 0 ? "Coin hoặc chuyển khoản" : "Bắt đầu ngay"}
                  </span>
                </button>
              )}
              <div className={styles.box26}>
                <span className={styles.label}>
                  {(course.studentsCount || 0).toLocaleString()}
                </span>{" "}
                học viên đã tham gia khóa học này.
              </div>
            </div>
          </div>

          {/* Hình ảnh/Thumbnail bên phải chuẩn Coursera */}
          <div className={styles.box27}>
            {course.thumbnail ? (
              <SafeImage
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className={styles.box28}
              />
            ) : (
              <div className={styles.col2}>
                <BookOpen size={48} className={styles.box29} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVBAR CHỈ MỤC (STICKY SUB-HEADER) */}
      <div className={styles.sticky}>
        <div className={styles.container4}>
          {[
            { id: "about", label: "Tổng quan" },
            { id: "curriculum", label: "Chương trình học" },
            { id: "faqs", label: "Câu hỏi thường gặp" },
            { id: "reviews", label: "Đánh giá" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                document
                  .getElementById(tab.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={`${styles.button12} ${
                activeTab === tab.id ? styles.button4 : styles.button5
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH - 3 THÔNG SỐ SƠ LƯỢC KẾ HOẠCH */}
      <div className={styles.container3}>
        {/* Khối Grid 4 cột tổng quan thông số kĩ thuật */}
        <div className={styles.card}>
          <div className={styles.stack8}>
            <div className={styles.row8}>
              <Award size={14} className={styles.box30} /> Tiến độ học
            </div>
            <p className={styles.text4}>Cấp chứng chỉ hoàn thành</p>
          </div>
          <div className={styles.stack8}>
            <div className={styles.row8}>
              <Clock size={14} className={styles.box30} /> Thời gian học
            </div>
            <p className={styles.text4}>Khoảng 4 tháng (Tự điều chỉnh)</p>
          </div>
          <div className={styles.stack8}>
            <div className={styles.row8}>
              <Sliders size={14} className={styles.box30} /> Cấp độ chuyên môn
            </div>
            <p className={styles.text5}>{course.level || "Beginner level"}</p>
          </div>
          <div className={styles.stack8}>
            <div className={styles.row8}>
              <Calendar size={14} className={styles.box30} /> Lịch trình học
            </div>
            <p className={styles.text4}>100% Linh hoạt theo ý bạn</p>
          </div>
        </div>

        {/* Bố cục Grid chính: Cột trái (70%) - Cột phải (30%) */}
        <div className={styles.grid}>
          {/* CỘT TRÁI CHỨA NỘI DUNG CHI TIẾT */}
          <div className={styles.stack4}>
            {/* Tab 1: About */}
            <section id="about" className={styles.section}>
              <h2 className={styles.heading}>Giới thiệu về khóa học này</h2>
              <div className={styles.box31}>
                {course.description ||
                  "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này."}
              </div>
            </section>

            {/* Tab 2: Curriculum */}
            <section id="curriculum" className={styles.section2}>
              <div className={styles.row9}>
                <h2 className={styles.heading}>Nội dung chương trình đào tạo</h2>
                <span className={styles.label4}>
                  {course.lessons?.length || 0} Học phần bài giảng
                </span>
              </div>

              <div className={styles.box32}>
                {course.lessons && course.lessons.length > 0 ? (
                  [...(course.lessons as Lesson[])]
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((lesson, index: number) => (
                      <div key={lesson._id || index} className={`group ${styles.row10}`}>
                        <div className={styles.row11}>
                          <span className={styles.label5}>{index + 1}</span>
                          <CheckCircle size={16} className={styles.box33} />
                          <span className={styles.label6}>{lesson.title}</span>
                        </div>
                        {lesson.videoUrl && (
                          <span className={styles.card5}>Bài học Video</span>
                        )}
                      </div>
                    ))
                ) : (
                  <p className={styles.text6}>
                    Nội dung bài học hiện tại đang được xây dựng.
                  </p>
                )}
              </div>
            </section>

            {/* Tab 3: FAQs */}
            <section id="faqs" className={styles.section2}>
              {(loadingFaqs || faqs.length > 0) && (
                <div className={styles.stack5}>
                  <h2 className={styles.heading2}>Các câu hỏi thường gặp hệ thống</h2>

                  {loadingFaqs ? (
                    <div className={styles.row12}>
                      <Loader2 className={styles.spinner} size={16} />
                      <span>Đang kết nối hệ thống giải đáp...</span>
                    </div>
                  ) : (
                    <div className={styles.card6}>
                      {faqs.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div key={faq._id || index} className={styles.box34}>
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                              className={`group ${styles.button6}`}
                            >
                              <span className={styles.label7}>{faq.question}</span>
                              <ChevronDown
                                size={18}
                                className={`${styles.box45} ${
                                  isOpen ? styles.box35 : ""
                                }`}
                              />
                            </button>

                            <div
                              className={`${styles.grid2} ${
                                isOpen ? styles.box36 : styles.box37
                              }`}
                            >
                              <div className={styles.box38}>
                                <p className={styles.text7}>{faq.answer}</p>
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
            <section id="reviews" className={styles.section2}>
              <h2 className={styles.heading}>Ý kiến từ cộng đồng học viên</h2>

              {stats && (
                <div className={styles.card7}>
                  <div className={styles.box39}>
                    <p className={styles.text8}>
                      {Number(stats.averageRating).toFixed(1)}
                    </p>
                    <div className={styles.row13}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < Math.round(Number(stats.averageRating))
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <p className={styles.text9}>{stats.totalReviews} xếp hạng thực tế</p>
                  </div>

                  <div className={styles.stack9}>
                    {Object.entries(stats.ratingDistribution)
                      .reverse()
                      .map(([star, count]) => (
                        <div key={star} className={styles.row14}>
                          <span className={styles.label8}>{star}</span>
                          <Star size={12} fill="currentColor" className={styles.box40} />
                          <div className={styles.box41}>
                            <div
                              className={styles.box42}
                              style={{
                                width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className={styles.label9}>{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* KHU VỰC THÊM ĐÁNH GIÁ CỦA BẢN THÂN */}
              {isEnrolled && userProgress >= 25 ? (
                <div className={styles.card8}>
                  <h4 className={styles.minorHeading}>
                    <Star size={16} className={styles.box24} />
                    Chia sẻ trải nghiệm học của bạn (Tiến độ: {userProgress}%)
                  </h4>

                  <div className={styles.row15}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={styles.button7}
                      >
                        <Star
                          size={20}
                          fill={star <= newRating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>

                  <div className={styles.stack2}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Nội dung kiến thức có sát với thực chiến không? Hãy đánh giá trung thực để cải thiện hệ thống nhé..."
                      className={styles.textarea}
                    />
                    <div className={styles.row16}>
                      <button
                        onClick={async () => {
                          if (!newComment.trim()) return alert("Vui lòng nhập phản hồi!");
                          try {
                            setIsSubmittingReview(true);
                            await reviewService.createReview({
                              courseId: course._id,
                              rating: newRating,
                              comment: newComment,
                            });
                            setNewComment("");
                            loadReviewsAndStats(course._id);
                            alert("Gửi phản hồi thành công!");
                          } catch (err) {
                            alert(getErrorMessage(err, "Gặp sự cố khi gửi"));
                          } finally {
                            setIsSubmittingReview(false);
                          }
                        }}
                        disabled={isSubmittingReview}
                        className={styles.button8}
                      >
                        {isSubmittingReview ? "Đang gửi đi..." : "Đăng tải phản hồi"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className={styles.card9}>
                  <p className={styles.text10}>
                    🔒 Bạn cần tích lũy học tập tối thiểu{" "}
                    <strong className={styles.strong2}>25%</strong> tổng thời lượng khóa
                    học để mở khóa tính năng viết bình luận.
                  </p>
                  <p className={styles.text11}>
                    Tiến trình lớp học hiện tại của bạn: {userProgress}%
                  </p>
                </div>
              ) : null}

              {/* LIST HIỂN THỊ ĐÁNH GIÁ */}
              <div className={styles.stack5}>
                {loadingReviews ? (
                  <p className={styles.text12}>Đang đồng bộ bình luận...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className={styles.card10}>
                      <div className={styles.row17}>
                        <div className={styles.row18}>
                          <AnhDaiDien
                            src={review.student?.avatar}
                            ten={review.student?.name}
                            size={36}
                            nenChuCai={styles.box46}
                          />
                          <div>
                            <p className={styles.text4}>{review.student?.name}</p>
                            <div className={styles.row19}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < review.rating ? "currentColor" : "none"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className={styles.label10}>
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className={styles.text13}>{review.comment}</p>

                      <div className={styles.row20}>
                        <button
                          onClick={() => handleMarkHelpful(review._id)}
                          className={styles.button9}
                        >
                          <ThumbsUp size={13} />
                          <span>Bình luận hữu ích ({review.helpful})</span>
                        </button>
                        {review.isVerifiedPurchase && (
                          <span className={styles.card11}>
                            Tài khoản đã được xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.text14}>
                    Khóa học này hiện chưa nhận được phản hồi.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI: BANNER BOX PHỤ (TRÁNH BỊ TRỐNG KHI CUỘN) */}
          <div id="mua-khoa-hoc" className={styles.stack10}>
            <div className={styles.card12}>
              <div className={styles.stack8}>
                <span className={styles.label11}>Mức giá chương trình</span>
                <div className={styles.box43}>
                  {(course.price ?? 0) === 0 ? (
                    <span className={styles.label12}>Miễn phí</span>
                  ) : (
                    <span>{(course.price ?? 0).toLocaleString("vi-VN")}đ</span>
                  )}
                </div>
              </div>

              {error && !isEnrolled && (
                <div className={styles.card13}>
                  <p className={styles.text15}>{error}</p>
                </div>
              )}

              {isEnrolled ? (
                <Link href={`/learn?slug=${courseSlug}`} className={styles.card14}>
                  Tiếp tục học tập
                </Link>
              ) : (
                <div className={styles.stack2}>
                  {/* O nhap ma dat TREN ca hai nut mua: nguoi dung phai ap ma
                      xong roi moi bam mua, khong phai bam mua roi moi phat
                      hien ra minh quen nhap ma. */}
                  {(course.price ?? 0) > 0 && (
                    <ONhapMaGiamGia
                      courseId={course._id}
                      onDoiMa={(ma, giam) => {
                        setMaGiamGia(ma);
                        setSoTienGiam(giam);
                      }}
                    />
                  )}

                  {soTienGiam > 0 && (
                    <p className={styles.text16}>
                      <span className={styles.label13}>
                        {(course.price ?? 0).toLocaleString("vi-VN")}đ
                      </span>{" "}
                      <span className={styles.label14}>
                        {Math.max(0, (course.price ?? 0) - soTienGiam).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </span>
                    </p>
                  )}

                  {/* Coin di TRUOC chuyen khoan: ai co san coin thi mo khoa
                      ngay tai day, khong phai qua man hinh QR roi ngoi cho
                      quan tri doi chieu. Ai khong du coin thi component nay tu
                      bao thieu bao nhieu, va nut chuyen khoan ben duoi van con
                      nguyen. */}
                  {(course.price ?? 0) > 0 && (
                    <NutMuaBangCoin
                      courseId={course._id}
                      gia={course.price ?? 0}
                      maGiamGia={maGiamGia}
                      soCoinGiam={giaRaCoin(soTienGiam)}
                      khiMuaXong={() => {
                        setIsEnrolled(true);
                        // Mua thang o day thi khoa nay khong con viec gi trong
                        // gio. De lai thi lan thanh toan gio sau bao "bạn đã
                        // sở hữu khóa này" - mot loi do chinh minh tao ra.
                        boKhoiGio(course._id);
                        router.push(`/learn?slug=${courseSlug}`);
                      }}
                    />
                  )}

                  {/* Them vao gio chi co nghia voi khoa CO PHI: khoa mien phi
                      thi bam mot cai la vao hoc duoc ngay, bo vao gio roi quay
                      lai thanh toan la bat nguoi ta di duong vong. */}
                  {(course.price ?? 0) > 0 &&
                    (coTrongGio(course._id) ? (
                      <Link href="/cart" className={styles.card15}>
                        <Check size={16} /> Đã có trong giỏ — Xem giỏ hàng
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          themVaoGio({
                            courseId: course._id,
                            title: course.title,
                            slug: course.slug,
                            thumbnail: course.thumbnail,
                            gia: course.price ?? 0,
                          })
                        }
                        className={styles.button10}
                      >
                        <ShoppingCart size={16} /> Thêm vào giỏ
                      </button>
                    ))}

                  <button
                    onClick={handleEnrollCourse}
                    disabled={submitting}
                    className={styles.button11}
                  >
                    <CreditCard size={15} />
                    {submitting
                      ? "Đang liên kết..."
                      : (course.price ?? 0) > 0
                        ? "Chuyển khoản ngân hàng"
                        : "Ghi danh học viên"}
                  </button>
                </div>
              )}

              <div className={styles.stack11}>
                <div className={styles.row21}>
                  <ShieldCheck size={16} className={styles.box44} />
                  <span>Quyền sở hữu chương trình vô thời hạn</span>
                </div>
                <div className={styles.row21}>
                  <ShieldCheck size={16} className={styles.box44} />
                  <span>Tự động nhận bài tập & giáo trình mới nhất</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khoa lien quan, dat SAU phan danh gia - tuc la sau khi nguoi doc da
          xem het thong tin ve khoa nay. Dat truoc do la moi ho di cho khac
          trong khi chua quyet dinh gi ve khoa dang xem.

          Component tu an di khi khong co goi y nao. */}
      {course?._id && <GoiYKhoaHoc soLuong={4} courseId={course._id} />}
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page4}>
          <div className={styles.spinner2} />
        </div>
      }
    >
      <CourseDetailPageContent />
    </Suspense>
  );
}
