// Doi mat khau cho MOT tai khoan, chay mot lan bang tay.
//
// Vi sao co file nay: truoc khi dua trang len mang, tai khoan quan tri con dung
// mat khau 3 ky tu. Trang cong khai + email quan tri doan duoc + mat khau ngan
// la mat sach du lieu. Doi bang tay qua Atlas thi phai tu bam bcrypt dung so
// vong, va rat de quen passwordChangedAt - thieu no thi token cu van dung duoc.
//
// CACH CHAY (tu thu muc backend):
//
//   NEW_PASSWORD='mat-khau-that-cua-ban' node src/utils/adminResetPassword.js
//
// Doi tai khoan khac thi them EMAIL:
//
//   EMAIL=ai.do@gmail.com NEW_PASSWORD='...' node src/utils/adminResetPassword.js
//
// Mat khau truyen qua bien moi truong chu khong phai tham so dong lenh, vi
// tham so dong lenh hien ra trong danh sach tien trinh cua may.

require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const { BCRYPT_ROUNDS, MIN_PASSWORD_LENGTH } = require('./password');

const DEFAULT_EMAIL = 'admin@gmail.com';

const thoat = (code, notification) => {
    console[code === 0 ? 'log' : 'error'](notification);
    process.exit(code);
};

const chay = async () => {
    const email = String(process.env.EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
    const newPassword = process.env.MAT_KHAU_MOI;

    if (!newPassword) {
        thoat(1, 'Thieu MAT_KHAU_MOI. Xem huong dan o dau file nay.');
    }

    // Chinh he thong nay bat nguoi dung dat toi thieu 8 ky tu, nen tai khoan
    // quan tri khong duoc phep la ngoai le.
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        thoat(1, `Mat khau phai tu ${MIN_PASSWORD_LENGTH} ky tu tro len.`);
    }

    await connectDB();

    const person = await User.findOne({ email });
    if (!person) {
        thoat(1, `Khong tim thay tai khoan: ${email}`);
    }

    person.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Lui lai 1 giay. JWT ghi thoi diem cap (iat) theo GIAY, con moc nay theo
    // mili giay: dat dung luc nay thi mot token vua cap trong cung giay do co
    // the bi coi la "cap truoc khi doi" hoac nguoc lai, tuy lam tron. Lui 1
    // giay thi moi token cu chac chan bi vo hieu, va token cap sau van song.
    person.passwordChangedAt = new Date(Date.now() - 1000);

    await person.save();

    console.log(`Da doi mat khau cho ${email}.`);
    console.log('Moi phien dang nhap cu tren tai khoan nay da bi vo hieu.');
};

chay()
    .catch((err) => {
        console.error('That bai:', err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
