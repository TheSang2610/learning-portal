// Chay:  npm test

const test = require('node:test');
const assert = require('node:assert');

const { createToken, hashToken, TTL_MS, BYTE_COUNT } = require('./verificationToken');

test('token la chuoi hex dai dung 2 lan so byte', () => {
    const { token } = createToken();
    assert.strictEqual(token.length, BYTE_COUNT * 2);
    assert.match(token, /^[0-9a-f]+$/);
});

test('moi lan goi ra mot token khac nhau', () => {
    // Neu cho nay lap lai, mot nguoi dang ky co the doan duoc token cua nguoi
    // dang ky ngay sau minh.
    const remove = new Set();
    for (let i = 0; i < 200; i += 1) remove.add(createToken().token);
    assert.strictEqual(remove.size, 200);
});

test('CSDL chi giu ban bam, khong the lan ra token goc', () => {
    const { token, hash } = createToken();
    assert.notStrictEqual(hash, token, 'ban bam khong duoc trung token');
    assert.ok(!hash.includes(token), 'ban bam khong duoc chua token');
    assert.strictEqual(hash.length, 64, 'SHA-256 dang hex luon 64 ky tu');
});

test('bamToken on dinh: cung dau vao thi cung ket qua', () => {
    // Duong /verify-email tra cuu bang chinh ban bam nay. Bam khong on dinh
    // thi khong ai xac minh duoc.
    assert.strictEqual(hashToken('abc'), hashToken('abc'));
    assert.notStrictEqual(hashToken('abc'), hashToken('abd'));
});

test('bamToken khong no voi dau vao rong hay sai kieu', () => {
    for (const v of [undefined, null, 0, {}, []]) {
        assert.strictEqual(hashToken(v).length, 64);
    }
});

test('han token tinh tu moc truyen vao', () => {
    const T0 = 1_700_000_000_000;
    const { hetHan: expiresAt } = createToken(T0);
    assert.strictEqual(expiresAt.getTime(), T0 + TTL_MS);
});

test('han mac dinh la 24 gio', () => {
    assert.strictEqual(TTL_MS, 24 * 60 * 60 * 1000);
});
