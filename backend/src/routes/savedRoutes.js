const express = require('express');
const router = express.Router();

const {
    layDaLuu,
    layIdDaLuu,
    luu,
    boLuu,
    nhapTuTrinhDuyet,
} = require('../controllers/savedController');
const { protect } = require('../middlewares/authMiddleware');
const { khongLuuCache } = require('../middlewares/cacheControl');

// Du lieu RIENG tung nguoi: bat buoc dang nhap va cam cache cho ca nhom -
// CDN luu danh sach cua nguoi nay roi phat cho nguoi khac la lo du lieu.
router.use(khongLuuCache, protect);

// @route   GET /api/da-luu
router.get('/', layDaLuu);
// @route   GET /api/da-luu/id
router.get('/id', layIdDaLuu);
// @route   POST /api/da-luu   { loai, id }
router.post('/', luu);
// @route   POST /api/da-luu/nhap   { duongDan: [] }
router.post('/nhap', nhapTuTrinhDuyet);
// @route   DELETE /api/da-luu/:loai/:id
router.delete('/:loai/:id', boLuu);

module.exports = router;
