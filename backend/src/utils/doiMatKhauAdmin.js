// Doi mat khau cho MOT tai khoan, chay mot lan bang tay.
//
// Vi sao co file nay: truoc khi dua trang len mang, tai khoan quan tri con dung
// mat khau 3 ky tu. Trang cong khai + email quan tri doan duoc + mat khau ngan
// la mat sach du lieu. Doi bang tay qua Atlas thi phai tu bam bcrypt dung so
// vong, va rat de quen passwordChangedAt - thieu no thi token cu van dung duoc.
//
// CACH CHAY (tu thu muc backend):
//
//   MAT_KHAU_MOI='mat-khau-that-cua-ban' node src/utils/doiMatKhauAdmin.js
//
// Doi tai khoan khac thi them EMAIL:
//
//   EMAIL=ai.do@gmail.com MAT_KHAU_MOI='...' node src/utils/doiMatKhauAdmin.js
//
// Mat khau truyen qua bien moi truong chu khong phai tham so dong lenh, vi
// tham so dong lenh hien ra trong danh sach tien trinh cua may.

require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const { BCRYPT_ROUNDS, DAI_MAT_KHAU_TOI_THIEU } = require('./matKhau');

const EMAIL_MAC_DINH = 'admin@gmail.com';

const thoat = (ma, thongBao) => {
    console[ma === 0 ? 'log' : 'error'](thongBao);
    process.exit(ma);
};

const chay = async () => {
    const email = String(process.env.EMAIL || EMAIL_MAC_DINH).trim().toLowerCase();
    const matKhauMoi = process.env.MAT_KHAU_MOI;

    if (!matKhauMoi) {
        thoat(1, 'Thieu MAT_KHAU_MOI. Xem huong dan o dau file nay.');
    }

    // Chinh he thong nay bat nguoi dung dat toi thieu 8 ky tu, nen tai khoan
    // quan tri khong duoc phep la ngoai le.
    if (matKhauMoi.length < DAI_MAT_KHAU_TOI_THIEU) {
        thoat(1, `Mat khau phai tu ${DAI_MAT_KHAU_TOI_THIEU} ky tu tro len.`);
    }

    await connectDB();

    const nguoi = await User.findOne({ email });
    if (!nguoi) {
        thoat(1, `Khong tim thay tai khoan: ${email}`);
    }

    nguoi.password = await bcrypt.hash(matKhauMoi, BCRYPT_ROUNDS);

    // Lui lai 1 giay. JWT ghi thoi diem cap (iat) theo GIAY, con moc nay theo
    // mili giay: dat dung luc nay thi mot token vua cap trong cung giay do co
    // the bi coi la "cap truoc khi doi" hoac nguoc lai, tuy lam tron. Lui 1
    // giay thi moi token cu chac chan bi vo hieu, va token cap sau van song.
    nguoi.passwordChangedAt = new Date(Date.now() - 1000);

    await nguoi.save();

    console.log(`Da doi mat khau cho ${email}.`);
    console.log('Moi phien dang nhap cu tren tai khoan nay da bi vo hieu.');
};

chay()
    .catch((loi) => {
        console.error('That bai:', loi.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
