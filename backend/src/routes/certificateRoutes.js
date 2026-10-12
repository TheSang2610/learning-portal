const express = require('express');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);

const {
    createCertificate,
    getMyCertificates,
    getCertificateById,
    downloadCertificatePdf,
    verifyCertificate,
    updateCertificate,
    getUserPublicCertificates,
    getMyAchievements,
    getUserPublicAchievements,
    getLeaderboard
} = require('../controllers/certificateController');

const { protect, optionalUser } = require('../middlewares/authMiddleware');

// 🔥 ĐỘT TIÊN: Routes không có params hoặc params cụ thể
router.post('/', protect, createCertificate);

router.get('/achievements/leaderboard', getLeaderboard);

router.get('/my-certificates', protect, getMyCertificates);

router.get('/achievements/my-achievements', protect, getMyAchievements);

// 🔥 CUỐI CÙNG: Routes có params :id hoặc :code
router.get('/verify/:code', verifyCertificate);

router.get('/user/:userId', getUserPublicCertificates);

router.get('/achievements/user/:userId', getUserPublicAchievements);

// optionalUser chu khong phai protect: chung nhan de cong khai thi nguoi
// tuyen dung khong co tai khoan van mo xem duoc. Chung nhan rieng tu van bi
// controller chan - no doi dung chu hoac quan tri.
router.get('/:id/pdf', optionalUser, downloadCertificatePdf);

router.put('/:id', protect, updateCertificate);

router.get('/:id', getCertificateById);

module.exports = router;