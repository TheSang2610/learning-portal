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
    enrollInCourse
} = require('../controllers/courseController');

const { protect, instructor } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../utils/uploadCloud');

// Route cơ bản cho danh sách khóa học
router.route('/')
    .get(getCourses)                               
    .post(protect, instructor, uploadCloud.single('thumbnail'), createCourse);  
    
router.get('/instructor', protect, instructor, getInstructorCourses);

router.get('/slug/:slug', getCourseBySlug);

// 2. 🔥 BỔ SUNG ROUTE PHÂN QUYỀN XUẤT BẢN CHO ADMIN
// Endpoint này nhận req.body dạng JSON nhẹ: { "isPublished": true/false }
router.put('/:id/publish', protect, publishCourse);

router.route('/:id')
    .get(getCourseById)                                             
    .put(protect, instructor, uploadCloud.single('thumbnail'), updateCourse)
    .delete(protect, instructor, deleteCourse);     

// Đăng ký học
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;