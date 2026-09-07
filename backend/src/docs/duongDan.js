/**
 * Bang ke 129 endpoint cua API, viet o dang gon roi banh ra thanh OpenAPI.
 *
 * Vi sao khong dung swagger-jsdoc: no bat rai chu thich JSDoc vao 15 file
 * route, moi endpoint mot khoi YAML muoi may dong. File route dang doc duoc,
 * nhet vao la thanh 1500 dong chu thich lan giua 129 dong ma that.
 *
 * O day moi endpoint la MOT dong. Them route moi thi them mot dong, va ham
 * banhRa() lo phan lap lai: doi ":id" thanh "{id}", khai tham so duong dan,
 * gan o khoa, va them cac ma loi tuong ung voi muc quyen.
 *
 * Cot quyen:
 *   ''   cong khai, khong can dang nhap
 *   'dn' phai dang nhap (middleware protect)
 *   'gv' giang vien hoac admin (middleware instructor)
 *   'ad' chi admin (middleware admin, hoac controller tu chan)
 */

const QUYEN = {
  "": "Công khai",
  dn: "Cần đăng nhập",
  gv: "Giảng viên hoặc Admin",
  ad: "Chỉ Admin",
};

// [phuong thuc, duong dan, quyen, tom tat, tuy chon]
//
// tuy chon:
//   tra    ten schema tra ve; boc trong mang => danh sach
//   than   ten schema hoac object mo ta than yeu cau
//   file   true => than la multipart/form-data
//   q      mang tham so query
//   ghiChu doan luu y hien duoi tom tat
const BANG = [
  // ------------------------------ Nguoi dung ------------------------------
  ["get", "/api/users", "ad", "Danh sách người dùng", { tag: "Người dùng", tra: ["NguoiDung"] }],
  ["post", "/api/users", "", "Đăng ký tài khoản", {
    tag: "Người dùng",
    than: { name: "string", email: "string", password: "string" },
    tra: "NguoiDung",
  }],
  ["post", "/api/users/login", "", "Đăng nhập", {
    tag: "Người dùng",
    than: { email: "string", password: "string" },
    tra: "NguoiDung",
    ghiChu:
      "Đặt token vào cookie httpOnly. Trình duyệt tự gửi kèm ở các lần gọi sau, JavaScript không đọc được. Có giới hạn số lần thử.",
  }],
  ["post", "/api/users/logout", "", "Đăng xuất", { tag: "Người dùng", ghiChu: "Xóa cookie phiên." }],
  ["post", "/api/users/google", "", "Đăng nhập bằng Google", {
    tag: "Người dùng",
    than: { credential: "string" },
    tra: "NguoiDung",
    ghiChu: "Nhận id_token từ Google Identity Services, xác minh ở máy chủ rồi cấp phiên như đăng nhập thường.",
  }],
  ["get", "/api/users/profile", "dn", "Hồ sơ của tôi", { tag: "Người dùng", tra: "NguoiDung" }],
  ["put", "/api/users/profile", "dn", "Cập nhật hồ sơ", {
    tag: "Người dùng",
    than: { name: "string", email: "string", password: "string" },
    tra: "NguoiDung",
  }],
  ["post", "/api/users/profile/avatar", "dn", "Đổi ảnh đại diện", {
    tag: "Người dùng",
    file: true,
    than: { avatar: "file" },
    tra: "NguoiDung",
  }],
  ["put", "/api/users/deactivate", "dn", "Vô hiệu hóa tài khoản của tôi", { tag: "Người dùng" }],
  ["get", "/api/users/activity", "dn", "Hoạt động gần đây của tôi", { tag: "Người dùng" }],
  ["get", "/api/users/instructors", "ad", "Danh sách giảng viên theo đơn vị", {
    tag: "Người dùng",
    tra: ["NguoiDung"],
  }],
  ["put", "/api/users/:id/role", "ad", "Đổi vai trò người dùng", {
    tag: "Người dùng",
    than: { role: "string" },
    tra: "NguoiDung",
  }],
  ["delete", "/api/users/:id", "ad", "Xóa người dùng", { tag: "Người dùng" }],

  // ------------------------------- Danh muc -------------------------------
  ["get", "/api/categories", "", "Danh sách danh mục", { tag: "Danh mục", tra: ["DanhMuc"] }],
  ["post", "/api/categories", "ad", "Tạo danh mục", { tag: "Danh mục", than: "DanhMuc", tra: "DanhMuc" }],
  ["put", "/api/categories/:id", "ad", "Sửa danh mục", { tag: "Danh mục", than: "DanhMuc", tra: "DanhMuc" }],
  ["delete", "/api/categories/:id", "ad", "Xóa danh mục", { tag: "Danh mục" }],

  // --------------------------- Don vi dao tao -----------------------------
  ["get", "/api/providers", "", "Danh sách đơn vị đào tạo", { tag: "Đơn vị đào tạo", tra: ["DonVi"] }],
  ["get", "/api/providers/slug/:slug", "", "Chi tiết đơn vị theo slug", { tag: "Đơn vị đào tạo", tra: "DonVi" }],
  ["post", "/api/providers", "ad", "Tạo đơn vị", { tag: "Đơn vị đào tạo", than: "DonVi", tra: "DonVi" }],
  ["put", "/api/providers/:id", "ad", "Sửa đơn vị", { tag: "Đơn vị đào tạo", than: "DonVi", tra: "DonVi" }],
  ["delete", "/api/providers/:id", "ad", "Xóa đơn vị", { tag: "Đơn vị đào tạo" }],

  // ------------------------------- Khoa hoc -------------------------------
  ["get", "/api/courses", "", "Danh sách khóa học", {
    tag: "Khóa học",
    tra: ["KhoaHoc"],
    q: ["category", "search", "page", "limit"],
    ghiChu: "Chỉ trả về khóa đã xuất bản. Trường lessons ở đây là mảng ObjectId, muốn nội dung bài thì gọi /api/courses/slug/{slug}.",
  }],
  ["get", "/api/courses/slug/:slug", "", "Chi tiết khóa học theo slug", {
    tag: "Khóa học",
    tra: "KhoaHoc",
    ghiChu: "Kèm danh sách bài học đầy đủ. Người chưa được mở khóa nhận bài học có biKhoa = true và bị cắt videoUrl.",
  }],
  ["get", "/api/courses/:id", "", "Chi tiết khóa học theo id", { tag: "Khóa học", tra: "KhoaHoc" }],
  ["get", "/api/courses/home-sections", "", "Ba nhóm khóa học của trang chủ", {
    tag: "Khóa học",
    ghiChu: "Trả về mostPopular, trendingNow, newReleases. Có cache 120 giây.",
  }],
  ["get", "/api/courses/instructor", "gv", "Khóa học do tôi tạo", { tag: "Khóa học", tra: ["KhoaHoc"] }],
  ["post", "/api/courses", "gv", "Tạo khóa học", {
    tag: "Khóa học",
    file: true,
    than: { title: "string", description: "string", price: "number", category: "string", thumbnail: "file" },
    tra: "KhoaHoc",
    ghiChu: "Khóa mới nằm ở dạng nháp (isPublished = false) cho tới khi admin xuất bản.",
  }],
  ["put", "/api/courses/:id", "gv", "Sửa khóa học", { tag: "Khóa học", file: true, tra: "KhoaHoc" }],
  ["delete", "/api/courses/:id", "gv", "Xóa khóa học", { tag: "Khóa học" }],
  ["put", "/api/courses/:id/publish", "ad", "Xuất bản / gỡ xuất bản khóa học", {
    tag: "Khóa học",
    than: { isPublished: "boolean" },
    ghiChu: "Route chỉ gắn protect, nhưng controller tự chặn: tài khoản không phải admin nhận 403.",
  }],
  ["patch", "/api/courses/:id/tags", "ad", "Gắn thẻ cho khóa học", {
    tag: "Khóa học",
    than: { tags: "array" },
    tra: "KhoaHoc",
  }],
  ["post", "/api/courses/:id/enroll", "dn", "Ghi danh vào khóa học", {
    tag: "Khóa học",
    tra: "GhiDanh",
    ghiChu: "Khóa có phí mà chưa có đơn hàng ở trạng thái paid thì trả 402 kèm requiresPayment = true.",
  }],
  ["get", "/api/courses/admin/courses/home-sections/most-popular", "ad", "Nhóm phổ biến nhất (bản quản trị)", { tag: "Khóa học" }],
  ["get", "/api/courses/admin/courses/home-sections/trending-now", "ad", "Nhóm đang thịnh hành (bản quản trị)", { tag: "Khóa học" }],
  ["get", "/api/courses/admin/courses/home-sections/new-releases", "ad", "Nhóm mới ra mắt (bản quản trị)", { tag: "Khóa học" }],

  // -------------------------------- Bai hoc -------------------------------
  ["get", "/api/lessons/:id", "dn", "Chi tiết bài học", {
    tag: "Bài học",
    tra: "BaiHoc",
    ghiChu: "Chưa được mở khóa thì videoUrl, content, documentUrl bị cắt và biKhoa = true.",
  }],
  ["get", "/api/lessons/course/:courseSlug/lesson/:lessonSlug", "dn", "Bài học theo slug khóa và slug bài", {
    tag: "Bài học",
    tra: "BaiHoc",
  }],
  ["post", "/api/lessons", "gv", "Thêm bài học", {
    tag: "Bài học",
    file: true,
    than: { courseId: "string", title: "string", duration: "string", order: "number", video: "file" },
    tra: "BaiHoc",
  }],
  ["put", "/api/lessons/:id", "gv", "Sửa bài học", { tag: "Bài học", file: true, tra: "BaiHoc" }],
  ["delete", "/api/lessons/:id", "gv", "Xóa bài học", { tag: "Bài học" }],

  // -------------------------- Ghi danh & tien do --------------------------
  ["get", "/api/enrollments/my-courses", "dn", "Các khóa tôi đã ghi danh", {
    tag: "Ghi danh & tiến độ",
    tra: ["GhiDanh"],
    ghiChu: "Một học viên ghi danh được nhiều khóa; ràng buộc duy nhất đặt trên cặp (khóa, học viên).",
  }],
  ["get", "/api/enrollments/:courseId", "dn", "Trạng thái ghi danh của tôi ở một khóa", {
    tag: "Ghi danh & tiến độ",
    tra: "GhiDanhTheoKhoa",
    ghiChu: "Chưa ghi danh vẫn trả 200 kèm isEnrolled = false chứ không trả 404. Phải kiểm cờ này trước khi đọc lessonProgress.",
  }],
  ["post", "/api/enrollments/:courseId", "dn", "Ghi danh vào khóa học", { tag: "Ghi danh & tiến độ", tra: "GhiDanh" }],
  ["get", "/api/enrollments/:courseId/progress", "dn", "Thống kê tiến độ của tôi", {
    tag: "Ghi danh & tiến độ",
    tra: "ThongKeTienDo",
  }],
  ["get", "/api/enrollments/:courseId/students", "dn", "Danh sách học viên của khóa", {
    tag: "Ghi danh & tiến độ",
    ghiChu: "Controller tự kiểm người gọi có phải giảng viên của chính khóa đó không.",
  }],
  ["put", "/api/enrollments/:courseId/start-lesson", "dn", "Bắt đầu một bài học", {
    tag: "Ghi danh & tiến độ",
    than: { lessonId: "string" },
  }],
  ["put", "/api/enrollments/:courseId/update-watch-time", "dn", "Cập nhật thời lượng đã xem", {
    tag: "Ghi danh & tiến độ",
    than: { lessonId: "string", watchTime: "number" },
  }],
  ["put", "/api/enrollments/:courseId/complete-lesson", "dn", "Đánh dấu hoàn thành bài học", {
    tag: "Ghi danh & tiến độ",
    than: { lessonId: "string" },
  }],
  ["put", "/api/enrollments/:courseId/complete-course", "dn", "Hoàn thành khóa học", {
    tag: "Ghi danh & tiến độ",
    ghiChu: "Đủ điều kiện thì sinh chứng nhận có mã tra cứu.",
  }],
  ["put", "/api/enrollments/:courseId/drop", "dn", "Bỏ khóa học", { tag: "Ghi danh & tiến độ" }],

  // ------------------------------- Don hang -------------------------------
  ["get", "/api/orders/my", "dn", "Đơn hàng của tôi", { tag: "Đơn hàng", tra: ["DonHang"] }],
  ["post", "/api/orders", "dn", "Tạo đơn mua khóa học", {
    tag: "Đơn hàng",
    than: { courseId: "string" },
    tra: "DonHang",
    ghiChu: "Trả về mã đơn để dựng mã QR chuyển khoản. Đơn ở trạng thái pending cho tới khi admin xác nhận.",
  }],
  ["get", "/api/orders/:code", "dn", "Xem đơn theo mã", { tag: "Đơn hàng", tra: "DonHang" }],
  ["put", "/api/orders/:code/cancel", "dn", "Hủy đơn", { tag: "Đơn hàng", tra: "DonHang" }],

  // ----------------------------- Trac nghiem ------------------------------
  ["get", "/api/quizzes/course/:courseId", "dn", "Các bài trắc nghiệm của khóa", {
    tag: "Trắc nghiệm",
    tra: ["BaiTracNghiem"],
  }],
  ["get", "/api/quizzes/:id", "dn", "Chi tiết bài trắc nghiệm", { tag: "Trắc nghiệm", tra: "BaiTracNghiem" }],
  ["post", "/api/quizzes/:id/submit", "dn", "Nộp bài", {
    tag: "Trắc nghiệm",
    than: { answers: "array" },
    tra: "LuotLamBai",
    ghiChu: "Chấm ngay ở máy chủ; passed = score >= passingScore.",
  }],
  ["get", "/api/quizzes/:id/attempts", "dn", "Các lượt làm bài", { tag: "Trắc nghiệm", tra: ["LuotLamBai"] }],
  ["get", "/api/quizzes/:id/attempt/:attemptId", "dn", "Chi tiết một lượt làm bài", { tag: "Trắc nghiệm", tra: "LuotLamBai" }],
  ["get", "/api/quizzes/:id/stats", "gv", "Thống kê điểm của bài trắc nghiệm", { tag: "Trắc nghiệm" }],
  ["post", "/api/quizzes", "gv", "Tạo bài trắc nghiệm", { tag: "Trắc nghiệm", than: "BaiTracNghiem", tra: "BaiTracNghiem" }],
  ["put", "/api/quizzes/:id", "gv", "Sửa bài trắc nghiệm", { tag: "Trắc nghiệm", than: "BaiTracNghiem", tra: "BaiTracNghiem" }],
  ["put", "/api/quizzes/:id/publish", "gv", "Xuất bản bài trắc nghiệm", { tag: "Trắc nghiệm" }],
  ["put", "/api/quizzes/:id/allow-retry/:studentId", "gv", "Cho một học viên làm lại", { tag: "Trắc nghiệm" }],
  ["delete", "/api/quizzes/:id", "gv", "Xóa bài trắc nghiệm", { tag: "Trắc nghiệm" }],

  // ------------------------------ Chung nhan ------------------------------
  ["get", "/api/certificates/verify/:code", "", "Tra cứu chứng nhận theo mã", {
    tag: "Chứng nhận",
    tra: "ChungNhan",
    ghiChu: "Công khai có chủ đích: nhà tuyển dụng gõ mã vào là kiểm chứng được, không cần tài khoản.",
  }],
  ["get", "/api/certificates/user/:userId", "", "Chứng nhận công khai của một người", { tag: "Chứng nhận", tra: ["ChungNhan"] }],
  ["get", "/api/certificates/achievements/user/:userId", "", "Thành tích công khai của một người", { tag: "Chứng nhận", tra: ["ThanhTich"] }],
  ["get", "/api/certificates/achievements/leaderboard", "", "Bảng xếp hạng thành tích", { tag: "Chứng nhận" }],
  ["get", "/api/certificates/my-certificates", "dn", "Chứng nhận của tôi", { tag: "Chứng nhận", tra: ["ChungNhan"] }],
  ["get", "/api/certificates/achievements/my-achievements", "dn", "Thành tích của tôi", { tag: "Chứng nhận", tra: ["ThanhTich"] }],
  ["get", "/api/certificates/:id", "", "Chi tiết chứng nhận", { tag: "Chứng nhận", tra: "ChungNhan" }],
  ["post", "/api/certificates", "dn", "Cấp chứng nhận", { tag: "Chứng nhận", tra: "ChungNhan" }],
  ["put", "/api/certificates/:id", "dn", "Sửa chứng nhận", { tag: "Chứng nhận", tra: "ChungNhan" }],

  // ------------------------------- Danh gia -------------------------------
  ["get", "/api/reviews/course/:courseId", "", "Đánh giá của một khóa", {
    tag: "Đánh giá",
    tra: ["DanhGia"],
    q: ["limit", "sortBy"],
  }],
  ["get", "/api/reviews/stats/:courseId", "", "Thống kê đánh giá của một khóa", { tag: "Đánh giá", tra: "ThongKeDanhGia" }],
  ["get", "/api/reviews/:id", "", "Chi tiết đánh giá", { tag: "Đánh giá", tra: "DanhGia" }],
  ["post", "/api/reviews/:id/helpful", "", "Bấm hữu ích", { tag: "Đánh giá" }],
  ["post", "/api/reviews/:id/unhelpful", "", "Bỏ bấm hữu ích", { tag: "Đánh giá" }],
  ["post", "/api/reviews", "dn", "Viết đánh giá", {
    tag: "Đánh giá",
    than: { course: "string", rating: "number", comment: "string" },
    tra: "DanhGia",
  }],
  ["put", "/api/reviews/:id", "dn", "Sửa đánh giá của mình", { tag: "Đánh giá", tra: "DanhGia" }],
  ["delete", "/api/reviews/:id", "dn", "Xóa đánh giá của mình", { tag: "Đánh giá" }],
  ["get", "/api/reviews/admin/all", "ad", "Toàn bộ đánh giá (quản trị)", { tag: "Đánh giá", tra: ["DanhGia"] }],

  // -------------------------------- Hoi dap -------------------------------
  ["get", "/api/faqs/homepage", "", "Hỏi đáp trang chủ", { tag: "Hỏi đáp", tra: ["CauHoiThuongGap"] }],
  ["get", "/api/faqs/course/:courseId", "", "Hỏi đáp của một khóa", { tag: "Hỏi đáp", tra: ["CauHoiThuongGap"] }],
  ["post", "/api/faqs", "gv", "Tạo câu hỏi", { tag: "Hỏi đáp", than: "CauHoiThuongGap", tra: "CauHoiThuongGap" }],
  ["put", "/api/faqs/:id", "gv", "Sửa câu hỏi", { tag: "Hỏi đáp", than: "CauHoiThuongGap", tra: "CauHoiThuongGap" }],
  ["delete", "/api/faqs/:id", "gv", "Xóa câu hỏi", { tag: "Hỏi đáp" }],

  // ---------------------------- Bang quang cao ----------------------------
  ["get", "/api/banners", "", "Danh sách băng quảng cáo", { tag: "Băng quảng cáo", tra: ["BangQuangCao"] }],
  ["post", "/api/banners", "ad", "Tạo băng", { tag: "Băng quảng cáo", file: true, tra: "BangQuangCao" }],
  ["put", "/api/banners/:id", "ad", "Sửa băng", { tag: "Băng quảng cáo", file: true, tra: "BangQuangCao" }],
  ["delete", "/api/banners/:id", "ad", "Xóa băng", { tag: "Băng quảng cáo" }],

  // ------------------------------- Tai lieu -------------------------------
  ["get", "/api/documents", "", "Danh sách tài liệu", { tag: "Tài liệu", tra: ["TaiLieu"], q: ["page", "limit"] }],
  ["get", "/api/documents/:id", "", "Chi tiết tài liệu", { tag: "Tài liệu", tra: "TaiLieu" }],
  ["post", "/api/documents/:id/download", "", "Đếm một lượt tải", { tag: "Tài liệu" }],
  ["post", "/api/documents", "dn", "Đăng tài liệu", {
    tag: "Tài liệu",
    file: true,
    than: { title: "string", file: "file" },
    tra: "TaiLieu",
    ghiChu: "Học viên cũng đăng được, không riêng giảng viên.",
  }],
  ["delete", "/api/documents/:id", "dn", "Xóa tài liệu", {
    tag: "Tài liệu",
    ghiChu: "Controller kiểm chủ sở hữu: chỉ người đăng hoặc admin mới xóa được, người khác nhận 403.",
  }],

  // ------------------------------- Bai viet -------------------------------
  ["get", "/api/posts", "", "Danh sách bài viết", { tag: "Bài viết", tra: ["BaiViet"], q: ["topic", "page", "limit"] }],
  ["get", "/api/posts/topics", "", "Danh sách chủ đề", { tag: "Bài viết" }],
  ["get", "/api/posts/:slug", "", "Chi tiết bài viết theo slug", { tag: "Bài viết", tra: "BaiViet" }],
  ["get", "/api/posts/admin/all", "ad", "Toàn bộ bài viết kể cả bản nháp", { tag: "Bài viết", tra: ["BaiViet"] }],
  ["get", "/api/posts/admin/:id", "ad", "Chi tiết bài viết (quản trị)", { tag: "Bài viết", tra: "BaiViet" }],
  ["post", "/api/posts", "ad", "Tạo bài viết", {
    tag: "Bài viết", file: true, tra: "BaiViet",
    ghiChu: "Trường content nhận văn bản thường hoặc HTML. HTML được lọc theo danh sách trắng (h1-h4, p, ul, ol, a, img, figure, blockquote, table, code): thẻ script, iframe, style cùng mọi thuộc tính sự kiện và địa chỉ javascript: đều bị bỏ trước khi lưu, nên phần lưu lại có thể ngắn hơn hẳn phần gửi lên.",
  }],
  ["put", "/api/posts/:id", "ad", "Sửa bài viết", {
    tag: "Bài viết", file: true, tra: "BaiViet",
    ghiChu: "Nội dung gửi lên đi qua đúng bộ lọc HTML như khi tạo bài.",
  }],
  ["delete", "/api/posts/:id", "dn", "Xóa bài viết", {
    tag: "Bài viết",
    ghiChu: "Route chỉ gắn protect. Controller kiểm tiếp: chỉ tác giả hoặc admin xóa được, người khác nhận 403.",
  }],

  // ------------------------------- Quan tri -------------------------------
  // Ca nhom nay nam sau `router.use(protect, admin)` nen deu la chi Admin.
  ["get", "/api/admin/dashboard/statistics", "ad", "Số liệu tổng quan", { tag: "Quản trị" }],
  ["get", "/api/admin/users", "ad", "Danh sách người dùng", { tag: "Quản trị", tra: ["NguoiDung"], q: ["role", "page", "limit"] }],
  ["post", "/api/admin/users", "ad", "Tạo người dùng", { tag: "Quản trị", than: "NguoiDung", tra: "NguoiDung" }],
  ["get", "/api/admin/users/:id", "ad", "Chi tiết người dùng", { tag: "Quản trị", tra: "NguoiDung" }],
  ["put", "/api/admin/users/:id", "ad", "Sửa người dùng", { tag: "Quản trị", than: "NguoiDung", tra: "NguoiDung" }],
  ["put", "/api/admin/users/:id/status", "ad", "Khóa / mở tài khoản", { tag: "Quản trị", than: { isActive: "boolean" } }],
  ["delete", "/api/admin/users/:id", "ad", "Xóa người dùng", { tag: "Quản trị" }],
  ["get", "/api/admin/courses", "ad", "Danh sách khóa học", { tag: "Quản trị", tra: ["KhoaHoc"] }],
  ["get", "/api/admin/courses/:id", "ad", "Chi tiết khóa học", { tag: "Quản trị", tra: "KhoaHoc" }],
  ["put", "/api/admin/courses/:id/publish", "ad", "Xuất bản khóa học", { tag: "Quản trị", than: { isPublished: "boolean" } }],
  ["delete", "/api/admin/courses/:id", "ad", "Xóa khóa học", { tag: "Quản trị" }],
  ["get", "/api/admin/enrollments", "ad", "Danh sách ghi danh", { tag: "Quản trị", tra: ["GhiDanh"] }],
  ["get", "/api/admin/enrollments/:id", "ad", "Chi tiết ghi danh", { tag: "Quản trị", tra: "GhiDanh" }],
  ["put", "/api/admin/enrollments/:id/status", "ad", "Đổi trạng thái ghi danh", { tag: "Quản trị", than: { status: "string" } }],
  ["get", "/api/admin/certificates", "ad", "Danh sách chứng nhận", { tag: "Quản trị", tra: ["ChungNhan"] }],
  ["get", "/api/admin/certificates/:verificationCode/verify", "ad", "Tra cứu chứng nhận", { tag: "Quản trị", tra: "ChungNhan" }],
  ["put", "/api/admin/certificates/:id/revoke", "ad", "Thu hồi chứng nhận", { tag: "Quản trị" }],
  ["get", "/api/admin/reviews", "ad", "Danh sách đánh giá", { tag: "Quản trị", tra: ["DanhGia"] }],
  ["delete", "/api/admin/reviews/:id", "ad", "Xóa đánh giá", { tag: "Quản trị" }],
  ["get", "/api/admin/orders", "ad", "Danh sách đơn hàng", { tag: "Quản trị", tra: ["DonHang"], q: ["status"] }],
  ["get", "/api/admin/orders/:code", "ad", "Chi tiết đơn hàng", { tag: "Quản trị", tra: "DonHang" }],
  ["put", "/api/admin/orders/:code/confirm", "ad", "Xác nhận đã nhận tiền", {
    tag: "Quản trị",
    tra: "DonHang",
    ghiChu: "Xác nhận xong thì học viên vào học được ngay.",
  }],
  ["put", "/api/admin/orders/:code/reject", "ad", "Từ chối đơn hàng", { tag: "Quản trị", tra: "DonHang" }],
];

// ---------------------------------------------------------------------------

const kieuDon = (t) =>
  t === "file"
    ? { type: "string", format: "binary" }
    : t === "array"
      ? { type: "array", items: { type: "string" } }
      : { type: t };

const thanYeuCau = (o) => {
  if (!o.than) return undefined;
  const schema =
    typeof o.than === "string"
      ? { $ref: "#/components/schemas/" + o.than }
      : {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(o.than).map(([k, v]) => [k, kieuDon(v)]),
          ),
        };
  return {
    required: true,
    content: { [o.file ? "multipart/form-data" : "application/json"]: { schema } },
  };
};

const traVe = (o) => {
  if (!o.tra) return { description: "Thành công" };
  const ten = Array.isArray(o.tra) ? o.tra[0] : o.tra;
  const ref = { $ref: "#/components/schemas/" + ten };
  return {
    description: "Thành công",
    content: {
      "application/json": {
        schema: Array.isArray(o.tra) ? { type: "array", items: ref } : ref,
      },
    },
  };
};

const loi = (ma, mo) => ({
  description: mo,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Loi" } } },
});

/**
 * Banh bang gon thanh doi tuong `paths` cua OpenAPI.
 */
function banhRa() {
  const paths = {};

  for (const [phuongThuc, duongDan, quyen, tomTat, tuyChon = {}] of BANG) {
    // ":courseId" -> "{courseId}"
    const duongOpenApi = duongDan.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
    const tenThamSo = [...duongDan.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]);

    const thamSo = tenThamSo.map((ten) => ({
      name: ten,
      in: "path",
      required: true,
      schema: { type: "string" },
    }));

    for (const q of tuyChon.q || []) {
      thamSo.push({ name: q, in: "query", required: false, schema: { type: "string" } });
    }

    const moTa = [
      "**Quyền:** " + QUYEN[quyen],
      tuyChon.ghiChu ? "\n\n" + tuyChon.ghiChu : "",
    ].join("");

    const responses = { 200: traVe(tuyChon) };
    if (phuongThuc === "post") {
      responses[201] = responses[200];
    }
    if (quyen !== "") {
      responses[401] = loi(401, "Chưa đăng nhập hoặc phiên đã hết hạn");
    }
    if (quyen === "gv" || quyen === "ad") {
      responses[403] = loi(403, "Đăng nhập rồi nhưng không đủ quyền");
    }
    if (tenThamSo.length > 0) {
      responses[404] = loi(404, "Không tìm thấy");
    }

    paths[duongOpenApi] ||= {};
    paths[duongOpenApi][phuongThuc] = {
      tags: [tuyChon.tag],
      summary: tomTat,
      description: moTa,
      ...(thamSo.length ? { parameters: thamSo } : {}),
      ...(tuyChon.than ? { requestBody: thanYeuCau(tuyChon) } : {}),
      responses,
      ...(quyen === "" ? { security: [] } : {}),
    };
  }

  return paths;
}

module.exports = { BANG, banhRa, QUYEN };
