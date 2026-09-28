const mongoose = require('mongoose');

/**
 * Binh luan duoi mot tai lieu chia se.
 *
 * MOT CAP tra loi: binh luan goc co the co tra loi, tra loi thi KHONG co tra
 * loi con. Tra loi vao mot tra loi se duoc gan vao binh luan goc cua no - xem
 * createComment trong controller. Long vo tan thi tren dien thoai moi cap thut
 * vao mot doan, toi cap thu tu la chu con hai chu mot dong.
 */
const documentCommentSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Chu thuong, KHONG phai HTML. Binh luan khong can dinh dang, va khong
        // nhan HTML thi khong co gi de lot XSS - giao dien hien bang {noiDung}
        // cua React, tu thoat ky tu.
        noiDung: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        // null = binh luan goc. Co gia tri = tra loi cho binh luan goc do.
        traLoi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocumentComment',
            default: null,
        },

        // Admin an binh luan vi pham ma khong xoa han: giu lai lam bang chung,
        // va bo an duoc neu an nham.
        daAn: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

// Truy van duy nhat: moi binh luan cua mot tai lieu, cu nhat truoc.
documentCommentSchema.index({ document: 1, createdAt: 1 });

module.exports = mongoose.model('DocumentComment', documentCommentSchema);
