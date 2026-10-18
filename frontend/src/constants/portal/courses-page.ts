/** Trang /courses (tim khoa hoc). Chu co bien dung mau "{n}" + fillTemplate. */
export const COURSES_PAGE = {
  metadata: {
    title: "Khóa học",
    description: "Tìm khóa học theo từ khóa hoặc theo danh mục.",
  },
  coursesApi: "/api/courses",
  categoriesApi: "/api/categories",

  hero: {
    breadcrumbHome: "Trang chủ",
    breadcrumbHref: "/",
    breadcrumbCurrent: "Khóa học",
    titleAll: "Khám phá khóa học",
    /** {q} = tu khoa. */
    titleSearch: 'Kết quả cho "{q}"',
    subtitle:
      "Học theo lộ trình, làm bài kiểm tra và nhận chứng nhận có mã tra cứu. Lọc theo danh mục hoặc tìm theo tên khóa.",
    searchPlaceholder: "Tìm khóa học, ví dụ: React, SEO, cơ sở dữ liệu…",
    searchButton: "Tìm",
    clearSearch: "Xóa tìm kiếm",
    stats: {
      /** {n} = so khoa. */
      courses: "{n} khóa học",
      free: "{n} khóa miễn phí",
      providers: "{n} đơn vị đào tạo",
    },
  },

  chips: {
    label: "Danh mục",
    all: "Tất cả",
  },

  results: {
    /** {n} = tong so khoa khop. */
    count: "{n} khóa học",
    countInCategory: "{n} khóa học trong danh mục này",
    loadMore: "Xem thêm (còn {n})",
    loadingMore: "Đang tải…",
    emptySearch: "Không tìm thấy khóa học nào cho",
    emptyCategory: "Danh mục này chưa có khóa học nào.",
    emptyHint: "Thử từ khóa ngắn hơn, hoặc xem các khóa nổi bật bên dưới.",
  },

  partners: {
    heading: "Học cùng các đơn vị đào tạo",
    description: "Khóa học trên hệ thống do các trường và đơn vị này cung cấp nội dung.",
  },

  more: {
    heading: "Không chỉ có khóa học",
    description:
      "Ôn thi và tự học thêm với cẩm nang từng môn và kho tài liệu do sinh viên chia sẻ.",
    cards: [
      {
        id: "guides",
        title: "Cẩm nang môn học",
        text: "Kinh nghiệm học từng môn, chia theo chủ đề — đọc vài phút là nắm được đường đi.",
        cta: "Đọc cẩm nang",
        href: "/blog",
      },
      {
        id: "documents",
        title: "Kho tài liệu",
        text: "Giáo trình, đề cương, slide và đề ôn tập theo trường, theo môn — tải về miễn phí.",
        cta: "Vào kho tài liệu",
        href: "/share-document",
      },
    ],
  },

  faq: {
    heading: "Câu hỏi thường gặp",
  },
} as const;
