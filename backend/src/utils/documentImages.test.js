const test = require('node:test');
const assert = require('node:assert');
const { locAnhNgoai, demAnh } = require('./documentImages');

const TIEN_TO = 'https://res.cloudinary.com/du-an/image/upload/';

test('giu anh tren kho cua du an', () => {
    const html = `<p>B1</p><img src="${TIEN_TO}v1/a.png" alt="b1" loading="lazy" />`;
    assert.strictEqual(locAnhNgoai(html, TIEN_TO), html);
});

test('bo anh tu trang ngoai, giu chu', () => {
    const html = '<p>B1</p><img src="https://evil.com/pixel.gif" loading="lazy" /><p>B2</p>';
    assert.strictEqual(locAnhNgoai(html, TIEN_TO), '<p>B1</p><p>B2</p>');
});

test('khong bi lua boi tien to nam giua duong dan', () => {
    const html = `<img src="https://evil.com/?x=${TIEN_TO}" />`;
    assert.strictEqual(locAnhNgoai(html, TIEN_TO), '');
});

test('anh cloudinary cua tai khoan KHAC cung bi bo', () => {
    const html = '<img src="https://res.cloudinary.com/nguoi-khac/image/upload/v1/a.png" />';
    assert.strictEqual(locAnhNgoai(html, TIEN_TO), '');
});

test('chua cau hinh kho anh -> bo het anh', () => {
    assert.strictEqual(locAnhNgoai(`<p>x</p><img src="${TIEN_TO}a.png" />`, ''), '<p>x</p>');
});

test('demAnh', () => {
    assert.strictEqual(demAnh('<p>a</p><img src="x"><IMG src="y">'), 2);
    assert.strictEqual(demAnh(''), 0);
});
