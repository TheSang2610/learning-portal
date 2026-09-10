const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

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

const { protect, admin } = require('../middlewares/authMiddleware');

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
// Lấy toàn bộ reviews hệ thống dành cho Admin.
// Trả về email của mọi học viên nên BẮT BUỘC phải qua protect + admin.
// @route   GET /api/reviews/admin/all
// ==========================================================================
router.get('/admin/all', protect, admin, getAllReviewsForAdmin);

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