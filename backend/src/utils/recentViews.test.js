const test = require('node:test');
const assert = require('node:assert');
const { pickRecentViews, MAX_RECENT } = require('./recentViews');

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const C = 'cccccccccccccccccccccccc';
const D = 'dddddddddddddddddddddddd';

const views = [
    { course: B, viewedAt: new Date('2026-10-14') },
    { course: A, viewedAt: new Date('2026-10-13') },
    { course: C, viewedAt: new Date('2026-10-12') },
    { course: D, viewedAt: new Date('2026-10-11') },
];
const courses = [A, B, C, D].map((id) => ({ _id: id, title: id }));

test('giu dung thu tu xem moi nhat truoc, kem viewedAt', () => {
    const r = pickRecentViews(views, courses, [], 3);
    assert.deepStrictEqual(r.map((k) => k._id), [B, A, C]);
    assert.ok(r[0].viewedAt instanceof Date);
});

test('bo khoa da ghi danh', () => {
    const r = pickRecentViews(views, courses, [A], 3);
    assert.deepStrictEqual(r.map((k) => k._id), [B, C, D]);
});

test('bo khoa khong con (da xoa / an)', () => {
    const r = pickRecentViews(views, courses.filter((k) => k._id !== B), [], 3);
    assert.deepStrictEqual(r.map((k) => k._id), [A, C, D]);
});

test('so luong: mac dinh 3, gioi han tren MAX_RECENT, rac thi ve 3', () => {
    assert.strictEqual(pickRecentViews(views, courses).length, 3);
    assert.strictEqual(pickRecentViews(views, courses, [], 'abc').length, 3);
    const many = Array.from({ length: 30 }, (_, i) => ({ course: String(i).padStart(24, '0') }));
    const manyCourses = many.map((v) => ({ _id: v.course }));
    assert.strictEqual(pickRecentViews(many, manyCourses, [], 99).length, MAX_RECENT);
});

test('dau vao hong thi tra mang rong', () => {
    assert.deepStrictEqual(pickRecentViews(null, courses), []);
    assert.deepStrictEqual(pickRecentViews(views, undefined), []);
});
