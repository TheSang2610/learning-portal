const express = require('express');
const router = express.Router();

const {
    createQuiz,
    getCourseQuizzes,
    getQuizById,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptResult,
    getQuizAttempts,
    getQuizStats
} = require('../controllers/quizController');

const { protect, instructor } = require('../middlewares/authMiddleware');

// @route   POST /api/quizzes
// @desc    Tạo quiz mới (instructor only)
// @access  Private
router.post('/', protect, instructor, createQuiz);

// @route   GET /api/quizzes/course/:courseId
// @desc    Lấy tất cả quizzes của course
// @access  Public
router.get('/course/:courseId', getCourseQuizzes);

// @route   GET /api/quizzes/:id/stats
// @desc    Lấy thống kê (instructor only)
// @access  Private
router.get('/:id/stats', protect, instructor, getQuizStats);

// @route   GET /api/quizzes/:id
// @desc    Lấy chi tiết quiz
// @access  Public
router.get('/:id', getQuizById);

// @route   GET /api/quizzes/:id/attempts
// @desc    Lấy tất cả attempts của student
// @access  Private
router.get('/:id/attempts', protect, getQuizAttempts);

// @route   GET /api/quizzes/:id/attempt/:attemptId
// @desc    Lấy kết quả quiz attempt
// @access  Private
router.get('/:id/attempt/:attemptId', protect, getQuizAttemptResult);

// @route   PUT /api/quizzes/:id
// @desc    Cập nhật quiz (instructor only)
// @access  Private
router.put('/:id', protect, instructor, updateQuiz);

// @route   PUT /api/quizzes/:id/publish
// @desc    Publish/Unpublish quiz (instructor only)
// @access  Private
router.put('/:id/publish', protect, instructor, publishQuiz);

// @route   DELETE /api/quizzes/:id
// @desc    Xóa quiz (instructor only)
// @access  Private
router.delete('/:id', protect, instructor, deleteQuiz);

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz attempt (student)
// @access  Private
router.post('/:id/submit', protect, submitQuizAttempt);

module.exports = router;
