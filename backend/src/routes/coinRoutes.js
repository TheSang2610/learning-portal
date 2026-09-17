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
    layYeuCauTheoMa,
    huyYeuCauNap,
    baoDaChuyenNap,
    danhSachYeuCauNap,
    xacNhanYeuCauNap,
    tuChoiYeuCauNap
} = require('../controllers/coinNapController');
const {
    nhanBaoCoNganHang,
    danhSachBaoCo
} = require('../controllers/webhookNganHangController');

// --------------------------------------------------------------------------
// Webhook ngan hang - KHONG co protect.
//
// Ngan hang khong cam duoc cookie phien cua ai, nen khong the di qua protect.
// Danh tinh dua vao khoa bi mat trong header, kiem trong chinh controller
// (config/webhookNganHang.js). Chua dat khoa thi controller tu choi tat ca -
// khong bao gio "chua cau hinh thi cho qua".
//
// Dat TRUOC moi duong khac de khoi bi cac mau ':code' ben duoi nuot mat.
// --------------------------------------------------------------------------
router.post('/webhook/ngan-hang', nhanBaoCoNganHang);

// --------------------------------------------------------------------------
// Hoc vien - chi cham vao vi CUA CHINH MINH.
//
// Khong co duong nao nhan :id o day. Neu co, mot tai khoan thuong doi so id la
// doc duoc vi nguoi khac. Muon xem vi nguoi khac thi phai di duong quan tri
// ben duoi, va duong do co `admin` chan.
// --------------------------------------------------------------------------
router.get('/cua-toi', protect, xemViCuaToi);
router.post('/mua/:courseId', protect, muaBangCoin);

// Nap coin.
router.post('/nap', protect, taoYeuCauNap);
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
router.get('/quan-tri/bao-co', protect, admin, danhSachBaoCo);
router.get('/quan-tri/nap', protect, admin, danhSachYeuCauNap);
router.put('/quan-tri/nap/:code/confirm', protect, admin, xacNhanYeuCauNap);
router.put('/quan-tri/nap/:code/huy', protect, admin, tuChoiYeuCauNap);

router.get('/quan-tri/:id', protect, admin, xemViHocVien);
router.post('/quan-tri/:id', protect, admin, napCoinChoHocVien);
router.post('/quan-tri/:id/tang-khoa', protect, admin, tangKhoaChoHocVien);

module.exports = router;
