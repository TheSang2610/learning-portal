const express = require('express');
const router = express.Router();

const {
    layDaLuu: getSaved,
    getSavedIds,
    luu: save,
    boLuu: unsave,
    importFromBrowser,
} = require('../controllers/savedController');
const { protect } = require('../middlewares/authMiddleware');
const { noStore } = require('../middlewares/cacheControl');

// Du lieu RIENG tung nguoi: bat buoc dang nhap va cam cache cho ca nhom -
// CDN luu danh sach cua nguoi nay roi phat cho nguoi khac la lo du lieu.
router.use(noStore, protect);

// @route   GET /api/da-luu
router.get('/', getSaved);
// @route   GET /api/da-luu/id
router.get('/id', getSavedIds);
// @route   POST /api/da-luu   { loai, id }
router.post('/', save);
// @route   POST /api/da-luu/nhap   { duongDan: [] }
router.post('/nhap', importFromBrowser);
// @route   DELETE /api/da-luu/:loai/:id
router.delete('/:loai/:id', unsave);

module.exports = router;
