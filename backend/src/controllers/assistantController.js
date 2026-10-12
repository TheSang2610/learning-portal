/**
 * Tro giang AI: hoc vien hoi, mo hinh tra loi trong pham vi bai dang hoc.
 *
 * THU TU KIEM O `askAssistant` LA CO CHU DICH, dung doi:
 *   1. co bat chuc nang chua      -> 503, khoi dung han muc cua ai
 *   2. cau hoi co hop le khong    -> 400, khoi di CSDL
 *   3. khoa/bai co that khong     -> 404
 *   4. NGUOI NAY CO QUYEN XEM     -> 403   <-- hang rao that
 *   5. con han muc khong          -> 429
 *   6. moi goi AI
 *
 * Buoc 4 phai dung TRUOC buoc 6, vi loi nhac gui cho mo hinh co CHUA nguyen van
 * noi dung bai hoc. Dao thu tu la bien tro ly thanh mot duong vong de doc noi
 * dung khoa co phi - dung cai lo ma utils/contentAccess.js sinh ra de va.
 */

const mongoose = require('mongoose');

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Conversation = require('../models/Conversation');

const { canViewContent } = require('../utils/contentAccess');
const { tang: increment } = require('../utils/rateLimitStore');
const { callAi, daCauHinh: isConfigured } = require('../utils/aiProvider');
const {
    filterQuestion,
    filterGuestHistory,
    buildSystemPrompt,
    buildCommonPrompt,
    buildMessages,
} = require('../utils/assistantPrompt');

// Han muc theo NGUOI khi da dang nhap: moi luot goi deu ton han muc cua khoa
// API, ma khoa la cua chu he thong chu khong phai cua nguoi dung. Chan theo IP
// cho nguoi da dang nhap thi mot tai khoan doi mang di dong la lai duoc han muc.
const HOURLY_QUOTA = { nguong: 20, window: 60 * 60 * 1000 };
const DAILY_QUOTA = { nguong: 100, window: 24 * 60 * 60 * 1000 };

// Khach vang lai thi khong co tai khoan de dem, chi con IP - ma IP thi doi
// duoc. Nen dat chat hon han, va coi day la muc "du de thu", khong phai muc de
// dung that. Muon hoi nhieu thi dang nhap.
const GUEST_HOURLY_QUOTA = { nguong: 12, window: 60 * 60 * 1000 };
const GUEST_DAILY_QUOTA = { nguong: 40, window: 24 * 60 * 60 * 1000 };

// Tran cho CA HE THONG trong mot ngay.
//
// Hai muc tren chi chan duoc tung nguoi. Mot mang may tinh ma ai do dieu khien
// thi moi IP chi can hoi 8 cau la du dot sach han muc mien phi cua Gemini
// truoc buoi trua, va tu do moi hoc vien that deu nhan loi. Tran nay la cai
// chan cuoi: cham no thi tro ly nghi, con moi chuc nang khac van chay.
const GLOBAL_QUOTA = { nguong: 500, window: 24 * 60 * 60 * 1000 };

// Giu lai bao nhieu tin trong mot cuoc tro chuyen. Chi 6 tin cuoi duoc gui cho
// mo hinh (MEMORY_MESSAGES), phan con lai la de hoc vien doc lai - nhung khong the
// de mang phinh vo han trong mot tai lieu Mongo (tran 16MB).
const KEPT_MESSAGES = 40;

/**
 * Tra ve chuoi thong bao khi het han muc, hoac null khi con duoc hoi.
 *
 * Dem tran toan he thong TRUOC, roi moi dem theo nguoi: hai phep dem deu tang
 * bo dem len, nen neu dem theo nguoi truoc thi mot nguoi bi chan van kip cong
 * vao tran chung - thanh ra bi tru hai lan cho mot cau khong duoc tra loi.
 */
const getQuota = async (req) => {
    const global = await increment('ai-toan-he', GLOBAL_QUOTA.window);
    if (global.count > GLOBAL_QUOTA.nguong) {
        return 'Trợ lý đã dùng hết lượt của hôm nay trên toàn hệ thống. Mai quay lại nhé.';
    }

    const person = req.user?._id;
    const hourKey = person ? `ai-gio|${person}` : `ai-ip-gio|${req.ip}`;
    const dayKey = person ? `ai-ngay|${person}` : `ai-ip-ngay|${req.ip}`;
    const limit = person ? HOURLY_QUOTA : GUEST_HOURLY_QUOTA;
    const dailyQuota = person ? DAILY_QUOTA : GUEST_DAILY_QUOTA;

    const hour = await increment(hourKey, limit.window);
    if (hour.count > limit.nguong) {
        const left = Math.ceil((hour.expiresAt - Date.now()) / 60000);
        return `Bạn đã hỏi ${limit.nguong} câu trong một giờ. Thử lại sau ${left} phút.`;
    }

    const day = await increment(dayKey, dailyQuota.window);
    if (day.count > dailyQuota.nguong) {
        return person
            ? `Bạn đã dùng hết ${dailyQuota.nguong} câu hỏi của hôm nay. Mai quay lại nhé.`
            : `Bạn đã dùng hết ${dailyQuota.nguong} câu hỏi của hôm nay. Đăng nhập để được hỏi nhiều hơn.`;
    }

    return null;
};

const askAssistant = async (req, res) => {
    try {
        if (!isConfigured()) {
            return res.status(503).json({
                message: 'Trợ giảng AI chưa được bật trên máy chủ này.',
            });
        }

        const check = filterQuestion(req.body?.cauHoi);
        if (!check.ok) {
            return res.status(400).json({ message: check.loi });
        }

        const { courseId, lessonId } = req.body || {};

        // KHONG co courseId -> che do hop chat chung (nut noi o goc phai, hien
        // tren moi trang). Khong co noi dung bai hoc nao duoc dua vao loi nhac,
        // nen khong can - va khong the - kiem quyen xem noi dung. Khach vang
        // lai hoi duoc, chi bi chan bang han muc theo IP.
        if (!courseId) {
            const overGlobalQuota = await getQuota(req);
            if (overGlobalQuota) {
                return res.status(429).json({ message: overGlobalQuota });
            }

            const commonReply = await callAi(
                buildCommonPrompt(),
                buildMessages({
                    // Che do nay khong luu CSDL (khach thi khong co tai khoan de
                    // gan vao), nen lich su do chinh trinh duyet gui len.
                    lichSu: filterGuestHistory(req.body?.lichSu),
                    cauHoi: check.cauHoi,
                }),
            );

            return res.status(200).json({ traLoi: commonReply });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Mã khóa học không hợp lệ.' });
        }

        // Tu day tro xuong la che do TRONG BAI HOC: loi nhac se chua nguyen van
        // noi dung bai, nen bat buoc phai dang nhap va phai qua cong kiem quyen.
        if (!req.user) {
            return res.status(401).json({ message: 'Bạn cần đăng nhập để hỏi về bài học' });
        }

        const course = await Course.findById(courseId).select('title instructor');
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (!(await canViewContent(course, req.user))) {
            return res.status(403).json({
                message: 'Bạn cần đăng ký khóa học này để hỏi trợ giảng',
                requiresEnrollment: true,
            });
        }

        // Bai hoc la tuy chon, nhung neu co thi phai thuoc DUNG khoa vua kiem
        // quyen o tren. Khong kiem cho nay thi mot nguoi ghi danh khoa re co
        // the tro lessonId cua khoa dat va lay noi dung qua duong tro ly.
        let lesson = null;
        if (lessonId) {
            if (!mongoose.Types.ObjectId.isValid(lessonId)) {
                return res.status(400).json({ message: 'Mã bài học không hợp lệ.' });
            }

            lesson = await Lesson.findById(lessonId).select('title content courseId');
            if (!lesson || String(lesson.courseId) !== String(course._id)) {
                return res.status(404).json({ message: 'Không tìm thấy bài học trong khóa này' });
            }
        }

        const overQuota = await getQuota(req);
        if (overQuota) {
            return res.status(429).json({ message: overQuota });
        }

        const query = { user: req.user._id, course: course._id, lesson: lesson?._id ?? null };
        const conversation = await Conversation.findOne(query).select('tinNhan');

        const system = buildSystemPrompt({
            tenKhoa: course.title,
            tenBai: lesson?.title,
            lessonContent: lesson?.content,
        });
        const message = buildMessages({ lichSu: conversation?.tinNhan, cauHoi: check.cauHoi });

        const reply = await callAi(system, message);

        // Chi ghi lai khi da co cau tra loi. Ghi cau hoi truoc roi AI hong thi
        // lan sau lich su mo dau bang mot cau hoi khong co dap - mo hinh se
        // tuong do la cau no da bo qua.
        await Conversation.findOneAndUpdate(
            query,
            {
                $push: {
                    tinNhan: {
                        $each: [
                            { vaiTro: 'nguoiDung', noiDung: check.cauHoi },
                            { vaiTro: 'troLy', noiDung: reply },
                        ],
                        $slice: -KEPT_MESSAGES,
                    },
                },
            },
            { upsert: true, new: true },
        );

        res.status(200).json({ traLoi: reply });
    } catch (error) {
        // callAi() gan san ma HTTP dung nghia (503/504/429/502). Cac loi con lai
        // moi la 500 that.
        const code = error.httpStatus || 500;
        if (code === 500) console.error('[tro-ly]', error.message);

        res.status(code).json({
            message: code === 500 ? 'Không gọi được trợ giảng, bạn thử lại sau.' : error.message,
        });
    }
};

const getHistory = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Thiếu mã khóa học hợp lệ.' });
        }

        // Loc theo req.user._id nen khong the doc duoc cuoc tro chuyen cua nguoi
        // khac du co doan dung ma khoa hoc.
        const conversation = await Conversation.findOne({
            user: req.user._id,
            course: courseId,
            lesson: mongoose.Types.ObjectId.isValid(lessonId) ? lessonId : null,
        }).select('tinNhan updatedAt');

        res.status(200).json({ tinNhan: conversation?.tinNhan ?? [] });
    } catch (error) {
        console.error('[tro-ly]', error.message);
        res.status(500).json({ message: 'Không đọc được lịch sử trò chuyện.' });
    }
};

const clearHistory = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Thiếu mã khóa học hợp lệ.' });
        }

        await Conversation.deleteOne({
            user: req.user._id,
            course: courseId,
            lesson: mongoose.Types.ObjectId.isValid(lessonId) ? lessonId : null,
        });

        res.status(200).json({ message: 'Đã xóa đoạn trò chuyện' });
    } catch (error) {
        console.error('[tro-ly]', error.message);
        res.status(500).json({ message: 'Không xóa được đoạn trò chuyện.' });
    }
};

module.exports = {
    askAssistant,
    getHistory,
    clearHistory,
    HOURLY_QUOTA,
    DAILY_QUOTA,
    GUEST_HOURLY_QUOTA,
    GUEST_DAILY_QUOTA,
    GLOBAL_QUOTA,
    KEPT_MESSAGES,
};
