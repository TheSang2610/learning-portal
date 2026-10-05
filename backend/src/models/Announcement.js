const mongoose = require('mongoose');

/**
 * Mot DOT thong bao quan tri gui di. Mot ban ghi o day co the:
 *   - hien thanh dai o dau trang cho moi nguoi, ke ca khach (dangHien), va/hoac
 *   - da gui vao chuong cua nhieu nguoi (guiChuong) - cac ban ghi Notification
 *     do tro ve day qua truong thongBaoGoc.
 * Sua hay xoa ban ghi nay la sua / thu hoi ca hai noi cung luc.
 *
 * Ban dau day chi la thong bao CONG KHAI: mot dai chu o dau trang ma moi nguoi
 * deu thay, ke ca khach chua dang nhap.
 *
 * VI SAO KHONG DUNG LAI Notification:
 *   Notification la thong bao cua MOT nguoi (co truong `user`, co `daDoc`), nam
 *   trong chuong va chi nguoi da dang nhap moi doc duoc. Thong bao bao tri hay
 *   khuyen mai can toi ca khach vang lai - nhung nguoi khong co tai khoan nao de
 *   gan ban ghi vao. Nhet chung vao Notification thi hoac phai tao ban ghi
 *   khong co `user` (pha moi truy van dang loc theo req.user._id), hoac khach
 *   khong bao gio thay.
 *
 *   Them nua, mot dai cong khai la MOT ban ghi cho tat ca, con thong bao chuong
 *   la N ban ghi cho N nguoi. Hai cach luu nay khong gop duoc.
 */
const announcementSchema = new mongoose.Schema(
    {
        tieuDe: {
            type: String,
            required: true,
            maxlength: 200,
        },

        noiDung: {
            type: String,
            default: '',
            maxlength: 1000,
        },

        // Chi duong dan noi bo, kiem o utils/announcementContent.js.
        duongDan: {
            type: String,
            default: '',
        },

        // Quyet dinh mau cua dai: xanh cho tin thuong, cam cho tin can chu y
        // (bao tri, su co). Enum de giao dien khong nhan mot gia tri no khong
        // biet to mau gi.
        mucDo: {
            type: String,
            enum: ['thong_tin', 'quan_trong'],
            default: 'thong_tin',
        },

        // Go xuong thi chi tat co nay, khong xoa ban ghi: con lai lich su de
        // biet da tung bao gi cho moi nguoi.
        dangHien: {
            type: Boolean,
            default: true,
        },

        // null = hien toi khi quan tri tu go. Co ngay thi qua ngay do tu an,
        // khoi phai nho vao go thong bao bao tri sau khi bao tri xong.
        hetHan: {
            type: Date,
            default: null,
        },

        // Dot gui nay co vao chuong khong, gui cho ai, bao nhieu nguoi nhan.
        // Luu lai de trang quan tri biet thu hoi la rut khoi chuong cua ai.
        guiChuong: {
            type: Boolean,
            default: false,
        },
        vaiTro: {
            type: String,
            enum: ['', 'student', 'instructor'],
            default: '',
        },
        soNguoiNhan: {
            type: Number,
            default: 0,
        },

        nguoiTao: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        // Ghim ten collection: de Mongoose tu suy tu ten model cung ra
        // 'announcements', nhung ghim san cho khop voi ERD trong bao cao va
        // khong bi doi neu ai do doi ten model.
        collection: 'announcements',
    },
);

// Duong cong khai chi hoi "nhung cai dang hien, moi nhat truoc".
announcementSchema.index({ dangHien: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
