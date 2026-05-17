const express = require('express');
const router = express.Router();

const {
    createReview,
    getCourseReviews,
    getReviewById,
    updateReview,
    deleteReview,
    markHelpful,
    markUnhelpful,
    getReviewStats
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/reviews
// @desc    Tạo review mới
// @access  Private
router.post('/', protect, createReview);

// @route   GET /api/reviews/course/:courseId
// @desc    Lấy tất cả reviews của course
// @access  Public
router.get('/course/:courseId', getCourseReviews);

// @route   GET /api/reviews/stats/:courseId
// @desc    Lấy thống kê rating của course
// @access  Public
router.get('/stats/:courseId', getReviewStats);

// @route   GET /api/reviews/:id
// @desc    Lấy review theo ID
// @access  Public
router.get('/:id', getReviewById);

// @route   PUT /api/reviews/:id
// @desc    Cập nhật review
// @access  Private
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Xóa review
// @access  Private
router.delete('/:id', protect, deleteReview);

// @route   POST /api/reviews/:id/helpful
// @desc    Đánh dấu review hữu ích
// @access  Public
router.post('/:id/helpful', markHelpful);

// @route   POST /api/reviews/:id/unhelpful
// @desc    Đánh dấu review không hữu ích
// @access  Public
router.post('/:id/unhelpful', markUnhelpful);

module.exports = router;
