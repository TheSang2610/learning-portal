const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tạo Token JWT (hàm tiện ích nội bộ)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Account Google chưa có password
        if (!user.password ) {
            return res.status(401).json({
                message: 'Vui lòng đăng nhập bằng Google'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
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

    const { sub, email, name, picture } = payload;

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
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp name, email và password' });
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
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        if (req.body.phone) {
            const phoneExists = await User.findOne({
                phone: req.body.phone,
                _id: { $ne: req.user._id }
            });

            if (phoneExists) {
                return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
            }
            user.phone = req.body.phone;
        }

        // Cập nhật các trường thông tin cơ bản
        user.name = req.body.name || user.name;
        user.fullname = req.body.fullname || user.fullname;
        user.birthday = req.body.birthday || user.birthday;
        user.avatar = req.body.avatar || user.avatar;
        user.bio = req.body.bio || user.bio;

        // 🎯 ĐẶC BIỆT: Nếu là Instructor, cho phép tự cập nhật/chọn Trường/Doanh nghiệp chủ quản
        if (user.role === 'instructor' && req.body.provider) {
            user.provider = req.body.provider;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        
        // Trả về dữ liệu sạch kèm thông tin provider nếu có
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            fullname: updatedUser.fullname,
            birthday: updatedUser.birthday,
            email: updatedUser.email,
            role: updatedUser.role,
            provider: updatedUser.provider
        });
    } catch (error) {
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
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser
};

