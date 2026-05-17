const express = require('express');
const router = express.Router();

const {
    getMyEnrolledCourses,
    getEnrollmentByCourse,
    markLessonComplete,
    startLesson,
    updateWatchTime,
    getProgressStats,
    completeCourse,
    dropCourse,
    getCourseStudents
} = require('../controllers/enrollmentController');

const { protect, instructor } = require('../middlewares/authMiddleware');

// @route   GET /api/enrollments/my-courses
// @desc    Lấy tất cả khóa học của student
// @access  Private
router.get('/my-courses', protect, getMyEnrolledCourses);

// @route   GET /api/enrollments/course/:courseId
// @desc    Lấy chi tiết enrollment của 1 khóa học
// @access  Private
router.get('/course/:courseId', protect, getEnrollmentByCourse);

// @route   GET /api/enrollments/course/:courseId/progress
// @desc    Lấy thống kê tiến độ học
// @access  Private
router.get('/course/:courseId/progress', protect, getProgressStats);

// @route   GET /api/enrollments/course/:courseId/students
// @desc    Lấy danh sách students đăng ký (instructor only)
// @access  Private
router.get('/course/:courseId/students', protect, instructor, getCourseStudents);

// @route   PUT /api/enrollments/course/:courseId/start-lesson
// @desc    Bắt đầu học bài
// @access  Private
router.put('/course/:courseId/start-lesson', protect, startLesson);

// @route   PUT /api/enrollments/course/:courseId/update-watch-time
// @desc    Cập nhật thời gian xem video
// @access  Private
router.put('/course/:courseId/update-watch-time', protect, updateWatchTime);

// @route   PUT /api/enrollments/course/:courseId/complete-lesson
// @desc    Đánh dấu bài học là hoàn thành
// @access  Private
router.put('/course/:courseId/complete-lesson', protect, markLessonComplete);

// @route   PUT /api/enrollments/course/:courseId/complete-course
// @desc    Đánh dấu khóa học là hoàn thành
// @access  Private
router.put('/course/:courseId/complete-course', protect, completeCourse);

// @route   PUT /api/enrollments/course/:courseId/drop
// @desc    Hủy đăng ký khóa học
// @access  Private
router.put('/course/:courseId/drop', protect, dropCourse);

module.exports = router;
