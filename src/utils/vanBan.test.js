// Chay:  npm test        (hoac  node --test src/)
//
// Dung bo chay test san co cua Node (node:test), khong cai them thu vien nao.

const test = require('node:test');
const assert = require('node:assert');

const { taoSlug, tachTags } = require('./vanBan');

test('taoSlug: bo dau tieng Viet', () => {
    assert.strictEqual(taoSlug('Lập trình Web'), 'lap-trinh-web');
    assert.strictEqual(taoSlug('Đường đi khó'), 'duong-di-kho');
    assert.strictEqual(taoSlug('ĐỀ THI CUỐI KỲ'), 'de-thi-cuoi-ky');
});

test('taoSlug: gop moi ky tu la thanh mot dau gach', () => {
    assert.strictEqual(taoSlug('Node.js  &  React!!!'), 'node-js-react');
    assert.strictEqual(taoSlug('a---b'), 'a-b');
});

test('taoSlug: khong de lai gach thua o hai dau', () => {
    assert.strictEqual(taoSlug('  --- xin chao --- '), 'xin-chao');
});

test('taoSlug: cat theo do dai roi van khong con gach o cuoi', () => {
    // Cat 8 ky tu tu "abcdefg-hijk" ra "abcdefg-", phai bo dau gach do di.
    assert.strictEqual(taoSlug('abcdefg hijk', { dai: 8 }), 'abcdefg');
    assert.ok(!taoSlug('a'.repeat(100) + ' b', { dai: 101 }).endsWith('-'));
});

test('taoSlug: chuoi khong con ky tu nao thi dung gia tri du phong', () => {
    assert.strictEqual(taoSlug('!!!'), 'bai-viet');
    assert.strictEqual(taoSlug(''), 'bai-viet');
    assert.strictEqual(taoSlug('   '), 'bai-viet');
    assert.strictEqual(taoSlug('###', { macDinh: 'tai-lieu' }), 'tai-lieu');
});

test('taoSlug: khong no khi nhan gia tri la nullish hay so', () => {
    assert.strictEqual(taoSlug(), 'bai-viet');
    assert.strictEqual(taoSlug(null), 'bai-viet');
    assert.strictEqual(taoSlug(undefined), 'bai-viet');
    assert.strictEqual(taoSlug(2026), '2026');
});

test('tachTags: nhan ca mang lan chuoi ngan cach bang dau phay', () => {
    assert.deepStrictEqual(tachTags('react, node, ts'), ['react', 'node', 'ts']);
    assert.deepStrictEqual(tachTags(['react', 'node']), ['react', 'node']);
});

test('tachTags: bo khoang trang thua va o rong', () => {
    assert.deepStrictEqual(tachTags(' react ,, node , '), ['react', 'node']);
});

test('tachTags: chan tren 5 the', () => {
    assert.deepStrictEqual(tachTags('a,b,c,d,e,f,g'), ['a', 'b', 'c', 'd', 'e']);
});

test('tachTags: dau vao rong tra ve mang rong', () => {
    assert.deepStrictEqual(tachTags(), []);
    assert.deepStrictEqual(tachTags(''), []);
    assert.deepStrictEqual(tachTags([]), []);
});
