const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    fullname: {
        type: String,
        default: ''
    },

    birthday: {
        type: Date
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        default: ''
    },

    avatar: {
        type: String,
        default: ''
    },

    // public_id cua anh tren Cloudinary, chi co khi anh do NGUOI DUNG TU TAI LEN.
    // Dan link tu noi khac thi de trong - de biet luc doi anh moi thi anh cu
    // nao la cua minh ma xoa, anh nao la cua nguoi ta ma dung dong vao.
    avatarPublicId: {
        type: String,
        default: ''
    },

    // Moc thoi gian doi mat khau gan nhat.
    //
    // JWT khong the thu hoi: da cap ra la con hieu luc het han cua no. Nen khi
    // nguoi dung doi mat khau vi nghi bi lo, cac token cu VAN dung duoc neu
    // khong co truong nay. protect() so sanh moc do voi thoi diem cap token
    // (iat) va tu choi moi token cap TRUOC luc doi.
    //
    // Bo trong voi tai khoan chua tung doi mat khau - luc do khong co gi de so.
    passwordChangedAt: Date,

    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        default: null
    },
    
    bio: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        unique: true,
        sparse: true
    },

    status: {
        type: Boolean,
        default: true
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    /**
     * Da chung minh duoc quyen so huu dia chi email chua.
     *
     * CHU Y - truong nay CO Y khong co `default`:
     *   undefined  tai khoan tao TRUOC khi co luong xac minh. Van dang nhap
     *              binh thuong.
     *   false      vua dang ky, dang cho bam lien ket trong email.
     *   true       da bam lien ket, hoac dang nhap bang Google (Google da xac
     *              minh ho roi).
     *
     * Dat `default: false` o day nhin thi vo hai nhung la KHOA TOAN BO NGUOI
     * DUNG CU RA NGOAI ngay trong lan deploy dau tien: Mongoose ap gia tri mac
     * dinh ca luc NAP mot ban ghi cu thieu truong, chu khong chi luc tao moi.
     * Vi vay loginUser chi chan khi truong nay dung bang false, chu khong dung
     * phep phu dinh.
     */
    emailVerified: {
        type: Boolean
    },

    // Ban bam SHA-256 cua token xac minh email - xem utils/tokenXacMinh.js.
    // Chi luu ban bam, khong bao gio luu token goc: ly do ghi o dau file do.
    verifyTokenHash: {
        type: String,
        index: true,
        sparse: true
    },

    verifyTokenExp: Date,

    /**
     * So coin dang co trong vi.
     *
     * Chi duoc doi qua utils/viCoin.js - dung $inc co dieu kien, khong bao gio
     * doc ra roi gan de len. Ly do ghi ro trong file do.
     *
     * min: 0 la luoi cuoi cung o tang luoc do: du co duong nao tinh sai thi
     * Mongoose cung tu choi luu so am, chu khong de mot cai vi mang no.
     */
    soDuCoin: {
        type: Number,
        default: 0,
        min: 0
    },

    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],

    createdCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]

}, { timestamps: true });


// AUTO GENERATE USER ID
userSchema.pre('save', async function () {

    if (this.userId) {
        return;
    }

    let newUserId;
    let existingUser;

    do {

        newUserId = `USR${Math.floor(
            10000000 + Math.random() * 90000000
        )}`;

        existingUser = await mongoose.models.User.findOne({
            userId: newUserId
        });

    } while (existingUser);

    this.userId = newUserId;
});

module.exports = mongoose.model('User', userSchema);