// Chay:  npm test

const test = require('node:test');
const assert = require('node:assert');

const { taoToken, bamToken, HAN_MS, SO_BYTE } = require('./tokenXacMinh');

test('token la chuoi hex dai dung 2 lan so byte', () => {
    const { token } = taoToken();
    assert.strictEqual(token.length, SO_BYTE * 2);
    assert.match(token, /^[0-9a-f]+$/);
});

test('moi lan goi ra mot token khac nhau', () => {
    // Neu cho nay lap lai, mot nguoi dang ky co the doan duoc token cua nguoi
    // dang ky ngay sau minh.
    const bo = new Set();
    for (let i = 0; i < 200; i += 1) bo.add(taoToken().token);
    assert.strictEqual(bo.size, 200);
});

test('CSDL chi giu ban bam, khong the lan ra token goc', () => {
    const { token, bam } = taoToken();
    assert.notStrictEqual(bam, token, 'ban bam khong duoc trung token');
    assert.ok(!bam.includes(token), 'ban bam khong duoc chua token');
    assert.strictEqual(bam.length, 64, 'SHA-256 dang hex luon 64 ky tu');
});

test('bamToken on dinh: cung dau vao thi cung ket qua', () => {
    // Duong /verify-email tra cuu bang chinh ban bam nay. Bam khong on dinh
    // thi khong ai xac minh duoc.
    assert.strictEqual(bamToken('abc'), bamToken('abc'));
    assert.notStrictEqual(bamToken('abc'), bamToken('abd'));
});

test('bamToken khong no voi dau vao rong hay sai kieu', () => {
    for (const v of [undefined, null, 0, {}, []]) {
        assert.strictEqual(bamToken(v).length, 64);
    }
});

test('han token tinh tu moc truyen vao', () => {
    const T0 = 1_700_000_000_000;
    const { hetHan } = taoToken(T0);
    assert.strictEqual(hetHan.getTime(), T0 + HAN_MS);
});

test('han mac dinh la 24 gio', () => {
    assert.strictEqual(HAN_MS, 24 * 60 * 60 * 1000);
});
