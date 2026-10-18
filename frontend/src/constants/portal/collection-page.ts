/** Chu cua trang /collection?slug=... (bang xep hang khoa hoc). */

export type CollectionSource = "mostPopular" | "newReleases" | "trendingNow";

// Ba muc nay chinh la ba cot o trang chu (PopularCoursesSection).
//
// Ten phai TRUNG voi ten cot ben do. Truoc day nguoi dung bam "Phổ biến nhất"
// roi dap xuong mot trang de "Most Popular Courses" - doi ca ngon ngu lan cach
// goi, khong con chac minh vua bam trung cho khong.
//
// Cai mo ta cung noi ro so lieu nao dung de xep - vi ca ba deu la BANG XEP
// HANG, va thu hang chi co nghia khi biet no xep theo cai gi.
export const COLLECTIONS: Record<
  string,
  { ten: string; moTa: string; get: CollectionSource }
> = {
  "most-popular-courses": {
    ten: "Phổ biến nhất",
    moTa: "Xếp theo số lượt ghi danh, nhiều nhất lên đầu.",
    get: "mostPopular",
  },
  "hot-releases-courses": {
    ten: "Mới phát hành",
    moTa: "Xếp theo ngày phát hành, khoá ra sau lên đầu.",
    get: "newReleases",
  },
  "trending-now-courses": {
    ten: "Đang thịnh hành",
    moTa: "Xếp theo lượt xem gần đây, nhiều nhất lên đầu.",
    get: "trendingNow",
  },
};

export const COLLECTION_PAGE = {
  /** + slug -> /collection?slug=most-popular-courses */
  href: "/collection?slug=",
  fallbackTitle: "Danh sách khoá học",
  chipsLabel: "Bảng xếp hạng",
  /** {n} = so khoa trong bang. */
  count: "{n} khóa học",
  empty: "Mục này chưa có khoá học nào được hiển thị.",
  unknown: "Không có mục nào ứng với đường dẫn này.",
} as const;
