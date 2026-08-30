const express = require('express');
const router = express.Router();

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, instructor, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getCategories) // Public: Ai cũng xem được để chọn bộ lọc
    .post(protect, instructor, createCategory); // Private: Chỉ giảng viên/admin được tạo

// Sua/xoa danh muc: chi admin
router.route('/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;