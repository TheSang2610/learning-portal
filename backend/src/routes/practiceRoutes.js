const express = require('express');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);

const { saveAttempt, attemptHistory, attemptDetail } = require('../controllers/practiceController');

const { protect } = require('../middlewares/authMiddleware');

// Lich su lam bai la du lieu rieng cua tung nguoi, khong co duong nao cho khach.
router.use(protect);

// @route   POST /api/luyen-tap/bai-lam
router.post('/bai-lam', saveAttempt);

// @route   GET /api/luyen-tap/bai-lam?deId=...
router.get('/bai-lam', attemptHistory);

// @route   GET /api/luyen-tap/bai-lam/:id
router.get('/bai-lam/:id', attemptDetail);

module.exports = router;
