const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    getMyEnrolledCourses,
    getEnrollmentByCourse,
    markLessonComplete,
    startLesson,
    updateWatchTime,
    getProgressStats,
    completeCourse,
    enrollInCourse,
    dropCourse,
    getCourseStudents
} = require('../controllers/enrollmentController');

const { protect } = require('../middlewares/authMiddleware');

// Tất cả các route dưới đây đều yêu cầu đăng nhập
router.use(protect);

// 1. Các route dạng tĩnh (Static) phải đưa lên ĐẦU để tránh bị trùng với param :courseId
router.get('/my-courses', getMyEnrolledCourses);

// 2. Các route thao tác theo courseId cụ thể (Dynamic)
router.route('/:courseId')
    .get(getEnrollmentByCourse) // Lấy chi tiết đăng ký
    .post(enrollInCourse);

router.route('/:courseId/progress')
    .get(getProgressStats); // Lấy thống kê tiến độ

router.route('/:courseId/students')
    .get(getCourseStudents); // Lấy danh sách học viên (Logic check chính chủ instructor nằm trong controller)

// 3. Các hành động thay đổi trạng thái học tập (PUT)
router.put('/:courseId/start-lesson', startLesson);
router.put('/:courseId/update-watch-time', updateWatchTime);
router.put('/:courseId/complete-lesson', markLessonComplete);
router.put('/:courseId/complete-course', completeCourse);
router.put('/:courseId/drop', dropCourse);

module.exports = router;