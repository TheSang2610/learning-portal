const express = require('express');
const router = express.Router();

const {
    layGhiChu,
    themGhiChu,
    suaGhiChu,
    xoaGhiChu,
    ghiChuCuaToi,
} = require('../controllers/noteController');

const { protect } = require('../middlewares/authMiddleware');

// Toan bo nhom nay la du lieu RIENG cua tung nguoi, khong co duong nao mo cho
// khach. Moi ham trong controller deu loc them `user: req.user._id`, nen bo
// `protect` o mot dong la truy van loc theo `undefined`.
router.use(protect);

// @route   GET /api/ghi-chu/cua-toi
// @desc    Tat ca ghi chu cua toi (man hinh tong hop)
//
// Dat TRUOC '/:id' - de sau thi Express coi 'cua-toi' la mot ma ghi chu.
router.get('/cua-toi', ghiChuCuaToi);

// @route   GET /api/ghi-chu?courseId=...&lessonId=...
// @desc    Ghi chu cua toi trong mot bai
router.get('/', layGhiChu);

// @route   POST /api/ghi-chu
router.post('/', themGhiChu);

// @route   PUT /api/ghi-chu/:id
router.put('/:id', suaGhiChu);

// @route   DELETE /api/ghi-chu/:id
router.delete('/:id', xoaGhiChu);

module.exports = router;
