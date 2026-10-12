const express = require('express');
const router = express.Router();
const { streamVideo } = require('../controllers/videoStreamController');

// Khong di qua protect: protect tra CSDL moi request, ma moi doan video la mot
// request. Controller tu kiem ve phat + cookie (xem videoStreamController).
router.get('/:lessonId/:kind', streamVideo);

module.exports = router;
