// Chay:  npm test
//
// Kho dem la lop nam duoi CA BA cho dang gioi han tan suat (dang nhap, dang ky,
// doi mat khau). Sai o day thi ca ba cho cung sai mot luc, va sai theo kieu
// khong ai nhin thay: van tra 200, chi la khong con chan gi nua.
//
// Test khong mo ket noi CSDL. Khi mongoose chua ket noi (readyState = 0),
// khoGioiHan tu lui ve bo dem trong bo nho tien trinh - do la nhanh duoc kiem
// o day. Nhanh CSDL dung cung mot chinh sach, chi khac cho luu.
//
// Moc thoi gian duoc truyen tay vao tung ham nen khong test nao phai ngu cho.

const test = require('node:test');
const assert = require('node:assert');

const {
    tang,
    conBiKhoa,
    ghiNhanSai,
    xoaKhoa,
    _resetForTest,
} = require('./khoGioiHan');

const CUA_SO = 15 * 60 * 1000;
const T0 = 1_700_000_000_000; // moc gia bat ky, mien la co dinh

test('tang: lan dau tien mo cua so moi, dem tu 1', async () => {
    _resetForTest();
    const rec = await tang('a', CUA_SO, T0);
    assert.strictEqual(rec.count, 1);
    assert.strictEqual(rec.firstAt, T0);
    assert.strictEqual(rec.expiresAt, T0 + CUA_SO);
});

test('tang: trong cung cua so thi cong don', async () => {
    _resetForTest();
    await tang('a', CUA_SO, T0);
    await tang('a', CUA_SO, T0 + 1000);
    const rec = await tang('a', CUA_SO, T0 + 2000);
    assert.strictEqual(rec.count, 3);
    assert.strictEqual(rec.firstAt, T0, 'moc mo cua so khong duoc doi giua chung');
});

test('tang: het cua so thi dem lai tu dau', async () => {
    _resetForTest();
    await tang('a', CUA_SO, T0);
    await tang('a', CUA_SO, T0 + 1000);

    const rec = await tang('a', CUA_SO, T0 + CUA_SO + 1);
    assert.strictEqual(rec.count, 1, 'qua cua so la mot dot dem hoan toan moi');
});

test('cac khoa khac nhau khong dung vao nhau', async () => {
    _resetForTest();
    await tang('a', CUA_SO, T0);
    await tang('a', CUA_SO, T0);
    const rec = await tang('b', CUA_SO, T0);
    assert.strictEqual(rec.count, 1);
});

test('ghiNhanSai: chua cham nguong thi chua khoa', async () => {
    _resetForTest();
    for (let i = 0; i < 4; i += 1) {
        await ghiNhanSai('a', 5, CUA_SO, T0);
    }
    assert.strictEqual(await conBiKhoa(['a'], T0), 0);
});

test('ghiNhanSai: cham dung nguong thi khoa het mot cua so', async () => {
    _resetForTest();
    for (let i = 0; i < 5; i += 1) {
        await ghiNhanSai('a', 5, CUA_SO, T0);
    }

    const giay = await conBiKhoa(['a'], T0);
    assert.strictEqual(giay, CUA_SO / 1000, 'phai khoa dung mot cua so tinh tu luc cham nguong');
});

test('khoa tu het han khi qua cua so', async () => {
    _resetForTest();
    for (let i = 0; i < 5; i += 1) {
        await ghiNhanSai('a', 5, CUA_SO, T0);
    }

    assert.ok(await conBiKhoa(['a'], T0 + CUA_SO - 1000) > 0, 'trong cua so thi con khoa');
    assert.strictEqual(await conBiKhoa(['a'], T0 + CUA_SO + 1), 0, 'qua cua so thi tu mo');
});

test('conBiKhoa: lay khoa nang nhat trong danh sach', async () => {
    // Duong dang nhap doc mot lan cho ca ba khoa. Neu ham nay lay khoa dau
    // tien thay duoc thay vi khoa xa nhat, mot khoa ngan se che mat mot khoa
    // dai va nguoi bi chan lai vao duoc som hon nguong that.
    _resetForTest();
    for (let i = 0; i < 5; i += 1) await ghiNhanSai('ngan', 5, 60 * 1000, T0);
    for (let i = 0; i < 5; i += 1) await ghiNhanSai('dai', 5, CUA_SO, T0);

    const giay = await conBiKhoa(['ngan', 'dai'], T0);
    assert.strictEqual(giay, CUA_SO / 1000);
});

test('conBiKhoa: khoa khong ton tai thi tra 0, khong no', async () => {
    _resetForTest();
    assert.strictEqual(await conBiKhoa(['chua-tung-co'], T0), 0);
});

test('xoaKhoa: xoa sach bo dem cua khoa do', async () => {
    _resetForTest();
    for (let i = 0; i < 5; i += 1) await ghiNhanSai('a', 5, CUA_SO, T0);
    assert.ok(await conBiKhoa(['a'], T0) > 0);

    await xoaKhoa('a');
    assert.strictEqual(await conBiKhoa(['a'], T0), 0);

    // Va dem lai tu dau chu khong noi tiep so cu.
    const rec = await tang('a', CUA_SO, T0);
    assert.strictEqual(rec.count, 1);
});

test('vuot nguong roi van goi tiep thi khong keo dai khoa vo han', async () => {
    // Neu moi lan sai deu day blockedUntil ra xa them 15 phut, ke tan cong chi
    // can ban deu vao endpoint la khoa vinh vien tai khoan cua nan nhan.
    _resetForTest();
    for (let i = 0; i < 5; i += 1) await ghiNhanSai('a', 5, CUA_SO, T0);
    const truoc = await conBiKhoa(['a'], T0);

    for (let i = 0; i < 20; i += 1) await ghiNhanSai('a', 5, CUA_SO, T0);
    const sau = await conBiKhoa(['a'], T0);

    assert.strictEqual(sau, truoc, 'khoa khong duoc dai them sau khi da khoa');
});
