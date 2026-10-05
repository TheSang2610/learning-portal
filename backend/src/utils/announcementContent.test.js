const test = require('node:test');
const assert = require('node:assert/strict');

const { dungThongBaoChung, conHieuLuc, locDangHien } = require('./announcementContent');

const BAY_GIO = new Date('2026-10-02T08:00:00Z');

test('thieu tieu de thi bao loi', () => {
    const kq = dungThongBaoChung({ tieuDe: '   ' }, BAY_GIO);
    assert.equal(kq.ok, false);
});

test('dung duoc thong bao co du truong', () => {
    const kq = dungThongBaoChung(
        { tieuDe: 'Bao tri', noiDung: 'Tu 23h', duongDan: '/courses', mucDo: 'quan_trong' },
        BAY_GIO,
    );
    assert.equal(kq.ok, true);
    assert.equal(kq.thongBao.tieuDe, 'Bao tri');
    assert.equal(kq.thongBao.duongDan, '/courses');
    assert.equal(kq.thongBao.mucDo, 'quan_trong');
    assert.equal(kq.thongBao.hetHan, null);
});

test('chan duong dan ra ngoai, ke ca dang //', () => {
    for (const dia of ['https://lua-dao.com', '//lua-dao.com', 'javascript:alert(1)']) {
        const kq = dungThongBaoChung({ tieuDe: 'x', duongDan: dia }, BAY_GIO);
        assert.equal(kq.thongBao.duongDan, '', dia);
    }
});

test('muc do la thi ve thong_tin', () => {
    const kq = dungThongBaoChung({ tieuDe: 'x', mucDo: 'do_ruc' }, BAY_GIO);
    assert.equal(kq.thongBao.mucDo, 'thong_tin');
});

test('ngay het han trong qua khu hoac sai dinh dang thi bao loi', () => {
    assert.equal(dungThongBaoChung({ tieuDe: 'x', hetHan: '2026-10-01' }, BAY_GIO).ok, false);
    assert.equal(dungThongBaoChung({ tieuDe: 'x', hetHan: 'khong-phai-ngay' }, BAY_GIO).ok, false);
});

test('ngay het han trong tuong lai thi giu lai', () => {
    const kq = dungThongBaoChung({ tieuDe: 'x', hetHan: '2026-10-05T00:00:00Z' }, BAY_GIO);
    assert.equal(kq.ok, true);
    assert.equal(kq.thongBao.hetHan.toISOString(), '2026-10-05T00:00:00.000Z');
});

test('conHieuLuc: da go hoac da het han thi khong hien', () => {
    assert.equal(conHieuLuc({ dangHien: true, hetHan: null }, BAY_GIO), true);
    assert.equal(conHieuLuc({ dangHien: false, hetHan: null }, BAY_GIO), false);
    assert.equal(conHieuLuc({ dangHien: true, hetHan: '2026-10-01T00:00:00Z' }, BAY_GIO), false);
    assert.equal(conHieuLuc({ dangHien: true, hetHan: '2026-10-03T00:00:00Z' }, BAY_GIO), true);
    assert.equal(conHieuLuc(null, BAY_GIO), false);
});

test('locDangHien chi lay ban dang hien va chua het han', () => {
    assert.deepEqual(locDangHien(BAY_GIO), {
        dangHien: true,
        $or: [{ hetHan: null }, { hetHan: { $gt: BAY_GIO } }],
    });
});

const { docKenh, locNguoiNhan } = require('./announcementContent');

test('docKenh: phai chon it nhat mot kenh', () => {
    assert.equal(docKenh({}).ok, false);
    assert.equal(docKenh({ hienDauTrang: false, guiChuong: false }).ok, false);
});

test('docKenh: chuoi "false" khong duoc coi la bat kenh', () => {
    // Form gui "false" dang chuoi thi van la truthy trong JS - khong duoc lot qua.
    assert.equal(docKenh({ guiChuong: 'false', hienDauTrang: 'true' }).ok, false);
});

test('docKenh: doc dung kenh va vai tro', () => {
    const kq = docKenh({ hienDauTrang: true, guiChuong: true, vaiTro: 'student' });
    assert.deepEqual(kq, { ok: true, hienDauTrang: true, guiChuong: true, vaiTro: 'student' });
    assert.equal(docKenh({ guiChuong: true, vaiTro: 'admin' }).vaiTro, '');
});

test('locNguoiNhan: khong bao gio gui cho quan tri khi de trong', () => {
    assert.deepEqual(locNguoiNhan(''), { role: { $ne: 'admin' } });
    assert.deepEqual(locNguoiNhan('admin'), { role: { $ne: 'admin' } });
    assert.deepEqual(locNguoiNhan('instructor'), { role: 'instructor' });
});
