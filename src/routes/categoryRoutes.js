const express = require('express');
const router = express.Router();

const { createCategory, getCategories } = require('../controllers/categoryController');
const { protect, instructor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getCategories) // Public: Ai cũng xem được để chọn bộ lọc
    .post(protect, instructor, createCategory); // Private: Chỉ giảng viên/admin được tạo

module.exports = router;