const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middlewares/authMiddleware');
const { receiveBankCredit, listBankCredits } = require('../controllers/bankWebhookController');

// Webhook ngan hang - KHONG co protect.
//
// Ngan hang khong cam duoc cookie phien cua ai, nen khong the di qua protect.
// Danh tinh dua vao khoa bi mat trong header, kiem trong chinh controller
// (config/bankWebhook.js). Chua dat khoa thi controller tu choi tat ca -
// khong bao gio "chua cau hinh thi cho qua".
router.post('/webhook', receiveBankCredit);

// Nhat ky bao co cho quan tri doi chieu cac khoan chua khop.
router.get('/quan-tri/bao-co', protect, admin, listBankCredits);

module.exports = router;
