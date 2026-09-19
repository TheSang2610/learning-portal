const mongoose = require('mongoose');

// Bang chu cai sinh ma don.
//
// Bo han 0/O va 1/I/L: nguoi dung phai GO LAI ma nay vao noi dung chuyen khoan
// neu khong quet duoc QR. Go nham mot ky tu la tien den noi ma khong khop don
// nao, va viec do chi phat hien ra khi co nguoi khieu nai.
const BANG_CHU = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DAI_MA = 4;

// 15 phut - dung bang F8 va du de mo app ngan hang chuyen khoan.
// Ngan hon thi nguoi dung dang go dở bi huy don; dai hon thi mot nguoi co the
// om nhieu don treo cung luc.
const HAN_GIU_DON_MS = 15 * 60 * 1000;

const orderSchema = new mongoose.Schema({
    // Ma nguoi dung ghi vao noi dung chuyen khoan, vi du "DH79ME".
    // Day la thu DUY NHAT noi tien ve voi don hang, nen phai la duy nhat.
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Chup lai gia TAI THOI DIEM dat don, khong doc gia hien tai cua khoa hoc.
    //
    // Neu doc gia hien tai: nguoi dung dat don luc gia 499k, quan tri sua gia
    // len 799k trong luc ho dang chuyen khoan, the la don bong nhien thieu tien
    // va khong ai hieu vi sao.
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // Gia truoc khi giam. Bang `amount` khi khong dung ma.
    //
    // Luu ca hai chu khong chi luu gia goc roi tru lai luc hien: ma QR sinh
    // theo `amount`, va doi soat sao ke cung so khop voi `amount`. Con `giaGoc`
    // chi de hien "500.000d -> 400.000d" cho nguoi dung thay ho duoc giam that.
    giaGoc: {
        type: Number,
        default: null,
        min: 0
    },

    // Chuoi ma da dung, chup lai tai thoi diem dat don.
    //
    // Luu chuoi chu khong phai tham chieu: ma co the bi sua hoac tat sau do,
    // nhung don nay VAN da duoc giam theo dieu kien luc do. Tham chieu toi ban
    // ghi dang song la doc ra dieu kien hien tai, tuc la viet lai lich su -
    // cung ly do voi viec `amount` chup gia thay vi doc gia hien tai.
    maGiamGia: {
        type: String,
        default: null,
        uppercase: true,
        trim: true,
        maxlength: 32
    },

    soTienGiam: {
        type: Number,
        default: 0,
        min: 0
    },

    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'expired'],
        default: 'pending'
    },

    expiresAt: {
        type: Date,
        required: true
    },

    paidAt: Date,

    // Ai bam xac nhan. He thong nay khong noi voi cong thanh toan nao, nen
    // viec doi chieu sao ke la thu cong - phai biet ai da xac nhan don nao.
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    note: {
        type: String,
        default: '',
        maxlength: 500
    },

    /**
     * Luc hoc vien bam "Toi da chuyen khoan". Rong = chua bam.
     *
     * Khong phai bang chung da tra tien - chi la loi khai. Nhung no la thu
     * quyet dinh THU TU quan tri xu ly: don co moc nay la don co nguoi dang
     * ngoi cho, phai mo sao ke doi chieu ngay; don khong co thi cu de do.
     *
     * Truoc day khong co truong nay nen quan tri phai tu mo trang xem co don
     * moi khong - tuc la hoac ngoi canh man hinh ca ngay, hoac de nguoi ta cho.
     */
    daBaoChuyenKhoanLuc: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Mot nguoi chi duoc co MOT don dang cho cho MOT khoa hoc.
//
// Chi ap dung cho don 'pending' (partialFilterExpression): don da huy hay da
// thanh toan thi khong chan nguoi ta mua lai hay mua khoa khac.
orderSchema.index(
    { student: 1, course: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

// Tra cuu theo trang thai + thoi gian cho man hinh quan tri.
orderSchema.index({ status: 1, createdAt: -1 });

/** Don da qua han chua? Tinh luc doc, khong cho tac vu nen quet. */
orderSchema.methods.daHetHan = function () {
    return this.status === 'pending' && this.expiresAt.getTime() < Date.now();
};

/** Sinh mot ma don ngau nhien, dang DH + 4 ky tu. */
const sinhMa = () => {
    let ma = 'DH';
    for (let i = 0; i < DAI_MA; i += 1) {
        ma += BANG_CHU[Math.floor(Math.random() * BANG_CHU.length)];
    }
    return ma;
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.sinhMa = sinhMa;
module.exports.HAN_GIU_DON_MS = HAN_GIU_DON_MS;
