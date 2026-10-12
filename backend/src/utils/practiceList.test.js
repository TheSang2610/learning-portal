const test = require('node:test');
const assert = require('node:assert');

const { attachPracticeQuiz } = require('./practiceList');

const courseA = { _id: 'k1', title: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu' };
const courseB = { _id: 'k2', title: 'Mạng máy tính', slug: 'mang-may-tinh' };

const quiz = (id, title, course, questionCount, them = {}) => ({
    _id: id,
    title,
    course,
    questions: Array.from({ length: questionCount }, (_, i) => ({
        _id: `${id}-c${i}`,
        text: 'Câu hỏi',
        options: [{ text: 'Đúng', isCorrect: true }],
        correctAnswer: 'Đúng'
    })),
    ...them
});

test('dem so cau va so luot lam dung theo tung quiz', () => {
    const outcome = attachPracticeQuiz(
        [quiz('q1', 'Đề số 1', courseA, 3)],
        new Map([['q1', 12]])
    );
    assert.strictEqual(outcome.length, 1);
    assert.strictEqual(outcome[0].soCau, 3);
    assert.strictEqual(outcome[0].attemptCount, 12);
    assert.deepStrictEqual(outcome[0].khoa, { _id: 'k1', title: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu' });
});

test('KHONG lo cau hoi hay dap an ra duong cong khai', () => {
    const [lesson] = attachPracticeQuiz([quiz('q1', 'Đề số 1', courseA, 2)], new Map());
    assert.strictEqual('questions' in lesson, false);
    assert.doesNotMatch(JSON.stringify(lesson), /isCorrect|correctAnswer/);
});

test('quiz chua ai lam thi so luot la 0, khong phai undefined', () => {
    const [lesson] = attachPracticeQuiz([quiz('q1', 'Đề số 1', courseA, 2)], new Map());
    assert.strictEqual(lesson.attemptCount, 0);
});

test('bo quiz mat khoa hoc (khoa bi xoa / chua xuat ban -> populate ra null)', () => {
    const outcome = attachPracticeQuiz(
        [quiz('q1', 'Mồ côi', null, 2), quiz('q2', 'Còn khoá', courseA, 2)],
        new Map()
    );
    assert.deepStrictEqual(outcome.map((b) => b._id), ['q2']);
});

test('bo quiz khong co cau hoi nao', () => {
    const outcome = attachPracticeQuiz([quiz('q1', 'Rỗng', courseA, 0)], new Map());
    assert.strictEqual(outcome.length, 0);
});

test('xep nhieu luot lam len truoc, bang luot thi theo ten', () => {
    const outcome = attachPracticeQuiz(
        [
            quiz('q1', 'Đề B', courseA, 1),
            quiz('q2', 'Đề A', courseB, 1),
            quiz('q3', 'Đề C', courseA, 1)
        ],
        new Map([['q3', 9]])
    );
    assert.deepStrictEqual(outcome.map((b) => b.title), ['Đề C', 'Đề A', 'Đề B']);
});

test('mo ta trong thi tra chuoi rong', () => {
    const [lesson] = attachPracticeQuiz([quiz('q1', 'Đề', courseA, 1)], new Map());
    assert.strictEqual(lesson.description, '');
});
