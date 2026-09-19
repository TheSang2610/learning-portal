/**
 * Hoi dap giua hoc vien va giang vien, gan theo tung bai hoc.
 *
 * CONG KIEM QUYEN: moi duong o day deu goi duocXemNoiDung() truoc khi lam bat
 * cu viec gi. Ly do khong phai vi cau hoi la "noi dung bai hoc", ma vi:
 *
 *   - Cau hoi va cau tra loi trich thang noi dung bai ra ("doan video phut 12
 *     thay noi ... em khong hieu"). Mo cho khach doc la mo mot duong vong de
 *     doc noi dung khoa co phi ma khong tra tien - dung cai lo ma
 *     utils/quyenNoiDung.js sinh ra de va.
 *   - Danh sach nguoi hoi la danh sach nguoi da mua khoa. Do la du lieu cua
 *     hoc vien, khong phai thu de ban khoa hoc.
 *
 * Day kiem do nam o utils/congBaiHoc.js va dung CHUNG voi ghi chu bai hoc.
 * Dung tu kiem lai o day: chep lam hai ban la som muon co mot ban thieu buoc
 * "bai co thuoc dung khoa vua kiem quyen khong".
 */

const mongoose = require('mongoose');

const Course = require('../models/Course');
const CauHoiBaiHoc = require('../models/CauHoiBaiHoc');

const {
    layBaiTrongKhoa,
    traLoiCong,
    vaiTroTrongKhoa,
} = require('../utils/congBaiHoc');
const { guiThongBao } = require('./thongBaoController');

const SO_MOI_TRANG = 20;
const DAI_TOI_DA = 2000;

// @desc    Danh sach cau hoi cua mot bai hoc
// @route   GET /api/hoi-dap?courseId=...&lessonId=...&trang=1
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const layCauHoi = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        const cong = await layBaiTrongKhoa(courseId, lessonId, req.user);
        if (cong.loi) return traLoiCong(res, cong);

        const trang = Math.max(parseInt(req.query.trang, 10) || 1, 1);

        const [danhSach, tong] = await Promise.all([
            CauHoiBaiHoc.find({ lesson: cong.bai._id })
                .sort({ createdAt: -1 })
                .skip((trang - 1) * SO_MOI_TRANG)
                .limit(SO_MOI_TRANG)
                .populate('student', 'name email avatar')
                .populate('traLoi.user', 'name email avatar')
                .lean(),
            CauHoiBaiHoc.countDocuments({ lesson: cong.bai._id }),
        ]);

        res.status(200).json({
            danhSach,
            trang,
            tong,
            conNua: trang * SO_MOI_TRANG < tong,
            // De giao dien biet co hien nut cua giang vien hay khong, thay vi tu
            // doan tu `role` - vai tro he thong khong noi len vai tro o khoa nay.
            vaiTro: vaiTroTrongKhoa(cong.khoa, req.user),
        });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đọc được phần hỏi đáp.' });
    }
};

// @desc    Dat cau hoi moi
// @route   POST /api/hoi-dap
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const dangCauHoi = async (req, res) => {
    try {
        const { courseId, lessonId, noiDung } = req.body || {};

        // Kiem do dai TRUOC khi di CSDL: mot chuoi mot megabyte khong dang de
        // ton mot luot truy van.
        const cau = typeof noiDung === 'string' ? noiDung.trim() : '';
        if (cau.length < 5) {
            return res.status(400).json({ message: 'Câu hỏi quá ngắn (tối thiểu 5 ký tự).' });
        }
        if (cau.length > DAI_TOI_DA) {
            return res
                .status(400)
                .json({ message: `Câu hỏi quá dài (tối đa ${DAI_TOI_DA} ký tự).` });
        }

        const cong = await layBaiTrongKhoa(courseId, lessonId, req.user);
        if (cong.loi) return traLoiCong(res, cong);

        const moi = await CauHoiBaiHoc.create({
            course: cong.khoa._id,
            lesson: cong.bai._id,
            student: req.user._id,
            noiDung: cau,
        });

        const day = await CauHoiBaiHoc.findById(moi._id)
            .populate('student', 'name email avatar')
            .lean();

        res.status(201).json({ cauHoi: day });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đăng được câu hỏi.' });
    }
};

// @desc    Tra loi mot cau hoi
// @route   POST /api/hoi-dap/:id/tra-loi
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const traLoiCauHoi = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã câu hỏi không hợp lệ.' });
        }

        const cau = typeof req.body?.noiDung === 'string' ? req.body.noiDung.trim() : '';
        if (!cau) {
            return res.status(400).json({ message: 'Bạn chưa nhập nội dung trả lời.' });
        }
        if (cau.length > DAI_TOI_DA) {
            return res
                .status(400)
                .json({ message: `Câu trả lời quá dài (tối đa ${DAI_TOI_DA} ký tự).` });
        }

        const cauHoi = await CauHoiBaiHoc.findById(id);
        if (!cauHoi) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        // Kiem quyen theo chinh khoa/bai CUA CAU HOI, khong lay tu req.body.
        // Lay tu body thi nguoi goi tu khai mot khoa ma ho co quyen, roi tra
        // loi vao cau hoi thuoc khoa khac.
        const cong = await layBaiTrongKhoa(cauHoi.course, cauHoi.lesson, req.user);
        if (cong.loi) return traLoiCong(res, cong);

        const vaiTro = vaiTroTrongKhoa(cong.khoa, req.user);

        cauHoi.traLoi.push({ user: req.user._id, vaiTro, noiDung: cau });

        // Giang vien hoac admin tra loi thi coi nhu da xu ly. Hoc vien tra loi
        // nhau thi khong - cau van con nam trong danh sach cho nguoi day.
        if (vaiTro !== 'hocVien') cauHoi.daGiaiQuyet = true;

        await cauHoi.save();

        // Bao cho nguoi hoi, tru khi ho tu tra loi chinh minh.
        if (String(cauHoi.student) !== String(req.user._id)) {
            await guiThongBao(cauHoi.student, 'tra_loi_hoi_dap', {
                tenBai: cong.bai.title,
                idKhoa: String(cauHoi.course),
                idBai: String(cauHoi.lesson),
            });
        }

        const day = await CauHoiBaiHoc.findById(id)
            .populate('student', 'name email avatar')
            .populate('traLoi.user', 'name email avatar')
            .lean();

        res.status(201).json({ cauHoi: day });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không gửi được câu trả lời.' });
    }
};

// @desc    Cau hoi CHUA TRA LOI trong cac khoa minh day
// @route   GET /api/hoi-dap/cho-giang-vien?trang=1&tatCa=0
// @access  giang vien (chi khoa cua minh) / admin (moi khoa)
//
// Day la duong dung toi index { course, daGiaiQuyet, createdAt } cua model.
// Khong co man hinh nay thi giang vien phai mo tung bai cua tung khoa de xem co
// ai hoi khong - tuc la ho se khong xem, va phan hoi dap thanh mot noi hoc vien
// dat cau hoi roi khong bao gio duoc tra loi.
//
// KHONG goi duocXemNoiDung() o day, va do la co chu dich: ham do kiem quyen
// XEM NOI DUNG cua mot khoa cu the. O day pham vi da bi chan hep ngay tu truy
// van - chi lay cau hoi cua nhung khoa ma chinh nguoi goi dang day.
const cauHoiChoGiangVien = async (req, res) => {
    try {
        const laQuanTri = req.user.role === 'admin';

        // Admin thay moi khoa; giang vien chi thay khoa minh day. Hoc vien
        // thuong se ra danh sach khoa rong -> cau hoi rong, khong can chan rieng.
        const locKhoa = laQuanTri ? {} : { instructor: req.user._id };

        const khoaCuaToi = await Course.find(locKhoa).select('_id title slug').lean();
        if (khoaCuaToi.length === 0) {
            return res.status(200).json({ danhSach: [], trang: 1, tong: 0, conNua: false });
        }

        // tatCa=1 de xem ca cau da tra loi. Mac dinh chi hien cau CHUA xu ly -
        // day la mot hang doi viec, khong phai mot kho luu tru.
        const chiChuaXong = req.query.tatCa !== '1';

        const dieuKien = {
            course: { $in: khoaCuaToi.map((k) => k._id) },
            ...(chiChuaXong ? { daGiaiQuyet: false } : {}),
        };

        const trang = Math.max(parseInt(req.query.trang, 10) || 1, 1);

        const [danhSach, tong] = await Promise.all([
            CauHoiBaiHoc.find(dieuKien)
                .sort({ createdAt: -1 })
                .skip((trang - 1) * SO_MOI_TRANG)
                .limit(SO_MOI_TRANG)
                .populate('student', 'name email avatar')
                .populate('course', 'title slug')
                .populate('lesson', 'title')
                .populate('traLoi.user', 'name email avatar')
                .lean(),
            CauHoiBaiHoc.countDocuments(dieuKien),
        ]);

        res.status(200).json({
            danhSach,
            trang,
            tong,
            conNua: trang * SO_MOI_TRANG < tong,
            chiChuaXong,
        });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đọc được danh sách câu hỏi.' });
    }
};

// @desc    Xoa cau hoi
// @route   DELETE /api/hoi-dap/:id
// @access  nguoi dat cau hoi / giang vien cua khoa / admin
const xoaCauHoi = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã câu hỏi không hợp lệ.' });
        }

        const cauHoi = await CauHoiBaiHoc.findById(id);
        if (!cauHoi) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        const khoa = await Course.findById(cauHoi.course).select('instructor');

        const laChu = String(cauHoi.student) === String(req.user._id);
        const laNguoiDay = !!khoa && String(khoa.instructor) === String(req.user._id);
        const laQuanTri = req.user.role === 'admin';

        if (!laChu && !laNguoiDay && !laQuanTri) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này.' });
        }

        await cauHoi.deleteOne();

        res.status(200).json({ message: 'Đã xóa câu hỏi.' });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không xóa được câu hỏi.' });
    }
};

module.exports = {
    layCauHoi,
    dangCauHoi,
    traLoiCauHoi,
    xoaCauHoi,
    cauHoiChoGiangVien,
    SO_MOI_TRANG,
    DAI_TOI_DA,
};
