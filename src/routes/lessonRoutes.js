const express = require('express');
const router = express.Router();
const { uploadLessonFiles } = require('../utils/uploadCloud');
const { addLesson, getLessonById, getLessonBySlug, updateLesson } = require('../controllers/lessonController');

const { protect, instructor } = require('../middlewares/authMiddleware');

router.get('/course/:courseSlug/lesson/:lessonSlug', protect, getLessonBySlug);
router.get('/:id', protect, getLessonById);
router.put('/:id', protect, instructor, uploadLessonFiles, updateLesson);

module.exports = router;