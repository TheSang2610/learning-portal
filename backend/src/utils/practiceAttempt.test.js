const test = require('node:test');
const assert = require('node:assert/strict');

const { chuanHoaBaiLam, SO_CAU_TOI_DA } = require('./practiceAttempt');

const hopLe = () => ({
    deId: 'mon4-1',
    cau: [3, 0, 1],
    dapAn: [[2, 0, 1, 3], [], [1, 0]],
    chon: [[0], [], [1]],
    soDung: 1,
    giay: 95,
});

test('bai hop le: tra ve du lieu kem soCau', () => {
    const kq = chuanHoaBaiLam(hopLe());
    assert.equal(kq.loi, undefined);
    assert.equal(kq.duLieu.soCau, 3);
    assert.deepEqual(kq.duLieu.cau, [3, 0, 1]);
});

test('bo truong la khong luu vao CSDL', () => {
    const kq = chuanHoaBaiLam({ ...hopLe(), user: 'ai-do-khac', diem: 10 });
    assert.equal(kq.duLieu.user, undefined);
    assert.equal(kq.duLieu.diem, undefined);
});

test('ma de sai dinh dang', () => {
    for (const deId of ['', 'MON4', '../x', 'a'.repeat(41), 12]) {
        assert.ok(chuanHoaBaiLam({ ...hopLe(), deId }).loi, String(deId));
    }
});

test('danh sach cau rong, qua dai, trung hoac khong phai so nguyen', () => {
    assert.ok(chuanHoaBaiLam({ ...hopLe(), cau: [] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), cau: [1, 1, 2] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), cau: [1, 2.5, 3] }).loi);
    const dai = Array.from({ length: SO_CAU_TOI_DA + 1 }, (_, i) => i);
    assert.ok(
        chuanHoaBaiLam({ ...hopLe(), cau: dai, dapAn: dai.map(() => []), chon: dai.map(() => []) })
            .loi,
    );
});

test('thu tu dap an phai la hoan vi hoac rong', () => {
    assert.ok(chuanHoaBaiLam({ ...hopLe(), dapAn: [[0, 0, 1, 2], [], []] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), dapAn: [[0, 5], [], []] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), dapAn: [[0, 1]] }).loi, 'thieu phan tu');
});

test('lua chon ngoai khoang hoac trung', () => {
    assert.ok(chuanHoaBaiLam({ ...hopLe(), chon: [[9], [], []] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), chon: [[1, 1], [], []] }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), chon: [[0], []] }).loi, 'thieu cau');
});

test('so cau dung khong vuot so cau da lam', () => {
    assert.ok(chuanHoaBaiLam({ ...hopLe(), soDung: 3 }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), soDung: -1 }).loi);
    assert.equal(chuanHoaBaiLam({ ...hopLe(), soDung: 2 }).loi, undefined);
});

test('thoi gian lam bai phai la so giay hop le', () => {
    assert.ok(chuanHoaBaiLam({ ...hopLe(), giay: -5 }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), giay: 1.5 }).loi);
    assert.ok(chuanHoaBaiLam({ ...hopLe(), giay: 999999 }).loi);
});

test('than rong khong nem loi', () => {
    assert.ok(chuanHoaBaiLam(undefined).loi);
    assert.ok(chuanHoaBaiLam(null).loi);
});
