const express = require('express');
const router = express.Router();

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

const { protect, instructor } = require('../middlewares/authMiddleware');
// Mẹo: Nếu bạn có middleware riêng để check admin (ví dụ: admin), hãy import vào đây. 
// Nếu chưa có, tạm thời dùng 'protect' để check đăng nhập nhé.
const { uploadCloud } = require('../utils/uploadCloud');

/* ==========================================================================
   1. ROUTE TĨNH (STATIC ROUTES) - Bắt buộc nằm trên cùng để tránh xung đột :id
   ========================================================================== */

// 🎯 THÊM: 3 Route lấy toàn bộ danh sách đổ vào view quản lý của Admin
// URL tạo thành: /api/courses/admin/courses/home-sections/... (Khớp chuẩn service FE của bạn)
router.get('/admin/courses/home-sections/most-popular', protect, getAdminPopularCourses);
router.get('/admin/courses/home-sections/trending-now', protect, getAdminTrendingCourses);
router.get('/admin/courses/home-sections/new-releases', protect, getAdminNewReleasesCourses);

// Lấy cấu trúc 3 mục trang chủ (Most Popular, Trending, New Releases) - Public cho học viên
router.get('/home-sections', getHomeSections);

// Lấy danh sách khóa học của Instructor/Admin đang đăng nhập
router.get('/instructor', protect, instructor, getInstructorCourses);

// Tìm khóa học thông qua link slug định dạng chữ viết liền
router.get('/slug/:slug', getCourseBySlug);


/* ==========================================================================
   2. ROUTE CƠ BẢN (BASE ROUTES)
   ========================================================================== */

router.route('/')
    .get(getCourses)                                                              
    .post(protect, instructor, uploadCloud.single('thumbnail'), createCourse);  


/* ==========================================================================
   3. ROUTE ĐIỀU KHIỂN ĐỘNG CỦA QUẢN TRỊ (ADMIN MANAGEMENT ROUTES)
   ========================================================================== */

// BỔ SUNG ROUTE PHÂN QUYỀN XUẤT BẢN CHO ADMIN 
router.put('/:id/publish', protect, publishCourse);

// API cập nhật nhãn điều khiển trang chủ dành riêng cho Admin (Bật/Tắt Popular, Trending, New)
router.patch('/:id/tags', updateCourseTags);


/* ==========================================================================
   4. ROUTE ĐỘNG THAM SỐ ID (DYNAMIC ID ROUTES)
   ========================================================================== */

router.route('/:id')
    .get(getCourseById)                                                                                             
    .put(protect, instructor, uploadCloud.single('thumbnail'), updateCourse)
    .delete(protect, instructor, deleteCourse);     

// Đăng ký học
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;