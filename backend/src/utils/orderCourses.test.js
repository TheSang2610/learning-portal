const test = require('node:test');
const assert = require('node:assert/strict');

const { orderCourses, ordersContainingCourse, filterCourseIds, MAX_COURSES } = require('./orderCourses');

const laId = (x) => /^[a-f0-9]{24}$/.test(x);
const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const C = 'c'.repeat(24);

test('don mua le chi co mot khoa', () => {
    assert.deepEqual(orderCourses({ course: A }), [A]);
    assert.deepEqual(orderCourses({ course: A, courses: [] }), [A]);
});

test('don gio hang lay du moi khoa, khong trung, course dung dau', () => {
    assert.deepEqual(orderCourses({ course: A, courses: [A, B, C] }), [A, B, C]);
});

test('chap nhan ban da populate', () => {
    assert.deepEqual(orderCourses({ course: { _id: A }, courses: [{ _id: A }, { _id: B }] }), [A, B]);
});

test('don rong khong nem loi', () => {
    assert.deepEqual(orderCourses(null), []);
});

test('dieu kien tim don bat ca hai truong', () => {
    assert.deepEqual(ordersContainingCourse(A), { $or: [{ course: A }, { courses: A }] });
});

test('loc danh sach: bo trung, giu thu tu', () => {
    assert.deepEqual(filterCourseIds([B, A, B], laId), { ds: [B, A] });
});

test('loc danh sach: tu choi rong, sai kieu, id hong, qua nhieu', () => {
    assert.ok(filterCourseIds([], laId).loi);
    assert.ok(filterCourseIds('abc', laId).loi);
    assert.ok(filterCourseIds([A, 'xyz'], laId).loi);
    const many = Array.from({ length: MAX_COURSES + 1 }, (_, i) => String(i).padStart(24, '0'));
    assert.ok(filterCourseIds(many, laId).loi);
});
