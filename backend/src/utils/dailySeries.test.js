const test = require('node:test');
const assert = require('node:assert');
const { buildDailySeries, compareWindows, vnDateKey } = require('./dailySeries');

test('vnDateKey: 23h UTC ngay 14 la ngay 15 o Viet Nam', () => {
    assert.strictEqual(vnDateKey('2026-10-14T23:00:00Z'), '2026-10-15');
    assert.strictEqual(vnDateKey('2026-10-14T16:59:59Z'), '2026-10-14');
});

test('buildDailySeries: du so ngay, ket thuc hom nay, ngay trong la 0', () => {
    const now = new Date('2026-10-14T05:00:00Z'); // 12h trua 14/10 gio VN
    const rows = buildDailySeries(
        { users: [{ _id: '2026-10-13', count: 2 }], enrollments: [{ _id: '2026-10-14', count: 5 }] },
        3,
        now
    );
    assert.deepStrictEqual(rows, [
        { date: '2026-10-12', users: 0, enrollments: 0 },
        { date: '2026-10-13', users: 2, enrollments: 0 },
        { date: '2026-10-14', users: 0, enrollments: 5 },
    ]);
});

test('buildDailySeries: so ngay rac thi ve 90, gioi han 366', () => {
    assert.strictEqual(buildDailySeries({}, 'abc').length, 90);
    assert.strictEqual(buildDailySeries({}, 9999).length, 366);
});

test('compareWindows: tong hai ky va % thay doi', () => {
    const rows = [{ v: 1 }, { v: 1 }, { v: 2 }, { v: 4 }];
    assert.deepStrictEqual(compareWindows(rows, 'v', 2), { current: 6, previous: 2, change: 200 });
});

test('compareWindows: ky truoc bang 0 thi change = null', () => {
    assert.deepStrictEqual(compareWindows([{ v: 0 }, { v: 3 }], 'v', 1), { current: 3, previous: 0, change: null });
});
