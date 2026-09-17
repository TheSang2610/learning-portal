const mongoose = require('mongoose');

/**
 * Nhat ky bao co ngan hang nhan tu webhook.
 *
 * VI SAO PHAI CO BANG NAY, khong cong thang coin roi thoi:
 *
 * 1. CHONG CONG HAI LAN. Nha cung cap webhook nao cung phat lai khi khong nhan
 *    duoc 200 - mang chap mot nhip la may chu nhan dung mot bao co hai lan.
 *    Khoa duy nhat tren maGiaoDich bien lan thu hai thanh loi 11000, bat duoc
 *    va bo qua. Khong co bang nay thi moi lan phat lai la mot lan cong coin.
 *
 * 2. DOI CHIEU DUOC. Tien ve ma khong khop yeu cau nao (go sai ma, chuyen
 *    thieu tien, chuyen sau khi da huy) van phai luu lai - khong luu thi khoan
 *    tien do bien mat khoi he thong va khong ai tra lai cho nguoi ta duoc.
 *
 * Bang nay CHI GHI, khong bao gio sua sau khi tao, tru truong xuLy/ghiChu khi
 * quan tri xu ly tay mot khoan chua khop.
 */

const bankTransactionSchema = new mongoose.Schema({
    // Ma giao dich do NGAN HANG (hoac nha cung cap webhook) cap. Day la khoa
    // chong trung - khong phai _id cua minh, vi minh khong quyet dinh duoc
    // khi nao ho phat lai.
    maGiaoDich: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    soTien: { type: Number, required: true, min: 0 },

    // Giu nguyen van noi dung chuyen khoan. Da rut duoc ma roi van luu ban goc:
    // khi doi chieu mot khoan sai, thu can nhin la nguoi ta go CAI GI, chu
    // khong phai thu minh hieu ra.
    noiDung: { type: String, default: '', maxlength: 500 },

    nganHang: { type: String, default: '' },
    soTaiKhoan: { type: String, default: '' },
    thoiGianNganHang: { type: Date, default: null },

    // Ma nap rut ra tu noi dung, null khi khong rut duoc.
    maNap: { type: String, default: null, uppercase: true, trim: true },

    // Ket qua xu ly. 'chua_khop' la hang doi viec cho quan tri, khong phai loi
    // he thong - phan lon la nguoi dung go thieu ma hoac chuyen thieu tien.
    xuLy: {
        type: String,
        enum: ['da_cong', 'chua_khop', 'trung', 'bo_qua'],
        default: 'chua_khop'
    },

    // Yeu cau nap duoc cong nho bao co nay, neu co.
    topUp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoinTopUp',
        default: null
    },

    soCoinDaCong: { type: Number, default: 0 },

    ghiChu: { type: String, default: '', maxlength: 500 }
}, { timestamps: true, collection: 'bank_transactions' });

// Man hinh doi chieu cua quan tri loc theo trang thai roi sap theo thoi gian.
bankTransactionSchema.index({ xuLy: 1, createdAt: -1 });
bankTransactionSchema.index({ maNap: 1 });

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);
