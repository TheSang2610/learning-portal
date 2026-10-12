const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAnnouncement, isActive, visibleFilter } = require('./announcementContent');

const NOW = new Date('2026-10-02T08:00:00Z');

test('thieu tieu de thi bao loi', () => {
    const outcome = buildAnnouncement({ tieuDe: '   ' }, NOW);
    assert.equal(outcome.ok, false);
});

test('dung duoc thong bao co du truong', () => {
    const outcome = buildAnnouncement(
        { tieuDe: 'Bao tri', noiDung: 'Tu 23h', duongDan: '/courses', mucDo: 'quan_trong' },
        NOW,
    );
    assert.equal(outcome.ok, true);
    assert.equal(outcome.thongBao.tieuDe, 'Bao tri');
    assert.equal(outcome.thongBao.duongDan, '/courses');
    assert.equal(outcome.thongBao.mucDo, 'quan_trong');
    assert.equal(outcome.thongBao.hetHan, null);
});

test('chan duong dan ra ngoai, ke ca dang //', () => {
    for (const address of ['https://lua-dao.com', '//lua-dao.com', 'javascript:alert(1)']) {
        const outcome = buildAnnouncement({ tieuDe: 'x', duongDan: address }, NOW);
        assert.equal(outcome.thongBao.duongDan, '', address);
    }
});

test('muc do la thi ve thong_tin', () => {
    const outcome = buildAnnouncement({ tieuDe: 'x', mucDo: 'do_ruc' }, NOW);
    assert.equal(outcome.thongBao.mucDo, 'thong_tin');
});

test('ngay het han trong qua khu hoac sai dinh dang thi bao loi', () => {
    assert.equal(buildAnnouncement({ tieuDe: 'x', hetHan: '2026-10-01' }, NOW).ok, false);
    assert.equal(buildAnnouncement({ tieuDe: 'x', hetHan: 'khong-phai-ngay' }, NOW).ok, false);
});

test('ngay het han trong tuong lai thi giu lai', () => {
    const outcome = buildAnnouncement({ tieuDe: 'x', hetHan: '2026-10-05T00:00:00Z' }, NOW);
    assert.equal(outcome.ok, true);
    assert.equal(outcome.thongBao.hetHan.toISOString(), '2026-10-05T00:00:00.000Z');
});

test('conHieuLuc: da go hoac da het han thi khong hien', () => {
    assert.equal(isActive({ dangHien: true, hetHan: null }, NOW), true);
    assert.equal(isActive({ dangHien: false, hetHan: null }, NOW), false);
    assert.equal(isActive({ dangHien: true, hetHan: '2026-10-01T00:00:00Z' }, NOW), false);
    assert.equal(isActive({ dangHien: true, hetHan: '2026-10-03T00:00:00Z' }, NOW), true);
    assert.equal(isActive(null, NOW), false);
});

test('locDangHien chi lay ban dang hien va chua het han', () => {
    assert.deepEqual(visibleFilter(NOW), {
        dangHien: true,
        $or: [{ hetHan: null }, { hetHan: { $gt: NOW } }],
    });
});

const { readChannel, recipientFilter } = require('./announcementContent');

test('docKenh: phai chon it nhat mot kenh', () => {
    assert.equal(readChannel({}).ok, false);
    assert.equal(readChannel({ hienDauTrang: false, guiChuong: false }).ok, false);
});

test('docKenh: chuoi "false" khong duoc coi la bat kenh', () => {
    // Form gui "false" dang chuoi thi van la truthy trong JS - khong duoc lot qua.
    assert.equal(readChannel({ guiChuong: 'false', hienDauTrang: 'true' }).ok, false);
});

test('docKenh: doc dung kenh va vai tro', () => {
    const outcome = readChannel({ hienDauTrang: true, guiChuong: true, vaiTro: 'student' });
    assert.deepEqual(outcome, { ok: true, hienDauTrang: true, guiChuong: true, vaiTro: 'student' });
    assert.equal(readChannel({ guiChuong: true, vaiTro: 'admin' }).vaiTro, '');
});

test('locNguoiNhan: khong bao gio gui cho quan tri khi de trong', () => {
    assert.deepEqual(recipientFilter(''), { role: { $ne: 'admin' } });
    assert.deepEqual(recipientFilter('admin'), { role: { $ne: 'admin' } });
    assert.deepEqual(recipientFilter('instructor'), { role: 'instructor' });
});
