const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
capIdHopLe(router);
const { uploadLessonFiles } = require('../utils/uploadCloud');
const { 
    addLesson, 
    getLessonById, 
    getLessonBySlug, 
    updateLesson,
    deleteLesson,
    layChuKyVideo
} = require('../controllers/lessonController');

const { protect, instructor } = require('../middlewares/authMiddleware');


router.get('/course/:courseSlug/lesson/:lessonSlug', protect, getLessonBySlug);

// Tuyến đường cho ID cụ thể
router.route('/:id')
    .get(protect, getLessonById)
    .put(protect, instructor, uploadLessonFiles, updateLesson)
    .delete(protect, instructor, deleteLesson); 

router.post('/', protect, instructor, uploadLessonFiles, addLesson);

// Chu ky de trinh duyet upload video thang len kho kin - xem utils/privateVideo.js.
router.post('/chu-ky-video', protect, instructor, layChuKyVideo);

module.exports = router;