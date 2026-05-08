const express = require('express');
const router = express.Router();
const { createCourse, getCourses } = require('../controllers/courseController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, createCourse); // Chỉ người đăng nhập mới tạo được

module.exports = router;