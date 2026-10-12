/** Chu va cau hinh cua trang /admin/posts (cam nang mon hoc). */
export const ADMIN_POSTS = {
  pageSize: 20,
  createHref: "/admin/post-create",
  editHref: (id: string) => `/admin/post-create?id=${id}`,
  viewHref: (slug: string) => `/blog/${slug}`,

  title: "Cẩm nang môn học",
  intro: {
    before: "Bài viết do Admin biên tập, hiện ở trang ",
    code: "/blog",
    after: ". Tài liệu học viên tự đăng nằm ở mục khác.",
  },
  create: "Viết bài mới",

  filters: {
    searchPlaceholder: "Tìm theo tiêu đề",
    searchAria: "Tìm bài viết",
    search: "Tìm",
    statusAria: "Lọc theo trạng thái",
    statuses: [
      { value: "", label: "Mọi trạng thái" },
      { value: "published", label: "Đã đăng" },
      { value: "draft", label: "Bản nháp" },
    ],
    topicAria: "Lọc theo chủ đề",
    allTopics: "Mọi chủ đề",
    count: (n: number) => `${n} bài`,
    matching: (q: string) => ` khớp "${q}"`,
  },

  loading: "Đang tải bài viết...",
  errorTitle: "Đã xảy ra lỗi dữ liệu",
  emptyFiltered: "Không có bài nào khớp bộ lọc",
  empty: "Chưa có bài viết nào",
  emptyHint: 'Bấm "Viết bài mới" ở góc trên để bắt đầu.',

  card: {
    draft: "Bản nháp",
    published: "Đã đăng",
    anonymous: "Ẩn danh",
    views: (n: number) => `${n} lượt xem`,
    viewTitle: "Xem trang thật",
    editTitle: "Sửa bài viết",
    deleteTitle: "Xóa bài viết",
  },

  pager: {
    prev: "Trước",
    next: "Sau",
    info: (page: number, pages: number) => `Trang ${page}/${pages}`,
  },

  messages: {
    loadFailed: "Không tải được danh sách bài viết.",
    confirmDelete: (title: string) =>
      `Xóa bài "${title}"? Thao tác này không hoàn tác được.`,
    deleteFailed: "Xóa thất bại.",
  },
} as const;

export type PostStatusFilter = "" | "published" | "draft";
