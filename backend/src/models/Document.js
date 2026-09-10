const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề tài liệu'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự']
    },

    description: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung mô tả tài liệu'],
        trim: true,
        maxlength: [5000, 'Nội dung tối đa 5000 ký tự']
    },

    fileUrl: {
        type: String,
        required: true
    },

    // Can de xoa dung file tren Cloudinary khi nguoi dang go bai.
    filePublicId: {
        type: String,
        default: ''
    },

    fileName: {
        type: String,
        required: true
    },

    fileExt: {
        type: String,
        required: true,
        enum: ['pdf', 'doc', 'docx']
    },

    fileSize: {
        type: Number,
        required: true
    },

    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    downloadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Danh sach luon sap xep moi nhat truoc -> can chi muc de khoi quet ca collection.
documentSchema.index({ createdAt: -1 });

// Tim kiem theo tieu de. Dung chi muc text thay vi regex vi regex khong
// dung duoc chi muc, cang nhieu tai lieu cang cham tuyen tinh.
documentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', documentSchema);
