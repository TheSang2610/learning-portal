const test = require('node:test');
const assert = require('node:assert/strict');

const { buildUpdate, recordLogin } = require('./loginActivity');

test('moi lan dang nhap tang count 1 va ghi cach dang nhap gan nhat', () => {
    const now = new Date('2026-10-21T03:00:00Z');
    assert.deepEqual(buildUpdate('password', now), {
        $set: { lastAt: now, method: 'password' },
        $inc: { count: 1 },
    });
    assert.deepEqual(buildUpdate('google', now).$set.method, 'google');
});

test('khong co userId thi khong dung toi CSDL', async () => {
    await assert.doesNotReject(recordLogin(undefined, 'password'));
});
