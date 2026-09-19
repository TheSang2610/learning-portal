const express = require('express');
const router = express.Router();

const {
    kiemMa,
    danhSachMa,
    taoMa,
    suaMa,
    batTatMa,
    luotDungCuaMa,
} = require('../controllers/maGiamGiaController');

const { protect, admin } = require('../middlewares/authMiddleware');

// @route   POST /api/ma-giam-gia/kiem
// @desc    Kiem ma truoc khi thanh toan (KHONG tru luot nao)
//
// `protect` chu khong mo cho khach: phep kiem co nhanh "moi nguoi mot lan" nen
// phai biet nguoi goi la ai. Va mo cho khach la bien duong nay thanh mot cai
// may do ma - ai cung goi lien tuc de tim ra ma nao con song.
router.post('/kiem', protect, kiemMa);

/* ==========================================================================
   QUAN TRI - tu day tro xuong chi admin
   ========================================================================== */

// Dat protect + admin mot lan cho ca nhom thay vi lap o tung dong: lap thi som
// muon co mot dong thieu, va dong do la mot duong cho bat ky ai sua ma giam gia.
router.use('/quan-tri', protect, admin);

router.get('/quan-tri', danhSachMa);
router.post('/quan-tri', taoMa);
router.get('/quan-tri/:id/luot-dung', luotDungCuaMa);
router.put('/quan-tri/:id/bat-tat', batTatMa);
router.put('/quan-tri/:id', suaMa);

module.exports = router;
