const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

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
    allowStudentRetry,
    getQuizStats
} = require('../controllers/quizController');

const { protect, instructor } = require('../middlewares/authMiddleware');

// Khóa học & Đề thi cần định danh người xem để xử lý ẩn/hiện đáp án đúng cấu hình
router.use(protect); 

// @route    POST /api/quizzes
router.post('/', instructor, createQuiz);

// @route    GET /api/quizzes/course/:courseId
router.get('/course/:courseId', getCourseQuizzes);

// @route    GET /api/quizzes/:id/stats
router.get('/:id/stats', instructor, getQuizStats);

// @route    GET /api/quizzes/:id
router.get('/:id', getQuizById);

// @route    GET /api/quizzes/:id/attempts
router.get('/:id/attempts', getQuizAttempts);

// @route    GET /api/quizzes/:id/attempt/:attemptId
router.get('/:id/attempt/:attemptId', getQuizAttemptResult);

// @route    PUT /api/quizzes/:id
router.put('/:id', instructor, updateQuiz);

// @route    PUT /api/quizzes/:id/publish
router.put('/:id/publish', instructor, publishQuiz);

router.put('/:id/allow-retry/:studentId', instructor, allowStudentRetry);

// @route    DELETE /api/quizzes/:id
router.delete('/:id', instructor, deleteQuiz);

// @route    POST /api/quizzes/:id/submit
router.post('/:id/submit', submitQuizAttempt);

module.exports = router;