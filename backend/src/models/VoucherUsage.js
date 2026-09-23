const mongoose = require('mongoose');

/**
 * Mot luot dung ma giam gia cua mot nguoi.
 *
 * VI SAO LA BANG RIENG CHU KHONG PHAI MANG TRONG MaGiamGia:
 *   Rang buoc "moi nguoi mot lan" phai duoc CSDL bao dam, khong phai ma nguon.
 *   Neu de mang `nguoiDaDung` trong tai lieu ma giam gia thi phep kiem se la
 *   doc-roi-ghi: hai yeu cau cua cung mot nguoi den cung luc deu doc thay
 *   "chua dung", ca hai cung ghi, va nguoi do dung ma hai lan.
 *
 *   Index duy nhat { ma, user } o day lam viec do thay: ban ghi thu hai bi
 *   CSDL tu choi, du hai yeu cau chay song song hoan toan.
 *
 * `donHang` de doi soat va de HOAN LUOT khi don bi huy - xem hoanLuotDungMa
 * trong maGiamGiaController.
 */

const luotDungSchema = new mongoose.Schema(
    {
        ma: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MaGiamGia',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },

        soTienGiam: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Rong khi mua bang coin (khong sinh don chuyen khoan).
        donHang: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
    },
    { timestamps: true },
);

// RANG BUOC CHINH cua bang nay. Xem ghi chu dau file.
luotDungSchema.index({ ma: 1, user: 1 }, { unique: true });

// Cho man hinh quan tri: ai da dung mot ma cu the.
luotDungSchema.index({ ma: 1, createdAt: -1 });

module.exports = mongoose.model('LuotDungMa', luotDungSchema);
