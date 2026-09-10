const mongoose = require('mongoose');

// Bo dem dung chung cua cac lop gioi han tan suat: dang nhap sai, dang ky,
// doi mat khau.
//
// VI SAO PHAI NAM TRONG CSDL chu khong phai mot Map trong bo nho tien trinh:
//
// Backend nay chay tren Vercel (@vercel/node - xem vercel.json), tuc la moi
// request roi vao MOT trong nhieu lambda instance, va instance duoc tao / thu
// hoi lien tuc. Map trong bo nho la bo dem RIENG cua tung instance, nen nguong
// "sai 5 lan thi khoa" tren thuc te thanh "sai 5 lan MOI instance", va mat
// sach moi lan container bi thu hoi. Noi thang: lop chan do mat khau nhin ma
// nguon thi thay co, chay that tren production thi gan nhu khong chan gi.
// Moi lop khac cua duong dang nhap deu kin, rieng lop nay chi kin khi chay
// `node index.js` mot tien trinh duy nhat.
//
// Dung Mongo chu khong dung Redis: cum Atlas da co san va da mo ket noi cho
// moi request roi. Them Redis la them mot dich vu phai nuoi, phai co secret,
// phai xu ly luc no chet - chi de giu vai con so song 15 phut.
//
// _id CHINH LA khoa dem (vi du 'dangnhap:ip:1.2.3.4'), nen moi thao tac deu
// la mot lenh theo khoa chinh, khong can index phu.
//
// expiresAt mang index TTL: Mongo tu xoa ban ghi het han, khong can cron don
// rac. TTL chay moi ~60 giay nen khong chinh xac tuyet doi - vi vay moi phep
// doc/ghi o utils/khoGioiHan.js van tu kiem han bang tay, ban ghi qua han chi
// la rac cho xoa chu khong bao gio duoc tinh.
const boDemGioiHanSchema = new mongoose.Schema(
    {
        _id: { type: String },

        // So lan da ghi nhan trong cua so hien tai.
        count: { type: Number, default: 0 },

        // Thoi diem mo cua so dang dem.
        firstAt: { type: Date, required: true },

        // Khac null nghia la dang bi khoa toi thoi diem nay.
        blockedUntil: { type: Date, default: null },

        // Thoi diem ban ghi het y nghia = max(firstAt + cuaSo, blockedUntil).
        // Vua la moc TTL cho Mongo, vua la moc "mo cua so dem moi" cho ma nguon.
        expiresAt: { type: Date, required: true },
    },
    { versionKey: false, collection: 'bo_dem_gioi_han' },
);

boDemGioiHanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.BoDemGioiHan
    || mongoose.model('BoDemGioiHan', boDemGioiHanSchema);
