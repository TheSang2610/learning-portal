const express = require('express');
const router = express.Router();
const { addLesson } = require('../controllers/lessonController');
const { protect, instructor } = require('../middlewares/authMiddleware');

router.post('/', protect, instructor, addLesson);

module.exports = router;