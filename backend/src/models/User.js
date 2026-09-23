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

    /**
     * Dia chi email - KHONG con bat buoc.
     *
     * Dang ky gio chi doi SO DIEN THOAI. Email la truong tuy chon, va la thu
     * DUY NHAT lay lai duoc mat khau cho toi khi gan duoc nha cung cap SMS -
     * xem passwordResetController.js.
     *
     * `sparse: true` PHAI co, va phai khop voi chi muc that tren Atlas.
     *
     * MongoDB coi truong thieu la null, va chi muc unique thong thuong se cho
     * rang hai ban ghi cung thieu email la trung nhau - tuc la tai khoan thu
     * HAI khong co email se bi tu choi bang loi E11000. `sparse` bao chi muc
     * bo qua han cac ban ghi khong co truong nay.
     *
     * Mongoose KHONG tu sua duoc dieu nay: autoIndex chi tao chi muc con
     * thieu, khong doi tuy chon cua chi muc da co. Chi muc email_1 tren Atlas
     * da duoc drop va tao lai voi { unique, sparse } dung mot lan bang tay.
     * Doi dong nay ma quen doi chi muc (hoac nguoc lai) thi moi lan khoi dong
     * Mongoose se doi tao mot chi muc mau thuan va bao loi IndexOptionsConflict.
     */
    email: {
        type: String,
        unique: true,
        sparse: true
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
     * KHONG CON CHAN DANG NHAP THEO TRUONG NAY. Buoc xac minh khi dang ky da
     * bo - email gio chi dung de doi mat khau va de quan tri gui thong bao.
     * Truong duoc giu lai vi ba cho van ghi vao no (dang ky, dang nhap Google,
     * dat lai mat khau) va vi no ghi lai mot su that co that: dia chi nay da
     * duoc chung minh la co chu hay chua.
     *
     * Trong CSDL dang co du ba trang thai, va do la ly do truoc day cho nay
     * CO Y khong dat `default`:
     *   undefined  tai khoan tao truoc khi co luong xac minh
     *   false      dang ky thoi xac minh nhung khong bao gio bam lien ket
     *   true       da bam lien ket, dang nhap Google, hoac dang ky tu khi bo
     *              buoc xac minh
     *
     * Dat `default: false` o day van nguy hiem y nguyen: Mongoose ap gia tri
     * mac dinh ca luc NAP mot ban ghi cu thieu truong, chu khong chi luc tao
     * moi - tuc la no se ghi de len su that cua nhung ban ghi cu.
     */
    emailVerified: {
        type: Boolean
    },

    /**
     * Luong QUEN MAT KHAU - xem utils/otpCode.js va
     * controllers/passwordResetController.js.
     *
     * Hai cap truong chu khong phai mot, vi luong co hai buoc va moi buoc
     * mang mot loai bi mat khac han nhau:
     *
     *   resetOtpHash     ban bam BCRYPT cua ma 6 chu so gui trong thu.
     *                    Bcrypt chu khong phai SHA-256 nhu resetTicketHash o
     *                    duoi: ma 6 chu so chi co mot trieu kha nang nen ban
     *                    bam SHA-256 do het trong chua mot giay. Ly do day du
     *                    ghi o dau utils/otpCode.js.
     *
     *   resetTicketHash  ban bam SHA-256 cua "phieu" 32 byte ngau nhien, cap
     *                    ra SAU khi nhap dung ma. Phieu moi la thu mang quyen
     *                    dat mat khau moi; ma bi tieu ngay khi doi lay phieu
     *                    nen khong dung lai duoc lan hai.
     *
     * Ca hai deu CHI luu ban bam. Ban ghi User la thu de bi doc nham nhat
     * trong he thong - neu ma nam nguyen trong do thi ai doc duoc CSDL la dat
     * lai duoc mat khau cua bat ky ai dang cho ma.
     *
     * Khong dat `default`: tai khoan chua bao gio quen mat khau thi khong co
     * truong nao ca, va index sparse ben duoi bo qua chung.
     */
    resetOtpHash: String,
    resetOtpExp: Date,

    // index de doi phieu -> nguoi dung bang mot lan tra cuu, thay vi quet bang.
    resetTicketHash: {
        type: String,
        index: true,
        sparse: true
    },

    resetTicketExp: Date,

    /**
     * So coin dang co trong vi.
     *
     * Chi duoc doi qua utils/coinWallet.js - dung $inc co dieu kien, khong bao gio
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