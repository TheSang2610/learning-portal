const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, DAI_MAT_KHAU_TOI_THIEU, HAN_TOKEN } = require('../utils/matKhau');
const { datCookieToken, xoaCookieToken } = require('../utils/cookieToken');
const jwt = require('jsonwebtoken');
const { recordLoginFailure, clearLoginAttempts } = require('../middlewares/loginRateLimit');
const layCloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../utils/uploadCloud');

// google-auth-library nap mat ~144ms nhung chi mot duong duy nhat can den no
// (dang nhap bang Google). Nap luoi de moi cold start khac khong phai tra
// khoan do. Node co dem module san nen chi lan goi dau tien moi cham.
let googleClient = null;
const layGoogleClient = () => {
  if (!googleClient) {
    const { OAuth2Client } = require('google-auth-library');
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

// Email luon luu/tra cuu o dang chu thuong da trim -> tranh tao trung tai khoan
// va tranh truong hop go hoa mot chu la khong dang nhap duoc.
const normalizeEmail = (v) => String(v || '').trim().toLowerCase();

// Kiem tra dinh dang co ban, khong dung regex phuc tap de tranh ReDoS
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// Tạo Token JWT (hàm tiện ích nội bộ)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: HAN_TOKEN });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = req.body?.password;

        // 1. Thieu tham so -> 400. Truoc day password thieu se lam bcrypt.compare
        //    nem loi va tra ve 500 kem thong bao noi bo cua thu vien.
        if (!email || typeof password !== 'string' || password === '') {
            return res.status(400).json({
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // 2. Sai dinh dang thi khong can truy van DB
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            });
        }

        const user = await User.findOne({ email });

        // 3. Khong ro email hay mat khau sai -> cung mot thong bao,
        //    tranh de lo email nao da ton tai trong he thong.
        if (!user) {
            recordLoginFailure(req.loginAttemptKey);
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Account Google chưa có password
        if (!user.password) {
            return res.status(401).json({
                message: 'Vui lòng đăng nhập bằng Google'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            recordLoginFailure(req.loginAttemptKey);
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // 4. Tai khoan bi admin khoa thi khong duoc cap token.
        //    Kiem tra SAU khi doi chieu mat khau de nguoi la khong do duoc
        //    email nao dang bi khoa.
        if (user.status === false) {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
            });
        }

        clearLoginAttempts(req.loginAttemptKey);

        // Token di bang cookie httpOnly, KHONG nam trong than phan hoi.
        // De no trong than thi JavaScript cua trang doc duoc, va the la mat
        // dung cai loi ich vua doi sang cookie de co.
        datCookieToken(res, generateToken(user._id));

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.error('loginUser error:', error);
        res.status(500).json({
            message: 'Đã có lỗi xảy ra, vui lòng thử lại'
        });
    }
};
const googleLogin = async (req, res) => {
  try {
    // KHONG log req.body o day. No chua req.body.credential - la id token cua
    // Google, dung duoc de mao danh nguoi dung cho toi khi het han. In ra log
    // la nem thang vao noi luu log cua nha cung cap, noi thuong duoc giu lau va
    // nhieu nguoi doc duoc hon la ta tuong.
    // CHI nhan id token cua Google va tu kiem chu ky. Khong co duong nao khac.
    //
    // Ban cu con mot nhanh thu hai: neu than request co `googleId` hoac
    // `email` thi tin luon, khong kiem gi. Do la mot cua hau mo toang - bat ky
    // ai cung chi can:
    //
    //     POST /api/users/google   {"email":"admin@gmail.com"}
    //
    // la nhan ve token admin hop le. Khong mat khau, khong Google, khong gi
    // ca. Moi lop bao ve khac - gioi han so lan dang nhap sai, bcrypt 12 vong,
    // passwordChangedAt, cookie httpOnly - deu bi di vong hoan toan.
    //
    // Nhanh do sinh ra de phuc vu luong doi code phia may chu (Next route
    // app/api/auth/google/token). Nay luong do tra id_token ve trinh duyet va
    // trinh duyet goi thang vao day, nen khong con ly do ton tai.
    if (!req.body.credential) {
      return res.status(400).json({ message: 'Thiếu Google credential' });
    }

    // Chu ky sai / het han / sai audience deu la "khong chung minh duoc danh
    // tinh" -> 401, khong phai 500. De nem thang ra thi khoi catch o duoi tra
    // 500, ma 500 nghia la "may chu hong" - sai han ban chat, va lam nhieu log
    // vi moi lan go token linh tinh deu thanh mot loi may chu.
    let payload;
    try {
      const ticket = await layGoogleClient().verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: 'Google credential không hợp lệ' });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Google credential không hợp lệ' });
    }

    const { sub, name, picture } = payload;
    const email = normalizeEmail(payload.email);

    const googleUserExists = await User.findOne({
        googleId: sub
    });

    if (
        googleUserExists &&
        googleUserExists.email !== email
    ) {
        return res.status(400).json({
            message: 'Google account already linked'
        });
    }

    // Find by email first
    let user = await User.findOne({ email });

    if (!user) {
      // Create user WITHOUT persisting google picture into `avatar`
      user = await User.create({
        name,
        email,
        password: '', // placeholder; you may want to randomize or mark differently
        avatar: '',               // keep empty so DB does not store the external link
        googleId: sub || '',
        role: 'student'
      });
    } else {
      // if user exists but doesn't have googleId, attach it (but do not overwrite avatar)
      if ((!user.googleId || user.googleId === '') && sub) {
        user.googleId = sub;
        await user.save();
      }
    }

    // Tai khoan bi admin khoa thi khong cap token, ke ca dang nhap qua Google
    if (user.status === false) {
      return res.status(403).json({
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // build response user object: include googlePicture in response, but NOT saved to DB
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',            // DB avatar (empty until upload)
      googlePicture: picture || '',         // temporary picture from Google (not persisted)
    };

    datCookieToken(res, generateToken(user._id));

    res.json(responseUser);

  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Dang xuat - xoa cookie token
// @route   POST /api/users/logout
//
// Phai co duong nay o phia may chu: cookie httpOnly thi JavaScript khong xoa
// duoc, nen truoc day chi can localStorage.removeItem la xong, gio thi khong.
//
// KHONG dat protect() o day: nguoi dung phai dang xuat duoc ca khi token da
// het han hoac da hong. Bat dang nhap moi cho dang xuat la vo ly, va se de lai
// cookie chet trong trinh duyet.
const logoutUser = (req, res) => {
    xoaCookieToken(res);
    res.json({ message: 'Đã đăng xuất' });
};

// @desc    Register a new user (Cập nhật từ hàm createUser của bạn)
// @route   POST /api/users
const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        // Luu email dang chu thuong cho khop voi luc dang nhap
        const email = normalizeEmail(req.body?.email);

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp name, email và password' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        if (password.length < DAI_MAT_KHAU_TOI_THIEU) {
            return res.status(400).json({ message: `Password phải có ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự` });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        if (user) {
            datCookieToken(res, generateToken(user._id));

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }
    } catch (error) {
        console.error('registerUser error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'instructor'];

        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        user.role = role;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        // protect() da bo password khoi req.user, nen phai lay lai ban ghi day du
        // thi moi so sanh duoc mat khau cu.
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);

        // --- Ten hien thi ---
        if (has('name')) {
            const name = String(req.body.name || '').trim();
            if (name.length < 2) {
                return res.status(400).json({ message: 'Tên hiển thị phải có ít nhất 2 ký tự' });
            }
            if (name.length > 50) {
                return res.status(400).json({ message: 'Tên hiển thị tối đa 50 ký tự' });
            }
            user.name = name;
        }

        // --- So dien thoai ---
        // Index cua truong phone la { unique, sparse }. Sparse chi bo qua null/undefined,
        // KHONG bo qua chuoi rong: neu de '' thi nguoi thu hai xoa so se dinh loi trung khoa.
        // Vi vay xoa so = undefined chu khong phai ''.
        if (has('phone')) {
            const phone = String(req.body.phone || '').trim();

            if (!phone) {
                user.phone = undefined;
            } else {
                if (!/^[0-9+\s.-]{8,15}$/.test(phone)) {
                    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
                }
                const phoneExists = await User.findOne({
                    phone,
                    _id: { $ne: req.user._id }
                });
                if (phoneExists) {
                    return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
                }
                user.phone = phone;
            }
        }

        // --- Cac truong van ban tu do ---
        // Dung hasOwnProperty chu khong dung (a || b): voi (a || b) thi gui chuoi rong
        // se roi vao nhanh "giu gia tri cu" -> khong bao gio xoa duoc bio/fullname.
        if (has('fullname')) user.fullname = String(req.body.fullname || '').trim().slice(0, 100);
        if (has('bio')) user.bio = String(req.body.bio || '').trim().slice(0, 500);
        // --- Anh dai dien dat bang duong dan ---
        if (has('avatar')) {
            const moi = String(req.body.avatar || '').trim();
            // Bo anh cu da tai len de khong de lai file rac tren Cloudinary.
            // Xoa hong thi ke, khong duoc chan viec luu ho so cua nguoi dung.
            if (user.avatarPublicId && moi !== user.avatar) {
                await xoaAnhCu(user.avatarPublicId);
                user.avatarPublicId = '';
            }
            user.avatar = moi;
        }

        if (has('birthday')) {
            if (!req.body.birthday) {
                user.birthday = undefined;
            } else {
                const d = new Date(req.body.birthday);
                if (Number.isNaN(d.getTime())) {
                    return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
                }
                if (d > new Date()) {
                    return res.status(400).json({ message: 'Ngày sinh không thể ở tương lai' });
                }
                user.birthday = d;
            }
        }

        // 🎯 ĐẶC BIỆT: Nếu là Instructor, cho phép tự cập nhật/chọn Trường/Doanh nghiệp chủ quản
        if (user.role === 'instructor' && has('provider')) {
            user.provider = req.body.provider || null;
        }

        // --- Doi mat khau ---
        if (req.body.password) {
            const newPassword = String(req.body.password);

            if (newPassword.length < 6) {
                return res.status(400).json({ message: `Mật khẩu mới phải có ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự` });
            }

            // Tai khoan dang nhap bang Google chua tung dat mat khau -> cho dat lan dau
            // ma khong can mat khau cu. Con lai BAT BUOC xac minh mat khau hien tai:
            // khong co buoc nay thi bat ky ai muon duoc token (may dung chung, XSS,
            // token con han 30 ngay) deu doi duoc mat khau va chiem han tai khoan.
            if (user.password) {
                const currentPassword = req.body.currentPassword;
                if (!currentPassword) {
                    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại' });
                }
                const ok = await bcrypt.compare(String(currentPassword), user.password);
                if (!ok) {
                    return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
                }
                if (await bcrypt.compare(newPassword, user.password)) {
                    return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
                }
            }

            const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
            user.password = await bcrypt.hash(newPassword, salt);

            // Vo hieu hoa moi token da cap truoc thoi diem nay - xem ghi chu o
            // model User va o protect(). Lui lai 1 giay vi truong iat cua JWT
            // chi tinh den giay: khong lui thi chinh token vua cap trong cung
            // giay do cung co the bi tu choi.
            user.passwordChangedAt = new Date(Date.now() - 1000);
        }

        await user.save();

        // Tra ve ban ghi day du (tru password). Ban cu chi tra 7 truong nen frontend
        // gop ket qua vao localStorage se lam mat avatar / bio / phone.
        const fresh = await User.findById(user._id)
            .populate('provider', 'name logo');

        const out = fresh.toObject();
        out.hasPassword = Boolean(out.password);
        delete out.password;

        res.json(out);
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Nguoi dung tu vo hieu hoa tai khoan cua minh
// @route   PUT /api/users/deactivate
const deactivateMyAccount = async (req, res) => {
    try {
        // Khoa admin cuoi cung lai thi khong con ai mo khoa duoc cho ai nua.
        if (req.user.role === 'admin') {
            return res.status(400).json({
                message: 'Tài khoản admin không thể tự vô hiệu hóa'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        // Yeu cau nhap lai mat khau: nut nay lam nguoi dung mat quyen truy cap
        // va chi admin moi mo lai duoc, nen phai chac chan la chinh chu.
        if (user.password) {
            if (!req.body.password) {
                return res.status(400).json({ message: 'Vui lòng nhập mật khẩu để xác nhận' });
            }
            const ok = await bcrypt.compare(String(req.body.password), user.password);
            if (!ok) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }
        }

        user.status = false;
        await user.save();

        res.json({ message: 'Tài khoản đã được vô hiệu hóa' });
    } catch (error) {
        console.error('deactivateMyAccount error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get instructors filtered by Provider (Phục vụ Admin khi tạo khóa học)
// @route   GET /api/users/instructors
const getInstructorsByProvider = async (req, res) => {
    try {
        const { providerId } = req.query;
        let filter = { role: 'instructor' };
        
        if (providerId) {
            filter.provider = providerId;
        }

        const instructors = await User.find(filter).select('name email fullname provider');
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User đã bị xóa' });
        } else {
            res.status(404).json({ message: 'User không tìm thấy' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------------------------------------
// Anh dai dien tai tu may len
// ---------------------------------------------------------------------------

// Xoa mot anh da tai len. Khong bao gio nem loi ra ngoai: xoa anh cu that bai
// khong phai ly do de tu choi luu anh moi cua nguoi dung.
const xoaAnhCu = async (publicId) => {
    if (!publicId) return;
    try {
        await layCloudinary().uploader.destroy(publicId, { invalidate: true });
    } catch (e) {
        console.error('Khong xoa duoc anh dai dien cu:', publicId, e.message);
    }
};

// Cloudinary chua cau hinh thi upload nem loi kho hieu tan sau. Kiem o day de
// tra ve dung nguyen nhan, giong cach lam o documentController.
const cloudinaryReady = () => {
    const c = layCloudinary().config();
    return Boolean(c.cloud_name && c.api_key && c.api_secret);
};

// @desc    Tai anh dai dien tu may len
// @route   POST /api/users/profile/avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một tấm ảnh' });
        }

        if (!cloudinaryReady()) {
            return res.status(503).json({
                message:
                    'Máy chủ chưa cấu hình Cloudinary nên chưa nhận được ảnh tải lên. ' +
                    'Cần đặt CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và ' +
                    'CLOUDINARY_API_SECRET trong backend/.env. ' +
                    'Trong lúc chờ, bạn vẫn dán được đường dẫn ảnh.',
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User không tìm thấy' });

        const anhCu = user.avatarPublicId;

        // Cat vuong quanh khuon mat va ep ve 400x400 ngay tren Cloudinary.
        // Lam o day chu khong phai o trinh duyet: anh 4000px chup bang dien
        // thoai ma de nguyen thi moi lan hien avatar 28px deu tai ve vai MB.
        const ketQua = await uploadToCloudinary(req.file.buffer, 'image', {
            folder: 'learning-portal/avatars',
            public_id: `avatar-${user._id}-${Date.now()}`,
            use_filename: false,
            unique_filename: false,
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });

        user.avatar = ketQua.secure_url;
        user.avatarPublicId = ketQua.public_id;
        await user.save();

        // Anh cu xoa SAU khi da luu anh moi: doi lai thi upload hong se lam
        // nguoi dung mat luon anh dang co.
        await xoaAnhCu(anhCu);

        const fresh = await User.findById(user._id).populate('provider', 'name logo');
        const out = fresh.toObject();
        out.hasPassword = Boolean(out.password);
        delete out.password;

        res.json(out);
    } catch (error) {
        console.error('uploadAvatar error:', error);
        res.status(500).json({ message: error.message || 'Không tải được ảnh lên' });
    }
};

module.exports = {
    deactivateMyAccount,
    logoutUser,
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile,
    uploadAvatar,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser
};

