const mongoose = require('mongoose');

/**
 * Mot cuoc tro chuyen giua hoc vien va tro giang AI, gan voi MOT bai hoc.
 *
 * Gan theo bai chu khong theo khoa: hoi ve bai 3 thi khong nen keo theo ngu
 * canh cua bai 1. Hoc vien quay lai bai cu van thay lai dung doan chat cu.
 *
 * VI SAO PHAI LUU:
 *   - Khong luu thi moi cau hoi la mot cuoc doi thoai moi, khong hoi tiep duoc
 *     ("cau tren y la gi?") - dung thu chi mot lan la bo.
 *   - Giang vien can xem hoc vien hay vuong o dau. Day la du lieu do that,
 *     khong phai phong doan.
 */

const tinNhanSchema = new mongoose.Schema(
    {
        // Ten vai tro rieng cua du an, khong phai ten cua hang API nao. Doi
        // sang 'user'/'model'/'assistant' o nhaCungCapAi.js, de sau nay doi
        // nha cung cap khong phai di sua du lieu da luu.
        vaiTro: {
            type: String,
            enum: ['nguoiDung', 'troLy'],
            required: true,
        },
        noiDung: {
            type: String,
            required: true,
            // Chan tren o tang luoc do nua. locCauHoi() da chan 1000 ky tu o
            // dau vao, nhung phan hoi cua AI thi khong qua ham do.
            maxlength: 8000,
        },
    },
    { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const cuocTroChuyenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        // Cho phep rong: hoi chung ve khoa khi chua mo bai nao.
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            default: null,
        },
        tinNhan: [tinNhanSchema],
    },
    { timestamps: true },
);

// Mot hoc vien chi co MOT cuoc tro chuyen cho moi bai. Dat unique o day thay vi
// kiem trong controller: hai request gui gan nhu cung luc (bam gui hai lan) se
// cung khong tim thay ban ghi nao va cung tao moi - chi rang buoc o CSDL moi
// chan duoc, vi no la noi duy nhat biet ca hai.
cuocTroChuyenSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('CuocTroChuyen', cuocTroChuyenSchema);
