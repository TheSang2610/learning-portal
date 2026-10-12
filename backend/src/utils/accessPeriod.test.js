const test = require('node:test');
const assert = require('node:assert/strict');
const { isExpired, extendExpiry, daysLeft, DAY_MS } = require('./accessPeriod');

const NOW = new Date('2026-10-10T00:00:00Z');

test('khong co han (mien phi, duoc tang, mua truoc khi co tinh nang) thi khong bao gio het han', () => {
    assert.equal(isExpired({ expiresAt: null }, NOW), false);
    assert.equal(isExpired({}, NOW), false);
    assert.equal(daysLeft({ expiresAt: null }, NOW), null);
});

test('mua lan dau: han = luc thanh toan + so ngay', () => {
    assert.equal(extendExpiry(null, 30, NOW).getTime(), NOW.getTime() + 30 * DAY_MS);
});

test('mua lai khi con han thi cong don, khong mat ngay da tra tien', () => {
    const old = new Date(NOW.getTime() + 5 * DAY_MS);
    assert.equal(extendExpiry(old, 30, NOW).getTime(), NOW.getTime() + 35 * DAY_MS);
});

test('mua lai khi da het han thi tinh tu luc thanh toan', () => {
    const old = new Date(NOW.getTime() - 10 * DAY_MS);
    assert.equal(extendExpiry(old, 30, NOW).getTime(), NOW.getTime() + 30 * DAY_MS);
});

test('so ngay sai thi dung mac dinh 30', () => {
    assert.equal(extendExpiry(null, 0, NOW).getTime(), NOW.getTime() + 30 * DAY_MS);
    assert.equal(extendExpiry(null, 'abc', NOW).getTime(), NOW.getTime() + 30 * DAY_MS);
});

test('het han dung luc toi han, so ngay con lai lam tron len', () => {
    assert.equal(isExpired({ expiresAt: NOW }, NOW), true);
    assert.equal(isExpired({ expiresAt: new Date(NOW.getTime() + 1) }, NOW), false);
    assert.equal(daysLeft({ expiresAt: new Date(NOW.getTime() + 1.2 * DAY_MS) }, NOW), 2);
    assert.equal(daysLeft({ expiresAt: new Date(NOW.getTime() - DAY_MS) }, NOW), 0);
});
