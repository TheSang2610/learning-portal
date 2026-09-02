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
    // JWT khong the thu hoi: da cap ra la con hieu luc du 30 ngay. Nen khi
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