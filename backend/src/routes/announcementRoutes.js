const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
capIdHopLe(router);

const {
    layThongBaoChung,
    layTatCaQuanTri,
    taoThongBaoChung,
    suaThongBaoChung,
    xoaThongBaoChung,
} = require('../controllers/announcementController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { datCache, khongLuuCache } = require('../middlewares/cacheControl');

// @route   GET /api/thong-bao-chung
// @desc    Thong bao cong khai dang hien - KHONG can dang nhap
//
// Gan datCache duoc vi: phan hoi giong nhau voi moi nguoi (khong doc req.user)
// va ham chi doc, khong ghi gi. Dat 15 giay cho ngan: quan tri go mot thong bao
// sai thi khach van co the thay no them mot chut, khong nen de lau.
router.get('/', datCache(15), layThongBaoChung);

// Cac duong quan tri: dat TRUOC '/:id' bat ky nao them sau nay, de chu
// 'quan-tri' khong bi hieu la mot id.

// @route   GET /api/thong-bao-chung/quan-tri
router.get('/quan-tri', khongLuuCache, protect, admin, layTatCaQuanTri);

// @route   POST /api/thong-bao-chung/quan-tri
router.post('/quan-tri', protect, admin, taoThongBaoChung);

// @route   PUT /api/thong-bao-chung/quan-tri/:id
// @desc    Sua noi dung / bat tat dai dau trang; cap nhat ca trong chuong
router.put('/quan-tri/:id', protect, admin, suaThongBaoChung);

// @route   DELETE /api/thong-bao-chung/quan-tri/:id
// @desc    Thu hoi: xoa khoi dai dau trang va khoi chuong cua moi nguoi nhan
router.delete('/quan-tri/:id', protect, admin, xoaThongBaoChung);

module.exports = router;
