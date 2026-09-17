const test = require('node:test');
const assert = require('node:assert');

const { rutMaNap, duTien, docBaoCo, docMotBaoCo } = require('./khopChuyenKhoan');

/* -------------------------------------------------------------- rutMaNap */

test('rut duoc ma nap khi noi dung sach', () => {
    assert.strictEqual(rutMaNap('NAP7K3M'), 'NAP7K3M');
});

test('rut duoc ma khi ngan hang chen them chu quanh no', () => {
    // Day la dang that nhat: ngan hang gan tien to va hau to vao noi dung.
    assert.strictEqual(rutMaNap('CT DEN:001234 NAP7K3M GD 123456'), 'NAP7K3M');
    assert.strictEqual(rutMaNap('chuyen tien nap7k3m cam on'), 'NAP7K3M');
});

test('rut duoc ma khi nguoi dung go co dau cach hoac gach ngang', () => {
    assert.strictEqual(rutMaNap('NAP-7K3M'), 'NAP7K3M');
    assert.strictEqual(rutMaNap('NAP 7K3M'), 'NAP7K3M');
});

test('khong co ma thi tra null', () => {
    assert.strictEqual(rutMaNap('chuyen tien hoc phi'), null);
    assert.strictEqual(rutMaNap(''), null);
    assert.strictEqual(rutMaNap(null), null);
});

test('ma thieu ky tu thi khong tinh la ma', () => {
    assert.strictEqual(rutMaNap('NAP7K3'), null);
});

test('ky tu bi loai khoi bang chu thi khong tinh la ma', () => {
    // 0, O, 1, I, L da bo khoi bang chu vi de go nham nhau.
    assert.strictEqual(rutMaNap('NAP0K3M'), null);
    assert.strictEqual(rutMaNap('NAPIK3M'), null);
});

test('hai ma khac nhau trong mot noi dung thi tra null, khong doan bua', () => {
    // Nguoi dung copy ca doan cu lan doan moi. Chon bua mot trong hai la 50%
    // cong nham vi nguoi khac - phai de quan tri nhin.
    assert.strictEqual(rutMaNap('NAP7K3M NAP9QRS'), null);
});

test('cung mot ma lap lai van rut duoc', () => {
    assert.strictEqual(rutMaNap('NAP7K3M NAP7K3M'), 'NAP7K3M');
});

/* ---------------------------------------------------------------- duTien */

test('chuyen dung so tien thi du', () => {
    assert.strictEqual(duTien(500000, 500000), true);
});

test('chuyen thua thi van du', () => {
    assert.strictEqual(duTien(600000, 500000), true);
});

test('thieu trong dung sai thi van du', () => {
    // 2% cua 500.000 la 10.000.
    assert.strictEqual(duTien(492000, 500000), true);
});

test('thieu qua dung sai thi khong du', () => {
    assert.strictEqual(duTien(400000, 500000), false);
});

test('khoan nho dung dung sai san 2000d chu khong phai 2%', () => {
    // 2% cua 10.000 chi la 200d - qua chat. San toi thieu 2.000d do o day.
    assert.strictEqual(duTien(8500, 10000), true);
    assert.strictEqual(duTien(7000, 10000), false);
});

test('so khong hop le thi khong du', () => {
    assert.strictEqual(duTien(NaN, 500000), false);
    assert.strictEqual(duTien(500000, 0), false);
    assert.strictEqual(duTien('abc', 500000), false);
});

/* --------------------------------------------------------------- docBaoCo */

test('doc duoc dinh dang phang kieu SePay', () => {
    const ds = docBaoCo({
        id: 92704,
        gateway: 'BIDV',
        transactionDate: '2026-09-16 14:02:37',
        accountNumber: '1810408755',
        content: 'NAP7K3M',
        transferType: 'in',
        transferAmount: 500000
    });

    assert.strictEqual(ds.length, 1);
    assert.strictEqual(ds[0].maGiaoDich, '92704');
    assert.strictEqual(ds[0].soTien, 500000);
    assert.strictEqual(ds[0].tienVao, true);
    assert.strictEqual(ds[0].noiDung, 'NAP7K3M');
});

test('doc duoc dinh dang boc trong mang kieu Casso', () => {
    const ds = docBaoCo({
        error: 0,
        data: [
            { tid: 'FT123', description: 'NAP7K3M', amount: 500000 },
            { tid: 'FT124', description: 'NAP9QRS', amount: 200000 }
        ]
    });

    assert.strictEqual(ds.length, 2);
    assert.strictEqual(ds[0].maGiaoDich, 'FT123');
    assert.strictEqual(ds[1].maGiaoDich, 'FT124');
});

test('giao dich tien ra bi danh dau tienVao = false', () => {
    // Bo sot cho nay thi mot lenh chuyen DI cung thanh mot lan nap coin.
    const raTheoLoai = docBaoCo({ id: 1, transferType: 'out', transferAmount: 500000 });
    assert.strictEqual(raTheoLoai[0].tienVao, false);

    const raTheoDau = docBaoCo({ id: 2, amount: -500000 });
    assert.strictEqual(raTheoDau[0].tienVao, false);
    assert.strictEqual(raTheoDau[0].soTien, 500000);
});

test('khong co ma giao dich thi bo qua ban ghi do', () => {
    // Khong co ma thi khong chong trung duoc, ma khong chong trung thi mot bao
    // co phat lai hai lan se cong coin hai lan.
    assert.deepStrictEqual(docBaoCo({ content: 'NAP7K3M', amount: 500000 }), []);
    assert.strictEqual(docMotBaoCo({ id: '', amount: 1 }), null);
});

test('than request rac thi tra mang rong chu khong nem loi', () => {
    assert.deepStrictEqual(docBaoCo(null), []);
    assert.deepStrictEqual(docBaoCo('chuoi'), []);
    assert.deepStrictEqual(docBaoCo(undefined), []);
});
