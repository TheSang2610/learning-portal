const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { layToken } = require('../utils/cookieToken');

const protect = async (req, res, next) => {
    try {
        // 1. Lay token: uu tien cookie httpOnly, sau do moi den header Bearer.
        //    Cookie la duong chinh cua trinh duyet; header giu lai cho curl,
        //    Postman va cac ung dung ngoai trinh duyet. Xem utils/cookieToken.js.
        const token = layToken(req);

        // 2. Kiểm tra token tồn tại
        if (!token) {
            return res.status(401).json({ 
                message: 'Không có token, truy cập bị từ chối' 
            });
        }

        // 3. Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Tìm user và gán vào req
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                message: 'User không tồn tại'
            });
        }

        // 4b. Token cap truoc khi bi khoa van con han 30 ngay,
        //     nen phai kiem tra trang thai o day chu khong chi luc dang nhap.
        if (req.user.status === false) {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị khóa'
            });
        }

        // 4c. Token cap TRUOC lan doi mat khau gan nhat thi khong con gia tri.
        //
        //     Khong co buoc nay thi doi mat khau gan nhu vo tac dung ve mat bao
        //     mat: ke da lay duoc token cu van dung tiep duoc toi 30 ngay, du
        //     nan nhan da doi mat khau ngay sau khi phat hien.
        //
        //     decoded.iat tinh bang GIAY, passwordChangedAt tinh bang mili giay.
        if (req.user.passwordChangedAt && decoded.iat) {
            const doiLuc = Math.floor(req.user.passwordChangedAt.getTime() / 1000);
            if (decoded.iat < doiLuc) {
                return res.status(401).json({
                    message: 'Mật khẩu đã được thay đổi, vui lòng đăng nhập lại'
                });
            }
        }

        // 5. Gọi next() để tiếp tục xử lý
        next();

    } catch (error) {
        console.error('JWT Error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn, vui lòng đăng nhập lại' 
            });
        }
        
        return res.status(401).json({ 
            message: 'Token không hợp lệ' 
        });
    }
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

module.exports = { protect, admin, instructor };