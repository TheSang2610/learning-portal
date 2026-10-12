"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { updateUrl, loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import { useCartStore } from "@/src/hooks/cart";
import { useHydrated, useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getCourseBySlug, type Course } from "@/src/services/course";
import {
  enrollInCourse,
  getEnrollmentByCourse,
  getProgressStats,
} from "@/src/services/enrollment.api";
import { createOrder } from "@/src/services/order";

/** Tai khoa theo ?slug=, kiem ghi danh, ghi danh / tao don / them vao gio. */
export function useCourseDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";

  // ?xem=1 => o lai trang gioi thieu, dung nhay vao bai hoc. Doc ra bien roi
  // moi dung trong effect: de nguyen searchParams thi phai bo ca doi tuong do
  // vao mang phu thuoc, ma no doi tham chieu moi lan dieu huong nen effect se
  // goi lai toan bo API mot cach thua thai.
  const skipJumpToLearn = searchParams.get("xem") === "1";

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  // Ngay het han (dd/mm/yyyy) khi khoa co phi da het thoi han hoc: hien nut gia han.
  const [expiredAt, setExpiredAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  // Bat khi trang nay chi la tram trung chuyen sang /learn. Giu khung xam cho
  // toi luc doi trang, neu khong nguoi hoc thay trang gioi thieu nhap nhay mot
  // cai roi bien mat.
  const [jumpingToLearn, setJumpingToLearn] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Ma giam gia dang duoc ap, va so tien giam TUONG UNG.
  //
  // `soTienGiam` chi de HIEN cho nguoi dung xem truoc. May chu luon tinh lai
  // tu dau khi nhan `maGiamGia` - khong bao gio tin con so gui len tu day.
  const { them: addToCart, isInCart } = useCartStore();
  const [voucher, setVoucher] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  // false khi dung HTML o may chu, true sau khi React gan vao trinh duyet.
  const isMounted = useHydrated();
  const user = useStoredUser();
  const loadingUser = useUserLoading();
  const path = usePathname();

  // Mo hop dang nhap NGAY TREN trang nay, giu nguyen ?slug dang xem. Truoc day
  // cho nay day nguoi dung ve "/?auth=login" - dang nhap xong ho dung o trang
  // chu va phai tu tim lai khoa hoc.
  const openLogin = (reason: "hoc" | "ghidanh") =>
    updateUrl(loginUrl(path, searchParams, reason));

  const [userProgress, setUserProgress] = useState<number>(0);

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

        // Danh gia va hoi dap tu tai khi co id khoa (useCourseReviews,
        // useCourseFaqs) - truoc day goi ngay tai day.
        if (isComponentMounted) setCourse(courseData);
      } catch (error) {
        console.error("Lỗi hệ thống khi kết nối Backend:", error);
        if (isComponentMounted) {
          setCourse(null);
          setError(C.messages.loadFailed);
        }
      } finally {
        if (isComponentMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isComponentMounted = false;
    };
  }, [courseSlug, isMounted, skipJumpToLearn, router]);

  // Ghi danh + tien do: effect RIENG, tach khoi luot tai khoa hoc.
  //
  // Vi sao phai tach: danh tinh gio den tu may chu (<UserBootstrap />) chu
  // khong con doc duoc tuc thi tu localStorage. De chung mot effect thi effect
  // do phai phu thuoc vao danh tinh, va no se chay HAI lan - lan hai goi lai
  // setLoading(true) nen ca trang khoa hoc nhay ve khung xam mot cai sau khi
  // da hien noi dung.
  //
  // Tach ra thi noi dung khoa hoc tai ngay, khong phai cho biet nguoi xem la
  // ai; phan ghi danh tu dien vao sau.
  //
  // Khach vang lai KHONG duoc goi hai duong duoi day. Khong phai de tiet kiem
  // request: apiHelper gap 401 la goi clearSession() roi day ve trang chu, nen
  // khach dang doc trang khoa hoc se bi hat van ra ngoai. Cong chan nay la thu
  // duy nhat giu ho o lai.
  useEffect(() => {
    const realCourseId = course?._id;
    if (!realCourseId) return;

    // Con dang hoi may chu thi CHUA ket luan gi. Ket luan som la nguoi dang
    // dang nhap bi coi nhu khach va mat nut vao hoc.
    if (loadingUser) return;

    // Khach vang lai: thoat, KHONG goi setIsEnrolled(false).
    //
    // Gia tri khoi tao cua isEnrolled da la false, nen goi lai chi thua - va
    // eslint chan setState dong bo trong than effect (--max-warnings 0). Nguoi
    // dang xem ma dang xuat thi clearSession() chuyen han sang trang chu, component
    // nay bi thao, khong con trang thai cu de don.
    if (!user) return;

    let isComponentMounted = true;

    const readEnrollment = async () => {
      try {
        const [enrollmentData, progressData] = await Promise.all([
          getEnrollmentByCourse(realCourseId),
          getProgressStats(realCourseId).catch(() => null),
        ]);

        if (isComponentMounted) {
          if (
            enrollmentData &&
            enrollmentData.isEnrolled === true &&
            enrollmentData.expired
          ) {
            // Het thoi han hoc: coi nhu chua mua, hien nut "Gia han".
            setIsEnrolled(false);
            setExpiredAt(
              enrollmentData.expiresAt
                ? new Date(enrollmentData.expiresAt).toLocaleDateString("vi-VN")
                : "",
            );
          } else if (enrollmentData && enrollmentData.isEnrolled === true) {
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
            if (!skipJumpToLearn) {
              setJumpingToLearn(true);
              router.replace(C.learnHref(courseSlug));
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

    readEnrollment();

    return () => {
      isComponentMounted = false;
    };
  }, [course?._id, user, loadingUser, skipJumpToLearn, courseSlug, router]);

  const handleEnrollCourse = async () => {
    if (!course?._id) {
      setError(C.messages.missingId);
      return;
    }

    // Khach vang lai: hien hop dang nhap NGAY, khong goi may chu truoc.
    //
    // Truoc day cho nay cu goi ghi danh, an 401, roi moi mo dang nhap - tuc la
    // nguoi dung bam nut, ngoi cho mot luot mang, roi moi thay hop dang nhap.
    // Nhanh bat 401 ben duoi VAN giu: phien co the het han giua chung, va luc
    // do chi may chu moi biet.
    //
    // loadingUser: chua hoi xong may chu \"toi la ai\". Khong kiem co nay
    // thi nguoi DANG dang nhap bam nut trong mot phan giay dau se bi day vao
    // hop dang nhap oan.
    if (!loadingUser && !user) {
      openLogin((course.price ?? 0) > 0 ? "ghidanh" : "hoc");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Khoa co phi: tao don roi sang trang thanh toan, khong goi ghi danh.
      // May chu cung chan duong ghi danh cho khoa co phi (402), day chi la de
      // nguoi dung khong phai bam mot nut roi nhan loi.
      if ((course.price ?? 0) > 0) {
        const { order } = await createOrder(course._id, voucher || undefined);
        router.push(C.paymentHref(order.code));
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
      router.push(C.learnHref(courseSlug));
    } catch (error) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = getErrorMessage(error, "");

      if (errorMsg.includes("401")) {
        // Phien vua het han giua chung. Mo hop dang nhap ngay tren trang nay,
        // KHONG day ve trang chu: dang nhap xong ho van o dung khoa hoc dang
        // xem va bam tiep duoc.
        setError(C.messages.loginToContinue);
        openLogin("hoc");
      } else if (errorMsg.includes("đã đăng ký") || errorMsg.includes("400")) {
        setIsEnrolled(true);
        router.push(C.learnHref(courseSlug));
      } else {
        setError(errorMsg || C.messages.enrollFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Nut to tren banner. */
  const handleHeroClick = () => {
    // Khoa co phi: dua xuong the mua, KHONG tao don roi nhay
    // thang sang man hinh QR. Nut nay la nut to nhat trang nen
    // hau het nguoi dung bam no - nhay thang sang QR thi ho bo
    // lo o nhap ma giam gia va nut them vao gio o the mua.
    if ((course?.price ?? 0) > 0) {
      document
        .getElementById(C.buyAnchorId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    void handleEnrollCourse();
  };

  const changeVoucher = (code: string, discount: number) => {
    setVoucher(code);
    setDiscountAmount(discount);
  };

  const addCourseToCart = () => {
    if (!course) return;
    addToCart({
      courseId: course._id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      gia: course.price ?? 0,
    });
  };

  return {
    router,
    courseSlug,
    course,
    isEnrolled,
    expiredAt,
    loading,
    jumpingToLearn,
    submitting,
    maGiamGia: voucher,
    soTienGiam: discountAmount,
    error,
    userProgress,
    isInCart,
    handleEnrollCourse,
    handleHeroClick,
    changeVoucher,
    addCourseToCart,
  };
}

export type CourseDetailState = ReturnType<typeof useCourseDetail>;
