const test = require('node:test');
const assert = require('node:assert');

const {
    chuanHoaDinhDanh,
    laEmail,
    tenHopLe,
    mauTheoTen,
    boLocTaiKhoan,
    DAI_TEN_TOI_DA,
} = require('./loginIdentifier');

const { emailHopLe } = require('./validateInput');

const loc = (v) => boLocTaiKhoan(chuanHoaDinhDanh(v), emailHopLe);

/* ------------------------------ chuan hoa ------------------------------- */

test('chuan hoa: cat khoang trang va ha ve chu thuong', () => {
    assert.strictEqual(chuanHoaDinhDanh('  TheSang  '), 'thesang');
    assert.strictEqual(chuanHoaDinhDanh('Admin@Gmail.COM'), 'admin@gmail.com');
});

test('chuan hoa: moi thu KHONG phai chuoi deu ra chuoi rong', () => {
    // Day moi la cho quan trong. Than request {"email":{"$ne":null}} ma lot
    // qua duoc la no di thang vao truy van Mongo. Xem ghi chu dau
    // utils/validateInput.js - String(v || '') bien no thanh
    // '[object Object]', tuc la nuot im lang chu khong tu choi.
    assert.strictEqual(chuanHoaDinhDanh({ $ne: null }), '');
    assert.strictEqual(chuanHoaDinhDanh(['a']), '');
    assert.strictEqual(chuanHoaDinhDanh(123), '');
    assert.strictEqual(chuanHoaDinhDanh(null), '');
    assert.strictEqual(chuanHoaDinhDanh(undefined), '');
});

/* ------------------------------ phan loai ------------------------------- */

test('co dau @ thi la email, khong co thi la ten ngan', () => {
    assert.ok(laEmail('a@b.com'));
    assert.ok(!laEmail('thesang'));
});

test('ten ngan hop le: chu, so, va . _ % + -', () => {
    assert.ok(tenHopLe('thesang'));
    assert.ok(tenHopLe('admin'));
    assert.ok(tenHopLe('the.sang'));
    assert.ok(tenHopLe('the_sang-99'));
    assert.ok(tenHopLe('a'));
});

test('ten ngan khong hop le: rong, qua dai, co khoang trang hay ky tu la', () => {
    assert.ok(!tenHopLe(''));
    assert.ok(!tenHopLe('a'.repeat(DAI_TEN_TOI_DA + 1)));
    assert.ok(!tenHopLe('the sang'), 'co khoang trang');
    assert.ok(!tenHopLe('the/sang'));
    assert.ok(!tenHopLe('Thesang'), 'chua ha ve chu thuong');
});

/* --------------------------- THOAT REGEX -------------------------------- */
//
// Phan quan trong nhat file nay. Tra cuu theo ten ngan la mot phep so khop
// dau chuoi /^ten@/. Nhet thang chuoi nguoi dung go vao do la mot lo hong
// tiem an - xem diem 3 trong loginIdentifier.js.

test('ky tu dac biet trong ten KHONG tro thanh cu phap regex', () => {
    // '.' trong regex khop MOI ky tu. Neu khong thoat thi mau cua "a.b" se
    // khop ca "axb@..." - tuc la go mot ten la van cham vao tai khoan khac.
    const mau = mauTheoTen('a.b');
    assert.ok(mau.test('a.b@gmail.com'), 'phai khop dung chuoi that');
    assert.ok(!mau.test('axb@gmail.com'), 'dau cham bi hieu thanh ky tu bat ky');
});

test('ten toan ky tu dac biet khong khop duoc moi tai khoan', () => {
    // Neu '.*' khong duoc thoat thi mau thanh /^.*@/ - khop MOI dia chi trong
    // he thong.
    const mau = mauTheoTen('.*');
    assert.ok(!mau.test('batky@gmail.com'));
    assert.ok(mau.test('.*@gmail.com'), 'chi khop dung chuoi that do');
});

test('mau luon NEO o dau chuoi', () => {
    // Khong neo thi "sang" khop ca "hoangsang@gmail.com".
    const mau = mauTheoTen('sang');
    assert.ok(mau.test('sang@gmail.com'));
    assert.ok(!mau.test('hoangsang@gmail.com'));
});

test('mau doi hoi dung dau @ ngay sau ten', () => {
    // Khong co '@' trong mau thi "sang" khop ca "sangnguyen@gmail.com".
    const mau = mauTheoTen('sang');
    assert.ok(!mau.test('sangnguyen@gmail.com'));
});

test('mau KHONG dat co i - de Mongo con dung duoc chi muc', () => {
    // Them co 'i' vao la mat chi muc cua truong email, moi luot dang nhap
    // thanh mot lan quet ca bang. Email trong CSDL da o dang chu thuong nen
    // khong can co nay.
    assert.strictEqual(mauTheoTen('sang').flags, '');
});

/* ------------------------------- bo loc --------------------------------- */

test('go ca dia chi -> tra cuu bang dung truong email', () => {
    assert.deepStrictEqual(loc('TheSang@Gmail.com'), { email: 'thesang@gmail.com' });
});

test('dia chi sai dinh dang -> null, khong tra cuu gi', () => {
    assert.strictEqual(loc('a@b'), null, 'thieu phan duoi cung');
    assert.strictEqual(loc('@gmail.com'), null, 'thieu phan truoc @');
    assert.strictEqual(loc('a b@gmail.com'), null, 'co khoang trang');
});

test('go ten ngan -> tra cuu bang mau, VA loai tai khoan Google thuan', () => {
    const kq = loc('thesang');
    assert.ok(kq, 'phai tra ve bo loc');
    assert.ok(kq.email instanceof RegExp);
    assert.ok(kq.email.test('thesang@gmail.com'));
    // Yeu cau cua chu du an: ai dang ky bang Google thi phai go du dia chi.
    // `password: ''` la dau hieu tai khoan Google thuan ma loginUser van dang
    // doc (`!user.password`).
    assert.deepStrictEqual(kq.password, { $ne: '' });
});

test('ten ngan sai hinh dang -> null', () => {
    assert.strictEqual(loc('the sang'), null);
    assert.strictEqual(loc(''), null);
    assert.strictEqual(loc('a'.repeat(DAI_TEN_TOI_DA + 1)), null);
});

test('dau vao KHONG phai chuoi -> null, khong bao gio thanh truy van', () => {
    // Cai bay lon nhat cua ca file: {"email":{"$ne":null}} ma di duoc vao
    // User.find() thi no khop ban ghi dau tien trong bang.
    assert.strictEqual(loc({ $ne: null }), null);
    assert.strictEqual(loc({ $gt: '' }), null);
    assert.strictEqual(loc(['admin']), null);
    assert.strictEqual(loc(null), null);
    assert.strictEqual(loc(undefined), null);
});

test('bo loc cua ten ngan khong bao gio chua toan tu tu nguoi dung', () => {
    // Doc het cac khoa cua bo loc: chi duoc co `email` va `password`, va
    // `password` phai la hang so cua he thong chu khong phai thu nguoi dung
    // gui len.
    const kq = loc('admin');
    assert.deepStrictEqual(Object.keys(kq).sort(), ['email', 'password']);
});

/* ------------------------ Dang nhap bang so dien thoai ------------------ */

test('go so dien thoai -> tra cuu bang truong phone, da chuan hoa', () => {
    // Moi cach go deu phai ra CUNG mot bo loc. Khong the thi nguoi dang ky
    // bang '+84...' se khong dang nhap duoc khi go '0...'.
    for (const go of ['0987654321', '+84987654321', '84987654321', '098.765.4321']) {
        const kq = loc(go);
        assert.deepStrictEqual(kq, { phone: '0987654321' }, `hong o: ${go}`);
    }
});

test('so dien thoai dat TRUOC nhanh ten ngan', () => {
    // MAU_TEN nhan ca chu so, nen neu nhanh ten ngan chay truoc thi
    // '0987654321' se thanh regex /^0987654321@/ - tra cuu mot dia chi khong
    // ai co, roi bao sai mat khau.
    const kq = loc('0987654321');
    assert.ok(kq.phone, 'phai ra bo loc theo phone');
    assert.ok(!kq.email, 'khong duoc ra bo loc theo email');
});

test('so dien thoai thang nhanh ten ngan, khong hoi ca hai', () => {
    // Mot chuoi toan chu so cung la ten ngan hop le. DA THU hoi ca hai bang
    // $or va bo di: no de ra khoa cheo giua nguoi co so 0901234567 va nguoi
    // co email 0901234567@gmail.com - truy van khop hai ban ghi, luat "trung
    // tu hai tro len thi tu choi" da lam ca hai khong vao duoc.
    const kq = loc('0901234567');
    assert.deepStrictEqual(kq, { phone: '0901234567' });
    assert.ok(!kq.$or, 'khong duoc con nhanh $or');
    assert.ok(!kq.email, 'khong duoc tra cuu theo email nua');
});

test('so may ban khong thanh bo loc phone', () => {
    // 024/028 khong nhan duoc SMS. No roi xuong nhanh ten ngan (toan chu so
    // van dung hinh dang), va do la hanh vi cu - khong phai loi moi.
    const kq = loc('02438251234');
    assert.ok(!kq || !kq.phone, 'khong duoc tra cuu nhu so di dong');
});

test('so dien thoai sai do dai khong thanh bo loc phone', () => {
    for (const go of ['090123456', '09012345678']) {
        const kq = loc(go);
        assert.ok(!kq || !kq.phone, `hong o: ${go}`);
    }
});

test('kieu du lieu sai khong bao gio thanh bo loc phone', () => {
    for (const v of [{ $ne: null }, ['0901234567'], null, undefined, 901234567]) {
        const kq = loc(v);
        assert.ok(!kq || !kq.phone, `hong o kieu: ${typeof v}`);
    }
});
