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

// --------------------------------------------------------------------------
// Hoc vien - chi cham vao vi CUA CHINH MINH.
//
// Khong co duong nao nhan :id o day. Neu co, mot tai khoan thuong doi so id la
// doc duoc vi nguoi khac. Muon xem vi nguoi khac thi phai di duong quan tri
// ben duoi, va duong do co `admin` chan.
// --------------------------------------------------------------------------
router.get('/cua-toi', protect, xemViCuaToi);
router.post('/mua/:courseId', protect, muaBangCoin);

// --------------------------------------------------------------------------
// Quan tri.
//
// Dat `admin` o TUNG duong chu khong dung router.use(): mot duong moi them vao
// duoi ma quen middleware thi loi im lang - khong ai chan, va cung khong ai
// bao. De ngay tren tung dong thi thieu la nhin ra ngay.
// --------------------------------------------------------------------------
router.get('/quan-tri/:id', protect, admin, xemViHocVien);
router.post('/quan-tri/:id', protect, admin, napCoinChoHocVien);
router.post('/quan-tri/:id/tang-khoa', protect, admin, tangKhoaChoHocVien);

module.exports = router;
