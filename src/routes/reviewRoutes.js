const express = require('express');
const router = express.Router();

const {
    createReview,
    getCourseReviews,
    getAllReviewsForAdmin, // 🔥 Import hàm controller mới vừa viết
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
router.post('/', protect, createReview);

// @route   GET /api/reviews/course/:courseId
// @desc    Lấy tất cả reviews của course
router.get('/course/:courseId', getCourseReviews);

// @route   GET /api/reviews/stats/:courseId
// @desc    Lấy thống kê rating của course
router.get('/stats/:courseId', getReviewStats);

// ==========================================================================
// 🔥 ROUTE MỚI: Lấy toàn bộ reviews hệ thống dành cho Admin (Không bọc protect)
// @route   GET /api/reviews/admin/all
// ==========================================================================
router.get('/admin/all', getAllReviewsForAdmin);

// @route   GET /api/reviews/:id
// @desc    Lấy review theo ID
router.get('/:id', getReviewById);

// @route   PUT /api/reviews/:id
// @desc    Cập nhật review
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Xóa review
router.delete('/:id', protect, deleteReview);

// @route   POST /api/reviews/:id/helpful
// @desc    Đánh dấu review hữu ích
router.post('/:id/helpful', markHelpful);

// @route   POST /api/reviews/:id/unhelpful
// @desc    Đánh dấu review không hữu ích
router.post('/:id/unhelpful', markUnhelpful);

module.exports = router;