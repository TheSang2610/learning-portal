// Chay:  npm test
//
// Cac test o day kiem MOT chieu it duoc de y: khong phai "dau vao dung co duoc
// nhan khong" ma "dau vao ac y co bi tu choi khong". Do la chieu ma khi hong
// thi khong ai thay - giao dien van chay binh thuong, chi co lo hong la mo san.

const test = require('node:test');
const assert = require('node:assert');

const {
  chuanHoaEmail,
  emailHopLe,
  matKhauNhanDuoc,
  loiMatKhauMoi,
  kiemTen,
  kiemPayloadGoogle,
  DAI_EMAIL_TOI_DA,
  DAI_TEN_TOI_DA,
} = require('./xacThucDauVao');

const { DAI_MAT_KHAU_TOI_THIEU, DAI_MAT_KHAU_TOI_DA } = require('./matKhau');

// --- chuanHoaEmail ----------------------------------------------------------

test('email duoc trim va ha ve chu thuong', () => {
  assert.strictEqual(chuanHoaEmail('  Nguoi.Dung@ViDu.COM '), 'nguoi.dung@vidu.com');
});

// Ban cu dung String(v || ''), no nuot im lang moi kieu du lieu roi de cho khac
// tu doan. Kieu sai thi tu choi thang.
test('gia tri khong phai chuoi deu thanh chuoi rong', () => {
  for (const v of [null, undefined, 123, true, {}, [], { $ne: null }, ['a@b.co']]) {
    assert.strictEqual(chuanHoaEmail(v), '', JSON.stringify(v));
  }
});

// --- emailHopLe -------------------------------------------------------------

test('email dung dinh dang thi qua', () => {
  for (const e of ['a@b.co', 'nguoi.dung+nhan@vi-du.com.vn']) {
    assert.strictEqual(emailHopLe(e), true, e);
  }
});

test('email sai dinh dang bi chan', () => {
  for (const e of ['', 'khong-co-cho-a', 'a@b', 'a@b.c', 'co khoang@trang.com', 'a@@b.co']) {
    assert.strictEqual(emailHopLe(e), false, JSON.stringify(e));
  }
});

// Tran nay khong chi de dep: khoa cua loginRateLimit la `ip|email`, nen mot
// "email" dai vo han la duong lam phinh bo dem tien trinh ma khong can dang
// nhap lan nao.
test('email dai qua 254 ky tu bi chan', () => {
  assert.strictEqual(emailHopLe('a'.repeat(DAI_EMAIL_TOI_DA) + '@vidu.com'), false);
  assert.strictEqual(emailHopLe('a'.repeat(DAI_EMAIL_TOI_DA - 10) + '@vidu.com'), true);
});

// --- matKhauNhanDuoc (duong DANG NHAP) --------------------------------------

// Day chinh la cho registerUser tung thung: `undefined < 8` la false nen
// {"$ne":null} qua duoc buoc kiem do dai roi di thang toi bcrypt.
test('mat khau khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 12345678, {}, [], { $ne: null }, ['matkhau1']]) {
    assert.strictEqual(matKhauNhanDuoc(v), false, JSON.stringify(v));
  }
});

test('mat khau rong bi tu choi', () => {
  assert.strictEqual(matKhauNhanDuoc(''), false);
});

// Khong ap tran 72 o duong dang nhap: ban cu khong chan do dai nen co the co
// nguoi da dat mat khau 300 ky tu. Tu choi chuoi day du ho go ra la khoa chinh
// chu ra ngoai.
test('mat khau dai hon 72 van dang nhap duoc, chi chan o muc rat cao', () => {
  assert.strictEqual(matKhauNhanDuoc('a'.repeat(300)), true);
  assert.strictEqual(matKhauNhanDuoc('a'.repeat(1024)), true);
  assert.strictEqual(matKhauNhanDuoc('a'.repeat(1025)), false);
});

// --- loiMatKhauMoi (duong DAT MOI) ------------------------------------------

test('mat khau dat moi ngan hon nguong bi tu choi', () => {
  assert.notStrictEqual(loiMatKhauMoi('a'.repeat(DAI_MAT_KHAU_TOI_THIEU - 1)), null);
  assert.strictEqual(loiMatKhauMoi('a'.repeat(DAI_MAT_KHAU_TOI_THIEU)), null);
});

// bcrypt bo lang moi byte tu 73 tro di va KHONG bao loi. Khong chan o day thi
// nguoi dung dat mat khau 200 ky tu roi tin rang ca 200 ky tu deu duoc tinh.
test('mat khau dat moi dai qua 72 byte bi tu choi', () => {
  assert.strictEqual(loiMatKhauMoi('a'.repeat(DAI_MAT_KHAU_TOI_DA)), null);
  assert.notStrictEqual(loiMatKhauMoi('a'.repeat(DAI_MAT_KHAU_TOI_DA + 1)), null);
});

// Dem theo BYTE chu khong phai ky tu: chu tieng Viet co dau ton 2-3 byte, nen
// dem theo ky tu thi mot mat khau 30 chu (~90 byte) van lot qua roi bi cat.
test('tran 72 duoc dem theo byte, khong phai theo ky tu', () => {
  const mk = 'ẫ'.repeat(30); // 30 ky tu, 90 byte
  assert.strictEqual(mk.length <= DAI_MAT_KHAU_TOI_DA, true, 'dem theo ky tu thi lot');
  assert.notStrictEqual(loiMatKhauMoi(mk), null, 'dem theo byte thi phai chan');
});

test('mat khau dat moi khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 12345678, {}, { $ne: null }]) {
    assert.notStrictEqual(loiMatKhauMoi(v), null, JSON.stringify(v));
  }
});

// --- kiemTen ----------------------------------------------------------------

test('ten qua ngan hoac qua dai bi tu choi', () => {
  assert.ok(kiemTen('a').loi);
  assert.ok(kiemTen('  ').loi);
  assert.ok(kiemTen('x'.repeat(DAI_TEN_TOI_DA + 1)).loi);
  assert.strictEqual(kiemTen('  Nguyen Van A  ').ten, 'Nguyen Van A');
});

test('ten khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 123, {}, ['Ten']]) {
    assert.ok(kiemTen(v).loi, JSON.stringify(v));
  }
});

// --- kiemPayloadGoogle ------------------------------------------------------

const payloadDat = {
  email: 'nguoi.dung@vidu.com',
  email_verified: true,
  sub: '1234567890',
  name: 'Nguoi Dung',
  picture: 'https://lh3.googleusercontent.com/a/abc',
};

test('payload day du va da xac minh thi qua', () => {
  const kq = kiemPayloadGoogle(payloadDat);
  assert.strictEqual(kq.loi, undefined);
  assert.strictEqual(kq.email, 'nguoi.dung@vidu.com');
  assert.strictEqual(kq.sub, '1234567890');
  assert.strictEqual(kq.anh, payloadDat.picture);
});

// LO HONG DA VA. Khong co buoc nay thi ai dung duoc mot mien Google Workspace
// la tao duoc tai khoan mang email cua nguoi khac roi dang nhap thang vao tai
// khoan cua ho o day - khong can mat khau.
test('email chua xac minh bi tu choi', () => {
  for (const v of [false, undefined, null, 'false', 0, '']) {
    const kq = kiemPayloadGoogle({ ...payloadDat, email_verified: v });
    assert.ok(kq.loi, 'email_verified = ' + JSON.stringify(v) + ' phai bi tu choi');
  }
});

test('email_verified dang chuoi "true" van duoc nhan', () => {
  const kq = kiemPayloadGoogle({ ...payloadDat, email_verified: 'true' });
  assert.strictEqual(kq.loi, undefined);
});

// `sub` la ma dinh danh duy nhat khong doi cua tai khoan Google. Thieu no thi
// ban cu ghi googleId: '' - ma chuoi rong KHONG duoc index sparse bo qua, nen
// tai khoan thu hai dung khoa trung va findOne({googleId:''}) khop nham.
test('thieu sub bi tu choi', () => {
  for (const v of [undefined, null, '', '   ', 123]) {
    assert.ok(kiemPayloadGoogle({ ...payloadDat, sub: v }).loi, JSON.stringify(v));
  }
});

test('email thieu hoac sai dinh dang bi tu choi', () => {
  for (const v of [undefined, '', 'khong-phai-email', { $ne: null }]) {
    assert.ok(kiemPayloadGoogle({ ...payloadDat, email: v }).loi, JSON.stringify(v));
  }
});

test('payload rong hoac sai kieu bi tu choi', () => {
  for (const v of [null, undefined, '', 'abc', 123]) {
    assert.ok(kiemPayloadGoogle(v).loi, JSON.stringify(v));
  }
});

// Anh nay duoc tra thang ve trinh duyet va thanh src cua mot the img.
test('picture khong phai http(s) bi bo di', () => {
  for (const v of ['javascript:alert(1)', 'data:text/html,<script>', 'ftp://a/b', 123, {}]) {
    const kq = kiemPayloadGoogle({ ...payloadDat, picture: v });
    assert.strictEqual(kq.anh, '', JSON.stringify(v));
  }
});

// Ten do Google cung cap se duoc GHI VAO CSDL, phai vua truong name.
test('ten Google qua dai bi cat chu khong lam hong dang nhap', () => {
  const kq = kiemPayloadGoogle({ ...payloadDat, name: 'x'.repeat(200) });
  assert.strictEqual(kq.loi, undefined);
  assert.strictEqual(kq.ten.length, DAI_TEN_TOI_DA);
});

test('thieu ten thi lay phan truoc @ cua email', () => {
  const kq = kiemPayloadGoogle({ ...payloadDat, name: undefined });
  assert.strictEqual(kq.ten, 'nguoi.dung');
});
