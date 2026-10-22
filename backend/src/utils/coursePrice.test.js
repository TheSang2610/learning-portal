const test = require('node:test');
const assert = require('node:assert');

const { priceError, MIN_PAID_PRICE } = require('./coursePrice');

test('mien phi (0) va de trong deu hop le', () => {
    assert.strictEqual(priceError(0), '');
    assert.strictEqual(priceError('0'), '');
    assert.strictEqual(priceError(undefined), '');
});

test('khoa co phi tu 2.000d tro len thi hop le', () => {
    assert.strictEqual(MIN_PAID_PRICE, 2000);
    assert.strictEqual(priceError(2000), '');
    assert.strictEqual(priceError('699000'), '');
});

test('khoa co phi duoi 2.000d bi chan', () => {
    assert.match(priceError(1000), /2\.000đ/);
    assert.match(priceError('1'), /2\.000đ/);
    assert.match(priceError(1999), /2\.000đ/);
});

test('so am, so le, chu thi bi chan', () => {
    assert.ok(priceError(-5000));
    assert.ok(priceError(2500.5));
    assert.ok(priceError('abc'));
});
