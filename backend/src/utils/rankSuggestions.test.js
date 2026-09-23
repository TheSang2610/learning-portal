// Chay:  npm test
//
// Chi test rankSuggestions.js - phan HAM THUAN. Viec doc ghi danh va dem nguoi hoc
// cung nam o courseController va khong test o day: CI khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const {
    chamDiem,
    xepHangGoiY,
    DIEM_CUNG_DANH_MUC,
    DIEM_HOC_CUNG_TOI_DA,
    DIEM_PHO_BIEN_TOI_DA,
} = require('./rankSuggestions');

const khoa = (id, them = {}) => ({
    _id: id,
    title: `Khoa ${id}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...them,
});

test('khoa da hoc bi loai khoi goi y', () => {
    // Loi de thay nhat cua mot muc goi y: goi y dung thu nguoi ta da mua.
    const kq = xepHangGoiY([khoa('a'), khoa('b')], { daHoc: new Set(['a']) });

    assert.strictEqual(kq.length, 1);
    assert.strictEqual(String(kq[0]._id), 'b');
});

test('cung danh muc duoc cong dung trong so', () => {
    const { diem } = chamDiem(khoa('x', { category: 'dm1' }), {
        danhMucDangHoc: new Set(['dm1']),
    });

    assert.strictEqual(diem, DIEM_CUNG_DANH_MUC);
});

test('category dang doi tuong da populate van doc duoc', () => {
    // Controller co the truyen vao ban da populate ({_id, name}) hoac ban tho
    // (chi ObjectId). Ca hai phai ra cung ket qua.
    const { diem } = chamDiem(khoa('x', { category: { _id: 'dm1', name: 'Web' } }), {
        danhMucDangHoc: new Set(['dm1']),
    });

    assert.strictEqual(diem, DIEM_CUNG_DANH_MUC);
});

test('diem hoc cung bi chan tran', () => {
    // Khong co tran thi mot khoa duoc 50 nguoi hoc cung se de bep moi tin hieu
    // khac, ke ca khi no thuoc linh vuc hoan toan khac.
    const { diem } = chamDiem(khoa('x'), {
        demHocCung: new Map([['x', 100]]),
    });

    assert.strictEqual(diem, DIEM_HOC_CUNG_TOI_DA);
});

test('diem pho bien bi chan tran', () => {
    const { diem } = chamDiem(khoa('x', { soHocVien: 100000 }), {});
    assert.strictEqual(diem, DIEM_PHO_BIEN_TOI_DA);
});

test('cau giai thich uu tien tin hieu tu hanh vi hon tin hieu tu danh muc', () => {
    const { vi } = chamDiem(khoa('x', { category: 'dm1' }), {
        danhMucDangHoc: new Set(['dm1']),
        demHocCung: new Map([['x', 3]]),
    });

    assert.match(vi, /Học viên học khóa giống bạn/);
});

test('khong co tin hieu nao van co cau giai thich, khong de trong', () => {
    const { vi } = chamDiem(khoa('x'), {});
    assert.strictEqual(vi, 'Có thể bạn quan tâm');
});

test('xep dung thu tu: danh muc thang pho bien', () => {
    const ds = [
        khoa('pho_bien', { soHocVien: 500 }),
        khoa('cung_dm', { category: 'dm1' }),
    ];

    const kq = xepHangGoiY(ds, { danhMucDangHoc: new Set(['dm1']) });

    assert.strictEqual(String(kq[0]._id), 'cung_dm');
});

test('bang diem thi khoa moi hon len truoc', () => {
    // Khong co nac nay thi thu tu phu thuoc CSDL tra ve the nao, va muc goi y
    // nhay lung tung giua hai lan tai trang.
    const ds = [
        khoa('cu', { createdAt: '2025-01-01T00:00:00.000Z' }),
        khoa('moi', { createdAt: '2026-06-01T00:00:00.000Z' }),
    ];

    const kq = xepHangGoiY(ds, {});
    assert.strictEqual(String(kq[0]._id), 'moi');
});

test('so luong tra ve bi chan tren va chan duoi', () => {
    const ds = Array.from({ length: 50 }, (_, i) => khoa(`k${i}`));

    assert.strictEqual(xepHangGoiY(ds, {}, 6).length, 6);
    assert.strictEqual(xepHangGoiY(ds, {}, 999).length, 24);
    assert.strictEqual(xepHangGoiY(ds, {}, 0).length, 1);
    assert.strictEqual(xepHangGoiY(ds, {}, -5).length, 1);
});

test('du lieu rac khong lam vo ham', () => {
    assert.deepStrictEqual(xepHangGoiY(null, {}), []);
    assert.deepStrictEqual(xepHangGoiY(undefined, {}), []);

    // Phan tu thieu _id bi bo qua chu khong lam nem ngoai le: du lieu tu CSDL
    // khong phai luc nao cung day du (khoa bi xoa giua chung mot truy van).
    const kq = xepHangGoiY([null, {}, khoa('ok')], {});
    assert.strictEqual(kq.length, 1);
});

test('boi thieu thi coi nhu khong co tin hieu nao, khong nem', () => {
    const kq = xepHangGoiY([khoa('a')], {});
    assert.strictEqual(kq.length, 1);
    assert.strictEqual(kq[0].diemGoiY, 0);
});

test('moi khoa tra ve deu co diem va cau giai thich', () => {
    // Giao dien doc hai truong nay truc tiep. Thieu mot cai la hien ra chu
    // "undefined" duoi the khoa hoc.
    const kq = xepHangGoiY([khoa('a'), khoa('b', { soHocVien: 5 })], {});

    for (const k of kq) {
        assert.strictEqual(typeof k.diemGoiY, 'number');
        assert.ok(typeof k.viSaoGoiY === 'string' && k.viSaoGoiY.length > 0);
    }
});
