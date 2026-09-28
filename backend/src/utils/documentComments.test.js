// Chay:  npm test
//
// Chi test documentComments.js - phan HAM THUAN. CI khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const {
    kiemTraBinhLuan,
    idBinhLuanGoc,
    dungCayBinhLuan,
    DAI_TOI_DA,
} = require('./documentComments');

// ------------------------------- kiem tra -------------------------------

test('binh luan rong hoac qua ngan bi tu choi', () => {
    for (const x of ['', ' ', 'a', '   \n\n  ', undefined, null, 123]) {
        assert.strictEqual(kiemTraBinhLuan(x).ok, false);
    }
});

test('binh luan qua dai bi tu choi', () => {
    assert.strictEqual(kiemTraBinhLuan('a'.repeat(DAI_TOI_DA + 1)).ok, false);
    assert.strictEqual(kiemTraBinhLuan('a'.repeat(DAI_TOI_DA)).ok, true);
});

test('nhieu dong trong lien tiep bi gop, xuong dong don duoc giu', () => {
    const { noiDung } = kiemTraBinhLuan('dong 1\n\n\n\n\ndong 2\ndong 3');
    assert.strictEqual(noiDung, 'dong 1\n\ndong 2\ndong 3');
});

test('xuong dong kieu Windows duoc doi ve \\n', () => {
    assert.strictEqual(kiemTraBinhLuan('a\r\nb').noiDung, 'a\nb');
});

// ------------------------------- mot cap -------------------------------

test('tra loi vao binh luan goc thi gan vao chinh no', () => {
    assert.strictEqual(idBinhLuanGoc({ _id: 'g', traLoi: null }), 'g');
});

test('tra loi vao mot tra loi thi gan vao binh luan GOC, khong long them cap', () => {
    assert.strictEqual(idBinhLuanGoc({ _id: 't', traLoi: 'g' }), 'g');
});

// ------------------------------- dung cay -------------------------------

const bl = (id, them = {}) => ({ _id: id, traLoi: null, daAn: false, noiDung: id, ...them });

test('tra loi duoc gom vao dung binh luan goc, giu thu tu', () => {
    const cay = dungCayBinhLuan([
        bl('g1'),
        bl('g2'),
        bl('t1', { traLoi: 'g1' }),
        bl('t2', { traLoi: 'g1' }),
    ]);
    assert.deepStrictEqual(cay.map((g) => g._id), ['g1', 'g2']);
    assert.deepStrictEqual(cay[0].cacTraLoi.map((t) => t._id), ['t1', 't2']);
    assert.strictEqual(cay[1].cacTraLoi.length, 0);
});

test('nguoi xem thuong khong thay binh luan da an', () => {
    const cay = dungCayBinhLuan([bl('g1'), bl('g2', { daAn: true })]);
    assert.deepStrictEqual(cay.map((g) => g._id), ['g1']);
});

test('an binh luan goc thi an ca cac tra loi cua no', () => {
    // Con lai tra loi thi doc len khong biet dang tra loi cai gi.
    const cay = dungCayBinhLuan([bl('g1', { daAn: true }), bl('t1', { traLoi: 'g1' })]);
    assert.strictEqual(cay.length, 0);
});

test('an mot tra loi thi chi mat tra loi do', () => {
    const cay = dungCayBinhLuan([
        bl('g1'),
        bl('t1', { traLoi: 'g1', daAn: true }),
        bl('t2', { traLoi: 'g1' }),
    ]);
    assert.deepStrictEqual(cay[0].cacTraLoi.map((t) => t._id), ['t2']);
});

test('admin thay ca binh luan da an', () => {
    const cay = dungCayBinhLuan([bl('g1', { daAn: true }), bl('t1', { traLoi: 'g1' })], {
        laAdmin: true,
    });
    assert.strictEqual(cay.length, 1);
    assert.strictEqual(cay[0].cacTraLoi.length, 1);
});

test('tra loi mo coi (goc da mat) bi bo', () => {
    const cay = dungCayBinhLuan([bl('g1'), bl('t1', { traLoi: 'khong-ton-tai' })]);
    assert.strictEqual(cay.length, 1);
    assert.strictEqual(cay[0].cacTraLoi.length, 0);
});

test('id dang ObjectId (khong phai chuoi) van gom dung', () => {
    // Tu CSDL ra, traLoi la ObjectId con _id cua goc cung la ObjectId - so
    // sanh bang === se truot. Mo phong bang doi tuong co toString.
    const oid = (s) => ({ toString: () => s });
    const cay = dungCayBinhLuan([
        { _id: oid('g1'), traLoi: null, daAn: false },
        { _id: oid('t1'), traLoi: oid('g1'), daAn: false },
    ]);
    assert.strictEqual(cay[0].cacTraLoi.length, 1);
});

test('dau vao sai kieu tra ve mang rong', () => {
    assert.deepStrictEqual(dungCayBinhLuan(undefined), []);
    assert.deepStrictEqual(dungCayBinhLuan([null, undefined]), []);
});
