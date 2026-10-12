const test = require('node:test');
const assert = require('node:assert');
const { parseRawSubjects, fixFileName } = require('./documentInput');

test('docDsMonTho: chuoi JSON tu form multipart', () => {
    assert.deepStrictEqual(parseRawSubjects('["toan","toan roi rac"]'), ['toan', 'toan roi rac']);
});

test('docDsMonTho: mang tu PATCH JSON, bo phan tu rong va khong phai chuoi', () => {
    assert.deepStrictEqual(parseRawSubjects([' toan ', '', 42, null, { $ne: 1 }, 'triet']), ['toan', 'triet']);
});

test('docDsMonTho: chuoi don cua may khach cu', () => {
    assert.deepStrictEqual(parseRawSubjects('toan'), ['toan']);
});

test('docDsMonTho: rac -> rong', () => {
    assert.deepStrictEqual(parseRawSubjects('[khong phai json'), []);
    assert.deepStrictEqual(parseRawSubjects(undefined), []);
    assert.deepStrictEqual(parseRawSubjects({ a: 1 }), []);
    assert.deepStrictEqual(parseRawSubjects('   '), []);
});

test('suaTenFile: sua ten UTF-8 bi doc thanh Latin-1', () => {
    const hong = Buffer.from('Chương 1 - Cấu trúc dữ liệu.pdf', 'utf8').toString('latin1');
    assert.strictEqual(fixFileName(hong), 'Chương 1 - Cấu trúc dữ liệu.pdf');
});

test('suaTenFile: ten da dung va ten ASCII giu nguyen', () => {
    assert.strictEqual(fixFileName('Chương 1.pdf'), 'Chương 1.pdf');
    assert.strictEqual(fixFileName('chuong-1.pdf'), 'chuong-1.pdf');
});

test('suaTenFile: ten Latin-1 that (khong phai UTF-8 hong) giu nguyen', () => {
    // "café.pdf" go bang Latin-1 that - doc lai UTF-8 se ra ky tu loi.
    assert.strictEqual(fixFileName('café.pdf'), 'café.pdf');
});
