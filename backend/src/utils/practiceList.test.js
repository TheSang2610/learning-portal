const test = require('node:test');
const assert = require('node:assert');

const { ghepBaiLuyenTap } = require('./practiceList');

const khoaA = { _id: 'k1', title: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu' };
const khoaB = { _id: 'k2', title: 'Mạng máy tính', slug: 'mang-may-tinh' };

const quiz = (id, title, course, soCau, them = {}) => ({
    _id: id,
    title,
    course,
    questions: Array.from({ length: soCau }, (_, i) => ({
        _id: `${id}-c${i}`,
        text: 'Câu hỏi',
        options: [{ text: 'Đúng', isCorrect: true }],
        correctAnswer: 'Đúng'
    })),
    ...them
});

test('dem so cau va so luot lam dung theo tung quiz', () => {
    const kq = ghepBaiLuyenTap(
        [quiz('q1', 'Đề số 1', khoaA, 3)],
        new Map([['q1', 12]])
    );
    assert.strictEqual(kq.length, 1);
    assert.strictEqual(kq[0].soCau, 3);
    assert.strictEqual(kq[0].soLuotLam, 12);
    assert.deepStrictEqual(kq[0].khoa, { _id: 'k1', title: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu' });
});

test('KHONG lo cau hoi hay dap an ra duong cong khai', () => {
    const [bai] = ghepBaiLuyenTap([quiz('q1', 'Đề số 1', khoaA, 2)], new Map());
    assert.strictEqual('questions' in bai, false);
    assert.doesNotMatch(JSON.stringify(bai), /isCorrect|correctAnswer/);
});

test('quiz chua ai lam thi so luot la 0, khong phai undefined', () => {
    const [bai] = ghepBaiLuyenTap([quiz('q1', 'Đề số 1', khoaA, 2)], new Map());
    assert.strictEqual(bai.soLuotLam, 0);
});

test('bo quiz mat khoa hoc (khoa bi xoa / chua xuat ban -> populate ra null)', () => {
    const kq = ghepBaiLuyenTap(
        [quiz('q1', 'Mồ côi', null, 2), quiz('q2', 'Còn khoá', khoaA, 2)],
        new Map()
    );
    assert.deepStrictEqual(kq.map((b) => b._id), ['q2']);
});

test('bo quiz khong co cau hoi nao', () => {
    const kq = ghepBaiLuyenTap([quiz('q1', 'Rỗng', khoaA, 0)], new Map());
    assert.strictEqual(kq.length, 0);
});

test('xep nhieu luot lam len truoc, bang luot thi theo ten', () => {
    const kq = ghepBaiLuyenTap(
        [
            quiz('q1', 'Đề B', khoaA, 1),
            quiz('q2', 'Đề A', khoaB, 1),
            quiz('q3', 'Đề C', khoaA, 1)
        ],
        new Map([['q3', 9]])
    );
    assert.deepStrictEqual(kq.map((b) => b.title), ['Đề C', 'Đề A', 'Đề B']);
});

test('mo ta trong thi tra chuoi rong', () => {
    const [bai] = ghepBaiLuyenTap([quiz('q1', 'Đề', khoaA, 1)], new Map());
    assert.strictEqual(bai.description, '');
});
