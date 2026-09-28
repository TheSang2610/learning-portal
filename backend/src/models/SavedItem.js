const mongoose = require('mongoose');

/**
 * Bai viet (blog) / tai lieu ma mot nguoi da bam nut luu - hien o trang ca nhan.
 *
 * Truoc day danh sach nay nam trong localStorage cua trinh duyet: doi may la
 * mat, va khong gan voi tai khoan. Nay luu o may chu theo tung nguoi.
 *
 * Mot bang cho ca hai loai, phan biet bang `loai`, thay vi hai bang rieng:
 * trang ca nhan can MOT danh sach tron hai loai, xep theo luc luu.
 */
const LOAI = ['baiViet', 'taiLieu'];

const savedItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loai: {
        type: String,
        enum: LOAI,
        required: true
    },
    // Id cua Post hoac Document tuy `loai`. Khong dung refPath: populate hai
    // bang khac nhau voi hai bo truong khac nhau thi tu truy van ro rang hon.
    doiTuong: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Moi thu chi luu MOT lan. Unique o CSDL chu khong "kiem roi moi ghi": bam
// nut hai lan that nhanh la hai request song song, kiem truoc thi ca hai cung
// thay "chua luu" - dung loi trung da gap o DocumentActivity.
savedItemSchema.index({ user: 1, loai: 1, doiTuong: 1 }, { unique: true });
// Trang ca nhan: moi nhat truoc.
savedItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);
module.exports.LOAI = LOAI;
