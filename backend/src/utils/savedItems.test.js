const test = require('node:test');
const assert = require('node:assert');
const { docDuongDanCu, laObjectId, TOI_DA_NHAP } = require('./savedItems');

const ID = '6aba36230bd792d94b5286b0';

test('doc duoc duong dan blog va tai lieu', () => {
    assert.deepStrictEqual(docDuongDanCu(['/blog/hoc-react', `/share-document/${ID}`]), [
        { loai: 'baiViet', slug: 'hoc-react' },
        { loai: 'taiLieu', id: ID },
    ]);
});

test('bo query, hash va dau / cuoi', () => {
    assert.deepStrictEqual(docDuongDanCu(['/blog/abc/?x=1', `/share-document/${ID}#top`]), [
        { loai: 'baiViet', slug: 'abc' },
        { loai: 'taiLieu', id: ID },
    ]);
});

test('bo trung, ke ca khac hoa thuong', () => {
    assert.strictEqual(docDuongDanCu(['/blog/abc', '/blog/ABC', '/blog/abc']).length, 1);
});

test('bo moi thu khong hop le', () => {
    const rac = [
        null, 42, {}, '', '/course?slug=x', '/share-document/123', '/share-document/zz',
        '/blog/', '/blog/a/b', 'https://evil.com/blog/x', '/blog/<script>', 'x'.repeat(400),
        `/share-document/${ID}/file`,
    ];
    assert.deepStrictEqual(docDuongDanCu(rac), []);
});

test('khong phai mang -> rong', () => {
    assert.deepStrictEqual(docDuongDanCu('/blog/x'), []);
    assert.deepStrictEqual(docDuongDanCu(undefined), []);
});

test('cat o TOI_DA_NHAP', () => {
    const nhieu = Array.from({ length: TOI_DA_NHAP + 50 }, (_, i) => `/blog/bai-${i}`);
    assert.strictEqual(docDuongDanCu(nhieu).length, TOI_DA_NHAP);
});

test('laObjectId', () => {
    assert.ok(laObjectId(ID));
    assert.ok(!laObjectId('123'));
    assert.ok(!laObjectId({ $ne: null }));
});
