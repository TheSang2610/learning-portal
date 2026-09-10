const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

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
    updateCourseTags,
    // 🎯 THÊM: Import 3 hàm xử lý hiển thị danh sách cho Admin
    getAdminPopularCourses,
    getAdminTrendingCourses,
    getAdminNewReleasesCourses
} = require('../controllers/courseController');

const { protect, docNguoiDungNeuCo, instructor, admin } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../utils/uploadCloud');
const { datCache } = require('../middlewares/cacheControl');

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
router.get('/home-sections', datCache(120), getHomeSections);

// Lấy danh sách khóa học của Instructor/Admin đang đăng nhập
router.get('/instructor', protect, instructor, getInstructorCourses);

// Tìm khóa học thông qua link slug định dạng chữ viết liền
router.get('/slug/:slug', docNguoiDungNeuCo, getCourseBySlug);


/* ==========================================================================
   2. ROUTE CƠ BẢN (BASE ROUTES)
   ========================================================================== */

router.route('/')
    .get(datCache(60), getCourses)                                                              
    .post(protect, instructor, uploadCloud.single('thumbnail'), createCourse);  


/* ==========================================================================
   3. ROUTE ĐIỀU KHIỂN ĐỘNG CỦA QUẢN TRỊ (ADMIN MANAGEMENT ROUTES)
   ========================================================================== */

// BỔ SUNG ROUTE PHÂN QUYỀN XUẤT BẢN CHO ADMIN 
router.put('/:id/publish', protect, publishCourse);

// API cập nhật nhãn điều khiển trang chủ dành riêng cho Admin (Bật/Tắt Popular, Trending, New)
router.patch('/:id/tags', protect, admin, updateCourseTags);


/* ==========================================================================
   4. ROUTE ĐỘNG THAM SỐ ID (DYNAMIC ID ROUTES)
   ========================================================================== */

router.route('/:id')
    .get(docNguoiDungNeuCo, getCourseById)                                                                                             
    .put(protect, instructor, uploadCloud.single('thumbnail'), updateCourse)
    .delete(protect, instructor, deleteCourse);     

// Đăng ký học
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;