const express = require('express');
const router = express.Router();
const { addLesson } = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addLesson);

module.exports = router;