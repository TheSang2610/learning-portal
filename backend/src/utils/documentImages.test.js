const test = require('node:test');
const assert = require('node:assert');
const { filterExternalImages, demAnh: countImages } = require('./documentImages');

const PREFIX = 'https://res.cloudinary.com/du-an/image/upload/';

test('giu anh tren kho cua du an', () => {
    const html = `<p>B1</p><img src="${PREFIX}v1/a.png" alt="b1" loading="lazy" />`;
    assert.strictEqual(filterExternalImages(html, PREFIX), html);
});

test('bo anh tu trang ngoai, giu chu', () => {
    const html = '<p>B1</p><img src="https://evil.com/pixel.gif" loading="lazy" /><p>B2</p>';
    assert.strictEqual(filterExternalImages(html, PREFIX), '<p>B1</p><p>B2</p>');
});

test('khong bi lua boi tien to nam giua duong dan', () => {
    const html = `<img src="https://evil.com/?x=${PREFIX}" />`;
    assert.strictEqual(filterExternalImages(html, PREFIX), '');
});

test('anh cloudinary cua tai khoan KHAC cung bi bo', () => {
    const html = '<img src="https://res.cloudinary.com/nguoi-khac/image/upload/v1/a.png" />';
    assert.strictEqual(filterExternalImages(html, PREFIX), '');
});

test('chua cau hinh kho anh -> bo het anh', () => {
    assert.strictEqual(filterExternalImages(`<p>x</p><img src="${PREFIX}a.png" />`, ''), '<p>x</p>');
});

test('demAnh', () => {
    assert.strictEqual(countImages('<p>a</p><img src="x"><IMG src="y">'), 2);
    assert.strictEqual(countImages(''), 0);
});
