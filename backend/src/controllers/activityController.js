const mongoose = require('mongoose');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Review = require('../models/Review');
const Achievement = require('../models/Achievement');

// Quy ve chuoi YYYY-MM-DD theo GIO DIA PHUONG cua server.
// Khong dung toISOString() vi no doi sang UTC - hoc luc 7h toi gio VN
// se bi day sang ngay hom truoc tren bieu do.
const dayKey = (d) => {
    const x = new Date(d);
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${x.getFullYear()}-${m}-${day}`;
};

// @desc    Thong tin day du cua user dang dang nhap
// @route   GET /api/users/profile
const getMyProfile = async (req, res) => {
    try {
        // Lay ca password de biet tai khoan da dat mat khau chua, nhung
        // KHONG tra chuoi bam ra ngoai - chi tra co/khong.
        const user = await User.findById(req.user._id)
            .populate('provider', 'name logo');

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const out = user.toObject();
        // Tai khoan tao qua Google chua tung dat mat khau -> man hinh doi mat khau
        // se khong hoi "mat khau hien tai".
        out.hasPassword = Boolean(out.password);
        delete out.password;

        res.json(out);
    } catch (error) {
        console.error('getMyProfile error:', error);
        res.status(500).json({ message: 'Không tải được thông tin tài khoản' });
    }
};

// @desc    Hoat dong theo ngay trong 12 thang gan nhat (kieu heatmap GitHub)
// @route   GET /api/users/activity
const getMyActivity = async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.user._id);

        // Moc bat dau: dung 12 thang truoc, tinh tu dau ngay
        const from = new Date();
        from.setFullYear(from.getFullYear() - 1);
        from.setHours(0, 0, 0, 0);

        // He thong chua co bang nhat ky hoat dong rieng, nen gom tu cac
        // dau vet co san. Bon truy van doc lap -> chay song song.
        const [lessonRows, quizRows, reviewRows, achievementRows] = await Promise.all([
            Enrollment.aggregate([
                { $match: { student: studentId } },
                { $unwind: '$lessonProgress' },
                { $match: { 'lessonProgress.completedAt': { $gte: from } } },
                { $project: { at: '$lessonProgress.completedAt' } },
            ]),
            QuizAttempt.find({ student: studentId, submittedAt: { $gte: from } })
                .select('submittedAt').lean(),
            Review.find({ student: studentId, createdAt: { $gte: from } })
                .select('createdAt').lean(),
            Achievement.find({ student: studentId, createdAt: { $gte: from } })
                .select('createdAt').lean(),
        ]);

        const counts = new Map();
        const bump = (date, kind) => {
            if (!date) return;
            const k = dayKey(date);
            const cur = counts.get(k) || { count: 0, lessons: 0, quizzes: 0, reviews: 0, achievements: 0 };
            cur.count += 1;
            cur[kind] += 1;
            counts.set(k, cur);
        };

        lessonRows.forEach((r) => bump(r.at, 'lessons'));
        quizRows.forEach((r) => bump(r.submittedAt, 'quizzes'));
        reviewRows.forEach((r) => bump(r.createdAt, 'reviews'));
        achievementRows.forEach((r) => bump(r.createdAt, 'achievements'));

        const days = [...counts.entries()]
            .map(([date, v]) => ({ date, ...v }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const total = days.reduce((s, d) => s + d.count, 0);

        // --- Chuoi ngay hoc lien tiep ---
        const active = new Set(days.map((d) => d.date));

        const shift = (d, n) => {
            const x = new Date(d);
            x.setDate(x.getDate() + n);
            return x;
        };

        // Chuoi hien tai: dem lui tu hom nay. Neu hom nay chua hoc thi
        // bat dau dem tu hom qua, de chuoi khong bi reset chi vi chua hoc sang nay.
        let current = 0;
        const today = new Date();
        let cursor = active.has(dayKey(today)) ? today : shift(today, -1);
        while (active.has(dayKey(cursor))) {
            current += 1;
            cursor = shift(cursor, -1);
        }

        // Chuoi dai nhat: duyet danh sach ngay da sap xep
        let longest = 0;
        let run = 0;
        let prev = null;
        for (const d of days) {
            if (prev && dayKey(shift(new Date(prev), 1)) === d.date) {
                run += 1;
            } else {
                run = 1;
            }
            if (run > longest) longest = run;
            prev = d.date;
        }

        res.json({
            from: dayKey(from),
            to: dayKey(new Date()),
            total,
            activeDays: days.length,
            currentStreak: current,
            longestStreak: longest,
            days,
        });
    } catch (error) {
        console.error('getMyActivity error:', error);
        res.status(500).json({ message: 'Không tải được dữ liệu hoạt động' });
    }
};

module.exports = { getMyProfile, getMyActivity };
