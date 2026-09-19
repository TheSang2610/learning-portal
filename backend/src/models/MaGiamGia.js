const mongoose = require('mongoose');

/**
 * Ma giam gia dung khi mua khoa hoc.
 *
 * MOI TRUONG O DAY DEU LA MOT CACH BI LAM DUNG NEU THIEU:
 *
 *   soLuotToiDa  - khong co thi mot ma ro ri len mang la ai cung dung duoc,
 *                  khong gioi han, cho toi khi co nguoi phat hien ra.
 *   moiNguoiMotLan - khong co thi mot nguoi dung ma 50% mua 20 khoa trong mot
 *                  buoi. Co thi ma khuyen mai van la khuyen mai.
 *   ketThuc      - ma khong han la ma song mai. Chien dich thang 9 van dung
 *                  duoc vao thang 12 nam sau.
 *   giamToiDa    - chan cho ma phan tram. 50% cua khoa 200k la 100k, nhung 50%
 *                  cua khoa 5 trieu la 2,5 trieu - nhieu hon y dinh rat xa.
 *
 * `daDung` duoc tang bang $inc CO DIEU KIEN luc ap ma (xem maGiamGiaController),
 * khong phai doc-roi-ghi. Doc roi ghi thi hai nguoi bam cung luc deu doc duoc
 * so cu va ma vuot qua so luot cho phep.
 */

const maGiamGiaSchema = new mongoose.Schema(
    {
        // Luon luu CHU HOA. Nguoi dung go tay ma nay nen khong the bat ho go
        // dung chu hoa chu thuong; chuan hoa mot lan o day thay vi so sanh
        // khong phan biet hoa thuong o moi cho (cai do khong dung duoc index).
        ma: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 3,
            maxlength: 32,
        },

        moTa: {
            type: String,
            default: '',
            maxlength: 300,
        },

        loai: {
            type: String,
            enum: ['phanTram', 'soTien'],
            required: true,
        },

        // phanTram: 1-100. soTien: so dong.
        giaTri: {
            type: Number,
            required: true,
            min: 0,
        },

        // Chi ap dung cho don tu muc nay tro len. 0 = khong rang buoc.
        donToiThieu: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Tran so tien duoc giam, chi co nghia voi loai 'phanTram'.
        // null = khong chan (chi nen dung khi phan tram nho).
        giamToiDa: {
            type: Number,
            default: null,
            min: 0,
        },

        batDau: {
            type: Date,
            default: Date.now,
        },

        ketThuc: {
            type: Date,
            required: true,
        },

        // null = khong gioi han tong so luot.
        soLuotToiDa: {
            type: Number,
            default: null,
            min: 1,
        },

        daDung: {
            type: Number,
            default: 0,
            min: 0,
        },

        moiNguoiMotLan: {
            type: Boolean,
            default: true,
        },

        // Rong = ap dung cho MOI khoa. Co phan tu = chi nhung khoa duoc liet ke.
        apDungKhoa: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],

        // Tat nhanh ma khong can xoa. Xoa mot ma da co nguoi dung la mat dau
        // vet doi soat; tat thi lich su van con.
        hoatDong: {
            type: Boolean,
            default: true,
        },

        nguoiTao: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true },
);

// Danh sach quan tri: ma dang bat, moi nhat truoc.
maGiamGiaSchema.index({ hoatDong: 1, ketThuc: -1 });

module.exports = mongoose.model('MaGiamGia', maGiamGiaSchema);
