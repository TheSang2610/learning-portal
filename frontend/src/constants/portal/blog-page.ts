/** Chu va cau hinh cua /blog va /blog/[slug]. */
export const BLOG = {
  /** Giay giu ban dung san truoc khi hoi lai may chu. */
  revalidate: 30,
  pageSize: 10,
  listHref: "/blog",
  postHref: (slug: string) => `/blog/${slug}`,
  shareDocumentHref: "/share-document",
  postsApi: (qs: string) => `/api/posts?${qs}`,
  topicsApi: "/api/posts/topics",
  postApi: (slug: string) => `/api/posts/${encodeURIComponent(slug)}`,

  metadata: {
    title: "Bài viết",
    description:
      "Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web.",
  },
  notFoundTitle: "Không tìm thấy bài viết",

  list: {
    title: "Bài viết",
    description:
      "Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web.",
    allPosts: "Tất cả bài viết",
    emptyTopic: "Chủ đề này chưa có bài viết",
    empty: "Chưa có bài viết nào",
    seeAll: "Xem tất cả bài viết",
    anonymous: "Ẩn danh",
    readMinutes: (n: number) => `${n} phút đọc`,
    prev: "Trước",
    next: "Sau",
    pageOf: (p: number, total: number) => `Trang ${p}/${total}`,
  },

  topics: {
    heading: "Xem các bài viết theo chủ đề",
    shareTitle: "Bạn có tài liệu muốn chia sẻ?",
    shareText: "Đăng đề cương, đề thi hoặc slide bài giảng để mọi người cùng tải về.",
    shareCta: "Chia sẻ tài liệu",
  },

  detail: {
    back: "Về danh sách bài viết",
    anonymous: "Ẩn danh",
    views: (n: number) => `${n} lượt xem`,
    readMinutes: (n: number) => `${n} phút đọc`,
    noOutline: "Bài viết này chưa chia mục.",
    imageSizes: "(max-width: 1152px) 100vw, 1152px",
  },
} as const;
