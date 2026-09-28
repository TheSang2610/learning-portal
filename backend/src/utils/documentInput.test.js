const test = require('node:test');
const assert = require('node:assert');
const { docDsMonTho, suaTenFile } = require('./documentInput');

test('docDsMonTho: chuoi JSON tu form multipart', () => {
    assert.deepStrictEqual(docDsMonTho('["toan","toan roi rac"]'), ['toan', 'toan roi rac']);
});

test('docDsMonTho: mang tu PATCH JSON, bo phan tu rong va khong phai chuoi', () => {
    assert.deepStrictEqual(docDsMonTho([' toan ', '', 42, null, { $ne: 1 }, 'triet']), ['toan', 'triet']);
});

test('docDsMonTho: chuoi don cua may khach cu', () => {
    assert.deepStrictEqual(docDsMonTho('toan'), ['toan']);
});

test('docDsMonTho: rac -> rong', () => {
    assert.deepStrictEqual(docDsMonTho('[khong phai json'), []);
    assert.deepStrictEqual(docDsMonTho(undefined), []);
    assert.deepStrictEqual(docDsMonTho({ a: 1 }), []);
    assert.deepStrictEqual(docDsMonTho('   '), []);
});

test('suaTenFile: sua ten UTF-8 bi doc thanh Latin-1', () => {
    const hong = Buffer.from('Chương 1 - Cấu trúc dữ liệu.pdf', 'utf8').toString('latin1');
    assert.strictEqual(suaTenFile(hong), 'Chương 1 - Cấu trúc dữ liệu.pdf');
});

test('suaTenFile: ten da dung va ten ASCII giu nguyen', () => {
    assert.strictEqual(suaTenFile('Chương 1.pdf'), 'Chương 1.pdf');
    assert.strictEqual(suaTenFile('chuong-1.pdf'), 'chuong-1.pdf');
});

test('suaTenFile: ten Latin-1 that (khong phai UTF-8 hong) giu nguyen', () => {
    // "café.pdf" go bang Latin-1 that - doc lai UTF-8 se ra ky tu loi.
    assert.strictEqual(suaTenFile('café.pdf'), 'café.pdf');
});
