const express = require('express');
const router = express.Router();

const {
    createCourse,
    getCourses,
    getCourseById,
    getCourseBySlug,
    updateCourse,
    enrollInCourse
} = require('../controllers/courseController');

const { protect, instructor } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../utils/uploadCloud');

// Route cơ bản cho danh sách khóa học
router.route('/')
    .get(getCourses)                               
    .post(protect, instructor, uploadCloud.single('thumbnail'), createCourse);       
router.get('/slug/:slug', getCourseBySlug);
router.route('/:id')
    .get(getCourseById)                             
    .put(protect, instructor, uploadCloud.single('thumbnail'), updateCourse);        
// Đăng ký học
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;