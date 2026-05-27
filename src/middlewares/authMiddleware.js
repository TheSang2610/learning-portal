const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Lấy token từ Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

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