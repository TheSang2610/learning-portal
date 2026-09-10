// Kiem chung DAU-CUOI luong dang ky co xac minh email.
//
//   npm run check:dangky
//
// VI SAO LA SCRIPT CHU KHONG PHAI TEST: giong checkGioiHan.js - `npm test`
// phai chay duoc tren CI, noi khong co MONGO_URI. Luong nay dung toi CSDL that
// nen no o day, chay tay.
//
// Goi THANG vao controller bang req/res gia, khong dung toi may chu HTTP. Dieu
// nay bo qua tang route (bo gioi han tan suat) - co chu dich: cai do da co
// kiem rieng, con o day can thu duong dang ky nhieu lan lien tiep.
//
// AN TOAN voi du lieu that:
//   - tao DUNG MOT tai khoan, dia chi mang tien to 'kiemthu+<ma ngau nhien>';
//   - xoa chinh tai khoan do truoc khi thoat, liet ke theo _id;
//   - khong cham vao bat ky ban ghi nao khac.
//
// CO GUI MAIL THAT: dia chi kiem thu duoc ghep tu MAIL_USER dang
// `ten+kiemthu-xxxx@gmail.com`, nen thu roi vao chinh hom thu cua ban. Gmail
// coi phan sau dau + la cung mot hop thu.

require('dotenv').config();

const crypto = require('crypto');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const { daCauHinh } = require('../config/mail');
const { registerUser, verifyEmail, loginUser } = require('../controllers/userController');
const { taoToken } = require('./tokenXacMinh');

const MA = crypto.randomBytes(3).toString('hex');
const MAT_KHAU = `Kiemthu!${crypto.randomBytes(6).toString('hex')}`;

// Ghep dia chi kiem thu tu MAIL_USER de thu ve dung hom thu cua ban.
const emailKiemThu = () => {
    const goc = process.env.MAIL_USER || 'kiemthu@example.com';
    const [ten, mien] = goc.split('@');
    return `${ten}+kiemthu-${MA}@${mien || 'example.com'}`;
};

const EMAIL = emailKiemThu().toLowerCase();

let soLoi = 0;
const check = (dat, moTa, thucTe) => {
    if (dat) {
        console.log(`  OK   ${moTa}`);
    } else {
        soLoi += 1;
        console.error(`  SAI  ${moTa}${thucTe === undefined ? '' : ` (nhan duoc: ${JSON.stringify(thucTe)})`}`);
    }
};

// res gia: ghi lai ma trang thai, than phan hoi va cac cookie duoc dat.
const gioRes = () => {
    const r = { code: 200, body: null, headers: {}, cookies: [] };
    r.status = (c) => { r.code = c; return r; };
    r.json = (b) => { r.body = b; return r; };
    r.set = (k, v) => { r.headers[k] = v; return r; };
    r.cookie = (ten, giaTri, tuyChon) => { r.cookies.push({ ten, giaTri, tuyChon }); return r; };
    r.clearCookie = () => r;
    return r;
};

const goi = async (ham, body) => {
    const res = gioRes();
    await ham({ body, ip: '127.0.0.1' }, res);
    return res;
};

const chay = async () => {
    console.log('Dang ket noi CSDL...');
    await connectDB();
    if (mongoose.connection.readyState !== 1) {
        console.error('KHONG ket noi duoc CSDL. Dung lai.');
        process.exit(1);
    }

    if (!daCauHinh()) {
        console.error(
            'CHUA DAT MAIL_USER / MAIL_APP_PASSWORD.\n'
            + 'Khong co hom thu thi registerUser chay nhanh du phong (tao va dang nhap luon),\n'
            + 'tuc la script nay se kiem nham mot luong khac han. Dat hai bien roi chay lai.',
        );
        process.exit(1);
    }

    console.log(`Da ket noi. Dia chi kiem thu: ${EMAIL}\n`);

    // -----------------------------------------------------------------
    console.log('1. Dang ky lan dau tren mot dia chi con trong');
    const r1 = await goi(registerUser, { name: 'Kiem Thu', email: EMAIL, password: MAT_KHAU });
    check(r1.code === 202, 'tra ve 202', r1.code);
    check(r1.cookies.length === 0, 'KHONG dat cookie phien - chua ai chung minh so huu dia chi');
    check(!r1.body?._id, 'khong lo danh tinh nao trong than phan hoi', r1.body);

    const u1 = await User.findOne({ email: EMAIL });
    check(Boolean(u1), 'da tao ban ghi nguoi dung');
    check(u1?.emailVerified === false, 'tai khoan o trang thai cho xac minh', u1?.emailVerified);
    check(/^[0-9a-f]{64}$/.test(u1?.verifyTokenHash || ''), 'da luu BAN BAM cua token (64 ky tu hex)');
    check(u1?.verifyTokenExp > new Date(), 'token con han');

    // -----------------------------------------------------------------
    console.log('2. Dang nhap khi CHUA xac minh thi bi tu choi');
    const r2 = await goi(loginUser, { email: EMAIL, password: MAT_KHAU });
    check(r2.code === 403, 'tra ve 403', r2.code);
    check(r2.cookies.length === 0, 'khong cap phien');
    check(r2.body?.canXacMinh === true, 'co co canXacMinh de giao dien biet phai nhac gi');

    // -----------------------------------------------------------------
    console.log('3. Dang ky LAI tren tai khoan chua kich hoat -> doi token');
    const bamCu = u1.verifyTokenHash;
    const r3 = await goi(registerUser, { name: 'Kiem Thu 2', email: EMAIL, password: MAT_KHAU });
    check(r3.code === 202, 'van tra ve 202', r3.code);
    const u3 = await User.findOne({ email: EMAIL });
    check(u3.verifyTokenHash !== bamCu, 'token cu da bi thay - lien ket cu khong dung lai duoc');
    check(u3.emailVerified === false, 'van o trang thai cho');
    const soTaiKhoan = await User.countDocuments({ email: EMAIL });
    check(soTaiKhoan === 1, 'khong tao them tai khoan trung email', soTaiKhoan);

    // -----------------------------------------------------------------
    console.log('4. Token sai / het han deu bi tu choi');
    const rSai = await goi(verifyEmail, { token: 'a'.repeat(64) });
    check(rSai.code === 400, 'token bia dat -> 400', rSai.code);
    check(rSai.cookies.length === 0, 'khong cap phien');

    // Dat mot token DA HET HAN roi thu.
    const hetHan = taoToken(Date.now() - 48 * 3600 * 1000);
    await User.updateOne(
        { _id: u3._id },
        { $set: { verifyTokenHash: hetHan.bam, verifyTokenExp: hetHan.hetHan } },
    );
    const rHetHan = await goi(verifyEmail, { token: hetHan.token });
    check(rHetHan.code === 400, 'token het han -> 400', rHetHan.code);

    // -----------------------------------------------------------------
    console.log('5. Token dung thi kich hoat va cap phien');
    const moi = taoToken();
    await User.updateOne(
        { _id: u3._id },
        { $set: { verifyTokenHash: moi.bam, verifyTokenExp: moi.hetHan } },
    );
    const r5 = await goi(verifyEmail, { token: moi.token });
    check(r5.code === 200, 'tra ve 200', r5.code);
    check(r5.cookies.some((c) => c.ten === 'token'), 'co dat cookie phien');
    check(r5.cookies.every((c) => c.tuyChon?.httpOnly), 'cookie phien la httpOnly');

    const u5 = await User.findOne({ email: EMAIL });
    check(u5.emailVerified === true, 'da danh dau xac minh');
    check(!u5.verifyTokenHash, 'da xoa token - lien ket chi dung duoc MOT lan');

    // -----------------------------------------------------------------
    console.log('6. Dung lai chinh token do lan hai thi bi tu choi');
    const r6 = await goi(verifyEmail, { token: moi.token });
    check(r6.code === 400, 'token da dung -> 400', r6.code);

    // -----------------------------------------------------------------
    console.log('7. Dang nhap sau khi xac minh thi vao duoc');
    const r7 = await goi(loginUser, { email: EMAIL, password: MAT_KHAU });
    check(r7.code === 200, 'tra ve 200', r7.code);
    check(r7.cookies.some((c) => c.ten === 'token'), 'co cap phien');

    // -----------------------------------------------------------------
    // Diem quan trong nhat cua ca script: hai truong hop phai KHONG PHAN BIET
    // duoc tu ben ngoai.
    console.log('8. Dia chi DA co tai khoan tra ve dung nhu dia chi con trong');
    const rDaCo = await goi(registerUser, { name: 'Ai Do', email: EMAIL, password: 'MotMatKhauKhac!123' });
    check(rDaCo.code === r1.code, 'cung ma trang thai voi lan dang ky dau', [rDaCo.code, r1.code]);
    check(
        JSON.stringify(rDaCo.body) === JSON.stringify(r1.body),
        'cung y nguyen than phan hoi - khong co gi de phan biet',
        [rDaCo.body, r1.body],
    );
    check(rDaCo.cookies.length === 0, 'khong cap phien');

    const u8 = await User.findOne({ email: EMAIL });
    check(u8.name === u5.name, 'KHONG ghi de ten cua tai khoan da xac minh', u8.name);
    check(u8.password === u5.password, 'KHONG doi mat khau cua tai khoan da xac minh');
    check(!u8.verifyTokenHash, 'khong cap token xac minh nao cho nguoi la');

    // -----------------------------------------------------------------
    console.log('9. Dang nhap bang mat khau cua nguoi la thi khong vao duoc');
    const r9 = await goi(loginUser, { email: EMAIL, password: 'MotMatKhauKhac!123' });
    check(r9.code === 401, 'tra ve 401', r9.code);
};

const don = async () => {
    const kq = await User.deleteMany({ email: EMAIL });
    console.log(`\nDa xoa ${kq.deletedCount} tai khoan kiem thu (${EMAIL}).`);
};

chay()
    .catch((e) => {
        soLoi += 1;
        console.error('\nNEM LOI:', e.stack || e.message);
    })
    .then(don)
    .catch((e) => console.error('Don dep that bai:', e.message))
    .finally(async () => {
        await mongoose.connection.close();
        if (soLoi === 0) {
            console.log('\nTAT CA DEU DUNG. Luong dang ky co xac minh chay dung tren cum that.');
            process.exit(0);
        }
        console.error(`\nCO ${soLoi} MUC SAI.`);
        process.exit(1);
    });
