const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);
const { uploadLessonFiles } = require('../utils/uploadCloud');
const { 
    addLesson, 
    getLessonById, 
    getLessonBySlug, 
    updateLesson,
    deleteLesson 
} = require('../controllers/lessonController');

const { protect, instructor } = require('../middlewares/authMiddleware');


router.get('/course/:courseSlug/lesson/:lessonSlug', protect, getLessonBySlug);

// Tuyến đường cho ID cụ thể
router.route('/:id')
    .get(protect, getLessonById)
    .put(protect, instructor, uploadLessonFiles, updateLesson)
    .delete(protect, instructor, deleteLesson); 

router.post('/', protect, instructor, uploadLessonFiles, addLesson); 

module.exports = router;