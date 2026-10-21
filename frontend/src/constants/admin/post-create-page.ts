/** Chu va cau hinh cua trang /admin/post-create (viet / sua bai cam nang). */
export const ADMIN_POST_CREATE = {
  listHref: "/admin/posts",
  editHref: (id: string) => `/admin/post-create?id=${id}`,
  viewHref: (slug: string) => `/blog/${slug}`,

  maxTitle: 200,
  maxExcerpt: 400,
  // Con so nay do phan NGUOI VIET GO VAO, khong phai phan duoc luu.
  //
  // Rong tay hon han gioi han 120.000 cua co so du lieu vi viec thuong lam nhat
  // la dan ca doan HTML tu mot trang bao vao: doan tho keo theo script, khung
  // quang cao va hang tram class, co the gap may lan bai that. May chu se cat
  // het truoc khi luu. De maxLength dung bang gioi han luu tru thi cu dan la bi
  // cat cut giua mot the, hong ca bai - te hon nhieu.
  maxContent: 400000,
  maxTags: 5,
  defaultTopic: "others",

  opening: "Đang mở bài viết...",

  header: {
    back: "Về danh sách bài viết",
    editTitle: "Sửa bài viết",
    createTitle: "Viết bài mới",
    intro:
      "Bài đăng ở đây hiện trên trang Cẩm nang môn học (/blog) cho tất cả mọi người đọc.",
    view: "Xem trang thật",
    save: "Lưu thay đổi",
    publish: "Đăng bài",
    saveDraft: "Lưu bản nháp",
  },

  fields: {
    required: "*",
    title: "Tiêu đề",
    titlePlaceholder: "VD: React 19: Server Components, hooks mới và cách tối ưu app web",
    excerpt: "Mô tả ngắn",
    excerptPlaceholder:
      "Hai đến ba câu tóm tắt. Đoạn này hiện ở thẻ ngoài danh sách, nên đừng chép câu mở đầu của bài vào.",
    content: "Nội dung bài",
    contentHint:
      "Gõ chữ thường vẫn chạy như cũ. Dán HTML vào thì máy chủ chỉ giữ lại thẻ bài viết — script và khung quảng cáo bị bỏ.",
    chars: (n: string) => `${n} ký tự`,
    counter: (n: number, max: number) => `${n}/${max}`,
  },

  publish: {
    heading: "Xuất bản",
    status: "Trạng thái",
    published: "Đã đăng — mọi người đọc được",
    draft: "Bản nháp — chỉ admin thấy",
    pathLabel: "Đường dẫn: ",
    path: (slug: string) => `/blog/${slug}`,
    stableNote:
      "Bài đã đăng thì đổi tiêu đề không đổi đường dẫn, nên link đã chia sẻ ra ngoài vẫn sống.",
  },

  classify: {
    heading: "Phân loại",
    topic: "Chủ đề",
    othersLabel: "Others",
    tags: "Tags",
    tagsCount: (n: number, max: number) => `(${n}/${max})`,
    tagsPlaceholder: "Thêm tag rồi Enter...",
    tagsAdd: "Thêm tag",
    tagsRemove: (tag: string) => `Bỏ tag ${tag}`,
    tagsMain: "Tag chính — hiện trên thẻ ngoài danh sách",
    tagsFull: "Đã đủ 5 tag. Bỏ bớt một tag để thêm tag khác.",
    tagsNote:
      "Enter hoặc dấu phẩy để thêm. Tag đầu tiên (★) hiện trên thẻ ngoài danh sách.",
    tagsSuggest: "Gợi ý chọn nhanh:",
    /** Dung khi chua co bai nao co tag de goi y. */
    defaultSuggestions: ["ReactJS", "NestJS", "Tailwind", "Python", "Database"],
    /** Tag dai qua lam vo the ngoai danh sach. */
    tagMaxLength: 30,
  },

  thumbnail: {
    heading: "Ảnh đại diện",
    ratio: "Chuẩn 16:9",
    tabUrl: "Dán URL",
    tabUpload: "Tải file lên",
    placeholder: "https://images.unsplash.com/...",
    aria: "Đường dẫn ảnh đại diện",
    fileAria: "Chọn ảnh từ máy",
    fileNote: "JPG, PNG, WEBP hoặc GIF, tối đa 15MB. Chọn xong sẽ mở khung cắt 16:9.",
    alt: "Xem trước ảnh đại diện",
    empty: "Chưa có ảnh",
    crop: "Cắt / Sửa",
    remove: "Xóa",
    uploading: "Đang tải ảnh lên...",
    notImage: "File này không phải ảnh.",
    tooBig: "Ảnh tối đa 15MB.",
    /** Anh goc duoc cat o trinh duyet roi moi gui (~300KB), nen nhan anh goc lon. */
    maxMb: 15,
    uploadFailed: "Không tải được ảnh lên.",
    corsBlocked:
      'Máy chủ của link ảnh này không cho cắt ảnh. Hãy lưu ảnh về máy rồi dùng "Tải file lên".',
    modal: {
      title: "Chỉnh sửa & Cắt ảnh (Tỉ lệ 16:9)",
      hint: "Kéo ảnh để chọn vùng, lăn chuột hoặc kéo thanh để phóng to.",
      zoom: "Phóng to",
      cancel: "Hủy",
      apply: "Áp dụng ảnh đã cắt",
    },
    /** Kich thuoc anh sau khi cat: du net cho anh bia o trang doc tren man hinh retina. */
    output: { width: 1280, height: 720, quality: 0.9 },
  },

  outline: {
    heading: "Mục lục nhận ra được",
    note: "Đây đúng là menu bên trái mà người đọc sẽ thấy.",
    /** Huong dan khi chua co de muc - cac doan xen ke chu thuong / the. */
    empty: {
      a: "Chưa dòng nào thành đề mục. Bấm ",
      bold: "Tiêu đề lớn",
      b: " để bọc dòng đang chọn trong ",
      tag: "<h2>",
      c: ". Nếu gõ chữ thường thì mở đầu dòng bằng ",
      ex1: "Chương 1:",
      d: ", ",
      ex2: "Mục 1.1",
      e: " hoặc ",
      ex3: "## Tiêu đề",
      f: ".",
    },
    bullets: { 1: "●", 2: "○" } as Record<number, string>,
    bulletDeep: "–",
  },

  filterNotice: {
    title: "Bài phải qua bộ lọc nội dung",
    text: "Cả tiêu đề, mô tả ngắn lẫn nội dung đều bị kiểm. Bài chửi thề, kỳ thị chủng tộc hoặc kích động sẽ bị máy chủ từ chối, kèm thông báo nói rõ trường nào vi phạm.",
  },

  messages: {
    loadFailed: "Không tải được bài viết.",
    required: "Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung.",
    saved: "Đã lưu thay đổi.",
    published: "Đã đăng bài viết.",
    drafted: "Đã lưu bản nháp.",
    saveFailed: "Không lưu được bài viết.",
  },
} as const;
