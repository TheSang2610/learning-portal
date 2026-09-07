const test = require('node:test');
const assert = require('node:assert');

const { phanTrang, thoatRegex, timGan } = require('./truyVan');

// --- phanTrang -------------------------------------------------------------

test('phanTrang: khong co tham so thi ve mac dinh trang 1, 10 dong', () => {
    assert.deepStrictEqual(phanTrang({}), { trang: 1, soDong: 10, boQua: 0 });
});

test('phanTrang: doc duoc chuoi so tu query string', () => {
    assert.deepStrictEqual(phanTrang({ page: '3', limit: '25' }), {
        trang: 3,
        soDong: 25,
        boQua: 50,
    });
});

// Day la loi that: ?page=-5 tung lam ca 5 duong /api/admin/* tra 500,
// vi skip am thi Mongo tu choi cau truy van.
test('phanTrang: page am khong duoc tao skip am', () => {
    const r = phanTrang({ page: -5 });
    assert.strictEqual(r.trang, 1);
    assert.ok(r.boQua >= 0, 'boQua khong duoc am');
});

test('phanTrang: page/limit khong phai so thi lui ve mac dinh', () => {
    assert.deepStrictEqual(phanTrang({ page: 'abc', limit: 'xyz' }), {
        trang: 1,
        soDong: 10,
        boQua: 0,
    });
});

test('phanTrang: limit=0 khong bi hieu la "lay tat ca"', () => {
    assert.strictEqual(phanTrang({ limit: 0 }).soDong, 10);
});

test('phanTrang: limit qua lon bi keo ve tran', () => {
    assert.strictEqual(phanTrang({ limit: 100000 }).soDong, 100);
});

test('phanTrang: tran mac dinh la 100 - vua du cho trang duyet danh gia', () => {
    assert.strictEqual(phanTrang({ limit: 100 }).soDong, 100);
});

test('phanTrang: so le duoc lam tron xuong', () => {
    assert.strictEqual(phanTrang({ page: 2.7 }).trang, 2);
});

test('phanTrang: doi duoc tran va mac dinh', () => {
    assert.strictEqual(phanTrang({ limit: 500 }, { toiDa: 20 }).soDong, 20);
    assert.strictEqual(phanTrang({}, { macDinh: 50 }).soDong, 50);
});

// --- thoatRegex ------------------------------------------------------------

// Loi that thu hai: go mot dau "(" vao o tim kiem cua trang admin la 500,
// vi chuoi tim kiem duoc nhet thang vao $regex.
test('thoatRegex: moi ky tu dac biet deu tao ra mau hop le', () => {
    for (const s of ['(', ')', '[', ']', '*', '+', '?', '.', '^', '$', '{', '}', '|']) {
        assert.doesNotThrow(
            () => new RegExp(thoatRegex(s)),
            `ky tu ${s} van lam vo regex`,
        );
    }
});

test('thoatRegex: dau cong duoc tim nhu chu, khong phai toan tu', () => {
    const re = new RegExp(thoatRegex('a+'), 'i');
    assert.ok(re.test('a+b'), 'phai khop chuoi chua "a+"');
    assert.ok(!re.test('aaa'), '"aaa" KHONG duoc khop - day la loi cu');
});

test('thoatRegex: dau cham sao khong con la ky tu dai dien', () => {
    const re = new RegExp(thoatRegex('.*'));
    assert.ok(re.test('gia.*tri'));
    assert.ok(!re.test('bat ky chuoi nao'));
});

test('thoatRegex: dau gach cheo nguoc cung duoc thoat', () => {
    const s = 'a' + String.fromCharCode(92) + 'b';
    assert.doesNotThrow(() => new RegExp(thoatRegex(s)));
    assert.ok(new RegExp(thoatRegex(s)).test(s));
});

test('thoatRegex: chuoi thuong giu nguyen', () => {
    assert.strictEqual(thoatRegex('sang'), 'sang');
});

test('thoatRegex: null/undefined thanh chuoi rong chu khong nem loi', () => {
    assert.strictEqual(thoatRegex(null), '');
    assert.strictEqual(thoatRegex(undefined), '');
});

// --- timGan ----------------------------------------------------------------

test('timGan: tra ve dung hinh dang filter cua Mongo', () => {
    assert.deepStrictEqual(timGan('sang'), { $regex: 'sang', $options: 'i' });
});

test('timGan: khong phan biet hoa thuong', () => {
    assert.strictEqual(timGan('Sang').$options, 'i');
});
