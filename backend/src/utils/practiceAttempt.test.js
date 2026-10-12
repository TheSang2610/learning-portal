const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeAttempt, MAX_QUESTIONS } = require('./practiceAttempt');

const isValid = () => ({
    deId: 'mon4-1',
    cau: [3, 0, 1],
    dapAn: [[2, 0, 1, 3], [], [1, 0]],
    chon: [[0], [], [1]],
    soDung: 1,
    giay: 95,
});

test('bai hop le: tra ve du lieu kem soCau', () => {
    const outcome = normalizeAttempt(isValid());
    assert.equal(outcome.loi, undefined);
    assert.equal(outcome.data.soCau, 3);
    assert.deepEqual(outcome.data.cau, [3, 0, 1]);
});

test('bo truong la khong luu vao CSDL', () => {
    const outcome = normalizeAttempt({ ...isValid(), user: 'ai-do-khac', diem: 10 });
    assert.equal(outcome.data.user, undefined);
    assert.equal(outcome.data.diem, undefined);
});

test('ma de sai dinh dang', () => {
    for (const quizId of ['', 'MON4', '../x', 'a'.repeat(41), 12]) {
        assert.ok(normalizeAttempt({ ...isValid(), deId: quizId }).loi, String(quizId));
    }
});

test('danh sach cau rong, qua dai, trung hoac khong phai so nguyen', () => {
    assert.ok(normalizeAttempt({ ...isValid(), cau: [] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), cau: [1, 1, 2] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), cau: [1, 2.5, 3] }).loi);
    const length = Array.from({ length: MAX_QUESTIONS + 1 }, (_, i) => i);
    assert.ok(
        normalizeAttempt({ ...isValid(), cau: length, dapAn: length.map(() => []), chon: length.map(() => []) })
            .loi,
    );
});

test('thu tu dap an phai la hoan vi hoac rong', () => {
    assert.ok(normalizeAttempt({ ...isValid(), dapAn: [[0, 0, 1, 2], [], []] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), dapAn: [[0, 5], [], []] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), dapAn: [[0, 1]] }).loi, 'thieu phan tu');
});

test('lua chon ngoai khoang hoac trung', () => {
    assert.ok(normalizeAttempt({ ...isValid(), chon: [[9], [], []] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), chon: [[1, 1], [], []] }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), chon: [[0], []] }).loi, 'thieu cau');
});

test('so cau dung khong vuot so cau da lam', () => {
    assert.ok(normalizeAttempt({ ...isValid(), soDung: 3 }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), soDung: -1 }).loi);
    assert.equal(normalizeAttempt({ ...isValid(), soDung: 2 }).loi, undefined);
});

test('thoi gian lam bai phai la so giay hop le', () => {
    assert.ok(normalizeAttempt({ ...isValid(), giay: -5 }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), giay: 1.5 }).loi);
    assert.ok(normalizeAttempt({ ...isValid(), giay: 999999 }).loi);
});

test('than rong khong nem loi', () => {
    assert.ok(normalizeAttempt(undefined).loi);
    assert.ok(normalizeAttempt(null).loi);
});
