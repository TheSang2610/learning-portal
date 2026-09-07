const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    createCertificate,
    getMyCertificates,
    getCertificateById,
    verifyCertificate,
    updateCertificate,
    getUserPublicCertificates,
    getMyAchievements,
    getUserPublicAchievements,
    getLeaderboard
} = require('../controllers/certificateController');

const { protect } = require('../middlewares/authMiddleware');

// 🔥 ĐỘT TIÊN: Routes không có params hoặc params cụ thể
router.post('/', protect, createCertificate);

router.get('/achievements/leaderboard', getLeaderboard);

router.get('/my-certificates', protect, getMyCertificates);

router.get('/achievements/my-achievements', protect, getMyAchievements);

// 🔥 CUỐI CÙNG: Routes có params :id hoặc :code
router.get('/verify/:code', verifyCertificate);

router.get('/user/:userId', getUserPublicCertificates);

router.get('/achievements/user/:userId', getUserPublicAchievements);

router.put('/:id', protect, updateCertificate);

router.get('/:id', getCertificateById);

module.exports = router;