/**
 * Ban dac ta OpenAPI 3 cua Learning Portal API.
 *
 * Gan vao ung dung o index.js:
 *   /api/docs       giao dien Swagger UI
 *   /api/docs.json  ban dac ta tho, de nap vao Postman hay sinh client
 */

const schemas = require("./schemas");
const { banhRa } = require("./duongDan");

// May chu duoc liet ke trong tai lieu. Doc tu bien moi truong de ban tren
// Render/Railway khong hien dia chi localhost cua may lap trinh.
const mayChu = [];
if (process.env.API_PUBLIC_URL) {
  mayChu.push({ url: process.env.API_PUBLIC_URL, description: "Máy chủ đang chạy thật" });
}
mayChu.push({ url: "http://localhost:5000", description: "Máy của lập trình viên" });

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Learning Portal API",
    version: "1.0.0",
    description: [
      "API của nền tảng học trực tuyến Learning Portal: khóa học, bài giảng,",
      "ghi danh, tiến độ, trắc nghiệm, đơn hàng và chứng nhận.",
      "",
      "### Đăng nhập",
      "",
      "Gọi `POST /api/users/login`. Máy chủ đặt token vào **cookie httpOnly**,",
      "không trả token trong thân phản hồi — JavaScript ở trình duyệt không đọc",
      "được nó. Những lần gọi sau trình duyệt tự gửi cookie kèm theo.",
      "",
      "Thử ngay trên trang này thì đăng nhập trước bằng `POST /api/users/login`,",
      "cookie sẽ được giữ cho các lệnh sau. Gọi từ máy khác thì nhớ bật gửi",
      "cookie: `credentials: 'include'` với fetch, `-c/-b` với curl.",
      "",
      "### Bốn mức quyền",
      "",
      "| Mức | Nghĩa |",
      "|---|---|",
      "| Công khai | Không cần đăng nhập |",
      "| Cần đăng nhập | Có phiên hợp lệ là được |",
      "| Giảng viên hoặc Admin | `role` là `instructor` hoặc `admin` |",
      "| Chỉ Admin | `role` là `admin` |",
      "",
      "Thiếu phiên nhận **401**, có phiên nhưng sai vai trò nhận **403**.",
      "",
      "### CORS",
      "",
      "Chỉ những origin khai trong biến môi trường mới gọi được từ trình duyệt.",
      "Gọi bằng curl hay Postman thì không dính CORS.",
    ].join("\n"),
    contact: {
      name: "Nguyễn Thế Sang",
      url: "https://github.com/TheSang2610",
    },
  },
  servers: mayChu,
  tags: [
    { name: "Người dùng", description: "Đăng ký, đăng nhập, hồ sơ" },
    { name: "Khóa học", description: "Danh mục khóa, chi tiết, ghi danh" },
    { name: "Bài học", description: "Nội dung bài giảng và video" },
    { name: "Ghi danh & tiến độ", description: "Theo dõi học viên học tới đâu" },
    { name: "Trắc nghiệm", description: "Đề, lượt làm bài và chấm điểm" },
    { name: "Chứng nhận", description: "Cấp và tra cứu chứng nhận" },
    { name: "Đơn hàng", description: "Mua khóa học có phí" },
    { name: "Đánh giá", description: "Nhận xét và số sao của khóa học" },
    { name: "Danh mục", description: "Phân loại khóa học" },
    { name: "Đơn vị đào tạo", description: "Trường và tổ chức cung cấp khóa" },
    { name: "Hỏi đáp", description: "Câu hỏi thường gặp" },
    { name: "Tài liệu", description: "Tài liệu do người dùng chia sẻ" },
    { name: "Bài viết", description: "Blog" },
    { name: "Băng quảng cáo", description: "Băng hiển thị do admin đặt" },
    { name: "Quản trị", description: "Toàn bộ nhóm này chỉ Admin gọi được" },
  ],
  components: {
    securitySchemes: {
      // Ten cookie do backend dat khi dang nhap.
      cookiePhien: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description:
          "Cookie httpOnly do POST /api/users/login đặt. Trình duyệt tự gửi kèm, không cần khai tay.",
      },
    },
    schemas,
  },
  // Mac dinh moi endpoint deu can phien; endpoint cong khai tu ghi de bang
  // `security: []` trong duongDan.js.
  security: [{ cookiePhien: [] }],
  paths: banhRa(),
};

module.exports = spec;
