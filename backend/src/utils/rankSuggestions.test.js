// Chay:  npm test
//
// Chi test rankSuggestions.js - phan HAM THUAN. Viec doc ghi danh va dem nguoi hoc
// cung nam o courseController va khong test o day: CI khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const {
    scoreDocument,
    rankSuggestions,
    SAME_CATEGORY_SCORE,
    MAX_CO_LEARNER_SCORE,
    MAX_POPULARITY_SCORE,
} = require('./rankSuggestions');

const course = (id, them = {}) => ({
    _id: id,
    title: `Khoa ${id}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...them,
});

test('khoa da hoc bi loai khoi goi y', () => {
    // Loi de thay nhat cua mot muc goi y: goi y dung thu nguoi ta da mua.
    const outcome = rankSuggestions([course('a'), course('b')], { learned: new Set(['a']) });

    assert.strictEqual(outcome.length, 1);
    assert.strictEqual(String(outcome[0]._id), 'b');
});

test('cung danh muc duoc cong dung trong so', () => {
    const { diem: score } = scoreDocument(course('x', { category: 'dm1' }), {
        learningCategories: new Set(['dm1']),
    });

    assert.strictEqual(score, SAME_CATEGORY_SCORE);
});

test('category dang doi tuong da populate van doc duoc', () => {
    // Controller co the truyen vao ban da populate ({_id, name}) hoac ban tho
    // (chi ObjectId). Ca hai phai ra cung ket qua.
    const { diem: score } = scoreDocument(course('x', { category: { _id: 'dm1', name: 'Web' } }), {
        learningCategories: new Set(['dm1']),
    });

    assert.strictEqual(score, SAME_CATEGORY_SCORE);
});

test('diem hoc cung bi chan tran', () => {
    // Khong co tran thi mot khoa duoc 50 nguoi hoc cung se de bep moi tin hieu
    // khac, ke ca khi no thuoc linh vuc hoan toan khac.
    const { diem: score } = scoreDocument(course('x'), {
        countCoLearners: new Map([['x', 100]]),
    });

    assert.strictEqual(score, MAX_CO_LEARNER_SCORE);
});

test('diem pho bien bi chan tran', () => {
    const { diem: score } = scoreDocument(course('x', { studentCount: 100000 }), {});
    assert.strictEqual(score, MAX_POPULARITY_SCORE);
});

test('cau giai thich uu tien tin hieu tu hanh vi hon tin hieu tu danh muc', () => {
    const { vi: wallet } = scoreDocument(course('x', { category: 'dm1' }), {
        learningCategories: new Set(['dm1']),
        countCoLearners: new Map([['x', 3]]),
    });

    assert.match(wallet, /Học viên học khóa giống bạn/);
});

test('khong co tin hieu nao van co cau giai thich, khong de trong', () => {
    const { vi: wallet } = scoreDocument(course('x'), {});
    assert.strictEqual(wallet, 'Có thể bạn quan tâm');
});

test('xep dung thu tu: danh muc thang pho bien', () => {
    const items = [
        course('pho_bien', { studentCount: 500 }),
        course('cung_dm', { category: 'dm1' }),
    ];

    const outcome = rankSuggestions(items, { learningCategories: new Set(['dm1']) });

    assert.strictEqual(String(outcome[0]._id), 'cung_dm');
});

test('bang diem thi khoa moi hon len truoc', () => {
    // Khong co nac nay thi thu tu phu thuoc CSDL tra ve the nao, va muc goi y
    // nhay lung tung giua hai lan tai trang.
    const items = [
        course('cu', { createdAt: '2025-01-01T00:00:00.000Z' }),
        course('moi', { createdAt: '2026-06-01T00:00:00.000Z' }),
    ];

    const outcome = rankSuggestions(items, {});
    assert.strictEqual(String(outcome[0]._id), 'moi');
});

test('so luong tra ve bi chan tren va chan duoi', () => {
    const items = Array.from({ length: 50 }, (_, i) => course(`k${i}`));

    assert.strictEqual(rankSuggestions(items, {}, 6).length, 6);
    assert.strictEqual(rankSuggestions(items, {}, 999).length, 24);
    assert.strictEqual(rankSuggestions(items, {}, 0).length, 1);
    assert.strictEqual(rankSuggestions(items, {}, -5).length, 1);
});

test('du lieu rac khong lam vo ham', () => {
    assert.deepStrictEqual(rankSuggestions(null, {}), []);
    assert.deepStrictEqual(rankSuggestions(undefined, {}), []);

    // Phan tu thieu _id bi bo qua chu khong lam nem ngoai le: du lieu tu CSDL
    // khong phai luc nao cung day du (khoa bi xoa giua chung mot truy van).
    const outcome = rankSuggestions([null, {}, course('ok')], {});
    assert.strictEqual(outcome.length, 1);
});

test('boi thieu thi coi nhu khong co tin hieu nao, khong nem', () => {
    const outcome = rankSuggestions([course('a')], {});
    assert.strictEqual(outcome.length, 1);
    assert.strictEqual(outcome[0].diemGoiY, 0);
});

test('moi khoa tra ve deu co diem va cau giai thich', () => {
    // Giao dien doc hai truong nay truc tiep. Thieu mot cai la hien ra chu
    // "undefined" duoi the khoa hoc.
    const outcome = rankSuggestions([course('a'), course('b', { studentCount: 5 })], {});

    for (const k of outcome) {
        assert.strictEqual(typeof k.diemGoiY, 'number');
        assert.ok(typeof k.viSaoGoiY === 'string' && k.viSaoGoiY.length > 0);
    }
});
