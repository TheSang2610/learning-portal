const test = require('node:test');
const assert = require('node:assert/strict');

const { cacKhoaCuaDon, donChuaKhoa, locDanhSachKhoa, SO_KHOA_TOI_DA } = require('./orderCourses');

const laId = (x) => /^[a-f0-9]{24}$/.test(x);
const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const C = 'c'.repeat(24);

test('don mua le chi co mot khoa', () => {
    assert.deepEqual(cacKhoaCuaDon({ course: A }), [A]);
    assert.deepEqual(cacKhoaCuaDon({ course: A, courses: [] }), [A]);
});

test('don gio hang lay du moi khoa, khong trung, course dung dau', () => {
    assert.deepEqual(cacKhoaCuaDon({ course: A, courses: [A, B, C] }), [A, B, C]);
});

test('chap nhan ban da populate', () => {
    assert.deepEqual(cacKhoaCuaDon({ course: { _id: A }, courses: [{ _id: A }, { _id: B }] }), [A, B]);
});

test('don rong khong nem loi', () => {
    assert.deepEqual(cacKhoaCuaDon(null), []);
});

test('dieu kien tim don bat ca hai truong', () => {
    assert.deepEqual(donChuaKhoa(A), { $or: [{ course: A }, { courses: A }] });
});

test('loc danh sach: bo trung, giu thu tu', () => {
    assert.deepEqual(locDanhSachKhoa([B, A, B], laId), { ds: [B, A] });
});

test('loc danh sach: tu choi rong, sai kieu, id hong, qua nhieu', () => {
    assert.ok(locDanhSachKhoa([], laId).loi);
    assert.ok(locDanhSachKhoa('abc', laId).loi);
    assert.ok(locDanhSachKhoa([A, 'xyz'], laId).loi);
    const nhieu = Array.from({ length: SO_KHOA_TOI_DA + 1 }, (_, i) => String(i).padStart(24, '0'));
    assert.ok(locDanhSachKhoa(nhieu, laId).loi);
});
