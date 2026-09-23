"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { duongDanDangNhap, doiDiaChi } from "@/src/components/auth/loginUrl";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/userStore";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Award,
  BookOpen,
  Clock,
  FileText,
  Lock,
} from "lucide-react";

import CertificateModal from "@/src/components/certificate/CertificateModal";
import StudentQuizView from "@/src/components/quiz/StudentQuizView";
import HopChatTroLy from "@/src/components/assistant/AssistantChat";
import HoiDapBaiHoc from "@/src/components/questions/LessonQuestions";
import GhiChuBaiHoc from "@/src/components/notes/LessonNotes";

import type Hls from "hls.js";

import { getCourseBySlug, type Course } from "@/src/services/course";
import type { Lesson } from "@/src/services/lesson.api";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
  type Enrollment,
  type EnrollmentByCourseResponse,
  type LessonProgress,
  type ProgressStats,
} from "@/src/services/enrollment.api";

import { getCourseQuizzes, type Quiz } from "@/src/services/quizService";
import { layDuongDanNhung } from "@/src/services/videoEmbed";

import styles from "./page.module.scss";
// Backend tra ve 200 kem isEnrolled: false khi chua dang ky chu khong tra 404,
// nen phai thu hep kieu truoc thi moi doc duoc lessonProgress.
const daDangKy = (
  e: EnrollmentByCourseResponse | null,
): e is { isEnrolled: true } & Enrollment => Boolean(e && e.isEnrolled === true);

// lessonProgress.lesson khi la ObjectId dang chuoi, khi la ca doi tuong bai hoc
// da populate - tuy endpoint nao tra ve.
const layIdBaiHoc = (lesson: LessonProgress["lesson"]): string | undefined =>
  typeof lesson === "string" ? lesson : (lesson?._id ?? undefined);

// Doc lessonProgress ma khong phai kiem tra isEnrolled lap lai o tung cho.
const layTienDo = (e: EnrollmentByCourseResponse | null): LessonProgress[] =>
  daDangKy(e) ? e.lessonProgress : [];

// course.instructor khi la ObjectId dang chuoi, khi la doi tuong da populate.
// Chi lay duoc ten o truong hop thu hai.
const tenGiangVien = (c: Course | null): string | undefined =>
  c && typeof c.instructor === "object" ? c.instructor.name : undefined;

function CourseLearnSkeleton() {
  return (
    <div className={styles.col}>
      {/* SKELETON HEADER */}
      <header className={styles.header}>
        <div className={styles.row}>
          <div className={styles.box}></div>
          <div className={styles.stack}>
            <div className={styles.box2}></div>
            <div className={styles.box3}></div>
          </div>
        </div>
        <div className={styles.box4}></div>
      </header>

      {/* SKELETON CONTENT */}
      <div className={styles.grid}>
        {/* VIEW TRÁI: VIDEO SKELETON */}
        <div className={styles.col2}>
          <div className={styles.card}></div>
          <div className={styles.card2}>
            <div className={styles.stack2}>
              <div className={styles.box5}></div>
              <div className={styles.box6}></div>
              <div className={styles.box3}></div>
            </div>
            <div className={styles.box7}></div>
          </div>
        </div>

        {/* VIEW PHẢI: MENU LESSONS SKELETON */}
        <div className={styles.col3}>
          <div className={styles.row2}>
            <div className={styles.box8}></div>
            <div className={styles.box9}></div>
          </div>
          <div className={styles.stack3}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.row3}>
                <div className={styles.box10}></div>
                <div className={styles.stack}>
                  <div className={styles.box11}></div>
                  <div className={styles.box12}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseLearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";
  const duongDan = usePathname();
  const nguoiDung = useNguoiDungLuu();
  const dangTaiNguoiDung = useDangTaiNguoiDung();
  const laKhach = !dangTaiNguoiDung && !nguoiDung;
  const videoRef = useRef<HTMLVideoElement>(null);
  // import type nen hls.js khong bi keo vao goi JavaScript - no van duoc nap
  // dong o duoi bang await import("hls.js").
  const hlsRef = useRef<Hls | null>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentByCourseResponse | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  // Bo cau hoi cua CA khoa hoc, tra cuu theo id bai hoc.
  //
  // Truoc day moi lan doi bai la mot loi goi
  // GET /quizzes/course/:id?lessonId=... - bam qua lai giua hai bai la goi lai
  // tu dau, khong he nho. Ca khoa hoc thuong chi co vai bai kiem tra, nen nap
  // mot lan cung voi trang roi tra cuu tai cho thi re hon han, va doi bai
  // khong con phai cho mang nua.
  const [quizTheoBai, setQuizTheoBai] = useState<Record<string, Quiz>>({});
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string>("");

  const currentQuiz = activeLesson ? (quizTheoBai[activeLesson._id] ?? null) : null;

  // Khac null nghia la bai nay dung video cua YouTube/Vimeo: phai nhung bang
  // iframe, the <video> khong doc duoc trang xem cua ho.
  const nhungVideo = activeLesson?.videoUrl
    ? layDuongDanNhung(activeLesson.videoUrl)
    : null;

  // Xep danh sach quiz tho thanh bang tra theo id bai hoc. Quiz khong gan bai
  // nao (lesson rong) la bai kiem tra cuoi khoa - khong thuoc bai nao nen bo
  // qua o day, dung voi cach cu la loc theo dung lessonId.
  const xepQuizTheoBai = (ds: Quiz[]): Record<string, Quiz> => {
    const bang: Record<string, Quiz> = {};
    for (const q of ds) {
      const idBai = typeof q.lesson === "string" ? q.lesson : q.lesson?._id;
      // Giu cai DAU tien: may chu sap xep createdAt giam dan, ma cach cu lay
      // res[0] - tuc la ban moi nhat. Phai giu dung thu tu do.
      if (idBai && !bang[idBai]) bang[idBai] = q;
    }
    return bang;
  };

  // Khach vang lai mo thang /learn: hien hop dang nhap ngay.
  //
  // Trang VAN nap binh thuong o duoi - may chu tu cat video va bai viet cua
  // nguoi chua ghi danh (xem backend/src/utils/contentAccess.js), nen khong co
  // gi de lo. Cho tai la de dang nhap xong ho o dung bai dang mo, khong phai
  // di lai tu trang chu.
  //
  // CHI mo MOT lan cho moi lan tai trang.
  //
  // Khong co cai co nay thi hop dang nhap khong tat duoc: bam dong la
  // AuthModalGate xoa tham so `auth` khoi dia chi, hieu ung nay thay tham so
  // bien mat va khach van chua dang nhap, nen no dat lai ngay lap tuc. Nut
  // dong tro thanh vo dung.
  //
  // useRef chu khong phai useState: doi gia tri nay khong duoc ve lai gi ca.
  const daMoiDangNhap = useRef(false);

  useEffect(() => {
    if (!laKhach || daMoiDangNhap.current) return;
    daMoiDangNhap.current = true;
    doiDiaChi(duongDanDangNhap(duongDan, searchParams, "hoc"), true);
  }, [laKhach, searchParams, duongDan]);

  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        // getCourseBySlug tra ve Course HOAC { error }, nen phai loai truong
        // hop loi ra truoc thi phan con lai moi chac chan la Course.
        const ketQua = await getCourseBySlug(courseSlug);
        if (!ketQua || "error" in ketQua) {
          setCourse(null);
          setLoading(false);
          return;
        }
        const courseData = ketQua;
        setCourse(courseData);

        const realCourseId = courseData._id;

        // Ba loi goi nay khong phu thuoc nhau, chi cung can courseId - nen goi
        // song song. Truoc day chung xep hang cho nhau, cong them
        // getCourseBySlug o tren va startLesson o duoi la NAM luot di-ve noi
        // tiep truoc khi khung xuong tat. Gio con hai.
        //
        // getProgressStats tra 404 khi chua ghi danh (khoa co phi chua duyet),
        // va quiz thi khong phai khoa nao cung co - bat rieng tung cai de mot
        // loi binh thuong o hai nhanh phu khong keo do ca man hinh hoc.
        const [enrollData, stats, dsQuiz] = await Promise.all([
          getEnrollmentByCourse(realCourseId),
          getProgressStats(realCourseId).catch(() => null),
          getCourseQuizzes(realCourseId).catch(() => [] as Quiz[]),
        ]);
        setEnrollment(enrollData);
        setProgress(stats);
        setQuizTheoBai(xepQuizTheoBai(dsQuiz));

        if (courseData?.lessons && courseData.lessons.length > 0) {
          // /courses/slug/:slug populate day du bai hoc, khac voi /courses chi
          // tra ve mang ObjectId - nen o day moi ep sang Lesson duoc.
          const sortedLessons = [...(courseData.lessons as Lesson[])].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );

          let defaultLesson: Lesson | undefined;

          if (daDangKy(enrollData) && enrollData.lessonProgress.length > 0) {
            const nextIncompleteProgress = enrollData.lessonProgress.find(
              (lp) => lp.status !== "completed",
            );

            if (nextIncompleteProgress) {
              const targetLessonId = layIdBaiHoc(nextIncompleteProgress.lesson);
              defaultLesson = sortedLessons.find((l) => l._id === targetLessonId);
            }
          }

          // Truoc day nhanh du phong doc enrollData.currentLessonId, ma model
          // Enrollment khong he co truong do - luon undefined, nen cai goi la
          // "hoc tiep tu cho dang do" that ra chua bao gio chay: no roi thang
          // xuong bai dau tien. Bo han cho khoi hieu nham, vi truong hop nay chi
          // xay ra khi moi bai deu da hoc xong.
          if (!defaultLesson) defaultLesson = sortedLessons[0];

          setActiveLesson(defaultLesson);

          // Bai bi khoa thi khong ghi tien do - xem ghi chu o handleSelectLesson.
          if (!defaultLesson.biKhoa) {
            // KHONG await: day la mot lenh GHI tien do, tren man hinh khong co
            // gi cho no ca. Truoc day no nam trong duong chay chinh nen khung
            // xuong phai doi them mot luot di-ve nua moi chiu tat.
            startLesson(realCourseId, defaultLesson._id).catch((err) =>
              console.error("Lỗi kích hoạt bài học mặc định:", err),
            );
          }
          // Cho nay truoc kia con gan videoRef.current.currentTime de hoc tiep
          // tu cho dang do. No chua bao gio chay: luc nay loading van la true
          // nen the <video> chua duoc dung, videoRef.current con null. Viec
          // tua da chuyen xuong onLoadedMetadata cua the <video>, la cho duy
          // nhat biet chac video da san sang de tua.
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
    // Rut ra bien rieng TRUOC khi vao ham bat dong bo: TypeScript khong giu
    // duoc ket qua thu hep kieu cua activeLesson?.videoUrl qua ranh gioi ham,
    // nen o trong closure no lai thanh string | undefined.
    const videoUrl = activeLesson?.videoUrl;
    if (!videoUrl || !videoRef.current) return;
    // Bai dung YouTube/Vimeo khong dung the <video> nen khong co gi de nap.
    if (layDuongDanNhung(videoUrl)) return;

    const setupVideo = async () => {
      try {
        setVideoError("");

        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Always reset the current source before switching videos
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();

        const isHls = /\.m3u8(\?|$)|application\/vnd\.apple\.mpegurl/i.test(videoUrl);

        if (isHls) {
          const canNativeHls =
            videoElement.canPlayType("application/vnd.apple.mpegurl") ||
            videoElement.canPlayType("application/x-mpegURL");

          if (canNativeHls) {
            videoElement.src = videoUrl;
            videoElement.load();
          } else {
            try {
              const hlsModule = await import("hls.js");
              const Hls = hlsModule.default;

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

                hls.on(Hls.Events.MANIFEST_PARSED, () => {});

                hls.on(Hls.Events.ERROR, (event, data) => {
                  console.error("❌ HLS Error:", event, data);
                  if (data.fatal) {
                    // Truong ma HTTP trong hls.js ten la code chu khong phai
                    // status - viet sai thi nhanh nay chua bao gio chay.
                    const errorMsg = data.response?.code
                      ? `Lỗi tải video: ${data.response.code}`
                      : `Lỗi tải video: ${data.error || "Không xác định"}`;
                    setVideoError(errorMsg);
                  }
                });
              } else {
                console.warn(
                  "⚠️ Browser does not support HLS.js; falling back to native HLS",
                );
                videoElement.src = videoUrl;
                videoElement.load();
              }
            } catch (error) {
              console.error("❌ Không tải được hls.js:", error);
              videoElement.src = videoUrl;
              videoElement.load();
            }
          }
        } else {
          videoElement.src = videoUrl;
          videoElement.load();
        }
      } catch (error) {
        console.error("Lỗi setup video:", error);
        setVideoError(
          `Có lỗi khi tải video: ${getErrorMessage(error, "Không xác định")}`,
        );
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

  const handleSelectLesson = (lesson: Lesson) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    setVideoError("");
    // Dong bai kiem tra cua bai truoc. Truoc day viec nay nam trong mot hieu
    // ung chay moi lan doi bai, va hieu ung do keo theo mot loi goi mang di tim
    // quiz cua bai moi. Gio bang quiz da nam san trong bo nho nen dat co ngay
    // tai cho bam la du - doi bai khong cham mang nua.
    setIsDoingQuiz(false);

    // Bai bi khoa thi khong ghi tien do: nguoi nay chua duoc mo khoa hoc, may
    // chu se tu choi, goi vao chi de lai mot dong loi do trong console.
    if (lesson.biKhoa) return;

    // KHONG await: bai moi da hien ra o dong tren roi, khong co gi phai cho
    // lenh ghi tien do nay ca.
    //
    // Truoc day sau await con gan videoRef.current.currentTime de tua ve cho
    // dang do. Cung chua bao gio chay dung: the <video> mang key={_id} nen doi
    // bai la React dung mot the MOI, roi hieu ung nap video goi load() - ca hai
    // deu dua currentTime ve 0 sau khi cau lenh do chay xong. Viec tua da
    // chuyen xuong onLoadedMetadata.
    startLesson(course._id, lesson._id).catch((err) =>
      console.error("Lỗi khi kích hoạt startLesson:", err),
    );
  };

  // Tua ve dung cho da xem do. Chi o day moi chac chan the <video> da co va da
  // biet thoi luong - gan currentTime truoc thoi diem nay thi bi load() xoa.
  const handleLoadedMetadata = () => {
    if (!activeLesson || !videoRef.current) return;
    const history = layTienDo(enrollment).find(
      (lp) => layIdBaiHoc(lp.lesson) === activeLesson._id,
    );
    if (history?.watchedDuration) {
      videoRef.current.currentTime = history.watchedDuration;
    }
  };

  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      const response = await completeLesson(course._id, activeLesson._id, duration);

      // Hai lenh doc lai nay doc lap nhau - goi song song. Chung phai chay SAU
      // completeLesson, neu khong se doc ra tien do cu.
      const [updatedEnroll, newStats] = await Promise.all([
        getEnrollmentByCourse(course._id),
        getProgressStats(course._id),
      ]);
      setEnrollment(updatedEnroll);
      setProgress(newStats);

      if (
        // Truoc day ve phai viet la newStats?.completedCount, ma ProgressStats
        // khong co truong do (ten that la completedLessons) - so undefined voi
        // mot con so thi luon sai, nen ca ve nay chua bao gio dung toi.
        newStats?.progressPercentage === 100 ||
        newStats?.completedLessons === course?.lessons?.length
      ) {
        await completeCourse(course._id);
        setShowCertificate(true);
      } else {
        alert(
          response?.message ||
            `Chúc mừng bạn đã hoàn thành phần video bài học: ${activeLesson.title}`,
        );
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

      const [updatedEnroll, newStats] = await Promise.all([
        getEnrollmentByCourse(course._id),
        getProgressStats(course._id),
      ]);
      setEnrollment(updatedEnroll);
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
    const found = layTienDo(enrollment).find((lp) => layIdBaiHoc(lp.lesson) === lessonId);
    return found?.status === "completed";
  };

  if (loading) {
    return <CourseLearnSkeleton />;
  }

  if (!course) {
    return (
      <div className={styles.col4}>
        <div className={styles.card3}>
          <p className={styles.text}>Không vào được phòng học</p>
          <p className={styles.text2}>
            Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.
          </p>
          <button onClick={() => router.push("/")} className={styles.button}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.col5}>
      {/* HEADER SÁNG */}
      <header className={styles.header}>
        <div className={styles.row4}>
          {/* xem=1 bao trang gioi thieu dung day nguoc lai vao day. Khoa mien
              phi da ghi danh mac dinh nhay thang vao bai hoc, thieu tham so nay
              thi bam Quay lai se bi nem tro ve chinh trang nay. */}
          <button
            onClick={() => router.push(`/course?slug=${courseSlug}&xem=1`)}
            className={styles.button2}
          >
            <ArrowLeft size={18} />
          </button>
          <div className={styles.box13}>
            <h1 className={styles.title}>{course?.title}</h1>
            <p className={styles.text3}>
              Giảng viên:{" "}
              <span className={styles.label}>{tenGiangVien(course) || "Chuyên gia"}</span>
            </p>
          </div>
        </div>

        {/* Khung Tiến độ nổi bật */}
        <div className={styles.card4}>
          <Award size={16} className={styles.box14} />
          <div className={styles.box15}>
            <span className={styles.label2}>
              {" "}
              Tiến độ: {progress?.progressPercentage || 0}%
            </span>
            <span className={styles.label3}>
              Bài đã xong: {progress?.completedLessons || 0}/
              {course?.lessons?.length || 0}
            </span>
          </div>
        </div>
      </header>

      {/* KHU VỰC BÀI HỌC VÀ MENU DANH SÁCH */}
      <div className={styles.grid2}>
        {/* VIEW TRÁI: VIDEO & NỘI DUNG BÀI HỌC CÙNG BÀI KIỂM TRA */}
        <div className={styles.scroller}>
          {isDoingQuiz && currentQuiz && currentQuiz._id ? (
            <StudentQuizView
              quizId={currentQuiz._id}
              onClose={() => setIsDoingQuiz(false)}
              onSuccess={handleQuizSuccess}
            />
          ) : activeLesson ? (
            <div className={styles.stack4}>
              {/* Box Video bo góc thanh lịch */}
              <div className={styles.card5}>
                {nhungVideo ? (
                  <iframe
                    key={activeLesson._id}
                    src={nhungVideo}
                    title={activeLesson.title}
                    className={styles.frame}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : activeLesson.videoUrl ? (
                  <>
                    {/* KHONG dat crossOrigin o day. Dat vao la trinh duyet doi
                        may chu video phai gui header Access-Control-Allow-Origin;
                        may chu nao khong gui thi video bi chan thang, nguoi hoc
                        chi thay o den. 18 bai dung media.w3.org da dinh dung loi
                        do. crossOrigin chi can khi muon ve khung hinh ra canvas
                        hoac nap phu de tu ten mien khac - trang nay khong lam. */}
                    <video
                      ref={videoRef}
                      key={activeLesson._id}
                      controls
                      className={styles.video}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleVideoEnded}
                      onError={(e) => {
                        console.error("❌ Video element error:", e);
                        setVideoError(
                          "Không thể phát video. Kiểm tra kết nối mạng hoặc định dạng file.",
                        );
                      }}
                    />
                    {videoError && (
                      <div className={styles.floating}>
                        <p className={styles.text4}>❌ {videoError}</p>
                      </div>
                    )}
                  </>
                ) : activeLesson.biKhoa ? (
                  /* May chu da cat videoUrl vi nguoi xem chua duoc mo khoa hoc.
                     Truoc day cho nay hien "chua cau hinh video" - nguoi hoc doc
                     xong tuong he thong hong, khong biet la minh chua duoc duyet. */
                  <div className={styles.floating2}>
                    <Lock size={40} className={styles.box16} />
                    <p className={styles.text5}>Bài học chưa được mở</p>
                    <p className={styles.text6}>
                      Khóa học này có phí. Sau khi bạn chuyển khoản, ban quản trị đối
                      chiếu rồi xác nhận đơn — toàn bộ bài giảng sẽ mở ra ngay tại đây.
                    </p>
                    <button
                      onClick={() => router.push(`/course?slug=${courseSlug}`)}
                      className={styles.button3}
                    >
                      Xem cách đăng ký khóa học
                    </button>
                  </div>
                ) : (
                  <div className={styles.floating3}>
                    <BookOpen size={48} className={styles.box17} />
                    <p className={styles.text7}>
                      Bài học này chưa được cấu hình liên kết Video bài giảng
                    </p>
                  </div>
                )}
              </div>

              {/* Chi tiết bài học dưới Video (Nền Trắng) */}
              <div className={styles.card6}>
                <div className={styles.stack5}>
                  <div className={styles.row5}>
                    <span className={styles.card7}>Đang diễn ra</span>
                    {checkLessonCompleted(activeLesson._id) && (
                      <span className={styles.card8}>Đã hoàn thành</span>
                    )}
                  </div>
                  <h2 className={styles.heading}>{activeLesson.title}</h2>
                  <p className={styles.text8}>
                    {/* Truoc day doc activeLesson.description, ma model Lesson
                        khong co truong do - luon rong nen cau du phong ben duoi
                        moi la thu thuc su hien ra tu truoc toi nay. */}
                    Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống.
                  </p>
                </div>

                <div className={styles.col6}>
                  {/* Video nhung chay trong iframe cua ben thu ba nen trang nay
                      khong nhan duoc su kien "het video" nhu the <video> - thieu
                      nut nay thi bai dung YouTube khong bao gio duoc tinh la
                      xong, keo theo khong bao gio cap duoc chung nhan. */}
                  {nhungVideo && !checkLessonCompleted(activeLesson._id) && (
                    <button onClick={handleVideoEnded} className={styles.button4}>
                      <CheckCircle size={16} />
                      Đánh dấu đã học xong
                    </button>
                  )}
                  {currentQuiz && (
                    <button
                      onClick={() => setIsDoingQuiz(true)}
                      className={styles.button5}
                    >
                      <FileText size={16} />
                      Làm bài kiểm tra ({currentQuiz.passingScore}% để đạt)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.card9}>
              <Play size={40} className={styles.box18} />
              <p className={styles.text9}>
                Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.
              </p>
            </div>
          )}

          {/* Hoi dap nam DUOI noi dung bai, trong cung cot cuon.
              Ba dieu kien deu can:
                - daDangKy: may chu kiem lai bang duocXemNoiDung() nen day chi
                  de khong bay ra mot khu vuc bam vao chi de an 403.
                - activeLesson: cau hoi gan theo BAI, chua chon bai thi khong co
                  gi de hoi ve.
                - !isDoingQuiz: dang lam bai kiem tra ma cuon xuong thay o hoi
                  dap la moi nguoi ta di hoi bai - xem loi nhac cua tro ly, luat
                  "khong lam ho bai danh gia" cung tu do ra. */}
          {daDangKy(enrollment) && course?._id && activeLesson?._id && !isDoingQuiz && (
            <>
              {/* Ghi chu dat TREN hoi dap: ghi chu la viec lam trong luc xem,
                  con hoi dap la viec lam khi da xem xong ma van khong hieu. */}
              <GhiChuBaiHoc
                courseId={course._id}
                lessonId={activeLesson._id}
                // Truyen HAM chu khong truyen con so: con so chup mot thoi
                // diem, ma thoi diem can biet la luc bam nut Luu, khong phai
                // luc ve lai component.
                layViTriVideo={() =>
                  videoRef.current ? Math.floor(videoRef.current.currentTime) : null
                }
                nhayToi={(giay: number) => {
                  if (!videoRef.current) return;
                  videoRef.current.currentTime = giay;
                  // Cuon video vao tam nhin: ghi chu nam duoi man hinh nen bam
                  // xong ma khong cuon thi nguoi dung khong thay gi xay ra.
                  videoRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }}
              />

              <HoiDapBaiHoc courseId={course._id} lessonId={activeLesson._id} />
            </>
          )}
        </div>

        {/* VIEW PHẢI: MENU DANH SÁCH BÀI HỌC (Nền Trắng) */}
        <div className={styles.col7}>
          <div className={styles.row2}>
            <h3 className={styles.subheading}>Nội dung bài học</h3>
            <span className={styles.label4}>{course?.lessons?.length || 0} mục</span>
          </div>

          <div className={styles.scroller2}>
            {course?.lessons && course.lessons.length > 0 ? (
              [...(course.lessons as Lesson[])]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((lesson, index: number) => {
                  const isCurrent = activeLesson?._id === lesson._id;
                  const isCompleted = checkLessonCompleted(lesson._id);

                  return (
                    <button
                      key={lesson._id || index}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`group ${styles.button8} ${
                        isCurrent ? styles.button6 : styles.button7
                      }`}
                    >
                      <div className={styles.box19}>
                        {lesson.biKhoa ? (
                          <Lock size={15} className={styles.box14} />
                        ) : isCompleted ? (
                          <CheckCircle size={16} className={styles.box20} />
                        ) : (
                          <div
                            className={`${styles.box24} ${isCurrent ? styles.box21 : styles.box22} ${styles.row8}`}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className={styles.box23}>
                        <span
                          className={`${styles.label7} ${isCurrent ? styles.label5 : styles.label6}`}
                        >
                          {lesson.title}
                        </span>
                        <div className={styles.row6}>
                          <div className={styles.row7}>
                            <Clock size={10} />
                            <span>
                              {lesson.duration
                                ? `${lesson.duration} phút`
                                : "Bài học Video"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
            ) : (
              <p className={styles.text10}>Đang cập nhật bài giảng.</p>
            )}
          </div>
        </div>
      </div>

      {/* Chi dung khi thuc su co ban ghi dang ky: CertificateModal lay chung
          chi theo enrollmentId, dua chuoi rong vao la no goi API vo ich. */}
      {daDangKy(enrollment) && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          enrollmentId={enrollment._id}
        />
      )}

      {/* Tro giang chi hien khi DA ghi danh. May chu van kiem quyen lai mot lan
          nua (duocXemNoiDung trong troLyController) — day chi la de khong bay
          ra mot cai nut bam vao chi de an 403. */}
      {daDangKy(enrollment) && course?._id && (
        <HopChatTroLy
          courseId={course._id}
          lessonId={activeLesson?._id}
          tenBai={activeLesson?.title}
        />
      )}
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseLearnPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <CourseLearnPageContent />
    </Suspense>
  );
}
