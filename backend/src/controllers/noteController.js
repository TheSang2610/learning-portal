/**
 * Ghi chu ca nhan cua hoc vien trong bai hoc.
 *
 * HAI TANG KIEM, ca hai deu bat buoc:
 *
 *   1. Cong bai hoc (utils/lessonGate.js) - phai co quyen xem noi dung khoa.
 *   2. Chu so huu - MOI truy van deu loc them `user: req.user._id`.
 *
 * Tang 2 moi la tang quan trong o day. Ghi chu la thu rieng tu nhat trong ca he
 * thong: hoc vien go vao do nhung cho minh khong hieu, doi khi ca mat khau bai
 * tap hay ghi chu ca nhan. Thieu bo loc `user` la bat ky ai cung hoc khoa do
 * deu doc duoc ghi chu cua nguoi khac.
 */

const mongoose = require('mongoose');

const GhiChuBaiHoc = require('../models/LessonNote');
const { layBaiTrongKhoa, traLoiCong } = require('../utils/lessonGate');

const DAI_TOI_DA = 5000;

// Tran so ghi chu moi bai. Khong phai de tiet kiem dung luong ma de chan viec
// mot script go hang nghin dong lam phinh bang - mot nguoi ghi chu that khong
// bao gio vuot con so nay trong mot bai.
const SO_TOI_DA_MOI_BAI = 200;

/** Chuan hoa moc giay: bo gia tri rac, giu null khi khong co video. */
const chuanMoc = (tho) => {
    if (tho === null || tho === undefined || tho === '') return null;

    const so = Number(tho);
    // Number('') la 0 nen phai chan chuoi rong o tren. NaN va so am deu la rac.
    if (!Number.isFinite(so) || so < 0) return null;

    // Lam tron xuong giay: video tra ve so thap phan, ma "phut 12 giay 7.348"
    // khong noi them duoc gi.
    return Math.floor(so);
};

// @desc    Ghi chu cua toi trong mot bai
// @route   GET /api/ghi-chu?courseId=...&lessonId=...
// @access  nguoi da ghi danh (chi thay ghi chu CUA MINH)
const layGhiChu = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        const cong = await layBaiTrongKhoa(courseId, lessonId, req.user);
        if (cong.loi) return traLoiCong(res, cong);

        // Xep theo moc giay truoc, roi den thoi diem tao.
        //
        // Sap theo thoi gian tao se lam danh sach nhay lung tung so voi video:
        // nguoi dung tua lai phut 3 ghi them mot dong thi dong do nam cuoi, du
        // no thuoc doan dau bai. Ghi chu khong co moc (bai doc) xuong duoi cung.
        const danhSach = await GhiChuBaiHoc.find({
            user: req.user._id,
            lesson: cong.bai._id,
        })
            .sort({ mocGiay: 1, createdAt: 1 })
            .limit(SO_TOI_DA_MOI_BAI)
            .lean();

        res.status(200).json({ danhSach });
    } catch (error) {
        console.error('[ghi-chu]', error.message);
        res.status(500).json({ message: 'Không đọc được ghi chú.' });
    }
};

// @desc    Them ghi chu
// @route   POST /api/ghi-chu
// @access  nguoi da ghi danh
const themGhiChu = async (req, res) => {
    try {
        const { courseId, lessonId, noiDung, mocGiay } = req.body || {};

        const chu = typeof noiDung === 'string' ? noiDung.trim() : '';
        if (!chu) {
            return res.status(400).json({ message: 'Bạn chưa nhập nội dung ghi chú.' });
        }
        if (chu.length > DAI_TOI_DA) {
            return res
                .status(400)
                .json({ message: `Ghi chú quá dài (tối đa ${DAI_TOI_DA} ký tự).` });
        }

        const cong = await layBaiTrongKhoa(courseId, lessonId, req.user);
        if (cong.loi) return traLoiCong(res, cong);

        const daCo = await GhiChuBaiHoc.countDocuments({
            user: req.user._id,
            lesson: cong.bai._id,
        });

        if (daCo >= SO_TOI_DA_MOI_BAI) {
            return res.status(400).json({
                message: `Bài này đã đạt tối đa ${SO_TOI_DA_MOI_BAI} ghi chú. Xóa bớt rồi thêm lại nhé.`,
            });
        }

        const moi = await GhiChuBaiHoc.create({
            user: req.user._id,
            course: cong.khoa._id,
            lesson: cong.bai._id,
            noiDung: chu,
            mocGiay: chuanMoc(mocGiay),
        });

        res.status(201).json({ ghiChu: moi.toObject() });
    } catch (error) {
        console.error('[ghi-chu]', error.message);
        res.status(500).json({ message: 'Không lưu được ghi chú.' });
    }
};

// @desc    Sua ghi chu
// @route   PUT /api/ghi-chu/:id
// @access  chu ghi chu
const suaGhiChu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã ghi chú không hợp lệ.' });
        }

        const chu = typeof req.body?.noiDung === 'string' ? req.body.noiDung.trim() : '';
        if (!chu) {
            return res.status(400).json({ message: 'Bạn chưa nhập nội dung ghi chú.' });
        }
        if (chu.length > DAI_TOI_DA) {
            return res
                .status(400)
                .json({ message: `Ghi chú quá dài (tối đa ${DAI_TOI_DA} ký tự).` });
        }

        // Dieu kien loc co CA `user`. Thieu no thi ai doan dung id cung sua duoc
        // ghi chu cua nguoi khac - va khong co man hinh nao lam lo id ra, nhung
        // id Mongo khong phai bi mat va khong duoc coi la mot lop bao ve.
        const kq = await GhiChuBaiHoc.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { noiDung: chu },
            { new: true },
        ).lean();

        if (!kq) {
            return res.status(404).json({ message: 'Không tìm thấy ghi chú.' });
        }

        res.status(200).json({ ghiChu: kq });
    } catch (error) {
        console.error('[ghi-chu]', error.message);
        res.status(500).json({ message: 'Không sửa được ghi chú.' });
    }
};

// @desc    Xoa ghi chu
// @route   DELETE /api/ghi-chu/:id
// @access  chu ghi chu
const xoaGhiChu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã ghi chú không hợp lệ.' });
        }

        const kq = await GhiChuBaiHoc.findOneAndDelete({ _id: id, user: req.user._id });

        if (!kq) {
            return res.status(404).json({ message: 'Không tìm thấy ghi chú.' });
        }

        res.status(200).json({ message: 'Đã xóa ghi chú.' });
    } catch (error) {
        console.error('[ghi-chu]', error.message);
        res.status(500).json({ message: 'Không xóa được ghi chú.' });
    }
};

// @desc    Tat ca ghi chu cua toi, gom theo khoa
// @route   GET /api/ghi-chu/cua-toi
// @access  da dang nhap
//
// KHONG qua cong bai hoc: day la du lieu cua chinh nguoi goi, khong phai noi
// dung khoa hoc. Neu hoc vien het han xem mot khoa thi ghi chu ho tu go van la
// cua ho - chan o day la lay mat ghi chep cua nguoi ta.
const ghiChuCuaToi = async (req, res) => {
    try {
        const trang = Math.max(parseInt(req.query.trang, 10) || 1, 1);
        const soDong = 50;

        const [danhSach, tong] = await Promise.all([
            GhiChuBaiHoc.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip((trang - 1) * soDong)
                .limit(soDong)
                .populate('course', 'title slug')
                .populate('lesson', 'title')
                .lean(),
            GhiChuBaiHoc.countDocuments({ user: req.user._id }),
        ]);

        res.status(200).json({
            danhSach,
            trang,
            tong,
            conNua: trang * soDong < tong,
        });
    } catch (error) {
        console.error('[ghi-chu]', error.message);
        res.status(500).json({ message: 'Không đọc được ghi chú.' });
    }
};

module.exports = {
    layGhiChu,
    themGhiChu,
    suaGhiChu,
    xoaGhiChu,
    ghiChuCuaToi,
    chuanMoc,
    DAI_TOI_DA,
    SO_TOI_DA_MOI_BAI,
};
