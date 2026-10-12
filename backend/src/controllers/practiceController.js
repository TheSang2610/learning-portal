/**
 * Lich su lam bai luyen tap (trang /practice).
 *
 * Du lieu RIENG cua tung nguoi: moi truy van deu loc `user: req.user._id`.
 * Thieu bo loc do la ai cung doc duoc bai lam cua nguoi khac chi bang cach
 * doan ma bai.
 */

const PracticeAttempt = require('../models/PracticeAttempt');
const { normalizeAttempt } = require('../utils/practiceAttempt');

// Moi de chi tra ve chung nay lan gan nhat - lich su dai hon khong ai cuon het,
// ma tra het thi mot tai khoan lam hang tram lan se keo ca danh sach nang.
const VISIBLE_ATTEMPTS = 30;

// @desc    Luu mot lan lam bai
// @route   POST /api/luyen-tap/bai-lam
// @access  da dang nhap
const saveAttempt = async (req, res) => {
    try {
        const outcome = normalizeAttempt(req.body);
        if (outcome.loi) return res.status(400).json({ message: outcome.loi });

        const lesson = await PracticeAttempt.create({ ...outcome.data, user: req.user._id });
        res.status(201).json({ _id: lesson._id, createdAt: lesson.createdAt });
    } catch (error) {
        console.error('[luyen-tap]', error.message);
        res.status(500).json({ message: 'Không lưu được bài làm.' });
    }
};

// @desc    Lich su cua toi trong mot de (ban tom tat, khong kem bai lam)
// @route   GET /api/luyen-tap/bai-lam?deId=...
// @access  da dang nhap
const attemptHistory = async (req, res) => {
    try {
        const { deId: quizId } = req.query || {};
        if (typeof quizId !== 'string' || !quizId) {
            return res.status(400).json({ message: 'Thiếu mã đề.' });
        }

        const list = await PracticeAttempt.find({ user: req.user._id, deId: quizId })
            .select('deId soDung soCau giay createdAt')
            .sort({ createdAt: -1 })
            .limit(VISIBLE_ATTEMPTS)
            .lean();

        res.status(200).json({ danhSach: list });
    } catch (error) {
        console.error('[luyen-tap]', error.message);
        res.status(500).json({ message: 'Không đọc được lịch sử làm bài.' });
    }
};

// @desc    Chi tiet mot lan lam bai cua toi
// @route   GET /api/luyen-tap/bai-lam/:id
// @access  da dang nhap, chi chu bai lam
const attemptDetail = async (req, res) => {
    try {
        // Loc ca user: ma bai cua nguoi khac tra ve 404 y nhu ma khong ton tai,
        // khong lo ra la ma do co that.
        const lesson = await PracticeAttempt.findOne({ _id: req.params.id, user: req.user._id }).lean();
        if (!lesson) return res.status(404).json({ message: 'Không tìm thấy bài làm.' });

        res.status(200).json({ bai: lesson });
    } catch (error) {
        console.error('[luyen-tap]', error.message);
        res.status(500).json({ message: 'Không đọc được bài làm.' });
    }
};

module.exports = { saveAttempt, attemptHistory, attemptDetail };
