const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { datCache } = require('../middlewares/cacheControl');

// Tao danh muc truoc day chi can quyen instructor, trong khi sua va xoa lai doi
// admin. Danh muc la phan loai dung chung cho ca trang: de moi giang vien them
// duoc ma khong don duoc thi danh sach loang ra, va nguoi don lai la admin.
// Toan bo giao dien goi cac ham nay cung nam trong khu /admin.
router.route('/')
    .get(datCache(300), getCategories) // Public: ai cũng xem được để chọn bộ lọc
    .post(protect, admin, createCategory);

router.route('/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;
