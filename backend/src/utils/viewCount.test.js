const test = require('node:test');
const assert = require('node:assert/strict');
const {
    monthKey, incrementViewCount, viewsThisMonth, compareTrending, fillTrending,
} = require('./viewCount');

test('khoaThang tinh theo gio Viet Nam', () => {
    // 18h UTC ngay 31/10 = 1h sang 1/11 o Viet Nam
    assert.equal(monthKey(new Date('2026-10-31T18:00:00Z')), '2026-11');
    assert.equal(monthKey(new Date('2026-10-31T16:59:00Z')), '2026-10');
});

test('capNhatLuotXem: tong luon +1, thang moi thi dat lai ve 1', () => {
    const [{ $set }] = incrementViewCount('2026-10');
    assert.deepEqual($set.luotXem, { $add: [{ $ifNull: ['$luotXem', 0] }, 1] });
    assert.deepEqual($set.luotXemThang.$cond[0], { $eq: ['$thangLuotXem', '2026-10'] });
    assert.equal($set.luotXemThang.$cond[2], 1);
    assert.equal($set.thangLuotXem, '2026-10');
});

test('luotXemThangNay: so cua thang cu tinh la 0', () => {
    assert.equal(viewsThisMonth({ thangLuotXem: '2026-10', luotXemThang: 7 }, '2026-10'), 7);
    assert.equal(viewsThisMonth({ thangLuotXem: '2026-09', luotXemThang: 99 }, '2026-10'), 0);
    assert.equal(viewsThisMonth({}, '2026-10'), 0);
});

test('soSanhXuHuong: xep theo luot thang nay roi tong luot xem', () => {
    const items = [
        { _id: 'a', thangLuotXem: '2026-09', luotXemThang: 500, luotXem: 900 },
        { _id: 'b', thangLuotXem: '2026-10', luotXemThang: 3, luotXem: 10 },
        { _id: 'c', thangLuotXem: '2026-10', luotXemThang: 3, luotXem: 50 },
        { _id: 'd', luotXem: 0 },
    ];
    assert.deepEqual(items.sort(compareTrending('2026-10')).map((k) => k._id), ['c', 'b', 'a', 'd']);
});

test('boSungXuHuong: bu cho trong bang khoa pho bien, khong trung', () => {
    const hot = [{ _id: 'x' }];
    const popular = [{ _id: 'x' }, { _id: 'y' }, { _id: 'z' }];
    assert.deepEqual(fillTrending(hot, popular, 2).map((k) => k._id), ['x', 'y']);
    assert.deepEqual(fillTrending([], popular, 5).map((k) => k._id), ['x', 'y', 'z']);
});
