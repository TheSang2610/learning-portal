const express = require('express');
const router = express.Router();

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

// ========== CERTIFICATES ==========

// @route   POST /api/certificates
// @desc    Tạo chứng chỉ (auto-triggered)
// @access  Private
router.post('/', protect, createCertificate);

// @route   GET /api/certificates/my-certificates
// @desc    Lấy chứng chỉ của student
// @access  Private
router.get('/my-certificates', protect, getMyCertificates);

// @route   GET /api/certificates/:id
// @desc    Lấy chi tiết chứng chỉ
// @access  Public/Private
router.get('/:id', getCertificateById);

// @route   GET /api/certificates/verify/:code
// @desc    Verify chứng chỉ
// @access  Public
router.get('/verify/:code', verifyCertificate);

// @route   PUT /api/certificates/:id
// @desc    Cập nhật chứng chỉ (public/private)
// @access  Private
router.put('/:id', protect, updateCertificate);

// @route   GET /api/certificates/user/:userId
// @desc    Lấy chứng chỉ công khai của user
// @access  Public
router.get('/user/:userId', getUserPublicCertificates);

// ========== ACHIEVEMENTS ==========

// @route   GET /api/achievements/my-achievements
// @desc    Lấy achievements của student
// @access  Private
router.get('/achievements/my-achievements', protect, getMyAchievements);

// @route   GET /api/achievements/user/:userId
// @desc    Lấy achievements công khai của user
// @access  Public
router.get('/achievements/user/:userId', getUserPublicAchievements);

// @route   GET /api/achievements/leaderboard
// @desc    Lấy leaderboard theo points
// @access  Public
router.get('/achievements/leaderboard', getLeaderboard);

module.exports = router;
