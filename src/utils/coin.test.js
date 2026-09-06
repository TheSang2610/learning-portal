const test = require('node:test');
const assert = require('node:assert');

const {
    DONG_MOI_COIN,
    NAP_TOI_DA,
    giaRaCoin,
    coinRaDong,
    kiemSoCoinNap,
    duCoin
} = require('./coin');

// --------------------------------------------------------------------------
// Doi gia ra coin
// --------------------------------------------------------------------------

test('gia chan doi ra coin dung ty gia', () => {
    assert.strictEqual(giaRaCoin(799000), 799);
    assert.strictEqual(giaRaCoin(1099000), 1099);
    assert.strictEqual(giaRaCoin(DONG_MOI_COIN), 1);
});

test('khoa mien phi ton 0 coin', () => {
    assert.strictEqual(giaRaCoin(0), 0);
});

test('gia le LAM TRON LEN chu khong lam tron thuong', () => {
    // 99.500d that ra la 99,5 coin. Lam tron xuong thi hoc vien tra 99.000d cho
    // mot khoa 99.500d - he thong tu ban re di 500d moi luot ma khong ai thay.
    assert.strictEqual(giaRaCoin(99500), 100);
    assert.strictEqual(giaRaCoin(1), 1);
    assert.strictEqual(giaRaCoin(1001), 2);
});

test('gia am hoac rac coi nhu 0, khong tra ve so am', () => {
    assert.strictEqual(giaRaCoin(-5000), 0);
    assert.strictEqual(giaRaCoin(null), 0);
    assert.strictEqual(giaRaCoin(undefined), 0);
    assert.strictEqual(giaRaCoin('khong phai so'), 0);
    assert.strictEqual(giaRaCoin(NaN), 0);
});

test('coin doi nguoc ra dong', () => {
    assert.strictEqual(coinRaDong(799), 799000);
    assert.strictEqual(coinRaDong(0), 0);
    assert.strictEqual(coinRaDong('rac'), 0);
});

// --------------------------------------------------------------------------
// Kiem so coin quan tri nhap
//
// Day la duong DUY NHAT sinh coin tu hu khong, nen moi truong hop duoi day la
// mot cach de tao coin sai.
// --------------------------------------------------------------------------

test('nhan so nguyen duong va so nguyen am', () => {
    assert.deepStrictEqual(kiemSoCoinNap(500), { hopLe: true, so: 500, loi: '' });
    assert.deepStrictEqual(kiemSoCoinNap(-200), { hopLe: true, so: -200, loi: '' });
    assert.deepStrictEqual(kiemSoCoinNap('300'), { hopLe: true, so: 300, loi: '' });
});

test('chan 0 - khong tao giao dich rong', () => {
    assert.strictEqual(kiemSoCoinNap(0).hopLe, false);
    assert.strictEqual(kiemSoCoinNap('0').hopLe, false);
});

test('chan so le - nua coin la vo nghia', () => {
    assert.strictEqual(kiemSoCoinNap(12.5).hopLe, false);
    assert.strictEqual(kiemSoCoinNap('0.1').hopLe, false);
});

test('chan Infinity - de lot qua la so du hong vinh vien', () => {
    // Number("1e999") ra Infinity. Cong Infinity vao so du thi moi phep tinh
    // sau do deu ra Infinity va khong sua lai duoc bang tay.
    assert.strictEqual(kiemSoCoinNap('1e999').hopLe, false);
    assert.strictEqual(kiemSoCoinNap(Infinity).hopLe, false);
    assert.strictEqual(kiemSoCoinNap(-Infinity).hopLe, false);
});

test('chan chuoi rong, chuoi rac, null, undefined', () => {
    assert.strictEqual(kiemSoCoinNap('').hopLe, false);
    assert.strictEqual(kiemSoCoinNap('   ').hopLe, false);
    assert.strictEqual(kiemSoCoinNap('abc').hopLe, false);
    assert.strictEqual(kiemSoCoinNap(null).hopLe, false);
    assert.strictEqual(kiemSoCoinNap(undefined).hopLe, false);
    assert.strictEqual(kiemSoCoinNap({}).hopLe, false);
});

test('chan vuot tran mot lan nap', () => {
    assert.strictEqual(kiemSoCoinNap(NAP_TOI_DA).hopLe, true);
    assert.strictEqual(kiemSoCoinNap(NAP_TOI_DA + 1).hopLe, false);
    assert.strictEqual(kiemSoCoinNap(-NAP_TOI_DA - 1).hopLe, false);
});

test('null va undefined KHONG bi Number() bien thanh 0 roi lot qua', () => {
    // Number(null) === 0, Number(undefined) === NaN. Neu chi kiem "> 0" thi
    // null se thanh mot lan nap 0 coin im lang.
    assert.strictEqual(kiemSoCoinNap(null).so, 0);
    assert.strictEqual(kiemSoCoinNap(null).hopLe, false);
});

// --------------------------------------------------------------------------
// Du coin khong
// --------------------------------------------------------------------------

test('du coin khi so du bang dung gia', () => {
    assert.strictEqual(duCoin(799, 799000), true);
});

test('thieu mot coin la khong mua duoc', () => {
    assert.strictEqual(duCoin(798, 799000), false);
});

test('khoa mien phi thi so du 0 van mua duoc', () => {
    assert.strictEqual(duCoin(0, 0), true);
});

test('so du rong coi nhu 0', () => {
    assert.strictEqual(duCoin(undefined, 799000), false);
    assert.strictEqual(duCoin(null, 0), true);
});

test('giao dien va may chu dung chung mot phep so sanh o gia le', () => {
    // 99.500d = 100 coin sau khi lam tron len. Co dung 99 coin la KHONG du,
    // du 99,5 coin "theo ly thuyet" la du.
    assert.strictEqual(duCoin(99, 99500), false);
    assert.strictEqual(duCoin(100, 99500), true);
});
