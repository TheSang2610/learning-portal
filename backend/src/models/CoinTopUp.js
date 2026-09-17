const mongoose = require('mongoose');

/**
 * Yeu cau nap coin cua hoc vien.
 *
 * Vi sao khong dung lai bang Order: Order bat buoc phai co `course`, vi no
 * sinh ra de mua MOT khoa hoc. Nap coin thi khong gan voi khoa nao. Noi long
 * rang buoc do de dung chung mot bang se lam moi cho doc Order phai tu hoi
 * "don nay co khoa hoc khong" - dat mot bang rieng re hon nhieu.
 *
 * Luong: hoc vien dat yeu cau -> chuyen khoan theo ma -> NGAN HANG bao co ve
 * webhook -> he thong khop ma va cong coin ngay. Xem
 * controllers/webhookNganHangController.js.
 *
 * Duong xac nhan tay cua quan tri VAN GIU, cho cac khoan webhook khong khop
 * duoc: go sai ma, chuyen thieu tien, chuyen sau khi da huy.
 *
 * Deu KHONG tu dong cong khi hoc vien bam "toi da chuyen roi": do moi la loi
 * khai, tin vao no thi ai cung nap duoc coin mien phi. Chi tien that ve tai
 * khoan that moi sinh ra coin.
 */

// Bo 0/O va 1/I/L nhu ma don hang: nguoi dung phai GO LAI ma nay vao noi dung
// chuyen khoan khi khong quet duoc QR, go nham mot ky tu la tien den noi ma
// khong khop yeu cau nao.
const BANG_CHU = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DAI_MA = 4;

// 15 phut, bang han cua don mua khoa hoc.
const HAN_GIU_MS = 15 * 60 * 1000;

const coinTopUpSchema = new mongoose.Schema({
    // Ma ghi trong noi dung chuyen khoan, vi du "NAP7K3M". Tien phan biet voi
    // don mua khoa hoc (DH...) ngay tu ma, nen quan tri nhin sao ke la biet
    // khoan nay thuoc loai nao.
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    soCoin: {
        type: Number,
        required: true,
        min: 1
    },

    // Chup lai so tien TAI THOI DIEM dat yeu cau. Ty gia doi ve sau thi yeu cau
    // cu van giu dung so tien da hien tren ma QR ma hoc vien vua chuyen.
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // 'abandoned': hoc vien roi khoi trang (reload, bam back) nen ma cu khong
    // con hien ra nua va he thong da cap ma moi. KHONG dung 'cancelled' cho
    // truong hop nay: 'cancelled' la hoc vien CHU DONG bam huy, con bo roi la
    // vo tinh. Phan biet duoc thi webhook con cong duoc tien ve theo ma cu -
    // nguoi ta chuyen xong roi moi lo tay F5 la chuyen rat thuong gap, xoa
    // thang ma di la an tien cua ho.
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'expired', 'abandoned'],
        default: 'pending'
    },

    expiresAt: {
        type: Date,
        required: true
    },

    // Luc hoc vien bam "Toi da chuyen khoan". Chi la loi khai, khong phai bang
    // chung - dung de xep thu tu viec cho quan tri.
    daBaoChuyenKhoanLuc: {
        type: Date,
        default: null
    },

    paidAt: { type: Date, default: null },

    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    note: {
        type: String,
        default: '',
        maxlength: 500
    }
}, { timestamps: true, collection: 'coin_topups' });

// Moi hoc vien chi duoc om MOT yeu cau dang cho. Khong co rang buoc nay thi
// bam nhieu lan sinh ra nhieu ma, hoc vien chuyen theo ma nay ma quan tri lai
// mo ma kia.
coinTopUpSchema.index(
    { student: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);
coinTopUpSchema.index({ status: 1, createdAt: -1 });

coinTopUpSchema.methods.daHetHan = function () {
    return this.status === 'pending' && this.expiresAt.getTime() < Date.now();
};

/** Sinh ma ngau nhien, dang NAP + 4 ky tu. */
const sinhMa = () => {
    let ma = 'NAP';
    for (let i = 0; i < DAI_MA; i += 1) {
        ma += BANG_CHU[Math.floor(Math.random() * BANG_CHU.length)];
    }
    return ma;
};

module.exports = mongoose.model('CoinTopUp', coinTopUpSchema);
module.exports.sinhMa = sinhMa;
module.exports.HAN_GIU_MS = HAN_GIU_MS;
