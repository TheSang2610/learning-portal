const mongoose = require('mongoose');

/**
 * So nhat ky moi lan coin ra vao vi cua mot hoc vien.
 *
 * VI SAO PHAI CO SO NAY, khong chi luu moi con so du tren User:
 *
 * Coin la thu mua duoc hang. Chi luu so du thi khi hoc vien hoi "sao tui con
 * 120 coin ma khong phai 300" thi khong ai tra loi duoc - con so do khong keo
 * ve dau ca. Co so nhat ky thi tra ve duoc tung dong: nap luc nao, ai nap, mua
 * khoa nao het bao nhieu.
 *
 * Va do la cach duy nhat phat hien nham lan: cong tat ca soCoin cua mot nguoi
 * phai bang dung so du hien tai cua ho. Lech nhau la biet co cho ghi thieu.
 */
const giaoDichCoinSchema = new mongoose.Schema({

    hocVien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    loai: {
        type: String,
        enum: ['nap', 'thuHoi', 'mua', 'tangKhoa'],
        required: true
    },

    /**
     * CO DAU: duong la coin vao vi, am la coin ra khoi vi.
     *
     * Luu co dau chu khong tach thanh hai cot "vao"/"ra" de cong tong ra ngay
     * so du, khong phai nho tru cot no cho cot kia moi lan tinh - va do chinh
     * la cho de quen dau tru nhat.
     *
     * 'tangKhoa' co soCoin = 0: quan tri mo khoa thang, khong dinh gi den vi.
     * Van ghi vao so de hoc vien thay duoc vi sao minh bong nhien co khoa do.
     */
    soCoin: {
        type: Number,
        required: true
    },

    /**
     * So du NGAY SAU giao dich nay.
     *
     * Chup lai thay vi tinh lai tu dau moi lan mo trang: so nhat ky chi dai
     * them chu khong bao gio sua, nen con so nay la bang chung cho trang thai
     * vi tai dung thoi diem do. Co no thi doi chieu duoc ca chuoi giao dich ma
     * khong can doc lai toan bo bang.
     */
    soDuSau: {
        type: Number,
        required: true,
        min: 0
    },

    // Chi co voi 'mua' va 'tangKhoa'.
    khoa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },

    ghiChu: {
        type: String,
        default: '',
        trim: true,
        maxlength: 300
    },

    /**
     * Quan tri da bam nut. De trong khi hoc vien tu mua bang coin.
     *
     * Bat buoc phai co voi 'nap'/'thuHoi'/'tangKhoa': day la nhung viec sinh ra
     * gia tri tu hu khong, phai truy duoc ai lam.
     */
    nguoiTao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, { timestamps: true });

// Mo so nhat ky cua mot nguoi, moi nhat truoc - truy van hay dung nhat.
giaoDichCoinSchema.index({ hocVien: 1, createdAt: -1 });

module.exports = mongoose.model('GiaoDichCoin', giaoDichCoinSchema);
