const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { layToken } = require('../utils/cookieToken');

// Giai token va tra ve nguoi dung, HOAC mot ma loi - khong tu tra loi HTTP.
//
// Tach ra khoi `protect` de `docNguoiDungNeuCo` dung chung dung mot bo kiem
// tra. Neu de hai noi tu kiem lay thi som muon cung lech nhau, va cai lech o
// tang xac thuc thi khong ai nhin thay cho toi luc bi loi dung.
const timNguoiDungTuToken = async (req) => {
    // 1. Lay token: uu tien cookie httpOnly, sau do moi den header Bearer.
    //    Cookie la duong chinh cua trinh duyet; header giu lai cho curl,
    //    Postman va cac ung dung ngoai trinh duyet. Xem utils/cookieToken.js.
    const token = layToken(req);
    if (!token) return { loi: 'khong_co_token' };

    let decoded;
    try {
        // Ghim algorithms: khong ghim thi thuat toan duoc doc tu header cua
        // CHINH cai token duoc gui len - tuc la do ben gui chon. Do la ho nha
        // lo hong "alg: none" va doi HS/RS. jsonwebtoken v9 da tu chan phan
        // lon truong hop khi khoa la chuoi, nhung ghim ro rang thi khong con
        // phu thuoc vao mac dinh cua mot ban thu vien nao ca - va ban thu vien
        // thi doi duoc bang mot lan `npm update` ma khong ai doc lai cho nay.
        decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
        if (error.name === 'TokenExpiredError') return { loi: 'het_han' };
        return { loi: 'token_hong' };
    }

    const nguoiDung = await User.findById(decoded.id).select('-password');
    if (!nguoiDung) return { loi: 'khong_co_user' };

    // Token cap truoc khi bi khoa van song het han cua no (HAN_TOKEN trong
    // utils/matKhau.js, hien la 1 ngay), nen phai kiem tra trang thai o day
    // chu khong chi luc dang nhap.
    if (nguoiDung.status === false) return { loi: 'bi_khoa' };

    // Token cap TRUOC lan doi mat khau gan nhat thi khong con gia tri.
    //
    // Khong co buoc nay thi doi mat khau gan nhu vo tac dung ve mat bao mat: ke
    // da lay duoc token cu van dung tiep duoc cho toi khi token het han, du
    // nan nhan da doi mat khau ngay sau khi phat hien.
    //
    // decoded.iat tinh bang GIAY, passwordChangedAt tinh bang mili giay.
    if (nguoiDung.passwordChangedAt && decoded.iat) {
        const doiLuc = Math.floor(nguoiDung.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < doiLuc) return { loi: 'doi_mat_khau' };
    }

    return { nguoiDung };
};

// Moi ma loi ung voi dung mot cau tra loi - giu nguyen status va cau chu cu.
const TRA_LOI_LOI = {
    khong_co_token: [401, 'Không có token, truy cập bị từ chối'],
    het_han: [401, 'Token đã hết hạn, vui lòng đăng nhập lại'],
    token_hong: [401, 'Token không hợp lệ'],
    khong_co_user: [401, 'User không tồn tại'],
    bi_khoa: [403, 'Tài khoản của bạn đã bị khóa'],
    doi_mat_khau: [401, 'Mật khẩu đã được thay đổi, vui lòng đăng nhập lại'],
};

const protect = async (req, res, next) => {
    try {
        const { nguoiDung, loi } = await timNguoiDungTuToken(req);

        if (loi) {
            const [ma, cau] = TRA_LOI_LOI[loi];
            return res.status(ma).json({ message: cau });
        }

        req.user = nguoiDung;
        next();
    } catch (error) {
        console.error('JWT Error:', error.message);
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Doc token NEU CO, khong co thi van cho di tiep.
//
// Dung cho cac duong cong khai nhung tra ve nhieu hay it tuy nguoi xem: trang
// khoa hoc phai mo cho khach vang lai xem muc luc, dong thoi phai dua du video
// cho hoc vien da ghi danh. Neu boc `protect` vao thi khach bi chan; neu khong
// biet nguoi xem la ai thi buoc phai cat video cua ca hoc vien that.
//
// Token hong hay het han o day KHONG phai loi - chi la khach vang lai.
const docNguoiDungNeuCo = async (req, res, next) => {
    try {
        const { nguoiDung } = await timNguoiDungTuToken(req);
        if (nguoiDung) req.user = nguoiDung;
    } catch (error) {
        console.error('Doc token tuy chon that bai:', error.message);
    }
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Quyền Admin mới có thể thực hiện' });
    }
};

const instructor = (req, res, next) => {
    if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Quyền Instructor hoặc Admin mới có thể thực hiện' });
    }
};

module.exports = { protect, docNguoiDungNeuCo, admin, instructor, timNguoiDungTuToken, TRA_LOI_LOI };