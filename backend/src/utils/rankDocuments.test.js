// Chay:  npm test
//
// Chi test rankDocuments.js - phan HAM THUAN. Viec doc lich su va tai lieu tu
// CSDL nam o documentController va khong test o day: CI khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const {
    normalizeSubject,
    splitKeywords,
    summarizeHistory,
    groupHistoryByDocument,
    scoreDocument,
    rankDocuments,
    SAME_SUBJECT_SCORE,
    MAX_INTEREST_SCORE,
    MAX_KEYWORD_SCORE,
    MAX_POPULARITY_SCORE,
} = require('./rankDocuments');

const tl = (id, them = {}) => ({
    _id: id,
    title: `Tai lieu ${id}`,
    monHoc: '',
    downloadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...them,
});

// ------------------------------- chuan hoa -------------------------------

test('cung mot mon viet nhieu cach thi ra cung mot khoa', () => {
    // Day la ly do co monHocKey: khong gop thi "cung mon" gan nhu khong trung.
    const k = normalizeSubject('Cấu trúc dữ liệu');
    assert.strictEqual(k, 'cau truc du lieu');
    assert.strictEqual(normalizeSubject('cau truc du lieu'), k);
    assert.strictEqual(normalizeSubject('  Cấu  trúc   dữ liệu '), k);
    assert.strictEqual(normalizeSubject('CẤU TRÚC DỮ LIỆU'), k);
});

test('chu đ duoc doi thanh d', () => {
    // NFD khong tach duoc "đ" vi no khong phai chu co dau ghep.
    assert.strictEqual(normalizeSubject('Đại số'), 'dai so');
});

test('mon rong hoac thieu thi ra chuoi rong', () => {
    assert.strictEqual(normalizeSubject(''), '');
    assert.strictEqual(normalizeSubject(undefined), '');
    assert.strictEqual(normalizeSubject(null), '');
});

test('tach tu khoa bo tu qua chung va tu 1 ky tu', () => {
    // "tai lieu", "giao trinh", "mon" co trong gan nhu moi tieu de.
    const t = splitKeywords('Giáo trình môn CTDL & GT tài liệu ôn tập C');
    assert.deepStrictEqual(t, ['ctdl', 'gt']);
});

test('tach tu khoa khong tra ve tu trung nhau', () => {
    assert.deepStrictEqual(splitKeywords('Java java JAVA'), ['java']);
});

// ------------------------------- lich su -------------------------------

test('tai tinh nang hon xem khi gom mon quan tam', () => {
    const { interestSubjects } = summarizeHistory([
        { loai: 'xem', monHocKey: 'toan' },
        { loai: 'tai', monHocKey: 'ly' },
    ]);
    assert.ok(interestSubjects.get('ly') > interestSubjects.get('toan'));
});

test('chi tai lieu DA TAI moi vao danh sach loai tru, da xem thi khong', () => {
    // Da xem ma chua tai co the la luong lu - van nen goi y lai.
    const { daTai: downloaded } = summarizeHistory([
        { loai: 'xem', document: 'a', monHocKey: 'x' },
        { loai: 'tai', document: 'b', monHocKey: 'x' },
    ]);
    assert.ok(downloaded.has('b'));
    assert.ok(!downloaded.has('a'));
});

test('tu khoa lay tu lan tim, khong lay tu lan xem', () => {
    const { tuKhoa: keyword } = summarizeHistory([
        { loai: 'tim', tuKhoa: 'đồ thị Dijkstra' },
        { loai: 'xem', tuKhoa: 'bo qua cai nay', monHocKey: 'x' },
    ]);
    assert.deepStrictEqual(keyword, ['do', 'thi', 'dijkstra']);
});

test('"thi" va "co" KHONG bi coi la tu bo qua', () => {
    // Hai tu nay tung nam trong STOP_WORDS. Bo dau xong, "thì" (lien tu) trung
    // mat chu voi "thi" (đề thi) va "thị" (đồ thị); "có" trung voi "cơ" (Cơ
    // sở dữ liệu). Voi kho tai lieu hoc tap, "de thi" la tin hieu quy nhat.
    assert.ok(splitKeywords('Đề thi cuối kỳ').includes('thi'));
    assert.ok(splitKeywords('Cơ sở dữ liệu').includes('co'));
});

test('chi lay tu khoa trong 10 lan tim gan nhat', () => {
    const activity = [];
    for (let i = 0; i < 10; i++) activity.push({ loai: 'tim', tuKhoa: `moi${i}` });
    activity.push({ loai: 'tim', tuKhoa: 'cunhat' }); // lan thu 11, cu nhat
    const { tuKhoa: keyword } = summarizeHistory(activity);
    assert.ok(!keyword.includes('cunhat'));
});

test('lich su rong hay sai kieu khong lam no', () => {
    for (const input of [undefined, null, [], [null, {}, { loai: 'la' }]]) {
        const outcome = summarizeHistory(input);
        assert.strictEqual(outcome.interestSubjects.size, 0);
        assert.strictEqual(outcome.daTai.size, 0);
        assert.deepStrictEqual(outcome.tuKhoa, []);
    }
});

// --------------------------- gop lich su de hien ---------------------------

test('moi tai lieu chi con mot dong, lay lan gan nhat', () => {
    const outcome = groupHistoryByDocument([
        { loai: 'xem', document: 'a', createdAt: '2026-09-03' },
        { loai: 'xem', document: 'b', createdAt: '2026-09-02' },
        { loai: 'xem', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.deepStrictEqual(outcome.map((x) => x.document), ['a', 'b']);
    assert.strictEqual(outcome[0].lanCuoi, '2026-09-03');
});

test('tung tai du mot lan thi danh dau da tai, du lan gan nhat chi la xem', () => {
    const [a] = groupHistoryByDocument([
        { loai: 'xem', document: 'a', createdAt: '2026-09-03' },
        { loai: 'tai', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.strictEqual(a.daTai, true);
});

test('lan tim kiem khong vao lich su tai lieu', () => {
    const outcome = groupHistoryByDocument([
        { loai: 'tim', tuKhoa: 'do thi', createdAt: '2026-09-03' },
        { loai: 'xem', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.deepStrictEqual(outcome.map((x) => x.document), ['a']);
});

test('gop lich su rong hay sai kieu tra ve mang rong', () => {
    assert.deepStrictEqual(groupHistoryByDocument(undefined), []);
    assert.deepStrictEqual(groupHistoryByDocument([null, {}, { loai: 'xem' }]), []);
});

// ------------------------------- cham diem -------------------------------

test('cung mon voi tai lieu dang xem duoc diem cao nhat va noi ro ten mon', () => {
    const { diem: score, vi: wallet } = scoreDocument(tl('a', { monHoc: 'Cấu trúc dữ liệu' }), {
        viewingSubject: 'cau truc du lieu',
    });
    assert.strictEqual(score, SAME_SUBJECT_SCORE);
    assert.strictEqual(wallet, 'Cùng môn Cấu trúc dữ liệu');
});

test('cung mon dang xem thi KHONG cong them diem lich su cho cung mon do', () => {
    // Dem hai lan mot tin hieu se day tai lieu cung mon vuot xa moi thu khac.
    const { diem: score } = scoreDocument(tl('a', { monHoc: 'Toán' }), {
        viewingSubject: 'toan',
        interestSubjects: new Map([['toan', 99]]),
    });
    assert.strictEqual(score, SAME_SUBJECT_SCORE);
});

test('diem mon quan tam co tran', () => {
    const { diem: score } = scoreDocument(tl('a', { monHoc: 'Toán' }), {
        interestSubjects: new Map([['toan', 1000]]),
    });
    assert.strictEqual(score, MAX_INTEREST_SCORE);
});

test('diem tu khoa co tran, tieu de dai khong vuot mat tai lieu cung mon', () => {
    const multipleWords = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff'];
    const matchesMany = scoreDocument(tl('a', { title: multipleWords.join(' ') }), { tuKhoa: multipleWords });
    assert.strictEqual(matchesMany.diem, MAX_KEYWORD_SCORE);
    assert.ok(matchesMany.diem < SAME_SUBJECT_SCORE);
});

test('cau giai thich doi theo nguon tu khoa', () => {
    const doc = tl('a', { title: 'Thuat toan Dijkstra' });
    assert.strictEqual(
        scoreDocument(doc, { tuKhoa: ['dijkstra'], keywordSource: 'tim' }).vi,
        'Liên quan tới "dijkstra" bạn đã tìm',
    );
    assert.strictEqual(
        scoreDocument(doc, { tuKhoa: ['dijkstra'], keywordSource: 'tieuDe' }).vi,
        'Nội dung gần với tài liệu đang xem',
    );
});

test('co nhieu ly do thi cau cu the nhat duoc chon', () => {
    // Vua cung mon vua duoc tai nhieu: "cung mon X" noi nhieu hon "duoc tai nhieu".
    const { vi: wallet } = scoreDocument(tl('a', { monHoc: 'Toán', downloadCount: 50 }), {
        viewingSubject: 'toan',
    });
    assert.strictEqual(wallet, 'Cùng môn Toán');
});

test('diem pho bien co tran', () => {
    const { diem: score, vi: wallet } = scoreDocument(tl('a', { downloadCount: 100000 }));
    assert.strictEqual(score, MAX_POPULARITY_SCORE);
    assert.strictEqual(wallet, 'Được tải nhiều');
});

test('khong co tin hieu nao thi diem 0 va van co cau giai thich', () => {
    const { diem: score, vi: wallet } = scoreDocument(tl('a'));
    assert.strictEqual(score, 0);
    assert.strictEqual(wallet, 'Mới được chia sẻ');
});

test('tai lieu cu chua co monHocKey van so duoc mon', () => {
    // Tai lieu dang truoc khi co truong monHocKey: tinh khoa tai cho tu monHoc.
    const { diem: score } = scoreDocument({ _id: 'a', title: 'x', monHoc: 'Vật lý' }, { viewingSubject: 'vat ly' });
    assert.strictEqual(score, SAME_SUBJECT_SCORE);
});

// ------------------------------- xep hang -------------------------------

test('tai lieu trong danh sach loai tru bi bo', () => {
    const outcome = rankDocuments([tl('a'), tl('b')], { exclude: new Set(['a']) });
    assert.strictEqual(outcome.length, 1);
    assert.strictEqual(outcome[0]._id, 'b');
});

test('cung mon xep truoc khac mon', () => {
    const outcome = rankDocuments(
        [tl('khac', { monHoc: 'Lý' }), tl('cung', { monHoc: 'Toán' })],
        { viewingSubject: 'toan' },
    );
    assert.strictEqual(outcome[0]._id, 'cung');
});

test('bang diem thi tai lieu moi hon len truoc', () => {
    const outcome = rankDocuments([
        tl('cu', { createdAt: '2026-01-01T00:00:00.000Z' }),
        tl('moi', { createdAt: '2026-06-01T00:00:00.000Z' }),
    ]);
    assert.strictEqual(outcome[0]._id, 'moi');
});

test('moi goi y co diem va cau giai thich', () => {
    const [d] = rankDocuments([tl('a')]);
    assert.strictEqual(typeof d.diemGoiY, 'number');
    assert.strictEqual(typeof d.viSaoGoiY, 'string');
});

test('so luong bi chan trong khoang 1 den 24', () => {
    const many = Array.from({ length: 40 }, (_, i) => tl(String(i)));
    assert.strictEqual(rankDocuments(many, {}, 999).length, 24);
    assert.strictEqual(rankDocuments(many, {}, 0).length, 1);
});

test('dau vao khong phai mang thi tra ve mang rong', () => {
    assert.deepStrictEqual(rankDocuments(null), []);
    assert.deepStrictEqual(rankDocuments(undefined), []);
});

// ---------------------------------------------------------------------------
// Mot tai lieu nhieu mon
// ---------------------------------------------------------------------------

test('nhieu mon: trung MOT mon voi tai lieu dang xem la "cung mon", noi dung mon trung', () => {
    const { scoreDocument, SAME_SUBJECT_SCORE } = require('./rankDocuments');
    const r = scoreDocument(
        { title: 'x', monHoc: ['Toán', 'Toán rời rạc'], monHocKey: ['toan', 'toan roi rac'] },
        { viewingSubject: ['giai tich', 'toan roi rac'] },
    );
    assert.strictEqual(r.diem, SAME_SUBJECT_SCORE);
    assert.strictEqual(r.vi, 'Cùng môn Toán rời rạc');
});

test('nhieu mon: trung hai mon KHONG cong don diem cung mon', () => {
    const { scoreDocument, SAME_SUBJECT_SCORE } = require('./rankDocuments');
    const r = scoreDocument(
        { title: 'x', monHoc: ['Toán', 'Toán rời rạc'], monHocKey: ['toan', 'toan roi rac'] },
        { viewingSubject: ['toan', 'toan roi rac'] },
    );
    assert.strictEqual(r.diem, SAME_SUBJECT_SCORE);
});

test('nhieu mon: lich su chon mon co trong so cao nhat de giai thich', () => {
    const { scoreDocument } = require('./rankDocuments');
    const r = scoreDocument(
        { title: 'x', monHoc: ['Toán', 'Triết'], monHocKey: ['toan', 'triet'] },
        { interestSubjects: new Map([['toan', 1], ['triet', 3]]) },
    );
    assert.strictEqual(r.vi, 'Môn Triết bạn hay xem');
    assert.strictEqual(r.diem, 30);
});

test('tongHopLichSu: ban ghi mang nhieu mon tinh cho moi mon, ban ghi cu dang chuoi van doc duoc', () => {
    const { summarizeHistory } = require('./rankDocuments');
    const { interestSubjects } = summarizeHistory([
        { loai: 'tai', document: 'a', monHocKey: ['toan', 'toan cao cap'] },
        { loai: 'xem', document: 'b', monHocKey: 'toan' },
    ]);
    assert.strictEqual(interestSubjects.get('toan'), 4);
    assert.strictEqual(interestSubjects.get('toan cao cap'), 3);
});

test('cacMonCua: tai lieu cu chi co ten dang chuoi van ra khoa', () => {
    const { subjectsOf } = require('./rankDocuments');
    assert.deepStrictEqual(subjectsOf({ monHoc: 'Cấu trúc dữ liệu' }), [
        { key: 'cau truc du lieu', ten: 'Cấu trúc dữ liệu' },
    ]);
    assert.deepStrictEqual(subjectsOf({ monHoc: [], monHocKey: [] }), []);
});
