const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    createOrder,
    getOrderByCode,
    getMyOrders,
    cancelOrder,
    baoDaChuyenKhoan
} = require('../controllers/orderController');

const { protect } = require('../middlewares/authMiddleware');

// Moi duong o day deu can dang nhap: don hang gan voi mot nguoi cu the.
router.use(protect);

// @route   GET /api/orders/my
// @desc    Danh sach don cua chinh minh
//
// PHAI dat TRUOC '/:code'. Neu khong, Express khop '/my' vao '/:code' va
// coi "my" la ma don - tra 404 cho mot duong hoan toan hop le.
router.get('/my', getMyOrders);

// @route   POST /api/orders
// @desc    Tao don cho mot khoa hoc co phi
router.post('/', createOrder);

// @route   GET /api/orders/:code
// @desc    Xem don theo ma, dung cho trang thanh toan
router.get('/:code', getOrderByCode);

// @route   PUT /api/orders/:code/cancel
// @desc    Huy don cua chinh minh
router.put('/:code/cancel', cancelOrder);

// @route   PUT /api/orders/:code/da-chuyen
// @desc    Hoc vien bao da chuyen khoan -> gui mail cho quan tri doi chieu
router.put('/:code/da-chuyen', baoDaChuyenKhoan);

module.exports = router;
