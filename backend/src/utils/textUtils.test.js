// Chay:  npm test        (hoac  node --test src/)
//
// Dung bo chay test san co cua Node (node:test), khong cai them thu vien nao.

const test = require('node:test');
const assert = require('node:assert');

const { createSlug, splitTags } = require('./textUtils');

test('taoSlug: bo dau tieng Viet', () => {
    assert.strictEqual(createSlug('Lập trình Web'), 'lap-trinh-web');
    assert.strictEqual(createSlug('Đường đi khó'), 'duong-di-kho');
    assert.strictEqual(createSlug('ĐỀ THI CUỐI KỲ'), 'de-thi-cuoi-ky');
});

test('taoSlug: gop moi ky tu la thanh mot dau gach', () => {
    assert.strictEqual(createSlug('Node.js  &  React!!!'), 'node-js-react');
    assert.strictEqual(createSlug('a---b'), 'a-b');
});

test('taoSlug: khong de lai gach thua o hai dau', () => {
    assert.strictEqual(createSlug('  --- xin chao --- '), 'xin-chao');
});

test('taoSlug: cat theo do dai roi van khong con gach o cuoi', () => {
    // Cat 8 ky tu tu "abcdefg-hijk" ra "abcdefg-", phai bo dau gach do di.
    assert.strictEqual(createSlug('abcdefg hijk', { dai: 8 }), 'abcdefg');
    assert.ok(!createSlug('a'.repeat(100) + ' b', { dai: 101 }).endsWith('-'));
});

test('taoSlug: chuoi khong con ky tu nao thi dung gia tri du phong', () => {
    assert.strictEqual(createSlug('!!!'), 'bai-viet');
    assert.strictEqual(createSlug(''), 'bai-viet');
    assert.strictEqual(createSlug('   '), 'bai-viet');
    assert.strictEqual(createSlug('###', { defaults: 'tai-lieu' }), 'tai-lieu');
});

test('taoSlug: khong no khi nhan gia tri la nullish hay so', () => {
    assert.strictEqual(createSlug(), 'bai-viet');
    assert.strictEqual(createSlug(null), 'bai-viet');
    assert.strictEqual(createSlug(undefined), 'bai-viet');
    assert.strictEqual(createSlug(2026), '2026');
});

test('tachTags: nhan ca mang lan chuoi ngan cach bang dau phay', () => {
    assert.deepStrictEqual(splitTags('react, node, ts'), ['react', 'node', 'ts']);
    assert.deepStrictEqual(splitTags(['react', 'node']), ['react', 'node']);
});

test('tachTags: bo khoang trang thua va o rong', () => {
    assert.deepStrictEqual(splitTags(' react ,, node , '), ['react', 'node']);
});

test('tachTags: chan tren 5 the', () => {
    assert.deepStrictEqual(splitTags('a,b,c,d,e,f,g'), ['a', 'b', 'c', 'd', 'e']);
});

test('tachTags: dau vao rong tra ve mang rong', () => {
    assert.deepStrictEqual(splitTags(), []);
    assert.deepStrictEqual(splitTags(''), []);
    assert.deepStrictEqual(splitTags([]), []);
});
