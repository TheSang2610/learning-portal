import { BadgeCheck, FileText, GraduationCap, PenLine } from "lucide-react";

import type {
  HomeCategoriesData,
  HomeCoursesData,
  HomeFeaturesData,
  HomeHeroData,
  HomePopularCoursesData,
  HomeTestimonialsData,
} from "@/src/types/home";

/* ------------------------------------------------------------------ */
/* Phan mo dau                                                          */
/* ------------------------------------------------------------------ */

const hero: HomeHeroData = {
  newBadge: "MỚI",
  freeCount: (n) => `${n} khóa đang mở miễn phí`,
  // GIU MOI DONG DUOI ~17 KY TU - xem ghi chu o the <h1> trong HomeHero.
  titleLine1: "Học có lộ trình,",
  titleLine2: "lấy chứng nhận",
  intro:
    "Mỗi khóa là một chuỗi bài xếp sẵn theo thứ tự: xem bài giảng, làm bài kiểm tra, hệ thống ghi lại bài nào bạn đã xong. Hết khóa thì có chứng nhận kèm mã, ai cũng tra cứu lại được.",
  primaryCta: { label: "Học thử miễn phí", href: "/courses" },
  secondaryCta: {
    href: "/courses",
    withCount: (n) => `Xem ${n} khóa học`,
    fallback: "Xem tất cả khóa học",
  },

  /**
   * Bon canh thay nhau hien ra, moi canh la mot tam doc lap.
   *
   * Ban mau dat o cho nay mot the <video> tu chay lap - xem muc 4 o dau
   * HomeHero de biet vi sao khong di theo. Bon canh nay cho ra dung cai can co
   * (hinh doi lien tuc) voi tong dung luong 812 KB, nho hon mot doan phim ngan
   * rat nhieu.
   *
   * `image` de trong = canh do khong co may tinh, ve vong quy dao thay vao -
   * dung nhu tam thu ba trong ban mau.
   *
   * Ba tam anh deu chup o CUNG kich thuoc 1240x640. Lech kich thuoc la luc
   * chuyen canh anh bi nhay mot cai, rat lo.
   *
   * THEM/BOT canh thi phai sua ba cho trong globals.css: do dai vong lap, buoc
   * tre cua tung canh, va cac moc phan tram trong keyframes.
   */
  scenes: [
    // Canh quy dao dat DAU TIEN theo y chu du an. No thuan CSS/SVG, khong tai
    // anh nao - nen canh dau tien nguoi dung thay cung la canh nhe nhat.
    {
      tone: "certificate",
      icon: BadgeCheck,
      label: "Chứng nhận",
      lead: "Bốn phần nối vào một chỗ",
      title: "Gọn trong một nền tảng",
    },
    {
      tone: "course",
      icon: GraduationCap,
      label: "Khóa học",
      // KHONG dat lai cau "Di len tung tang, khong nhay coc" o day: no la dung
      // chu cua the <h1> ngay ben trai, doc len thanh mot cau lap lai.
      lead: "Xem bài giảng rồi làm bài tập",
      title: "Khóa học có lộ trình",
      image: {
        src: "/images/screen-courses.webp",
        alt: "Danh sách khóa học kèm đơn vị đào tạo, số bài và học phí",
      },
      // Ban truoc ghi "Bai mo dan / Qua bai truoc moi len bai sau" - sai het,
      // xem ghi chu o the <h1>. Doi sang thu he thong lam that: Enrollment co
      // mang lessonProgress, moi bai mang trang thai not_started / in_progress /
      // completed.
      badge: { title: "Nhớ tiến độ", subtitle: "Bài nào xong hệ thống ghi lại" },
    },
    {
      tone: "document",
      icon: FileText,
      label: "Tài liệu",
      lead: "Người học góp, người học dùng",
      title: "Kho tài liệu chia sẻ",
      image: {
        src: "/images/screen-documents.webp",
        alt: "Trang tài liệu do người học chia sẻ, kèm định dạng và lượt tải",
      },
      badge: { title: "Tải về miễn phí", subtitle: "PDF, slide, đề ôn tập" },
    },
    {
      tone: "post",
      icon: PenLine,
      label: "Bài viết",
      lead: "Kinh nghiệm của người đi trước",
      title: "Học cách tự học",
      image: {
        src: "/images/screen-posts.webp",
        alt: "Trang bài viết chia sẻ kinh nghiệm tự học, lọc theo chủ đề",
      },
      badge: { title: "Lọc theo chủ đề", subtitle: "Đọc đúng thứ đang cần" },
    },
  ],

  // Bon the quay quanh tam o canh dau, moi the la mot "hanh tinh".
  //
  // HAI VANH, MOI VANH HAI THE, DAT DOI DIEN NHAU (0/180 va 90/270 do). Cach chia
  // nay khong phai cho dep ma de KHONG BAO GIO chong nhau, va do la rang buoc hinh
  // hoc chu khong phai may man:
  //
  //   - Cung mot vanh: hai the cung chu ky nen goc lech giu nguyen 180 do mai mai.
  //   - Khac vanh: hai vanh cach nhau 17% cua canh o vuong = 65px o kich thuoc
  //     that, trong khi the chi cao ~52px. Luc hai the thang hang goc nhau - truong
  //     hop xau nhat - chung van cach 13px.
  //
  // Da THU bon vanh moi vanh mot the cho giong he mat troi hon. Khong duoc: ban
  // kinh dung duoc chi tu 16% (mep dia tam) toi 50% (mep o), chia bon thanh moi
  // vanh cach nhau 8,5% = 33px, nho hon chieu cao mot the - hai the o vanh ke nhau
  // se long vao nhau moi khi thang hang.
  //
  // Vanh trong quay nhanh hon vanh ngoai, dung nhu he mat troi that.
  // Doi `radius` thi phai doi ban kinh hai vong tron 184/116 trong SVG cua HomeHero.
  orbit: [
    {
      tone: "course",
      icon: GraduationCap,
      label: "Khóa học",
      angle: "0deg",
      radius: "46%",
      period: "44s",
    },
    {
      tone: "post",
      icon: PenLine,
      label: "Bài viết",
      angle: "180deg",
      radius: "46%",
      period: "44s",
    },
    {
      tone: "certificate",
      icon: BadgeCheck,
      label: "Chứng nhận",
      angle: "90deg",
      radius: "29%",
      period: "30s",
    },
    {
      tone: "document",
      icon: FileText,
      label: "Tài liệu",
      angle: "270deg",
      radius: "29%",
      period: "30s",
    },
  ],
  logoMark: "LP",
  stats: {
    courses: " khóa học",
    free: " khóa mở miễn phí",
    certificate: "chứng nhận tra cứu được bằng mã",
  },
};

/* ------------------------------------------------------------------ */
/* Hai muc "hinh mot ben, chu mot ben"                                  */
/* ------------------------------------------------------------------ */

const features: HomeFeaturesData = {
  lessons: [
    { title: "Giới thiệu React và môi trường", time: "12:40", state: "done" },
    { title: "Component và props", time: "18:05", state: "done" },
    { title: "State và vòng đời", time: "22:18", state: "done" },
    { title: "Gọi API với Node.js", time: "Đang học", state: "current" },
    { title: "Dự án nhỏ: trang tin", time: "Khóa", state: "locked" },
    { title: "Bài kiểm tra cuối khóa", time: "Khóa", state: "locked" },
  ],
  progressLabel: "Tiến độ khóa học",
  progressValue: "3 / 6 bài",
  lessonBlock: {
    heading: "Bài sau chỉ mở khi bài trước đã qua",
    text: "Không phải để làm khó. Bài dự án cần đúng thứ hai bài trước đó dạy — nhảy thẳng vào là ngồi nhìn màn hình không biết bắt đầu từ đâu.",
    points: [
      "Tiến độ lưu trên máy chủ, đổi máy vẫn đúng chỗ đang dở",
      "Bài tập chấm ngay, sai chỗ nào chỉ chỗ đó",
      "Bài đã qua thì xem lại bao nhiêu lần cũng được",
    ],
  },
  certificateBlock: {
    heading: "Chứng nhận có mã, không phải tấm ảnh",
    text: "Ai cũng làm được một tấm ảnh đẹp trong Photoshop. Cái đáng giá là nhà tuyển dụng gõ mã vào trang tra cứu và thấy đúng tên bạn, đúng khóa, đúng ngày.",
    points: [
      "Mỗi chứng nhận một mã riêng, tra cứu công khai",
      "Chỉ cấp khi đã hết bài và đạt bài kiểm tra cuối",
      "Tải PDF hoặc gửi thẳng đường dẫn",
    ],
  },
  certificate: {
    mark: "★",
    title: "Chứng nhận hoàn thành",
    learner: "Học viên Learning Portal",
    course: "Lập trình Web với React & Node.js",
    codeLabel: "Mã tra cứu ",
    code: "LP-7K2M-93XA",
    dateLabel: "Cấp ngày ",
    date: "04/09/2026",
  },
};

/* ------------------------------------------------------------------ */
/* Cac muc con lai                                                      */
/* ------------------------------------------------------------------ */

const categories: HomeCategoriesData = {
  heading: "Khám phá danh mục",
  description:
    "Chọn lĩnh vực bạn muốn theo đuổi. Mỗi danh mục là một lộ trình từ khoá nhập môn tới khoá nâng cao.",
  seeAllHref: "/courses",
  seeAllLabel: "Xem toàn bộ khoá học",
  categoryHref: "/courses?category={slug}",
  countUnknown: "Xem khoá học",
  countZero: "Sắp có khoá học",
  count: "{n} khoá học",
};

const popularCourses: HomePopularCoursesData = {
  heading: "Khoá học mới và phổ biến",
  description:
    "Khám phá các khóa học trực tuyến và bài học riêng lẻ mới nhất của chúng tôi.",
  empty: "Không có khóa học nào được Admin kích hoạt hiển thị lên trang chủ vào lúc này.",
  // Ten cot phai TRUNG voi ten muc o /collection (constants/collection.ts).
  columns: [
    { id: "most-popular", title: "Phổ biến nhất", key: "mostPopular" },
    { id: "hot-releases", title: "Mới phát hành", key: "newReleases" },
    { id: "trending-now", title: "Đang thịnh hành", key: "trendingNow" },
  ],
  collectionHref: "/collection?slug={id}-courses",
  courseHref: "/course?slug={slug}",
  providerFallback: "Hệ thống LMS",
  providerTitle: "Cấp bởi: {name}",
  lessons: "{n} bài học",
  free: "Miễn phí",
};

const courses: HomeCoursesData = {
  heading: "Tất cả khoá học",
  description:
    "Toàn bộ khoá học đang mở trên hệ thống. Lọc theo lĩnh vực, cấp độ hoặc học phí.",
  filterLabel: "Bộ lọc:",
  allCategories: "Tất cả danh mục",
  levels: [
    { value: "all", label: "Tất cả cấp độ" },
    { value: "beginner", label: "Sơ cấp (Beginner)" },
    { value: "intermediate", label: "Trung cấp (Intermediate)" },
    { value: "advanced", label: "Cao cấp (Advanced)" },
  ],
  prices: [
    { value: "all", label: "Tất cả học phí" },
    { value: "free", label: "Miễn phí" },
    { value: "paid", label: "Có phí" },
  ],
  countSuffix: " khoá học",
  resetFilters: "Xoá bộ lọc",
  empty: "Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.",
  cardSizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px",
};

const testimonials: HomeTestimonialsData = {
  heading: "Học viên nói gì",
  description:
    "Bốn người đã học xong và đi làm, kể lại thứ họ mang theo được sau khoá học.",
  items: [
    {
      name: "Jessica Wong",
      role: "Học viên Phân tích Dữ liệu Google",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      review:
        "Learning Portal đã giúp tôi có được những kỹ năng thực tế và tìm được một công việc mới trong lĩnh vực công nghệ. Sự linh hoạt của chương trình giúp việc học trở nên dễ dàng hơn, song song với công việc.",
    },
    {
      name: "Michael Johnson",
      role: "Sinh viên Phát triển Full Stack IBM",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      review:
        "Các khóa học được cấu trúc cực kỳ tốt và được giảng dạy bởi các chuyên gia trong ngành. Tôi cảm thấy tự tin khi xây dựng các dự án thực tế.",
    },
    {
      name: "Sophia Martinez",
      role: "Học viên Phát triển Front-End Meta",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      review:
        "Tôi rất thích trải nghiệm học tập thực hành và các chứng chỉ chuyên môn. Điều đó đã giúp tôi tự tin hơn để chuyển đổi nghề nghiệp.",
    },
    {
      name: "David Kim",
      role: "Cựu học viên Kiến trúc Điện toán Đám mây",
      image: "https://randomuser.me/api/portraits/men/46.jpg",
      review:
        "Những chứng chỉ và kinh nghiệm trong CV của tôi thực sự nổi bật trong các buổi phỏng vấn. Việc học thêm kỹ năng ở đây đã thay đổi toàn bộ con đường sự nghiệp của tôi.",
    },
  ],
};

/**
 * Noi dung + cau hinh trang chu (app/(portal)/page.tsx).
 *
 * Section nao la client component (categories, popularCourses, courses,
 * testimonials) thi chi chua du lieu thuan: chu co bien viet bang mau "{n}",
 * khong dung ham - xem fillTemplate trong lib/format.ts.
 */
export const HOME_PAGE = {
  api: {
    categories: "/api/categories",
    providers: "/api/providers",
    faqs: "/api/faqs/homepage",
    homeSections: "/api/courses/home-sections",
    courses: "/api/courses",
  },
  /** So khoa goi y ca nhan hoa hien tren trang chu. */
  suggestionsCount: 8,
  hero,
  features,
  categories,
  popularCourses,
  courses,
  testimonials,
};
