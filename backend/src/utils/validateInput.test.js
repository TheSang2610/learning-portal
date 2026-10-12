// Chay:  npm test
//
// Cac test o day kiem MOT chieu it duoc de y: khong phai "dau vao dung co duoc
// nhan khong" ma "dau vao ac y co bi tu choi khong". Do la chieu ma khi hong
// thi khong ai thay - giao dien van chay binh thuong, chi co lo hong la mo san.

const test = require('node:test');
const assert = require('node:assert');

const {
  normalizeEmail,
  isValidEmail,
  receivedPassword,
  newPasswordError,
  validateName,
  verifyGooglePayload,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} = require('./validateInput');

const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = require('./password');

// --- normalizeEmail ----------------------------------------------------------

test('email duoc trim va ha ve chu thuong', () => {
  assert.strictEqual(normalizeEmail('  Nguoi.Dung@ViDu.COM '), 'nguoi.dung@vidu.com');
});

// Ban cu dung String(v || ''), no nuot im lang moi kieu du lieu roi de cho khac
// tu doan. Kieu sai thi tu choi thang.
test('gia tri khong phai chuoi deu thanh chuoi rong', () => {
  for (const v of [null, undefined, 123, true, {}, [], { $ne: null }, ['a@b.co']]) {
    assert.strictEqual(normalizeEmail(v), '', JSON.stringify(v));
  }
});

// --- isValidEmail -------------------------------------------------------------

test('email dung dinh dang thi qua', () => {
  for (const e of ['a@b.co', 'nguoi.dung+nhan@vi-du.com.vn']) {
    assert.strictEqual(isValidEmail(e), true, e);
  }
});

test('email sai dinh dang bi chan', () => {
  for (const e of ['', 'khong-co-cho-a', 'a@b', 'a@b.c', 'co khoang@trang.com', 'a@@b.co']) {
    assert.strictEqual(isValidEmail(e), false, JSON.stringify(e));
  }
});

// Tran nay khong chi de dep: khoa cua loginRateLimit la `ip|email`, nen mot
// "email" dai vo han la duong lam phinh bo dem tien trinh ma khong can dang
// nhap lan nao.
test('email dai qua 254 ky tu bi chan', () => {
  assert.strictEqual(isValidEmail('a'.repeat(MAX_EMAIL_LENGTH) + '@vidu.com'), false);
  assert.strictEqual(isValidEmail('a'.repeat(MAX_EMAIL_LENGTH - 10) + '@vidu.com'), true);
});

// --- receivedPassword (duong DANG NHAP) --------------------------------------

// Day chinh la cho registerUser tung thung: `undefined < 8` la false nen
// {"$ne":null} qua duoc buoc kiem do dai roi di thang toi bcrypt.
test('mat khau khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 12345678, {}, [], { $ne: null }, ['matkhau1']]) {
    assert.strictEqual(receivedPassword(v), false, JSON.stringify(v));
  }
});

test('mat khau rong bi tu choi', () => {
  assert.strictEqual(receivedPassword(''), false);
});

// Khong ap tran 72 o duong dang nhap: ban cu khong chan do dai nen co the co
// nguoi da dat mat khau 300 ky tu. Tu choi chuoi day du ho go ra la khoa chinh
// chu ra ngoai.
test('mat khau dai hon 72 van dang nhap duoc, chi chan o muc rat cao', () => {
  assert.strictEqual(receivedPassword('a'.repeat(300)), true);
  assert.strictEqual(receivedPassword('a'.repeat(1024)), true);
  assert.strictEqual(receivedPassword('a'.repeat(1025)), false);
});

// --- newPasswordError (duong DAT MOI) ------------------------------------------

test('mat khau dat moi ngan hon nguong bi tu choi', () => {
  assert.notStrictEqual(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH - 1)), null);
  assert.strictEqual(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH)), null);
});

// bcrypt bo lang moi byte tu 73 tro di va KHONG bao loi. Khong chan o day thi
// nguoi dung dat mat khau 200 ky tu roi tin rang ca 200 ky tu deu duoc tinh.
test('mat khau dat moi dai qua 72 byte bi tu choi', () => {
  assert.strictEqual(newPasswordError('a'.repeat(MAX_PASSWORD_LENGTH)), null);
  assert.notStrictEqual(newPasswordError('a'.repeat(MAX_PASSWORD_LENGTH + 1)), null);
});

// Dem theo BYTE chu khong phai ky tu: chu tieng Viet co dau ton 2-3 byte, nen
// dem theo ky tu thi mot mat khau 30 chu (~90 byte) van lot qua roi bi cat.
test('tran 72 duoc dem theo byte, khong phai theo ky tu', () => {
  const password = 'ẫ'.repeat(30); // 30 ky tu, 90 byte
  assert.strictEqual(password.length <= MAX_PASSWORD_LENGTH, true, 'dem theo ky tu thi lot');
  assert.notStrictEqual(newPasswordError(password), null, 'dem theo byte thi phai chan');
});

test('mat khau dat moi khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 12345678, {}, { $ne: null }]) {
    assert.notStrictEqual(newPasswordError(v), null, JSON.stringify(v));
  }
});

// --- validateName ----------------------------------------------------------------

test('ten qua ngan hoac qua dai bi tu choi', () => {
  assert.ok(validateName('a').loi);
  assert.ok(validateName('  ').loi);
  assert.ok(validateName('x'.repeat(MAX_NAME_LENGTH + 1)).loi);
  assert.strictEqual(validateName('  Nguyen Van A  ').ten, 'Nguyen Van A');
});

test('ten khong phai chuoi bi tu choi', () => {
  for (const v of [null, undefined, 123, {}, ['Ten']]) {
    assert.ok(validateName(v).loi, JSON.stringify(v));
  }
});

// --- verifyGooglePayload ------------------------------------------------------

const validPayload = {
  email: 'nguoi.dung@vidu.com',
  email_verified: true,
  sub: '1234567890',
  name: 'Nguoi Dung',
  picture: 'https://lh3.googleusercontent.com/a/abc',
};

test('payload day du va da xac minh thi qua', () => {
  const outcome = verifyGooglePayload(validPayload);
  assert.strictEqual(outcome.loi, undefined);
  assert.strictEqual(outcome.email, 'nguoi.dung@vidu.com');
  assert.strictEqual(outcome.sub, '1234567890');
  assert.strictEqual(outcome.anh, validPayload.picture);
});

// LO HONG DA VA. Khong co buoc nay thi ai dung duoc mot mien Google Workspace
// la tao duoc tai khoan mang email cua nguoi khac roi dang nhap thang vao tai
// khoan cua ho o day - khong can mat khau.
test('email chua xac minh bi tu choi', () => {
  for (const v of [false, undefined, null, 'false', 0, '']) {
    const outcome = verifyGooglePayload({ ...validPayload, email_verified: v });
    assert.ok(outcome.loi, 'email_verified = ' + JSON.stringify(v) + ' phai bi tu choi');
  }
});

test('email_verified dang chuoi "true" van duoc nhan', () => {
  const outcome = verifyGooglePayload({ ...validPayload, email_verified: 'true' });
  assert.strictEqual(outcome.loi, undefined);
});

// `sub` la ma dinh danh duy nhat khong doi cua tai khoan Google. Thieu no thi
// ban cu ghi googleId: '' - ma chuoi rong KHONG duoc index sparse bo qua, nen
// tai khoan thu hai dung khoa trung va findOne({googleId:''}) khop nham.
test('thieu sub bi tu choi', () => {
  for (const v of [undefined, null, '', '   ', 123]) {
    assert.ok(verifyGooglePayload({ ...validPayload, sub: v }).loi, JSON.stringify(v));
  }
});

test('email thieu hoac sai dinh dang bi tu choi', () => {
  for (const v of [undefined, '', 'khong-phai-email', { $ne: null }]) {
    assert.ok(verifyGooglePayload({ ...validPayload, email: v }).loi, JSON.stringify(v));
  }
});

test('payload rong hoac sai kieu bi tu choi', () => {
  for (const v of [null, undefined, '', 'abc', 123]) {
    assert.ok(verifyGooglePayload(v).loi, JSON.stringify(v));
  }
});

// Anh nay duoc tra thang ve trinh duyet va thanh src cua mot the img.
test('picture khong phai http(s) bi bo di', () => {
  for (const v of ['javascript:alert(1)', 'data:text/html,<script>', 'ftp://a/b', 123, {}]) {
    const outcome = verifyGooglePayload({ ...validPayload, picture: v });
    assert.strictEqual(outcome.anh, '', JSON.stringify(v));
  }
});

// Ten do Google cung cap se duoc GHI VAO CSDL, phai vua truong name.
test('ten Google qua dai bi cat chu khong lam hong dang nhap', () => {
  const outcome = verifyGooglePayload({ ...validPayload, name: 'x'.repeat(200) });
  assert.strictEqual(outcome.loi, undefined);
  assert.strictEqual(outcome.ten.length, MAX_NAME_LENGTH);
});

test('thieu ten thi lay phan truoc @ cua email', () => {
  const outcome = verifyGooglePayload({ ...validPayload, name: undefined });
  assert.strictEqual(outcome.ten, 'nguoi.dung');
});
