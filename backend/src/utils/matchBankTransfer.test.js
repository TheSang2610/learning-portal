const test = require('node:test');
const assert = require('node:assert');

const { extractOrderCode, isPaidEnough, parseBankCredits, parseBankCredit } = require('./matchBankTransfer');

/* -------------------------------------------------------------- extractOrderCode */

test('rut duoc ma don khi noi dung sach', () => {
    assert.strictEqual(extractOrderCode('DH7K3M'), 'DH7K3M');
});

test('rut duoc ma khi ngan hang chen them chu quanh no', () => {
    // Day la dang that nhat: ngan hang gan tien to va hau to vao noi dung.
    assert.strictEqual(extractOrderCode('CT DEN:001234 DH7K3M GD 123456'), 'DH7K3M');
    assert.strictEqual(extractOrderCode('chuyen tien dh7k3m cam on'), 'DH7K3M');
});

test('rut duoc ma khi nguoi dung go co dau cach hoac gach ngang', () => {
    assert.strictEqual(extractOrderCode('DH-7K3M'), 'DH7K3M');
    assert.strictEqual(extractOrderCode('DH 7K3M'), 'DH7K3M');
});

test('khong co ma thi tra null', () => {
    assert.strictEqual(extractOrderCode('chuyen tien hoc phi'), null);
    assert.strictEqual(extractOrderCode(''), null);
    assert.strictEqual(extractOrderCode(null), null);
});

test('ma thieu ky tu thi khong tinh la ma', () => {
    assert.strictEqual(extractOrderCode('DH7K3'), null);
});

test('ky tu bi loai khoi bang chu thi khong tinh la ma', () => {
    // 0, O, 1, I, L da bo khoi bang chu vi de go nham nhau.
    assert.strictEqual(extractOrderCode('DH0K3M'), null);
    assert.strictEqual(extractOrderCode('DHIK3M'), null);
});

test('hai ma khac nhau trong mot noi dung thi tra null, khong doan bua', () => {
    // Nguoi dung copy ca doan cu lan doan moi. Chon bua mot trong hai la co the
    // mo khoa nham don cua nguoi khac - phai de quan tri nhin.
    assert.strictEqual(extractOrderCode('DH7K3M DH9PQR'), null);
});

test('cung mot ma lap lai van rut duoc', () => {
    assert.strictEqual(extractOrderCode('DH7K3M DH7K3M'), 'DH7K3M');
});

/* ---------------------------------------------------------------- isPaidEnough */

test('chuyen dung so tien thi du', () => {
    assert.strictEqual(isPaidEnough(500000, 500000), true);
});

test('chuyen thua thi van du', () => {
    assert.strictEqual(isPaidEnough(600000, 500000), true);
});

test('thieu trong dung sai thi van du', () => {
    // 2% cua 500.000 la 10.000.
    assert.strictEqual(isPaidEnough(492000, 500000), true);
});

test('thieu qua dung sai thi khong du', () => {
    assert.strictEqual(isPaidEnough(400000, 500000), false);
});

test('khoan nho dung dung sai san 2000d chu khong phai 2%', () => {
    // 2% cua 10.000 chi la 200d - qua chat. San toi thieu 2.000d do o day.
    assert.strictEqual(isPaidEnough(8500, 10000), true);
    assert.strictEqual(isPaidEnough(7000, 10000), false);
});

test('so khong hop le thi khong du', () => {
    assert.strictEqual(isPaidEnough(NaN, 500000), false);
    assert.strictEqual(isPaidEnough(500000, 0), false);
    assert.strictEqual(isPaidEnough('abc', 500000), false);
});

/* --------------------------------------------------------------- parseBankCredits */

test('Casso ban cu: data la mang, ma giao dich lay tid', () => {
    const items = parseBankCredits({
        error: 0,
        data: [
            { id: 1, tid: 'FT123', description: 'DH7K3M', amount: 500000, subAccId: '1810408755', when: '2026-10-22 08:00:00' },
            { id: 2, tid: 'FT124', description: 'DH9PQR', amount: 200000 }
        ]
    });

    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].maGiaoDich, 'FT123');
    assert.strictEqual(items[0].soTien, 500000);
    assert.strictEqual(items[0].soTaiKhoan, '1810408755');
    assert.strictEqual(items[0].incoming, true);
    assert.strictEqual(items[1].maGiaoDich, 'FT124');
});

test('Casso ban moi: data la MOT object, ma giao dich lay reference', () => {
    const items = parseBankCredits({
        error: 0,
        data: { id: 7, reference: 'BIDV-998', amount: 120000, description: 'CK DH7K3M', accountNumber: '1810408755' }
    });
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].maGiaoDich, 'BIDV-998');
    assert.strictEqual(extractOrderCode(items[0].noiDung), 'DH7K3M');
});

test('giao dich tien ra (so am) bi danh dau incoming = false', () => {
    const items = parseBankCredits({ error: 0, data: [{ id: 2, amount: -500000 }] });
    assert.strictEqual(items[0].incoming, false);
    assert.strictEqual(items[0].soTien, 500000);
});

test('Casso bao error khac 0 thi khong xu ly giao dich nao', () => {
    assert.deepStrictEqual(parseBankCredits({ error: 1, data: [{ id: 1, amount: 1000 }] }), []);
});

test('khong co ma giao dich thi bo qua ban ghi do', () => {
    // Khong co ma thi khong chong trung duoc, ma khong chong trung thi mot bao
    // co phat lai hai lan se bi xu ly hai lan.
    assert.deepStrictEqual(parseBankCredits({ error: 0, data: [{ description: 'DH7K3M', amount: 500000 }] }), []);
    assert.strictEqual(parseBankCredit({ id: '', amount: 1 }), null);
});

test('khong con doc dinh dang phang kieu SePay', () => {
    assert.deepStrictEqual(
        parseBankCredits({ id: 92704, content: 'DH7K3M', transferType: 'in', transferAmount: 500000 }),
        []
    );
});

test('than request rac thi tra mang rong chu khong nem loi', () => {
    assert.deepStrictEqual(parseBankCredits(null), []);
    assert.deepStrictEqual(parseBankCredits('chuoi'), []);
    assert.deepStrictEqual(parseBankCredits(undefined), []);
    assert.deepStrictEqual(parseBankCredits([{ id: 1 }]), []);
});
