const express = require('express');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);

const {
    createCourse,
    getCourses,
    getInstructorCourses,
    getCourseById,
    getCourseBySlug,
    updateCourse,
    publishCourse, 
    deleteCourse,
    enrollInCourse,
    getHomeSections,
    // 🎯 THÊM: Import 3 hàm xử lý hiển thị danh sách cho Admin
    getAdminPopularCourses,
    getAdminTrendingCourses,
    getAdminNewReleasesCourses,
    suggestCourses,
    getRecentlyViewed,
} = require('../controllers/courseController');

const { protect, optionalUser, instructor, admin } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../utils/uploadCloud');
const { setCache, noStore } = require('../middlewares/cacheControl');

/* ==========================================================================
   1. ROUTE TĨNH (STATIC ROUTES) - Bắt buộc nằm trên cùng để tránh xung đột :id
   ========================================================================== */

// 🎯 THÊM: 3 Route lấy toàn bộ danh sách đổ vào view quản lý của Admin
// URL tạo thành: /api/courses/admin/courses/home-sections/... (Khớp chuẩn service FE của bạn)
// Ba duong nay tra ve email giang vien va chi ba man hinh quan tri goi den.
// Truoc day chi co `protect`: bat ky tai khoan hoc vien nao dang nhap cung lay
// duoc danh sach email do.
router.get('/admin/courses/home-sections/most-popular', protect, admin, getAdminPopularCourses);
router.get('/admin/courses/home-sections/trending-now', protect, admin, getAdminTrendingCourses);
router.get('/admin/courses/home-sections/new-releases', protect, admin, getAdminNewReleasesCourses);

// Lấy cấu trúc 3 mục trang chủ (Most Popular, Trending, New Releases) - Public cho học viên
router.get('/home-sections', setCache(120), getHomeSections);

// Lấy danh sách khóa học của Instructor/Admin đang đăng nhập
router.get('/instructor', protect, instructor, getInstructorCourses);

// Tìm khóa học thông qua link slug định dạng chữ viết liền
router.get('/slug/:slug', optionalUser, getCourseBySlug);

// Goi y khoa hoc tiep theo.
//
// PHAI nam trong khoi route tinh nay: de xuong duoi '/:id' thi Express coi
// 'goi-y' la mot ma khoa hoc va tra ve 404.
//
// optionalUser chu khong phai protect: khach vang lai van xem duoc muc goi
// y (ho nhan danh sach khoa pho bien), chi la khong duoc ca nhan hoa. Dat
// protect o day la mat mot muc noi dung o trang chu voi nguoi chua dang nhap -
// dung nhom nguoi minh muon thuyet phuc nhat.
//
// TUYET DOI KHONG gan setCache() vao duong nay, du no la GET va du no cham.
// Ghi chu dau middlewares/cacheControl.js da dat dieu kien: chi duoc dat cache
// khi phan hoi KHONG phu thuoc req.user. Phan hoi o day phu thuoc hoan toan -
// no loai bo khoa nguoi dung da mua va xep hang theo ghi danh cua ho. Voi
// 'public, s-maxage=60' thi CDN giu goi y cua mot nguoi roi tra cho nguoi tiep
// theo, tuc la lo ra nguoi truoc da mua nhung khoa nao.
router.get('/goi-y', noStore, optionalUser, suggestCourses);

// Lich su xem cua RIENG nguoi dang nhap - noStore, cung ly do voi /goi-y.
router.get('/da-xem', noStore, protect, getRecentlyViewed);


/* ==========================================================================
   2. ROUTE CƠ BẢN (BASE ROUTES)
   ========================================================================== */

router.route('/')
    .get(setCache(60), getCourses)                                                              
    .post(protect, instructor, uploadCloud.single('thumbnail'), createCourse);  


/* ==========================================================================
   3. ROUTE ĐIỀU KHIỂN ĐỘNG CỦA QUẢN TRỊ (ADMIN MANAGEMENT ROUTES)
   ========================================================================== */

// BỔ SUNG ROUTE PHÂN QUYỀN XUẤT BẢN CHO ADMIN 
router.put('/:id/publish', protect, publishCourse);


/* ==========================================================================
   4. ROUTE ĐỘNG THAM SỐ ID (DYNAMIC ID ROUTES)
   ========================================================================== */

router.route('/:id')
    .get(optionalUser, getCourseById)                                                                                             
    .put(protect, instructor, uploadCloud.single('thumbnail'), updateCourse)
    .delete(protect, instructor, deleteCourse);     

// Đăng ký học
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;