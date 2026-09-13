const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middlewares/authMiddleware');
const {
    napCoinChoHocVien,
    tangKhoaChoHocVien,
    xemViHocVien,
    xemViCuaToi,
    muaBangCoin
} = require('../controllers/coinController');
const {
    taoYeuCauNap,
    yeuCauDangCho,
    layYeuCauTheoMa,
    huyYeuCauNap,
    baoDaChuyenNap,
    danhSachYeuCauNap,
    xacNhanYeuCauNap,
    tuChoiYeuCauNap
} = require('../controllers/coinNapController');

// --------------------------------------------------------------------------
// Hoc vien - chi cham vao vi CUA CHINH MINH.
//
// Khong co duong nao nhan :id o day. Neu co, mot tai khoan thuong doi so id la
// doc duoc vi nguoi khac. Muon xem vi nguoi khac thi phai di duong quan tri
// ben duoi, va duong do co `admin` chan.
// --------------------------------------------------------------------------
router.get('/cua-toi', protect, xemViCuaToi);
router.post('/mua/:courseId', protect, muaBangCoin);

// Nap coin. `dang-cho` phai dat TRUOC `:code`, khong thi Express coi chuoi
// "dang-cho" la mot ma yeu cau va luon tra 404.
router.post('/nap', protect, taoYeuCauNap);
router.get('/nap/dang-cho', protect, yeuCauDangCho);
router.get('/nap/:code', protect, layYeuCauTheoMa);
router.put('/nap/:code/huy', protect, huyYeuCauNap);
router.put('/nap/:code/da-chuyen', protect, baoDaChuyenNap);

// --------------------------------------------------------------------------
// Quan tri.
//
// Dat `admin` o TUNG duong chu khong dung router.use(): mot duong moi them vao
// duoi ma quen middleware thi loi im lang - khong ai chan, va cung khong ai
// bao. De ngay tren tung dong thi thieu la nhin ra ngay.
// --------------------------------------------------------------------------
// Ba duong nap nay phai dat TRUOC '/quan-tri/:id': dat sau thi Express khop
// '/quan-tri/nap' vao ':id' va di goi xemViHocVien voi id = "nap".
router.get('/quan-tri/nap', protect, admin, danhSachYeuCauNap);
router.put('/quan-tri/nap/:code/confirm', protect, admin, xacNhanYeuCauNap);
router.put('/quan-tri/nap/:code/huy', protect, admin, tuChoiYeuCauNap);

router.get('/quan-tri/:id', protect, admin, xemViHocVien);
router.post('/quan-tri/:id', protect, admin, napCoinChoHocVien);
router.post('/quan-tri/:id/tang-khoa', protect, admin, tangKhoaChoHocVien);

module.exports = router;
