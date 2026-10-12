const test = require('node:test');
const assert = require('node:assert');

const {
    normalizeIdentifier,
    laEmail,
    isValidName,
    colorByName,
    accountFilter,
    MAX_NAME_LENGTH,
} = require('./loginIdentifier');

const { isValidEmail } = require('./validateInput');

const query = (v) => accountFilter(normalizeIdentifier(v), isValidEmail);

/* ------------------------------ chuan hoa ------------------------------- */

test('chuan hoa: cat khoang trang va ha ve chu thuong', () => {
    assert.strictEqual(normalizeIdentifier('  TheSang  '), 'thesang');
    assert.strictEqual(normalizeIdentifier('Admin@Gmail.COM'), 'admin@gmail.com');
});

test('chuan hoa: moi thu KHONG phai chuoi deu ra chuoi rong', () => {
    // Day moi la cho quan trong. Than request {"email":{"$ne":null}} ma lot
    // qua duoc la no di thang vao truy van Mongo. Xem ghi chu dau
    // utils/validateInput.js - String(v || '') bien no thanh
    // '[object Object]', tuc la nuot im lang chu khong tu choi.
    assert.strictEqual(normalizeIdentifier({ $ne: null }), '');
    assert.strictEqual(normalizeIdentifier(['a']), '');
    assert.strictEqual(normalizeIdentifier(123), '');
    assert.strictEqual(normalizeIdentifier(null), '');
    assert.strictEqual(normalizeIdentifier(undefined), '');
});

/* ------------------------------ phan loai ------------------------------- */

test('co dau @ thi la email, khong co thi la ten ngan', () => {
    assert.ok(laEmail('a@b.com'));
    assert.ok(!laEmail('thesang'));
});

test('ten ngan hop le: chu, so, va . _ % + -', () => {
    assert.ok(isValidName('thesang'));
    assert.ok(isValidName('admin'));
    assert.ok(isValidName('the.sang'));
    assert.ok(isValidName('the_sang-99'));
    assert.ok(isValidName('a'));
});

test('ten ngan khong hop le: rong, qua dai, co khoang trang hay ky tu la', () => {
    assert.ok(!isValidName(''));
    assert.ok(!isValidName('a'.repeat(MAX_NAME_LENGTH + 1)));
    assert.ok(!isValidName('the sang'), 'co khoang trang');
    assert.ok(!isValidName('the/sang'));
    assert.ok(!isValidName('Thesang'), 'chua ha ve chu thuong');
});

/* --------------------------- THOAT REGEX -------------------------------- */
//
// Phan quan trong nhat file nay. Tra cuu theo ten ngan la mot phep so khop
// dau chuoi /^ten@/. Nhet thang chuoi nguoi dung go vao do la mot lo hong
// tiem an - xem diem 3 trong loginIdentifier.js.

test('ky tu dac biet trong ten KHONG tro thanh cu phap regex', () => {
    // '.' trong regex khop MOI ky tu. Neu khong thoat thi mau cua "a.b" se
    // khop ca "axb@..." - tuc la go mot ten la van cham vao tai khoan khac.
    const mau = colorByName('a.b');
    assert.ok(mau.test('a.b@gmail.com'), 'phai khop dung chuoi that');
    assert.ok(!mau.test('axb@gmail.com'), 'dau cham bi hieu thanh ky tu bat ky');
});

test('ten toan ky tu dac biet khong khop duoc moi tai khoan', () => {
    // Neu '.*' khong duoc thoat thi mau thanh /^.*@/ - khop MOI dia chi trong
    // he thong.
    const mau = colorByName('.*');
    assert.ok(!mau.test('batky@gmail.com'));
    assert.ok(mau.test('.*@gmail.com'), 'chi khop dung chuoi that do');
});

test('mau luon NEO o dau chuoi', () => {
    // Khong neo thi "sang" khop ca "hoangsang@gmail.com".
    const mau = colorByName('sang');
    assert.ok(mau.test('sang@gmail.com'));
    assert.ok(!mau.test('hoangsang@gmail.com'));
});

test('mau doi hoi dung dau @ ngay sau ten', () => {
    // Khong co '@' trong mau thi "sang" khop ca "sangnguyen@gmail.com".
    const mau = colorByName('sang');
    assert.ok(!mau.test('sangnguyen@gmail.com'));
});

test('mau KHONG dat co i - de Mongo con dung duoc chi muc', () => {
    // Them co 'i' vao la mat chi muc cua truong email, moi luot dang nhap
    // thanh mot lan quet ca bang. Email trong CSDL da o dang chu thuong nen
    // khong can co nay.
    assert.strictEqual(colorByName('sang').flags, '');
});

/* ------------------------------- bo loc --------------------------------- */

test('go ca dia chi -> tra cuu bang dung truong email', () => {
    assert.deepStrictEqual(query('TheSang@Gmail.com'), { email: 'thesang@gmail.com' });
});

test('dia chi sai dinh dang -> null, khong tra cuu gi', () => {
    assert.strictEqual(query('a@b'), null, 'thieu phan duoi cung');
    assert.strictEqual(query('@gmail.com'), null, 'thieu phan truoc @');
    assert.strictEqual(query('a b@gmail.com'), null, 'co khoang trang');
});

test('go ten ngan -> tra cuu bang mau, VA loai tai khoan Google thuan', () => {
    const outcome = query('thesang');
    assert.ok(outcome, 'phai tra ve bo loc');
    assert.ok(outcome.email instanceof RegExp);
    assert.ok(outcome.email.test('thesang@gmail.com'));
    // Yeu cau cua chu du an: ai dang ky bang Google thi phai go du dia chi.
    // `password: ''` la dau hieu tai khoan Google thuan ma loginUser van dang
    // doc (`!user.password`).
    assert.deepStrictEqual(outcome.password, { $ne: '' });
});

test('ten ngan sai hinh dang -> null', () => {
    assert.strictEqual(query('the sang'), null);
    assert.strictEqual(query(''), null);
    assert.strictEqual(query('a'.repeat(MAX_NAME_LENGTH + 1)), null);
});

test('dau vao KHONG phai chuoi -> null, khong bao gio thanh truy van', () => {
    // Cai bay lon nhat cua ca file: {"email":{"$ne":null}} ma di duoc vao
    // User.find() thi no khop ban ghi dau tien trong bang.
    assert.strictEqual(query({ $ne: null }), null);
    assert.strictEqual(query({ $gt: '' }), null);
    assert.strictEqual(query(['admin']), null);
    assert.strictEqual(query(null), null);
    assert.strictEqual(query(undefined), null);
});

test('bo loc cua ten ngan khong bao gio chua toan tu tu nguoi dung', () => {
    // Doc het cac khoa cua bo loc: chi duoc co `email` va `password`, va
    // `password` phai la hang so cua he thong chu khong phai thu nguoi dung
    // gui len.
    const outcome = query('admin');
    assert.deepStrictEqual(Object.keys(outcome).sort(), ['email', 'password']);
});

/* ------------------------ Dang nhap bang so dien thoai ------------------ */

test('go so dien thoai -> tra cuu bang truong phone, da chuan hoa', () => {
    // Moi cach go deu phai ra CUNG mot bo loc. Khong the thi nguoi dang ky
    // bang '+84...' se khong dang nhap duoc khi go '0...'.
    for (const go of ['0987654321', '+84987654321', '84987654321', '098.765.4321']) {
        const outcome = query(go);
        assert.deepStrictEqual(outcome, { phone: '0987654321' }, `hong o: ${go}`);
    }
});

test('so dien thoai dat TRUOC nhanh ten ngan', () => {
    // USERNAME_PATTERN nhan ca chu so, nen neu nhanh ten ngan chay truoc thi
    // '0987654321' se thanh regex /^0987654321@/ - tra cuu mot dia chi khong
    // ai co, roi bao sai mat khau.
    const outcome = query('0987654321');
    assert.ok(outcome.phone, 'phai ra bo loc theo phone');
    assert.ok(!outcome.email, 'khong duoc ra bo loc theo email');
});

test('so dien thoai thang nhanh ten ngan, khong hoi ca hai', () => {
    // Mot chuoi toan chu so cung la ten ngan hop le. DA THU hoi ca hai bang
    // $or va bo di: no de ra khoa cheo giua nguoi co so 0901234567 va nguoi
    // co email 0901234567@gmail.com - truy van khop hai ban ghi, luat "trung
    // tu hai tro len thi tu choi" da lam ca hai khong vao duoc.
    const outcome = query('0901234567');
    assert.deepStrictEqual(outcome, { phone: '0901234567' });
    assert.ok(!outcome.$or, 'khong duoc con nhanh $or');
    assert.ok(!outcome.email, 'khong duoc tra cuu theo email nua');
});

test('so may ban khong thanh bo loc phone', () => {
    // 024/028 khong nhan duoc SMS. No roi xuong nhanh ten ngan (toan chu so
    // van dung hinh dang), va do la hanh vi cu - khong phai loi moi.
    const outcome = query('02438251234');
    assert.ok(!outcome || !outcome.phone, 'khong duoc tra cuu nhu so di dong');
});

test('so dien thoai sai do dai khong thanh bo loc phone', () => {
    for (const go of ['090123456', '09012345678']) {
        const outcome = query(go);
        assert.ok(!outcome || !outcome.phone, `hong o: ${go}`);
    }
});

test('kieu du lieu sai khong bao gio thanh bo loc phone', () => {
    for (const v of [{ $ne: null }, ['0901234567'], null, undefined, 901234567]) {
        const outcome = query(v);
        assert.ok(!outcome || !outcome.phone, `hong o kieu: ${typeof v}`);
    }
});
