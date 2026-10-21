import { BadgeCheck, FileText, GraduationCap, PenLine } from "lucide-react";

import type {
  HomeCategoriesData,
  HomeCoursesData,
  HomeDashboardData,
  HomeDocumentsData,
  HomeExploreData,
  HomeFeaturesData,
  HomeGuidesData,
  HomeHeroData,
  HomePopularCoursesData,
  HomePricingData,
  HomePromoData,
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

/* ------------------------------------------------------------------ */
/* Hai muc dan sang khu Cam nang (/blog) va khu Tai lieu (/share-document) */
/* ------------------------------------------------------------------ */

const guides: HomeGuidesData = {
  eyebrow: "Cẩm nang môn học",
  heading: "Kinh nghiệm học từng môn, từ người đã đi qua",
  text: "Môn nào khó ở chỗ nào, nên học theo thứ tự ra sao, đề thi hay ra dạng gì — gom lại thành bài viết ngắn, đọc vài phút là nắm được đường đi.",
  points: [
    "Chia theo chủ đề: front-end, back-end, AI, kiểm thử, thiết kế...",
    "Viết bởi giảng viên và học viên đã học xong môn",
    "Lưu bài để đọc lại lúc ôn thi",
  ],
  cta: { label: "Đọc cẩm nang", href: "/blog" },
  latestTitle: "Bài mới đăng",
  topicsTitle: "Chọn chủ đề",
  topicCount: "{n} bài viết",
  topicEmpty: "Sắp có bài",
  topicHref: "/blog?topic={slug}",
  readMinutes: "{n} phút đọc",
};

const documents: HomeDocumentsData = {
  eyebrow: "Chia sẻ tài liệu",
  heading: "Kho tài liệu do chính sinh viên góp",
  text: "Giáo trình, đề cương, slide, đề ôn tập — lọc theo trường, theo môn, tải về miễn phí. Có tài liệu hay thì đăng lên để bạn khác cùng dùng.",
  cta: { label: "Vào kho tài liệu", href: "/share-document" },
  statLabels: {
    documents: "tài liệu",
    subjects: "môn học",
    schools: "trường đại học",
    downloads: "lượt tải",
  },
  popularTitle: "Được xem nhiều",
  seeAllLabel: "Xem tất cả tài liệu",
  seeAllHref: "/share-document/all-document",
  groupsTitle: "Theo lĩnh vực",
  share: {
    title: "Có tài liệu hay trong máy?",
    text: "Đăng PDF, Word hoặc viết thẳng một bài hướng dẫn — chỉ mất một phút.",
    label: "Chia sẻ tài liệu",
    href: "/share-document",
  },
};

/* ------------------------------------------------------------------ */
/* Phan rieng cho KHACH (landing) va cho nguoi DA dang nhap (dashboard)  */
/* ------------------------------------------------------------------ */

// Dai quang cao. Sua chu / duong dan o day; muon tat thi bo the <HomePromo>
// trong page.tsx tuong ung.
const guestPromo: HomePromoData = {
  badge: "Miễn phí",
  title: "Tạo tài khoản là học được ngay — không cần thẻ, không cần nạp tiền",
  text: "Ghi danh khóa miễn phí, lưu tiến độ trên máy chủ, làm bài kiểm tra và nhận chứng nhận có mã tra cứu.",
  cta: { label: "Tạo tài khoản miễn phí", action: "register" },
  secondary: { label: "Xem khóa học", href: "/courses" },
};

const memberPromo: HomePromoData = {
  badge: "Mới",
  title: "Kho tài liệu theo trường: tìm đề cương, giáo trình đúng môn trường bạn",
  text: "Lọc theo trường, lĩnh vực và môn học. Có tài liệu hay thì đăng lên cho bạn cùng lớp.",
  cta: { label: "Xem các trường", href: "/share-document/institution" },
};

const pricing: HomePricingData = {
  heading: "Học phí rõ ràng, trả theo từng khóa",
  description:
    "Không gói tháng, không tự gia hạn. Khóa miễn phí học bao lâu cũng được; khóa có phí trả một lần cho một thời hạn học.",
  freePrice: "0đ",
  paidFrom: "Từ {price}",
  paidNone: "Sắp mở",
  accessDaysLabel: "{n} ngày học",
  plans: [
    {
      id: "free",
      name: "Khóa miễn phí",
      priceNote: "Trọn đời",
      count: "{n} khóa đang mở",
      countZero: "Sắp có khóa",
      features: [
        "Học không giới hạn thời gian",
        "Lưu tiến độ, đổi máy vẫn học tiếp được",
        "Bài kiểm tra và chứng nhận khi hoàn thành",
      ],
      cta: { label: "Học miễn phí", href: "/courses" },
    },
    {
      id: "paid",
      name: "Khóa có phí",
      priceNote: "",
      count: "{n} khóa",
      countZero: "Đang chuẩn bị khóa đầu tiên",
      features: [
        "Trả một lần, học trong thời hạn của khóa",
        "Gia hạn cộng dồn, không mất ngày còn lại",
        "Hỏi đáp trực tiếp với giảng viên trong bài",
        "Chuyển khoản ngân hàng, dùng được mã giảm giá",
      ],
      cta: { label: "Xem khóa có phí", href: "/courses" },
      highlight: true,
    },
  ],
  footnote: "Chứng nhận của mọi khóa đều có mã riêng, ai cũng tra cứu lại được.",
};

const dashboard: HomeDashboardData = {
  welcome: "{name}, chào mừng quay lại khóa học",
  welcomeFallback: "Chào mừng quay lại khóa học",
  pace: {
    daysLeft: "Còn {n} ngày học · đến {date}",
    until: "Học đến {date}",
    unlimited: "Học không giới hạn thời gian",
    expired: "Đã hết hạn học",
  },
  complete: "{n}% hoàn thành",
  upNext: "Bài tiếp theo: {title}",
  allDone: "Bạn đã học hết các bài",
  upNextUnknown: "Vào học tiếp khóa này",
  lessonPosition: "Bài {i}/{total}",
  video: "Video",
  reading: "Bài đọc",
  resume: "Học tiếp",
  start: "Bắt đầu",
  review: "Xem lại khóa",
  continueWatching: "Tiếp tục xem",
  goalsTitle: "Mục tiêu hôm nay",
  goal: "Hoàn thành {n} bài trong {course} · {done}/{n}",
  streak: "Chuỗi {n} tuần",
  streakTip:
    "Tuần nào cũng học một chút thì dễ đi hết khóa hơn nhiều so với dồn học một lúc.",
  weekDays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  weekSummary: "Tuần này: {n} bài đã xong · {m} phút học",
  setGoal: "Mục tiêu mỗi ngày: {n} bài — bấm để đổi",
  goalOptions: [1, 2, 3, 5],
  otherTitle: "Khóa khác của bạn",
  emptyTitle: "Bạn chưa ghi danh khóa nào",
  emptyText: "Chọn một khóa miễn phí để bắt đầu — tiến độ sẽ hiện ở đây.",
  emptyCta: { label: "Tìm khóa học", href: "/courses" },
  myCoursesHref: "/user/my-courses",
  myCoursesLabel: "Tất cả khóa của tôi",
  error: "Không tải được khóa học của bạn. Thử tải lại trang.",
};

// Muc "Tiep tuc kham pha" (dashboard): ba cot cuon ngang, bo cuc theo Coursera.
const explore: HomeExploreData = {
  heading: "Tiếp tục khám phá",
  panels: {
    recent: "Xem gần đây",
    similar: "Tương tự hoạt động của bạn",
    trending: "Đang thịnh hành",
  },
  recentEmpty: "Các khóa bạn mở xem sẽ hiện ở đây để quay lại nhanh.",
  recentEmptyCta: { label: "Khám phá khóa học", href: "/courses" },
  empty: "Chưa có khóa nào ở mục này.",
  free: "Miễn phí",
  courseHref: "/course?slug={slug}",
  prev: "Xem cột trước",
  next: "Xem cột sau",
};

/**
 * Noi dung + cau hinh trang chu (app/(portal)/page.tsx).
 *
 * Section nao la client component (categories, popularCourses, courses,
 * testimonials) thi chi chua du lieu thuan: chu co bien viet bang mau "{n}",
 * khong dung ham - xem fillTemplate trong lib/format.ts.
 */
export const HOME_PAGE = {
  // Truoc day trang chu khong co title: tab trinh duyet trong ten, ket qua tim
  // kiem cung khong co dong tieu de. Ten thuong hieu lay theo logo (BrandLogo).
  metadata: {
    title: "Learning Platform – Học có lộ trình, lấy chứng nhận",
    description:
      "Khóa học trực tuyến xếp bài theo lộ trình, bài kiểm tra chấm ngay và chứng nhận có mã tra cứu công khai. Nhiều khóa học miễn phí.",
  },
  api: {
    categories: "/api/categories",
    providers: "/api/providers",
    faqs: "/api/faqs/homepage",
    homeSections: "/api/courses/home-sections",
    courses: "/api/courses",
    latestPosts: "/api/posts?page=1&limit=3",
    postTopics: "/api/posts/topics",
    documentStats: "/api/documents/thong-ke",
    popularDocuments: "/api/documents?page=1&limit=4&sapXep=phoBien",
    documentGroups: "/api/documents/linh-vuc",
  },
  /** So khoa goi y ca nhan hoa hien tren trang chu. */
  suggestionsCount: 8,
  /** So linh vuc tai lieu hien o muc Chia se tai lieu. */
  documentGroupCount: 6,
  hero,
  features,
  categories,
  popularCourses,
  courses,
  guides,
  documents,
  testimonials,
  guestPromo,
  memberPromo,
  pricing,
  dashboard,
  explore,
};
