/**
 * Tro giang AI: hoc vien hoi, mo hinh tra loi trong pham vi bai dang hoc.
 *
 * THU TU KIEM O `hoiTroLy` LA CO CHU DICH, dung doi:
 *   1. co bat chuc nang chua      -> 503, khoi dung han muc cua ai
 *   2. cau hoi co hop le khong    -> 400, khoi di CSDL
 *   3. khoa/bai co that khong     -> 404
 *   4. NGUOI NAY CO QUYEN XEM     -> 403   <-- hang rao that
 *   5. con han muc khong          -> 429
 *   6. moi goi AI
 *
 * Buoc 4 phai dung TRUOC buoc 6, vi loi nhac gui cho mo hinh co CHUA nguyen van
 * noi dung bai hoc. Dao thu tu la bien tro ly thanh mot duong vong de doc noi
 * dung khoa co phi - dung cai lo ma utils/quyenNoiDung.js sinh ra de va.
 */

const mongoose = require('mongoose');

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Conversation = require('../models/Conversation');

const { duocXemNoiDung } = require('../utils/quyenNoiDung');
const { tang } = require('../utils/khoGioiHan');
const { goiAi, daCauHinh } = require('../utils/nhaCungCapAi');
const {
    locCauHoi,
    locLichSuKhach,
    dungNhacHeThong,
    dungNhacChung,
    dungTinNhan,
} = require('../utils/nhacTroLy');

// Han muc theo NGUOI khi da dang nhap: moi luot goi deu ton han muc cua khoa
// API, ma khoa la cua chu he thong chu khong phai cua nguoi dung. Chan theo IP
// cho nguoi da dang nhap thi mot tai khoan doi mang di dong la lai duoc han muc.
const HAN_GIO = { nguong: 20, cuaSo: 60 * 60 * 1000 };
const HAN_NGAY = { nguong: 100, cuaSo: 24 * 60 * 60 * 1000 };

// Khach vang lai thi khong co tai khoan de dem, chi con IP - ma IP thi doi
// duoc. Nen dat chat hon han, va coi day la muc "du de thu", khong phai muc de
// dung that. Muon hoi nhieu thi dang nhap.
const HAN_KHACH_GIO = { nguong: 12, cuaSo: 60 * 60 * 1000 };
const HAN_KHACH_NGAY = { nguong: 40, cuaSo: 24 * 60 * 60 * 1000 };

// Tran cho CA HE THONG trong mot ngay.
//
// Hai muc tren chi chan duoc tung nguoi. Mot mang may tinh ma ai do dieu khien
// thi moi IP chi can hoi 8 cau la du dot sach han muc mien phi cua Gemini
// truoc buoi trua, va tu do moi hoc vien that deu nhan loi. Tran nay la cai
// chan cuoi: cham no thi tro ly nghi, con moi chuc nang khac van chay.
const HAN_TOAN_HE = { nguong: 500, cuaSo: 24 * 60 * 60 * 1000 };

// Giu lai bao nhieu tin trong mot cuoc tro chuyen. Chi 6 tin cuoi duoc gui cho
// mo hinh (SO_TIN_NHO), phan con lai la de hoc vien doc lai - nhung khong the
// de mang phinh vo han trong mot tai lieu Mongo (tran 16MB).
const TIN_GIU_LAI = 40;

/**
 * Tra ve chuoi thong bao khi het han muc, hoac null khi con duoc hoi.
 *
 * Dem tran toan he thong TRUOC, roi moi dem theo nguoi: hai phep dem deu tang
 * bo dem len, nen neu dem theo nguoi truoc thi mot nguoi bi chan van kip cong
 * vao tran chung - thanh ra bi tru hai lan cho mot cau khong duoc tra loi.
 */
const layHanMuc = async (req) => {
    const toanHe = await tang('ai-toan-he', HAN_TOAN_HE.cuaSo);
    if (toanHe.count > HAN_TOAN_HE.nguong) {
        return 'Trợ lý đã dùng hết lượt của hôm nay trên toàn hệ thống. Mai quay lại nhé.';
    }

    const nguoi = req.user?._id;
    const khoaGio = nguoi ? `ai-gio|${nguoi}` : `ai-ip-gio|${req.ip}`;
    const khoaNgay = nguoi ? `ai-ngay|${nguoi}` : `ai-ip-ngay|${req.ip}`;
    const han = nguoi ? HAN_GIO : HAN_KHACH_GIO;
    const hanNgay = nguoi ? HAN_NGAY : HAN_KHACH_NGAY;

    const gio = await tang(khoaGio, han.cuaSo);
    if (gio.count > han.nguong) {
        const con = Math.ceil((gio.expiresAt - Date.now()) / 60000);
        return `Bạn đã hỏi ${han.nguong} câu trong một giờ. Thử lại sau ${con} phút.`;
    }

    const ngay = await tang(khoaNgay, hanNgay.cuaSo);
    if (ngay.count > hanNgay.nguong) {
        return nguoi
            ? `Bạn đã dùng hết ${hanNgay.nguong} câu hỏi của hôm nay. Mai quay lại nhé.`
            : `Bạn đã dùng hết ${hanNgay.nguong} câu hỏi của hôm nay. Đăng nhập để được hỏi nhiều hơn.`;
    }

    return null;
};

const hoiTroLy = async (req, res) => {
    try {
        if (!daCauHinh()) {
            return res.status(503).json({
                message: 'Trợ giảng AI chưa được bật trên máy chủ này.',
            });
        }

        const kiem = locCauHoi(req.body?.cauHoi);
        if (!kiem.ok) {
            return res.status(400).json({ message: kiem.loi });
        }

        const { courseId, lessonId } = req.body || {};

        // KHONG co courseId -> che do hop chat chung (nut noi o goc phai, hien
        // tren moi trang). Khong co noi dung bai hoc nao duoc dua vao loi nhac,
        // nen khong can - va khong the - kiem quyen xem noi dung. Khach vang
        // lai hoi duoc, chi bi chan bang han muc theo IP.
        if (!courseId) {
            const quaHanChung = await layHanMuc(req);
            if (quaHanChung) {
                return res.status(429).json({ message: quaHanChung });
            }

            const traLoiChung = await goiAi(
                dungNhacChung(),
                dungTinNhan({
                    // Che do nay khong luu CSDL (khach thi khong co tai khoan de
                    // gan vao), nen lich su do chinh trinh duyet gui len.
                    lichSu: locLichSuKhach(req.body?.lichSu),
                    cauHoi: kiem.cauHoi,
                }),
            );

            return res.status(200).json({ traLoi: traLoiChung });
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

        if (!(await duocXemNoiDung(course, req.user))) {
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

        const quaHan = await layHanMuc(req);
        if (quaHan) {
            return res.status(429).json({ message: quaHan });
        }

        const loc = { user: req.user._id, course: course._id, lesson: lesson?._id ?? null };
        const cuoc = await Conversation.findOne(loc).select('tinNhan');

        const heThong = dungNhacHeThong({
            tenKhoa: course.title,
            tenBai: lesson?.title,
            noiDungBai: lesson?.content,
        });
        const tinNhan = dungTinNhan({ lichSu: cuoc?.tinNhan, cauHoi: kiem.cauHoi });

        const traLoi = await goiAi(heThong, tinNhan);

        // Chi ghi lai khi da co cau tra loi. Ghi cau hoi truoc roi AI hong thi
        // lan sau lich su mo dau bang mot cau hoi khong co dap - mo hinh se
        // tuong do la cau no da bo qua.
        await Conversation.findOneAndUpdate(
            loc,
            {
                $push: {
                    tinNhan: {
                        $each: [
                            { vaiTro: 'nguoiDung', noiDung: kiem.cauHoi },
                            { vaiTro: 'troLy', noiDung: traLoi },
                        ],
                        $slice: -TIN_GIU_LAI,
                    },
                },
            },
            { upsert: true, new: true },
        );

        res.status(200).json({ traLoi });
    } catch (error) {
        // goiAi() gan san ma HTTP dung nghia (503/504/429/502). Cac loi con lai
        // moi la 500 that.
        const ma = error.maHttp || 500;
        if (ma === 500) console.error('[tro-ly]', error.message);

        res.status(ma).json({
            message: ma === 500 ? 'Không gọi được trợ giảng, bạn thử lại sau.' : error.message,
        });
    }
};

const layLichSu = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Thiếu mã khóa học hợp lệ.' });
        }

        // Loc theo req.user._id nen khong the doc duoc cuoc tro chuyen cua nguoi
        // khac du co doan dung ma khoa hoc.
        const cuoc = await Conversation.findOne({
            user: req.user._id,
            course: courseId,
            lesson: mongoose.Types.ObjectId.isValid(lessonId) ? lessonId : null,
        }).select('tinNhan updatedAt');

        res.status(200).json({ tinNhan: cuoc?.tinNhan ?? [] });
    } catch (error) {
        console.error('[tro-ly]', error.message);
        res.status(500).json({ message: 'Không đọc được lịch sử trò chuyện.' });
    }
};

const xoaLichSu = async (req, res) => {
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
    hoiTroLy,
    layLichSu,
    xoaLichSu,
    HAN_GIO,
    HAN_NGAY,
    HAN_KHACH_GIO,
    HAN_KHACH_NGAY,
    HAN_TOAN_HE,
    TIN_GIU_LAI,
};
