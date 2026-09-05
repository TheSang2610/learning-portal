/**
 * Cac kieu du lieu dung chung trong tai lieu API.
 *
 * Viet tay chu khong sinh tu Mongoose schema: model co nhieu truong noi bo
 * (khoa bam mat khau, co nhap nhay) khong nen phoi ra tai lieu cong khai, va
 * cai nguoi goi API can biet la HINH DANG JSON tra ve chu khong phai dinh
 * nghia luu tru.
 */

const idMongo = { type: "string", example: "66f1a2b3c4d5e6f7a8b9c0d1" };

const Loi = {
  type: "object",
  properties: {
    message: { type: "string", example: "Không tìm thấy khóa học" },
  },
};

const NguoiDung = {
  type: "object",
  properties: {
    _id: idMongo,
    name: { type: "string", example: "Nguyễn Thế Sang" },
    email: { type: "string", format: "email", example: "sang@example.com" },
    role: { type: "string", enum: ["student", "instructor", "admin"], example: "student" },
    avatar: { type: "string", example: "https://res.cloudinary.com/.../avatar.jpg" },
    provider: { type: "string", enum: ["local", "google"], example: "local" },
    isActive: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
  },
};

const DanhMuc = {
  type: "object",
  properties: {
    _id: idMongo,
    name: { type: "string", example: "Lập trình web" },
    slug: { type: "string", example: "lap-trinh-web" },
    description: { type: "string" },
  },
};

const DonVi = {
  type: "object",
  properties: {
    _id: idMongo,
    name: { type: "string", example: "Học viện Công nghệ Bưu chính Viễn thông" },
    slug: { type: "string", example: "ptit" },
    logo: { type: "string" },
  },
};

const BaiHoc = {
  type: "object",
  properties: {
    _id: idMongo,
    courseId: idMongo,
    title: { type: "string", example: "Giới thiệu React và môi trường" },
    slug: { type: "string", example: "gioi-thieu-react" },
    // Chuoi chu khong phai so - dung dang "12:30".
    duration: { type: "string", example: "12:40" },
    order: { type: "integer", example: 1 },
    videoUrl: { type: "string", example: "https://.../bai-1.m3u8" },
    content: { type: "string" },
    documentUrl: { type: "string" },
    biKhoa: {
      type: "boolean",
      description:
        "May chu dat true khi nguoi xem chua duoc mo khoa hoc. Luc do videoUrl, content va documentUrl bi cat, chi con muc luc.",
      example: false,
    },
  },
};

const KhoaHoc = {
  type: "object",
  properties: {
    _id: idMongo,
    title: { type: "string", example: "Lập trình Web với React & Node.js" },
    slug: { type: "string", example: "lap-trinh-web-react-nodejs" },
    description: { type: "string" },
    thumbnail: { type: "string" },
    // 0 nghia la mien phi. Giao dien hien chu "Mien phi" khi price === 0.
    price: { type: "number", example: 799000, description: "Don vi VND. 0 la mien phi." },
    category: { oneOf: [idMongo, { $ref: "#/components/schemas/DanhMuc" }] },
    instructor: { oneOf: [idMongo, { $ref: "#/components/schemas/NguoiDung" }] },
    lessons: { type: "array", items: { $ref: "#/components/schemas/BaiHoc" } },
    tags: { type: "array", items: { type: "string" } },
    isPublished: {
      type: "boolean",
      description: "Chi tai khoan admin doi duoc co nay.",
      example: true,
    },
    createdAt: { type: "string", format: "date-time" },
  },
};

const TienDoBai = {
  type: "object",
  properties: {
    lesson: { oneOf: [idMongo, { $ref: "#/components/schemas/BaiHoc" }] },
    status: { type: "string", enum: ["not-started", "in-progress", "completed"] },
    watchTime: { type: "integer", description: "So giay da xem", example: 340 },
    completedAt: { type: "string", format: "date-time" },
  },
};

const GhiDanh = {
  type: "object",
  properties: {
    _id: idMongo,
    course: { oneOf: [idMongo, { $ref: "#/components/schemas/KhoaHoc" }] },
    student: idMongo,
    status: { type: "string", enum: ["active", "completed", "dropped"] },
    totalProgress: { type: "integer", example: 50 },
    lessonProgress: { type: "array", items: { $ref: "#/components/schemas/TienDoBai" } },
    enrolledAt: { type: "string", format: "date-time" },
  },
};

// Endpoint GET /api/enrollments/{courseId} luon tra 200, phan biet bang co
// isEnrolled chu khong tra 404 - nguoi goi phai kiem co nay truoc.
const GhiDanhTheoKhoa = {
  type: "object",
  properties: {
    isEnrolled: { type: "boolean", example: true },
    _id: idMongo,
    course: idMongo,
    lessonProgress: { type: "array", items: { $ref: "#/components/schemas/TienDoBai" } },
    totalProgress: { type: "integer", example: 50 },
  },
};

const ThongKeTienDo = {
  type: "object",
  properties: {
    progressPercentage: { type: "integer", example: 50 },
    completedLessons: { type: "integer", example: 3 },
    totalLessons: { type: "integer", example: 6 },
  },
};

const DonHang = {
  type: "object",
  properties: {
    _id: idMongo,
    code: { type: "string", example: "LP7K2M93" },
    course: { oneOf: [idMongo, { $ref: "#/components/schemas/KhoaHoc" }] },
    student: idMongo,
    amount: { type: "number", example: 799000 },
    status: { type: "string", enum: ["pending", "paid", "cancelled", "rejected"] },
    createdAt: { type: "string", format: "date-time" },
  },
};

const CauHoiTracNghiem = {
  type: "object",
  properties: {
    question: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    // Khong tra ve cho hoc vien truoc khi nop bai.
    correctIndex: { type: "integer", example: 2 },
  },
};

const BaiTracNghiem = {
  type: "object",
  properties: {
    _id: idMongo,
    course: idMongo,
    title: { type: "string", example: "Bài kiểm tra cuối khóa" },
    passingScore: { type: "integer", example: 70 },
    isPublished: { type: "boolean" },
    questions: { type: "array", items: { $ref: "#/components/schemas/CauHoiTracNghiem" } },
  },
};

const LuotLamBai = {
  type: "object",
  properties: {
    _id: idMongo,
    quiz: idMongo,
    student: idMongo,
    score: { type: "integer", example: 80 },
    passed: { type: "boolean", example: true, description: "score >= passingScore" },
    submittedAt: { type: "string", format: "date-time" },
  },
};

const ChungNhan = {
  type: "object",
  properties: {
    _id: idMongo,
    course: { oneOf: [idMongo, { $ref: "#/components/schemas/KhoaHoc" }] },
    student: { oneOf: [idMongo, { $ref: "#/components/schemas/NguoiDung" }] },
    certificateNumber: {
      type: "string",
      example: "LP-7K2M-93XA",
      description: "Ma duy nhat, tra cuu cong khai qua GET /api/certificates/verify/{code}.",
    },
    title: { type: "string" },
    issuedAt: { type: "string", format: "date-time" },
  },
};

const DanhGia = {
  type: "object",
  properties: {
    _id: idMongo,
    course: idMongo,
    user: { oneOf: [idMongo, { $ref: "#/components/schemas/NguoiDung" }] },
    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
    comment: { type: "string" },
    helpfulCount: { type: "integer", example: 3 },
    createdAt: { type: "string", format: "date-time" },
  },
};

const ThongKeDanhGia = {
  type: "object",
  properties: {
    averageRating: { type: "number", example: 4.6 },
    totalReviews: { type: "integer", example: 25 },
    distribution: {
      type: "object",
      additionalProperties: { type: "integer" },
      example: { 5: 18, 4: 5, 3: 1, 2: 1, 1: 0 },
    },
  },
};

const CauHoiThuongGap = {
  type: "object",
  properties: {
    _id: idMongo,
    question: { type: "string" },
    answer: { type: "string" },
    course: { ...idMongo, nullable: true, description: "Rong nghia la FAQ cua trang chu." },
    order: { type: "integer" },
  },
};

const BangQuangCao = {
  type: "object",
  properties: {
    _id: idMongo,
    title: { type: "string" },
    image: { type: "string" },
    link: { type: "string" },
    isActive: { type: "boolean" },
  },
};

const TaiLieu = {
  type: "object",
  properties: {
    _id: idMongo,
    title: { type: "string" },
    fileUrl: { type: "string" },
    filePublicId: { type: "string" },
    uploader: { oneOf: [idMongo, { $ref: "#/components/schemas/NguoiDung" }] },
    downloadCount: { type: "integer", example: 12 },
  },
};

const BaiViet = {
  type: "object",
  properties: {
    _id: idMongo,
    title: { type: "string" },
    slug: { type: "string" },
    topic: { type: "string" },
    content: {
      type: "string",
      description:
        "Van ban thuong hoac HTML da qua bo loc danh sach trang. Khong bao gio chua script hay thuoc tinh su kien.",
    },
    isPublished: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
};

const ThanhTich = {
  type: "object",
  properties: {
    _id: idMongo,
    user: idMongo,
    type: { type: "string", example: "first-course" },
    title: { type: "string" },
    earnedAt: { type: "string", format: "date-time" },
  },
};

module.exports = {
  Loi,
  NguoiDung,
  DanhMuc,
  DonVi,
  BaiHoc,
  KhoaHoc,
  TienDoBai,
  GhiDanh,
  GhiDanhTheoKhoa,
  ThongKeTienDo,
  DonHang,
  CauHoiTracNghiem,
  BaiTracNghiem,
  LuotLamBai,
  ChungNhan,
  DanhGia,
  ThongKeDanhGia,
  CauHoiThuongGap,
  BangQuangCao,
  TaiLieu,
  BaiViet,
  ThanhTich,
};
