const mongoose = require('mongoose');

/**
 * Luot dang nhap theo ngay - cho duong "Luot dang nhap" tren bieu do va bang
 * "Dang nhap gan day" o dashboard admin.
 *
 * Chi tinh lan dang nhap THAT (go mat khau / bam Google). Quay lai trang bang
 * phien con han (cookie) khong tinh: dang xuat roi dang nhap lai moi la +1.
 *
 * Moi cap (nguoi, ngay gio VN) mot dong, `count` = so lan dang nhap trong ngay
 * cua nguoi do. Tong `count` theo ngay = so luot dang nhap; so dong theo ngay =
 * so nguoi. Gop vay thay vi mot dong moi luot de bang khong phinh theo so luot.
 */
const loginActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        day: { type: String, required: true }, // "YYYY-MM-DD" gio Viet Nam
        // Cach dang nhap GAN NHAT trong ngay.
        method: { type: String, enum: ['password', 'google'], required: true },
        count: { type: Number, default: 0 },
        lastAt: { type: Date, default: Date.now },
    },
    // Ghim ten collection: Mongoose tu suy se ra "loginactivities".
    { timestamps: true, collection: 'login_activities' }
);

// Unique o CSDL: hai lan dang nhap sat nhau la hai upsert song song.
loginActivitySchema.index({ user: 1, day: 1 }, { unique: true });
// "Dang nhap gan day": moi nhat truoc.
loginActivitySchema.index({ lastAt: -1 });
// Dashboard xem toi da 180 ngay; xoa dong cu hon de bang khong phinh mai.
loginActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 200 * 24 * 60 * 60 });

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
