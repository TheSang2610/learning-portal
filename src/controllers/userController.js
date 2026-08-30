const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { recordLoginFailure, clearLoginAttempts } = require('../middlewares/loginRateLimit');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email luon luu/tra cuu o dang chu thuong da trim -> tranh tao trung tai khoan
// va tranh truong hop go hoa mot chu la khong dang nhap duoc.
const normalizeEmail = (v) => String(v || '').trim().toLowerCase();

// Kiem tra dinh dang co ban, khong dung regex phuc tap de tranh ReDoS
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// Tạo Token JWT (hàm tiện ích nội bộ)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
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
    console.log('googleLogin body:', req.body);

    let payload;

    // Case A: frontend sends id token (credential)
    if (req.body.credential) {
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (req.body.googleId || req.body.email) {
      // Case B: frontend sends user payload after server-side exchange
      payload = {
        sub: req.body.googleId || req.body.sub,
        email: req.body.email,
        name: req.body.name,
        picture: req.body.picture,
      };
    } else {
      return res.status(400).json({ message: 'Missing Google credential or user payload' });
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

    res.json({
      ...responseUser,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: error.message });
  }
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

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password phải có ít nhất 6 ký tự' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
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
        if (has('avatar')) user.avatar = String(req.body.avatar || '').trim();

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
                return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
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

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
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

module.exports = {
    deactivateMyAccount,
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser
};

