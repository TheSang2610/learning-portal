const express = require('express');
const router = express.Router();

const {
    layCauHoi,
    dangCauHoi,
    traLoiCauHoi,
    xoaCauHoi,
    cauHoiChoGiangVien,
} = require('../controllers/questionController');

const { protect, instructor } = require('../middlewares/authMiddleware');

// Khong co duong nao mo cho khach o day. Ca bon deu can req.user de goi
// duocXemNoiDung() - bo `protect` o mot dong la cho do kiem quyen tren
// `undefined`, va bat ky ai cung doc duoc hoi dap cua khoa co phi.
//
// KHONG dung middleware `instructor`: vai tro trong he thong khong noi len vai
// tro o KHOA NAY (mot giang vien day khoa khac thi voi khoa nay chi la hoc
// vien). Viec do controller tu xet bang vaiTroTrongKhoa().

// @route   GET /api/hoi-dap?courseId=...&lessonId=...
// @desc    Danh sach cau hoi cua mot bai hoc
router.get('/', protect, layCauHoi);

// @route   GET /api/hoi-dap/cho-giang-vien
// @desc    Hang doi cau hoi chua tra loi trong cac khoa minh day
//
// `instructor` o day nhan CA instructor lan admin (xem authMiddleware) - dung
// y muon. Nhung no chi chan o muc "co phai nguoi day khong", con viec chi thay
// khoa CUA MINH thi controller lam bang bo loc truy van.
router.get('/cho-giang-vien', protect, instructor, cauHoiChoGiangVien);

// @route   POST /api/hoi-dap
// @desc    Dat cau hoi moi
router.post('/', protect, dangCauHoi);

// @route   POST /api/hoi-dap/:id/tra-loi
// @desc    Tra loi mot cau hoi
router.post('/:id/tra-loi', protect, traLoiCauHoi);

// @route   DELETE /api/hoi-dap/:id
// @desc    Xoa cau hoi (chu cau hoi, giang vien cua khoa, hoac admin)
router.delete('/:id', protect, xoaCauHoi);

module.exports = router;
