const test = require('node:test');
const assert = require('node:assert');
const { parseLegacyPath, laObjectId, MAX_IMPORT } = require('./savedItems');

const ID = '6aba36230bd792d94b5286b0';

test('doc duoc duong dan blog va tai lieu', () => {
    assert.deepStrictEqual(parseLegacyPath(['/blog/hoc-react', `/share-document/${ID}`]), [
        { loai: 'baiViet', slug: 'hoc-react' },
        { loai: 'taiLieu', id: ID },
    ]);
});

test('bo query, hash va dau / cuoi', () => {
    assert.deepStrictEqual(parseLegacyPath(['/blog/abc/?x=1', `/share-document/${ID}#top`]), [
        { loai: 'baiViet', slug: 'abc' },
        { loai: 'taiLieu', id: ID },
    ]);
});

test('bo trung, ke ca khac hoa thuong', () => {
    assert.strictEqual(parseLegacyPath(['/blog/abc', '/blog/ABC', '/blog/abc']).length, 1);
});

test('bo moi thu khong hop le', () => {
    const rac = [
        null, 42, {}, '', '/course?slug=x', '/share-document/123', '/share-document/zz',
        '/blog/', '/blog/a/b', 'https://evil.com/blog/x', '/blog/<script>', 'x'.repeat(400),
        `/share-document/${ID}/file`,
    ];
    assert.deepStrictEqual(parseLegacyPath(rac), []);
});

test('khong phai mang -> rong', () => {
    assert.deepStrictEqual(parseLegacyPath('/blog/x'), []);
    assert.deepStrictEqual(parseLegacyPath(undefined), []);
});

test('cat o TOI_DA_NHAP', () => {
    const many = Array.from({ length: MAX_IMPORT + 50 }, (_, i) => `/blog/bai-${i}`);
    assert.strictEqual(parseLegacyPath(many).length, MAX_IMPORT);
});

test('laObjectId', () => {
    assert.ok(laObjectId(ID));
    assert.ok(!laObjectId('123'));
    assert.ok(!laObjectId({ $ne: null }));
});
