const express = require('express');
const multer = require('multer');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);
const {
    getUsers,
    registerUser,
    loginUser,
    logoutUser,
    googleLogin,
    updateUserProfile,
    uploadAvatar,
    deactivateMyAccount,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { loginRateLimit } = require('../middlewares/loginRateLimit');
const { gioiHan } = require('../middlewares/rateLimit');

// Dang ky khong co "lan sai" de dem nhu dang nhap - ban than viec goi nhieu da
// la van de: mo hang loat tai khoan rac, hoac do xem email nao da ton tai
// (endpoint nay tra ve "User da ton tai", khac han voi trang dang nhap von cham
// chi tra cung mot cau cho moi truong hop).
const gioiHanDangKy = gioiHan({
    soLan: 10,
    cuaSoMs: 60 * 60 * 1000, // 1 gio
    thongBao: 'Bạn đã tạo quá nhiều tài khoản từ địa chỉ này. Vui lòng thử lại sau.',
});

// Google tu xac thuc nen khong do mat khau duoc, nhung moi luot goi deu keo
// theo mot lan xac minh token voi may chu Google - van nen co tran.
const gioiHanGoogle = gioiHan({
    soLan: 30,
    cuaSoMs: 15 * 60 * 1000,
    thongBao: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau ít phút.',
});
const { getMyProfile, getMyActivity } = require('../controllers/activityController');

router.get('/instructors', protect, admin, getInstructorsByProvider);

router.route('/').get(protect, admin, getUsers).post(gioiHanDangKy, registerUser);
router.post('/login', loginRateLimit, loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateUserProfile);

// ---------------------------------------------------------------------------
// Anh dai dien tai tu may len
//
// Multer rieng, khong dung chung `uploadCloud` o utils: cai do dat tran 100MB
// cho video bai hoc, qua rong cho mot tam anh dai dien.
// ---------------------------------------------------------------------------
const MAX_AVATAR_MB = 5;
const MIME_ANH = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const uploadAnh = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_AVATAR_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!MIME_ANH.includes(file.mimetype)) {
            return cb(new Error('Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF'));
        }
        cb(null, true);
    },
});

// Multer nem loi ngoai luong try/catch cua controller. Khong bat o day thi
// nguoi dung nhan 500 khong ro nguyen nhan thay vi "anh qua nang".
const nhanAnh = (req, res, next) => {
    uploadAnh.single('avatar')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: `Ảnh tối đa ${MAX_AVATAR_MB}MB` });
        }
        return res.status(400).json({ message: err.message || 'Không đọc được ảnh tải lên' });
    });
};

router.post('/profile/avatar', protect, nhanAnh, uploadAvatar);

router.put('/deactivate', protect, deactivateMyAccount);
router.get('/activity', protect, getMyActivity);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);
router.post('/google', gioiHanGoogle, googleLogin);

module.exports = router;
