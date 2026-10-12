const express = require('express');
const router = express.Router();

const {
    getNotifications,
    countUnread,
    markAsRead,
    markAllAsRead,
    sendSystemNotification,
} = require('../controllers/notificationController');

const { protect, admin } = require('../middlewares/authMiddleware');

// KHONG co duong nao mo cho khach o day. Thong bao luon la cua mot nguoi cu
// the, va moi ham trong controller deu loc theo req.user._id - bo `protect` o
// bat ky dong nao la req.user thanh undefined va truy van loc theo undefined.

// @route   GET /api/thong-bao
// @desc    Danh sach thong bao cua chinh minh, moi nhat truoc
router.get('/', protect, getNotifications);

// @route   POST /api/thong-bao/quan-tri/gui
// @desc    Gui thong bao he thong cho nhieu nguoi
//
// Dat TRUOC '/:id/doc' cho chac, du POST va PUT khong dung nhau: them mot dong
// PUT '/quan-tri/...' sau nay ma quen thu tu la mot loi kho tim.
router.post('/quan-tri/gui', protect, admin, sendSystemNotification);

// @route   GET /api/thong-bao/chua-doc
// @desc    Dem so chua doc cho cham do tren chuong
router.get('/chua-doc', protect, countUnread);

// @route   PUT /api/thong-bao/doc-het
// @desc    Danh dau tat ca da doc
//
// Dat TRUOC '/:id/doc' la co chu dich - neu de sau thi 'doc-het' se bi '/:id'
// nuot mat va Express coi 'doc-het' la mot ma thong bao.
router.put('/doc-het', protect, markAllAsRead);

// @route   PUT /api/thong-bao/:id/doc
// @desc    Danh dau mot thong bao da doc
router.put('/:id/doc', protect, markAsRead);

module.exports = router;
