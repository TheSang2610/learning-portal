const express = require('express');
const router = express.Router();

const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    enrollInCourse
} = require('../controllers/courseController');

const { protect, instructor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, instructor, createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, instructor, updateCourse);

router.route('/:id/enroll')
    .post(protect, enrollInCourse);

module.exports = router;