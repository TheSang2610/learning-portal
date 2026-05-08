const express = require('express');
const router = express.Router();

const {
    createCourse,
    getCourses
} = require('../controllers/courseController');

const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, createCourse);

module.exports = router;